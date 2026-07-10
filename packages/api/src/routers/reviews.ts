import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { prisma } from '@galaxy/db';
import {
  router,
  publicProcedure,
  protectedProcedure,
  customerProcedure,
  adminProcedure,
} from '../trpc';

export const reviewRouter = router({
  // ── Create review ──────────────────────────────────────────────────────────
  create: customerProcedure
    .input(
      z.object({
        bookingId: z.number(),
        rating: z.number().min(1).max(5),
        comment: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { bookingId, rating, comment } = input;

      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        select: { customerId: true, status: true, technicianId: true },
      });

      if (!booking) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Booking not found' });
      }

      if (booking.customerId !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only review your own bookings',
        });
      }

      if (booking.status !== 'COMPLETED') {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'Can only review completed bookings',
        });
      }

      const existing = await prisma.review.findUnique({
        where: { bookingId },
      });

      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'A review already exists for this booking',
        });
      }

      const review = await prisma.review.create({
        data: {
          bookingId,
          customerId: ctx.user.id,
          rating,
          comment,
        },
      });

      // Recalculate technician rating aggregate
      const technician = await prisma.technician.findUnique({
        where: { userId: booking.technicianId },
      });

      if (technician) {
        const agg = await prisma.review.aggregate({
          where: {
            booking: { technicianId: booking.technicianId },
            isVisible: true,
          },
          _avg: { rating: true },
          _count: { id: true },
        });

        await prisma.technician.update({
          where: { id: technician.id },
          data: {
            ratingAvg: agg._avg.rating ?? 0,
            totalReviews: agg._count.id,
          },
        });
      }

      return review;
    }),

  // ── Get reviews by technician ─────────────────────────────────────────────
  getByTechnician: publicProcedure
    .input(
      z.object({
        techUserId: z.number(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
      }),
    )
    .query(async ({ input }) => {
      const { techUserId, page, limit } = input;
      const skip = (page - 1) * limit;
      const where = {
        booking: { technicianId: techUserId },
        isVisible: true,
      };

      const [items, total] = await Promise.all([
        prisma.review.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            customer: { select: { id: true, name: true, avatarUrl: true } },
          },
        }),
        prisma.review.count({ where }),
      ]);

      return {
        items,
        total,
        page,
        limit,
        hasMore: skip + items.length < total,
        totalPages: Math.ceil(total / limit),
      };
    }),

  // ── Get review by booking ─────────────────────────────────────────────────
  getByBooking: protectedProcedure
    .input(z.object({ bookingId: z.number() }))
    .query(async ({ ctx, input }) => {
      const review = await prisma.review.findUnique({
        where: { bookingId: input.bookingId },
        include: {
          customer: { select: { id: true, name: true, avatarUrl: true } },
        },
      });

      if (!review) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Review not found' });
      }

      // Verify caller is a participant on the booking
      const booking = await prisma.booking.findUnique({
        where: { id: input.bookingId },
        select: { customerId: true, technicianId: true },
      });

      if (
        booking &&
        booking.customerId !== ctx.user.id &&
        booking.technicianId !== ctx.user.id
      ) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' });
      }

      return { ...review };
    }),

  // ── Update own review ─────────────────────────────────────────────────────
  update: customerProcedure
    .input(
      z.object({
        reviewId: z.number(),
        rating: z.number().min(1).max(5).optional(),
        comment: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { reviewId, rating, comment } = input;

      const existing = await prisma.review.findUnique({
        where: { id: reviewId },
        select: { customerId: true, bookingId: true },
      });

      if (!existing) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Review not found' });
      }

      if (existing.customerId !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only update your own reviews',
        });
      }

      const review = await prisma.review.update({
        where: { id: reviewId },
        data: {
          ...(rating !== undefined && { rating }),
          ...(comment !== undefined && { comment }),
        },
      });

      // Recalculate technician rating
      const booking = await prisma.booking.findUnique({
        where: { id: existing.bookingId },
        select: { technicianId: true },
      });

      if (booking) {
        const technician = await prisma.technician.findUnique({
          where: { userId: booking.technicianId },
        });

        if (technician) {
          const agg = await prisma.review.aggregate({
            where: {
              booking: { technicianId: booking.technicianId },
              isVisible: true,
            },
            _avg: { rating: true },
            _count: { id: true },
          });

          await prisma.technician.update({
            where: { id: technician.id },
            data: {
              ratingAvg: agg._avg.rating ?? 0,
              totalReviews: agg._count.id,
            },
          });
        }
      }

      return review;
    }),

  // ── Toggle review visibility (admin) ──────────────────────────────────────
  hide: adminProcedure
    .input(z.object({ reviewId: z.number() }))
    .mutation(async ({ input }) => {
      const review = await prisma.review.findUnique({
        where: { id: input.reviewId },
        select: { id: true, isVisible: true, booking: { select: { technicianId: true } } },
      });

      if (!review) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Review not found' });
      }

      const updated = await prisma.review.update({
        where: { id: input.reviewId },
        data: { isVisible: !review.isVisible },
      });

      // Recalculate technician rating aggregate
      if (review.booking) {
        const technician = await prisma.technician.findUnique({
          where: { userId: review.booking.technicianId },
        });

        if (technician) {
          const agg = await prisma.review.aggregate({
            where: {
              booking: { technicianId: review.booking.technicianId },
              isVisible: true,
            },
            _avg: { rating: true },
            _count: { id: true },
          });

          await prisma.technician.update({
            where: { id: technician.id },
            data: {
              ratingAvg: agg._avg.rating ?? 0,
              totalReviews: agg._count.id,
            },
          });
        }
      }

      return updated;
    }),

  // ── List reviews (public, filterable) ─────────────────────────────────────
  list: publicProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
        technicianId: z.number().optional(),
        minRating: z.number().min(1).max(5).optional(),
      }),
    )
    .query(async ({ input }) => {
      const { page, limit, technicianId, minRating } = input;
      const skip = (page - 1) * limit;

      const where: Record<string, unknown> = { isVisible: true };

      if (technicianId) {
        where.booking = { technicianId };
      }

      if (minRating) {
        where.rating = { gte: minRating };
      }

      const [items, total] = await Promise.all([
        prisma.review.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            customer: { select: { id: true, name: true, avatarUrl: true } },
            booking: {
              select: {
                id: true,
                technicianId: true,
                service: { select: { id: true, titleJson: true } },
              },
            },
          },
        }),
        prisma.review.count({ where }),
      ]);

      return {
        items,
        total,
        page,
        limit,
        hasMore: skip + items.length < total,
        totalPages: Math.ceil(total / limit),
      };
    }),
});
