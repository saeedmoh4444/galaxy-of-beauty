/**
 * E5 — nail bars: venue vertical riding the unified provider pipeline
 * (becomeNailBar in marketplace.ts). Public listing/detail + station-capacity
 * slot bookings claimed atomically; payment happens at the venue.
 */
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { prisma } from '@galaxy/db';
import { DEFAULT_PAGE_SIZE } from '@galaxy/shared';
import { publicProcedure, customerProcedure, router } from '../trpc';

function bookingCode(): string {
  return `GON-${Math.random().toString(16).slice(2, 8).toUpperCase()}`;
}

export const nailBarsRouter = router({
  /** list — verified + active nail bars. */
  list: publicProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(DEFAULT_PAGE_SIZE),
        city: z.string().optional(),
        // E6d — women-only-staff / private-suite nail bars.
        womenOnly: z.boolean().optional(),
        privateSuite: z.boolean().optional(),
      }),
    )
    .query(async ({ input }) => {
      const where: Record<string, unknown> = {
        type: 'NAIL_BAR',
        isActive: true,
        isVerified: true,
        ...(input.womenOnly ? { womenOnlyStaff: true } : {}),
        ...(input.privateSuite ? { privateSuite: true } : {}),
        ...(input.city ? { nailBarCity: input.city } : {}),
      };
      const skip = (input.page - 1) * input.limit;
      const [items, total] = await Promise.all([
        prisma.vendor.findMany({
          where: where as never,
          select: {
            id: true,
            storeName: true,
            storeSlug: true,
            nailBarType: true,
            nailBarCity: true,
            nailBarAddress: true,
            logoUrl: true,
            descriptionJson: true,
            ratingAvg: true,
            totalReviews: true,
            womenOnlyStaff: true,
            privateSuite: true,
          },
          orderBy: { ratingAvg: 'desc' },
          skip,
          take: input.limit,
        }),
        prisma.vendor.count({ where: where as never }),
      ]);
      return { items, total, page: input.page };
    }),

  /** detail — verified nail bar by slug. */
  detail: publicProcedure.input(z.object({ slug: z.string().min(1) })).query(async ({ input }) => {
    const nailBar = await prisma.vendor.findFirst({
      where: { storeSlug: input.slug, type: 'NAIL_BAR', isVerified: true },
    });
    if (!nailBar) throw new TRPCError({ code: 'NOT_FOUND', message: 'Nail bar not found' });
    return nailBar;
  }),

  /** slots — open slots in the window with remaining stations. */
  slots: publicProcedure
    .input(
      z.object({
        nailBarId: z.number().int().positive(),
        from: z.string().datetime(),
        to: z.string().datetime(),
      }),
    )
    .query(async ({ input }) => {
      const slots = await prisma.nailBarSlot.findMany({
        where: {
          nailBarId: input.nailBarId,
          startAt: { gte: new Date(input.from) },
          endAt: { lte: new Date(input.to) },
        },
        orderBy: { startAt: 'asc' },
      });
      return slots.map((s) => ({
        ...s,
        spotsLeft: Math.max(0, s.capacity - s.bookedCount),
      }));
    }),

  /**
   * bookSlot — claim a nail station. Atomic capacity claim
   * (updateMany with bookedCount < capacity); one booking per customer
   * per slot (unique constraint). Payment happens at the venue.
   */
  bookSlot: customerProcedure
    .input(z.object({ slotId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const slot = await prisma.nailBarSlot.findUnique({ where: { id: input.slotId } });
      if (!slot) throw new TRPCError({ code: 'NOT_FOUND', message: 'Slot not found' });

      try {
        return await prisma.$transaction(async (tx) => {
          const claimed = await tx.nailBarSlot.updateMany({
            where: { id: input.slotId, bookedCount: { lt: slot.capacity } },
            data: { bookedCount: { increment: 1 } },
          });
          if (claimed.count === 0) {
            throw new TRPCError({ code: 'CONFLICT', message: 'Slot is full' });
          }
          return tx.nailBarBooking.create({
            data: {
              code: bookingCode(),
              slotId: input.slotId,
              customerId: ctx.user.id,
            },
          });
        });
      } catch (e) {
        // Duplicate (slotId, customerId) unique violation → clean error.
        if (e instanceof Error && (e as { code?: string }).code === 'P2002') {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Already booked this slot' });
        }
        throw e;
      }
    }),

  /** myBookings — the caller's own nail bar bookings, newest first. */
  myBookings: customerProcedure.query(async ({ ctx }) => {
    return prisma.nailBarBooking.findMany({
      where: { customerId: ctx.user.id },
      include: {
        slot: {
          include: { nailBar: { select: { id: true, storeName: true, storeSlug: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }),
});
