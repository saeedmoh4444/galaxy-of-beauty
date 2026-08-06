import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { publicProcedure, customerProcedure, router } from '../trpc';
import { notFound } from '../lib/errors';

export const greenSalonRouter = router({
  list: publicProcedure
    .input(z.object({ page: z.number().int().min(1).default(1), limit: z.number().int().min(1).max(50).default(12) }))
    .query(async ({ input }) => {
      const [items, total] = await Promise.all([
        prisma.greenSalon.findMany({ where: { isVerified: true }, orderBy: { name: 'asc' }, skip: (input.page - 1) * input.limit, take: input.limit }),
        prisma.greenSalon.count({ where: { isVerified: true } }),
      ]);
      return { items, total, page: input.page, pages: Math.ceil(total / input.limit) };
    }),

  getById: publicProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ input }) => {
      const salon = await prisma.greenSalon.findUnique({ where: { id: input.id } });
      if (!salon) throw notFound('Green salon', input.id);
      return salon;
    }),

  register: customerProcedure
    .input(z.object({ name: z.string().min(2).max(100), practices: z.array(z.string()), city: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      return prisma.greenSalon.create({ data: { name: input.name, practices: input.practices, city: input.city ?? null, ownerId: ctx.user.id } });
    }),
});
