import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { publicProcedure, customerProcedure, router } from '../trpc';

export const exportProgramRouter = router({
  stats: publicProcedure.query(async () => {
    const [products, countries] = await Promise.all([
      prisma.exportProduct.count(),
      prisma.exportProduct.groupBy({ by: ['country'], _count: true }),
    ]);
    return { products, countries: countries.length };
  }),

  list: publicProcedure
    .input(z.object({ limit: z.number().int().min(1).max(50).default(20) }))
    .query(async ({ input }) => prisma.exportProduct.findMany({ take: input.limit, orderBy: { createdAt: 'desc' } })),

  register: customerProcedure
    .input(z.object({ productName: z.string().min(2).max(200), country: z.string().min(2).max(100), description: z.string().max(500).optional() }))
    .mutation(async ({ ctx, input }) => prisma.exportProduct.create({ data: { name: input.productName, country: input.country, description: input.description ?? null, ownerId: ctx.user.id } })),
});
