import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { customerProcedure, publicProcedure, router } from '../trpc';

export const technicianQARouter = router({
  list: publicProcedure
    .input(
      z.object({
        category: z.string().optional(),
        page: z.number().default(1),
        limit: z.number().default(20),
      }),
    )
    .query(async ({ input }) => {
      const where: Record<string, unknown> = { isAnswered: true };
      if (input.category) where.category = input.category;
      const [items, total] = await Promise.all([
        prisma.qAQuestion.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip: (input.page - 1) * input.limit,
          take: input.limit,
        }),
        prisma.qAQuestion.count({ where }),
      ]);
      return { items, total };
    }),

  ask: customerProcedure
    .input(
      z.object({
        question: z.string().min(5).max(500),
        category: z.enum(['makeup', 'hair', 'skincare', 'nails', 'general']),
      }),
    )
    .mutation(async ({ ctx, input }) =>
      prisma.qAQuestion.create({
        data: {
          userId: ctx.user.id,
          userName: ctx.user.email,
          question: input.question,
          category: input.category,
        },
      }),
    ),

  categories: publicProcedure.query(() => [
    { key: 'makeup', nameAr: 'مكياج', emoji: '' },
    { key: 'hair', nameAr: 'شعر', emoji: '‍️' },
    { key: 'skincare', nameAr: 'عناية بالبشرة', emoji: '' },
    { key: 'nails', nameAr: 'أظافر', emoji: '' },
    { key: 'general', nameAr: 'عام', emoji: '' },
  ]),
});
