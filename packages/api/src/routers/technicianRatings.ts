import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { publicProcedure, customerProcedure, router } from '../trpc';

export const technicianRatingsRouter = router({
  getBreakdown: publicProcedure
    .input(z.object({ technicianId: z.number().int().positive() }))
    .query(async ({ input }) => {
      const [avg, count, byRating] = await Promise.all([
        prisma.technicianRating.aggregate({ where: { technicianId: input.technicianId }, _avg: { overall: true, skill: true, punctuality: true, cleanliness: true, communication: true } }),
        prisma.technicianRating.count({ where: { technicianId: input.technicianId } }),
        prisma.technicianRating.groupBy({ by: ['overall'], where: { technicianId: input.technicianId }, _count: true, orderBy: { overall: 'desc' } }),
      ]);
      return { avg: avg._avg, count, distribution: byRating.map((r) => ({ rating: r.overall, count: r._count })) };
    }),

  submit: customerProcedure
    .input(z.object({ technicianId: z.number().int().positive(), bookingId: z.number().int().positive(), overall: z.number().int().min(1).max(5), skill: z.number().int().min(1).max(5).optional(), punctuality: z.number().int().min(1).max(5).optional(), cleanliness: z.number().int().min(1).max(5).optional(), communication: z.number().int().min(1).max(5).optional(), comment: z.string().max(500).optional() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await prisma.technicianRating.findUnique({ where: { bookingId: input.bookingId } });
      if (existing) return { error: 'Already rated' };
      return prisma.technicianRating.create({ data: { userId: ctx.user.id, technicianId: input.technicianId, bookingId: input.bookingId, overall: input.overall, skill: input.skill ?? null, punctuality: input.punctuality ?? null, cleanliness: input.cleanliness ?? null, communication: input.communication ?? null, comment: input.comment ?? null } });
    }),
});
