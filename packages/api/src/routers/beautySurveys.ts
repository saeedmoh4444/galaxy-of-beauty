import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { publicProcedure, customerProcedure, adminProcedure, router } from '../trpc';

export const beautySurveysRouter = router({
  active: publicProcedure
    .input(z.object({ limit: z.number().int().min(1).max(10).default(3) }))
    .query(async ({ input }) => prisma.beautySurvey.findMany({ where: { isActive: true }, take: input.limit, orderBy: { createdAt: 'desc' } })),

  respond: customerProcedure
    .input(z.object({ surveyId: z.number().int().positive(), answersJson: z.record(z.unknown()) }))
    .mutation(async ({ ctx, input }) => {
      const existing = await prisma.surveyResponse.findUnique({ where: { userId_surveyId: { userId: ctx.user.id, surveyId: input.surveyId } } });
      if (existing) return { error: 'Already responded' };
      return prisma.surveyResponse.create({ data: { userId: ctx.user.id, surveyId: input.surveyId, answersJson: input.answersJson } });
    }),

  myResponses: customerProcedure
    .input(z.object({ limit: z.number().int().min(1).max(20).default(5) }))
    .query(async ({ ctx, input }) => prisma.surveyResponse.findMany({ where: { userId: ctx.user.id }, take: input.limit, orderBy: { createdAt: 'desc' } })),

  create: adminProcedure
    .input(z.object({ title: z.string().min(3).max(200), questionsJson: z.array(z.object({ question: z.string(), type: z.enum(['text', 'rating', 'choice']), options: z.array(z.string()).optional() })) }))
    .mutation(async ({ input }) => prisma.beautySurvey.create({ data: { title: input.title, questionsJson: input.questionsJson } })),
});
