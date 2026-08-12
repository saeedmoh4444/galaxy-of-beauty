import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { customerProcedure, router } from '../trpc';

export const savingsMilestonesRouter = router({
  myMilestones: customerProcedure
    .input(z.object({ limit: z.number().int().min(1).max(30).default(10) }))
    .query(async ({ ctx, input }) => {
      return prisma.savingsMilestone.findMany({
        where: { userId: ctx.user.id },
        orderBy: { amount: 'asc' },
        take: input.limit,
      });
    }),

  create: customerProcedure
    .input(
      z.object({
        name: z.string().min(2).max(100),
        amount: z.number().int().positive(),
        emoji: z.string().default('💰'),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return prisma.savingsMilestone.create({
        data: { userId: ctx.user.id, name: input.name, amount: input.amount, emoji: input.emoji },
      });
    }),

  markAchieved: customerProcedure
    .input(z.object({ milestoneId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const m = await prisma.savingsMilestone.findFirst({
        where: { id: input.milestoneId, userId: ctx.user.id },
      });
      if (m)
        await prisma.savingsMilestone.update({
          where: { id: m.id },
          data: { achieved: true, achievedAt: new Date() },
        });
      return { success: true };
    }),

  stats: customerProcedure.query(async ({ ctx }) => {
    const [total, achieved, totalSaved] = await Promise.all([
      prisma.savingsMilestone.count({ where: { userId: ctx.user.id } }),
      prisma.savingsMilestone.count({ where: { userId: ctx.user.id, achieved: true } }),
      prisma.savingsMilestone.aggregate({
        where: { userId: ctx.user.id, achieved: true },
        _sum: { amount: true },
      }),
    ]);
    return { total, achieved, totalSaved: totalSaved._sum.amount ?? 0 };
  }),
});
