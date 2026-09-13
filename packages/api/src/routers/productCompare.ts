import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { publicProcedure, router } from '../trpc';

const db = prisma;

export const productCompareRouter = router({
  list: publicProcedure.query(() =>
    db.compareProduct.findMany({ where: { isActive: true }, orderBy: { createdAt: 'desc' } }),
  ),

  compare: publicProcedure
    .input(z.object({ ids: z.array(z.number()).min(2).max(4) }))
    .query(async ({ input }) => {
      const products = await db.compareProduct.findMany({
        where: { id: { in: input.ids }, isActive: true },
      });
      return { products, dimensions: ['hydration', 'absorption', 'value', 'gentle'] };
    }),
});
