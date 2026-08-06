import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { customerProcedure, router } from '../trpc';
import { notFound } from '../lib/errors';

export const kindnessPointsRouter = router({
  getStatus: customerProcedure.query(async ({ ctx }) => {
    const account = await prisma.kindnessAccount.findUnique({ where: { userId: ctx.user.id } });
    if (!account) {
      return await prisma.kindnessAccount.create({ data: { userId: ctx.user.id, points: 0 } });
    }
    return account;
  }),

  earnTransaction: customerProcedure
    .input(z.object({ action: z.string().min(1).max(100) }))
    .mutation(async ({ ctx, input }) => {
      const pointsMap: Record<string, number> = { 'answer_question': 10, 'give_advice': 25, 'mentor_new_member': 50, 'organize_event': 100, 'donate_beauty_bank': 200 };
      const points = pointsMap[input.action] || 5;

      let account = await prisma.kindnessAccount.findUnique({ where: { userId: ctx.user.id } });
      if (!account) account = await prisma.kindnessAccount.create({ data: { userId: ctx.user.id, points: 0 } });

      await prisma.kindnessTransaction.create({ data: { accountId: account.id, points, reason: input.action } });
      const updated = await prisma.kindnessAccount.update({ where: { id: account.id }, data: { points: { increment: points }, lifetimePoints: { increment: points } } });
      return updated;
    }),

  leaderboard: customerProcedure
    .input(z.object({ limit: z.number().int().min(1).max(50).default(10) }))
    .query(async ({ input }) => {
      return prisma.kindnessAccount.findMany({ orderBy: { points: 'desc' }, take: input.limit, include: { user: { select: { name: true } } } });
    }),

  history: customerProcedure
    .input(z.object({ page: z.number().int().min(1).default(1), limit: z.number().int().min(1).max(50).default(20) }))
    .query(async ({ ctx, input }) => {
      const account = await prisma.kindnessAccount.findUnique({ where: { userId: ctx.user.id } });
      if (!account) throw notFound('Kindness account');
      return prisma.kindnessTransaction.findMany({ where: { accountId: account.id }, orderBy: { createdAt: 'desc' }, skip: (input.page - 1) * input.limit, take: input.limit });
    }),
});
