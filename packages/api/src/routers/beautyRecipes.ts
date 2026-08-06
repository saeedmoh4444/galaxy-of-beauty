import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { publicProcedure, adminProcedure, router } from '../trpc';

export const beautyRecipesRouter = router({
  list: publicProcedure
    .input(z.object({ page: z.number().int().min(1).default(1), limit: z.number().int().min(1).max(50).default(12), forSkin: z.string().optional() }))
    .query(async ({ input }) => {
      const where = input.forSkin ? { forSkin: input.forSkin } : {};
      const [items, total] = await Promise.all([
        prisma.beautyRecipe.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (input.page - 1) * input.limit, take: input.limit }),
        prisma.beautyRecipe.count({ where }),
      ]);
      return { items, total, page: input.page, pages: Math.ceil(total / input.limit) };
    }),

  getById: publicProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ input }) => prisma.beautyRecipe.findUnique({ where: { id: input.id } })),

  create: adminProcedure
    .input(z.object({ title: z.string().min(3).max(200), ingredientsJson: z.array(z.string()), stepsJson: z.array(z.string()), duration: z.string(), forSkin: z.string().optional(), emoji: z.string().default('🥣') }))
    .mutation(async ({ input }) => prisma.beautyRecipe.create({ data: { title: input.title, ingredientsJson: input.ingredientsJson, stepsJson: input.stepsJson, duration: input.duration, forSkin: input.forSkin ?? null, emoji: input.emoji } })),
});
