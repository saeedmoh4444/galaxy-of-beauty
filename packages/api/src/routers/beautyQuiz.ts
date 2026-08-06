import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { publicProcedure, customerProcedure, router } from '../trpc';

export const beautyQuizRouter = router({
  list: publicProcedure
    .input(z.object({ limit: z.number().int().min(1).max(50).default(10) }))
    .query(async ({ input }) => {
      return prisma.beautyQuizQuestion.findMany({ take: input.limit });
    }),

  submitAnswer: customerProcedure
    .input(z.object({ questionId: z.number().int().positive(), answerIndex: z.number().int().min(0).max(3) }))
    .mutation(async ({ ctx, input }) => {
      const q = await prisma.beautyQuizQuestion.findUnique({ where: { id: input.questionId } });
      if (!q) return { correct: false };
      const isCorrect = input.answerIndex === q.correctIndex;
      await prisma.beautyQuizAttempt.create({ data: { userId: ctx.user.id, questionId: input.questionId, selectedIndex: input.answerIndex, isCorrect } });
      return { correct: isCorrect, explanation: q.explanation };
    }),

  myStats: customerProcedure.query(async ({ ctx }) => {
    const [total, correct] = await Promise.all([
      prisma.beautyQuizAttempt.count({ where: { userId: ctx.user.id } }),
      prisma.beautyQuizAttempt.count({ where: { userId: ctx.user.id, isCorrect: true } }),
    ]);
    return { total, correct, pct: total > 0 ? Math.round((correct / total) * 100) : 0 };
  }),
});
