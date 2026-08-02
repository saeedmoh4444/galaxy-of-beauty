import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { customerProcedure, publicProcedure, router } from '../trpc';

export const beforeAfterRouter = router({
  feed: publicProcedure
    .input(z.object({ page: z.number().default(1), limit: z.number().default(12) }))
    .query(async ({ input }) => {
      const skip = (input.page - 1) * input.limit;
      const [items, total] = await Promise.all([
        prisma.beforeAfter.findMany({ orderBy: { createdAt: 'desc' }, skip, take: input.limit }),
        prisma.beforeAfter.count(),
      ]);
      return { items, total };
    }),

  submit: customerProcedure
    .input(z.object({ beforeUrl: z.string(), afterUrl: z.string(), serviceType: z.string(), technicianName: z.string(), description: z.string().max(300) }))
    .mutation(async ({ ctx, input }) =>
      prisma.beforeAfter.create({ data: { userId: ctx.user.id, userName: ctx.user.email || 'مستخدمة', ...input } })
    ),
});
