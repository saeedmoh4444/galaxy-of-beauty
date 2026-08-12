import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { customerProcedure, adminProcedure, router } from '../trpc';

export const customerFeedbackRouter = router({
  submit: customerProcedure
    .input(
      z.object({
        category: z.enum(['suggestion', 'bug', 'praise', 'complaint']),
        message: z.string().min(5).max(1000),
        rating: z.number().int().min(1).max(5).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return prisma.customerFeedback.create({
        data: {
          userId: ctx.user.id,
          category: input.category,
          message: input.message,
          rating: input.rating ?? null,
        },
      });
    }),

  myFeedback: customerProcedure
    .input(z.object({ limit: z.number().int().min(1).max(30).default(10) }))
    .query(async ({ ctx, input }) =>
      prisma.customerFeedback.findMany({
        where: { userId: ctx.user.id },
        take: input.limit,
        orderBy: { createdAt: 'desc' },
      }),
    ),

  list: adminProcedure
    .input(
      z.object({
        category: z.string().optional(),
        limit: z.number().int().min(1).max(100).default(50),
      }),
    )
    .query(async ({ input }) => {
      const where = input.category ? { category: input.category } : {};
      return prisma.customerFeedback.findMany({
        where,
        take: input.limit,
        orderBy: { createdAt: 'desc' },
      });
    }),

  stats: adminProcedure.query(async () => {
    const [total, byCategory, avgRating] = await Promise.all([
      prisma.customerFeedback.count(),
      prisma.customerFeedback.groupBy({ by: ['category'], _count: true }),
      prisma.customerFeedback.aggregate({ _avg: { rating: true } }),
    ]);
    return { total, byCategory, avgRating: Math.round((avgRating._avg.rating ?? 0) * 10) / 10 };
  }),
});
