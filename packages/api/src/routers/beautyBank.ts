import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { publicProcedure, customerProcedure, router } from '../trpc';

export const beautyBankRouter = router({
  stats: publicProcedure.query(async () => {
    const donations = await prisma.beautyBank.aggregate({ _sum: { amount: true }, _count: true });
    return { totalRaised: donations._sum.amount ?? 0, totalDonors: donations._count, goal: 10000 };
  }),

  donate: customerProcedure
    .input(z.object({ amount: z.number().int().positive().min(10), message: z.string().max(200).optional() }))
    .mutation(async ({ ctx, input }) => {
      return prisma.beautyBank.create({ data: { donorId: ctx.user.id, amount: input.amount, message: input.message ?? null } });
    }),

  myDonations: customerProcedure
    .input(z.object({ limit: z.number().int().min(1).max(50).default(10) }))
    .query(async ({ ctx, input }) => {
      return prisma.beautyBank.findMany({ where: { donorId: ctx.user.id }, orderBy: { createdAt: 'desc' }, take: input.limit });
    }),

  leaderboard: publicProcedure
    .input(z.object({ limit: z.number().int().min(1).max(50).default(10) }))
    .query(async ({ input }) => {
      return prisma.beautyBank.groupBy({ by: ['donorId'], _sum: { amount: true }, orderBy: { _sum: { amount: 'desc' } }, take: input.limit });
    }),
});
