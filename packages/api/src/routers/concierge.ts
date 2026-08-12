import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { EXPERIMENTAL_FEATURES } from '@galaxy/shared';
import { customerProcedure, router , requireFeatureFlag } from '../trpc';

const flag = requireFeatureFlag(EXPERIMENTAL_FEATURES.CONCIERGE);

export const conciergeRouter = router({
  request: customerProcedure.use(flag).input(
      z.object({
        request: z.string().min(5).max(500),
        category: z
          .enum(['booking', 'recommendation', 'surprise', 'transport', 'consultation', 'priority'])
          .default('booking'),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return prisma.conciergeRequest.create({
        data: { userId: ctx.user.id, request: input.request, category: input.category },
      });
    }),

  myRequests: customerProcedure.use(flag).input(z.object({ limit: z.number().int().min(1).max(30).default(10) }))
    .query(async ({ ctx, input }) => {
      return prisma.conciergeRequest.findMany({
        where: { userId: ctx.user.id },
        orderBy: { createdAt: 'desc' },
        take: input.limit,
      });
    }),

  stats: customerProcedure.use(flag).query(async ({ ctx }) => {
    const [total, pending, completed] = await Promise.all([
      prisma.conciergeRequest.count({ where: { userId: ctx.user.id } }),
      prisma.conciergeRequest.count({ where: { userId: ctx.user.id, status: 'PENDING' } }),
      prisma.conciergeRequest.count({ where: { userId: ctx.user.id, status: 'COMPLETED' } }),
    ]);
    return { total, pending, completed };
  }),
});
