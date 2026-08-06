import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { publicProcedure, customerProcedure, router } from '../trpc';

export const investorRelationsRouter = router({
  stats: publicProcedure.query(async () => {
    const [startups, funded, totalRaised] = await Promise.all([
      prisma.investmentPitch.count(),
      prisma.investmentPitch.count({ where: { status: 'FUNDED' } }),
      prisma.investmentPitch.aggregate({ where: { status: 'FUNDED' }, _sum: { amount: true } }),
    ]);
    return { startups, funded, totalRaised: totalRaised._sum.amount ?? 0 };
  }),

  list: publicProcedure
    .input(z.object({ limit: z.number().int().min(1).max(50).default(20) }))
    .query(async ({ input }) => prisma.investmentPitch.findMany({ take: input.limit, orderBy: { createdAt: 'desc' } })),

  submit: customerProcedure
    .input(z.object({ name: z.string().min(2).max(200), amount: z.number().int().positive(), description: z.string().max(1000) }))
    .mutation(async ({ ctx, input }) => prisma.investmentPitch.create({ data: { name: input.name, amount: input.amount, description: input.description, ownerId: ctx.user.id } })),
});
