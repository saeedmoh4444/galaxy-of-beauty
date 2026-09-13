import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { publicProcedure, router } from '../trpc';
import { notFound } from '../lib/errors';

export const beautyHeritageRouter = router({
  list: publicProcedure
    .input(
      z.object({
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(50).default(12),
      }),
    )
    .query(async ({ input }) => {
      const [items, total] = await Promise.all([
        prisma.beautyHeritagePractice.findMany({
          orderBy: { name: 'asc' },
          skip: (input.page - 1) * input.limit,
          take: input.limit,
        }),
        prisma.beautyHeritagePractice.count(),
      ]);
      return { items, total, page: input.page, pages: Math.ceil(total / input.limit) };
    }),

  getByName: publicProcedure
    .input(z.object({ name: z.string().min(1) }))
    .query(async ({ input }) => {
      const practice = await prisma.beautyHeritagePractice.findFirst({
        where: { name: { contains: input.name } },
      });
      if (!practice) throw notFound('Heritage practice', input.name);
      return practice;
    }),
});
