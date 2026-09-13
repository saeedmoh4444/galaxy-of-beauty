import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { publicProcedure, adminProcedure, router } from '../trpc';
import { notFound } from '../lib/errors';

export const beautyMythsRouter = router({
  list: publicProcedure
    .input(
      z.object({
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(50).default(10),
        category: z.string().optional(),
      }),
    )
    .query(async ({ input }) => {
      const where = input.category ? { category: input.category } : {};
      const [items, total] = await Promise.all([
        prisma.beautyMyth.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip: (input.page - 1) * input.limit,
          take: input.limit,
        }),
        prisma.beautyMyth.count({ where }),
      ]);
      return { items, total, page: input.page, pages: Math.ceil(total / input.limit) };
    }),

  getRandom: publicProcedure.query(async () => {
    const count = await prisma.beautyMyth.count();
    const skip = Math.floor(Math.random() * count);
    return prisma.beautyMyth.findFirst({ skip, take: 1 });
  }),

  create: adminProcedure
    .input(
      z.object({
        myth: z.string().min(5).max(500),
        fact: z.string().min(5).max(1000),
        category: z.string().default('general'),
        source: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      return prisma.beautyMyth.create({
        data: {
          myth: input.myth,
          fact: input.fact,
          category: input.category,
          source: input.source ?? null,
        },
      });
    }),

  delete: adminProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ input }) => {
      const myth = await prisma.beautyMyth.findUnique({ where: { id: input.id } });
      if (!myth) throw notFound('Beauty myth', input.id);
      await prisma.beautyMyth.delete({ where: { id: input.id } });
      return { success: true };
    }),
});
