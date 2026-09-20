import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { prisma } from '@galaxy/db';
import { SMALL_PAGE_SIZE } from '@galaxy/shared';
import { customerProcedure, adminProcedure, publicProcedure, router } from '../trpc';
import { notifyUser } from '../lib/notify';

/**
 * NPS post-booking survey (ENHANCEMENT_PLAN quick win #6).
 *
 * Customers rate a COMPLETED booking 0-10 with an optional comment —
 * one response per booking (enforced by the unique bookingId column).
 * Admins get an aggregate dashboard: average, distribution buckets
 * (detractor/passive/promoter), and the most recent comments.
 */

const npsSubmitSchema = z.object({
  bookingId: z.number().int().positive().optional(),
  score: z.number().int().min(0).max(10),
  comment: z.string().max(500).optional(),
});

export const npsRouter = router({
  /** Submit (or attempt to submit) a score. Rejects non-completed or foreign bookings. */
  submit: customerProcedure.input(npsSubmitSchema).mutation(async ({ ctx, input }) => {
    if (input.bookingId) {
      const booking = await prisma.booking.findUnique({
        where: { id: input.bookingId },
        select: { customerId: true, status: true },
      });
      if (!booking || booking.customerId !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Booking not found or does not belong to you',
        });
      }
      if (booking.status !== 'COMPLETED') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Only completed bookings can be rated',
        });
      }
    }
    const response = await prisma.npsResponse.create({
      data: {
        userId: ctx.user.id,
        bookingId: input.bookingId,
        score: input.score,
        comment: input.comment?.trim() || null,
      },
    });

    // 4.3 detractor loop: NPS ≤ 6 → alert every admin to follow up
    // within 24h (markFollowedUp closes the loop).
    if (input.score <= 6) {
      const admins = await prisma.user.findMany({
        where: { role: 'ADMIN' },
        select: { id: true },
      });
      for (const admin of admins) {
        await notifyUser({
          userId: admin.id,
          templateKey: 'nps_detractor',
          vars: {
            score: input.score,
            comment: response.comment ?? '',
            bookingId: input.bookingId ?? 0,
          },
          link: '/admin',
        });
      }
    }
    return response;
  }),

  /** The customer's own responses (used to render "already rated" states). */
  mine: customerProcedure.query(async ({ ctx }) =>
    prisma.npsResponse.findMany({
      where: { userId: ctx.user.id },
      orderBy: { createdAt: 'desc' },
      take: SMALL_PAGE_SIZE,
    }),
  ),

  /** 4.3: close the detractor loop — stamp the follow-up time. */
  markFollowedUp: adminProcedure
    .input(z.object({ responseId: z.number().int().positive() }))
    .mutation(async ({ input }) => {
      const response = await prisma.npsResponse.findUnique({ where: { id: input.responseId } });
      if (!response) throw new TRPCError({ code: 'NOT_FOUND', message: 'Response not found' });
      return prisma.npsResponse.update({
        where: { id: input.responseId },
        data: { followedUpAt: new Date() },
      });
    }),

  /**
   * 4.3: public NPS aggregate for a technician profile — the score comes
   * from responses linked to the technician's bookings. NpsResponse has no
   * booking relation (scalar bookingId), so join via a booking-id lookup.
   */
  byTechnician: publicProcedure
    .input(z.object({ technicianId: z.number().int().positive() }))
    .query(async ({ input }) => {
      const bookingIds = (
        await prisma.booking.findMany({
          where: { technicianId: input.technicianId },
          select: { id: true },
        })
      ).map((b) => b.id);
      if (bookingIds.length === 0) {
        return { total: 0, average: 0, distribution: { detractors: 0, passives: 0, promoters: 0 } };
      }
      const rows = await prisma.npsResponse.findMany({
        where: { bookingId: { in: bookingIds } },
        select: { score: true },
      });
      const total = rows.length;
      const average = total === 0 ? 0 : rows.reduce((s, r) => s + r.score, 0) / total;
      const distribution = { detractors: 0, passives: 0, promoters: 0 };
      for (const r of rows) {
        if (r.score <= 6) distribution.detractors += 1;
        else if (r.score <= 8) distribution.passives += 1;
        else distribution.promoters += 1;
      }
      return { total, average: Math.round(average * 100) / 100, distribution };
    }),

  /** Aggregate dashboard for admins. */
  stats: adminProcedure.query(async () => {
    const rows = await prisma.npsResponse.findMany({
      select: { score: true, comment: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
    const total = rows.length;
    const average = total === 0 ? 0 : rows.reduce((sum, r) => sum + r.score, 0) / total;
    const distribution = { detractors: 0, passives: 0, promoters: 0 };
    for (const r of rows) {
      if (r.score <= 6) distribution.detractors += 1;
      else if (r.score <= 8) distribution.passives += 1;
      else distribution.promoters += 1;
    }
    return {
      total,
      average: Math.round(average * 100) / 100,
      distribution,
      recentComments: rows
        .filter((r) => r.comment)
        .slice(0, 10)
        .map((r) => ({ score: r.score, comment: r.comment as string, createdAt: r.createdAt })),
    };
  }),
});
