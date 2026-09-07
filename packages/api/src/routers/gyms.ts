/**
 * E3 — fitness vertical (gyms). Public listing/detail + capacity-based class
 * bookings (seats claimed atomically; payment happens at the gym).
 * Memberships reuse SubscriptionPlan (gymId-scoped) and day passes reuse
 * ClassPass (gymId-scoped, record-only purchase).
 */
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { prisma } from '@galaxy/db';
import { DEFAULT_PAGE_SIZE } from '@galaxy/shared';
import { publicProcedure, customerProcedure, router } from '../trpc';

function bookingCode(): string {
  return `GYM-${Math.random().toString(16).slice(2, 8).toUpperCase()}`;
}

export const gymsRouter = router({
  /** list — verified + active gyms. */
  list: publicProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(DEFAULT_PAGE_SIZE),
      }),
    )
    .query(async ({ input }) => {
      const where: Record<string, unknown> = {
        type: 'GYM',
        isActive: true,
        isVerified: true,
      };
      const skip = (input.page - 1) * input.limit;
      const [items, total] = await Promise.all([
        prisma.vendor.findMany({
          where: where as never,
          select: {
            id: true,
            storeName: true,
            storeSlug: true,
            gymType: true,
            gymCity: true,
            gymAddress: true,
            logoUrl: true,
            descriptionJson: true,
            ratingAvg: true,
            totalReviews: true,
          },
          orderBy: { ratingAvg: 'desc' },
          skip,
          take: input.limit,
        }),
        prisma.vendor.count({ where: where as never }),
      ]);
      return { items, total, page: input.page };
    }),

  /** detail — verified gym + membership plans + day passes. */
  detail: publicProcedure.input(z.object({ slug: z.string().min(1) })).query(async ({ input }) => {
    const gym = await prisma.vendor.findFirst({
      where: { storeSlug: input.slug, type: 'GYM', isVerified: true },
      include: {
        gymPlans: { where: { isActive: true }, orderBy: { price: 'asc' } },
        gymDayPasses: { where: { isActive: true }, orderBy: { price: 'asc' } },
      },
    });
    if (!gym) throw new TRPCError({ code: 'NOT_FOUND', message: 'Gym not found' });

    const { gymPlans, gymDayPasses, ...rest } = gym;
    return { ...rest, plans: gymPlans, dayPasses: gymDayPasses };
  }),

  /** classes — active classes in the window with remaining seats. */
  classes: publicProcedure
    .input(
      z.object({
        gymId: z.number().int().positive(),
        from: z.string().datetime(),
        to: z.string().datetime(),
      }),
    )
    .query(async ({ input }) => {
      const classes = await prisma.gymClass.findMany({
        where: {
          gymId: input.gymId,
          isActive: true,
          startsAt: { gte: new Date(input.from) },
          endsAt: { lte: new Date(input.to) },
        },
        orderBy: { startsAt: 'asc' },
      });
      return classes.map((c) => ({
        ...c,
        spotsLeft: Math.max(0, c.capacity - c.enrolledCount),
      }));
    }),

  /**
   * bookClass — claim a seat. The capacity claim is atomic
   * (updateMany with enrolledCount < capacity inside a transaction);
   * one booking per customer per class (unique constraint).
   */
  bookClass: customerProcedure
    .input(z.object({ classId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const cls = await prisma.gymClass.findUnique({ where: { id: input.classId } });
      if (!cls || !cls.isActive) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Class not found' });
      }

      try {
        return await prisma.$transaction(async (tx) => {
          const claimed = await tx.gymClass.updateMany({
            where: { id: input.classId, enrolledCount: { lt: cls.capacity } },
            data: { enrolledCount: { increment: 1 } },
          });
          if (claimed.count === 0) {
            throw new TRPCError({ code: 'CONFLICT', message: 'Class is full' });
          }
          return tx.gymClassBooking.create({
            data: {
              code: bookingCode(),
              classId: input.classId,
              customerId: ctx.user.id,
            },
          });
        });
      } catch (e) {
        // Duplicate (classId, customerId) unique violation → clean error.
        if (e instanceof Error && (e as { code?: string }).code === 'P2002') {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Already booked this class' });
        }
        throw e;
      }
    }),

  /** myBookings — the caller's own class bookings, newest first. */
  myBookings: customerProcedure.query(async ({ ctx }) => {
    return prisma.gymClassBooking.findMany({
      where: { customerId: ctx.user.id },
      include: {
        class: {
          include: { gym: { select: { storeName: true, storeSlug: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }),

  /** cancelBooking — customer frees their seat (BOOKED only). */
  cancelBooking: customerProcedure
    .input(z.object({ bookingId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const booking = await prisma.gymClassBooking.findUnique({
        where: { id: input.bookingId },
      });
      if (!booking || booking.customerId !== ctx.user.id) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Booking not found' });
      }
      if (booking.status !== 'BOOKED') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Booking already cancelled' });
      }

      return prisma.$transaction(async (tx) => {
        const updated = await tx.gymClassBooking.update({
          where: { id: input.bookingId },
          data: { status: 'CANCELLED', cancelledAt: new Date() },
        });
        await tx.gymClass.update({
          where: { id: booking.classId },
          data: { enrolledCount: { decrement: 1 } },
        });
        return updated;
      });
    }),
});
