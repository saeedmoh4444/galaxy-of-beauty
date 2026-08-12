import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { customerProcedure, router } from '../trpc';

export const visionBoardRouter = router({
  myGoals: customerProcedure
    .input(z.object({ limit: z.number().int().min(1).max(50).default(20) }))
    .query(async ({ ctx, input }) => {
      return prisma.visionGoal.findMany({
        where: { userId: ctx.user.id },
        orderBy: { year: 'desc' },
        take: input.limit,
      });
    }),

  create: customerProcedure
    .input(
      z.object({
        emoji: z.string().default(''),
        text: z.string().min(3).max(300),
        year: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return prisma.visionGoal.create({
        data: { userId: ctx.user.id, emoji: input.emoji, text: input.text, year: input.year },
      });
    }),

  markAchieved: customerProcedure
    .input(z.object({ goalId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const goal = await prisma.visionGoal.findFirst({
        where: { id: input.goalId, userId: ctx.user.id },
      });
      if (goal)
        await prisma.visionGoal.update({
          where: { id: goal.id },
          data: { achieved: !goal.achieved },
        });
      return { success: true };
    }),

  stats: customerProcedure.query(async ({ ctx }) => {
    const [total, achieved] = await Promise.all([
      prisma.visionGoal.count({ where: { userId: ctx.user.id } }),
      prisma.visionGoal.count({ where: { userId: ctx.user.id, achieved: true } }),
    ]);
    return { total, achieved, pct: total > 0 ? Math.round((achieved / total) * 100) : 0 };
  }),
});
