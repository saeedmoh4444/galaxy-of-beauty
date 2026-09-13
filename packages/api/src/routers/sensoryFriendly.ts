import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { publicProcedure, customerProcedure, router } from '../trpc';

export const sensoryFriendlyRouter = router({
  listSalons: publicProcedure
    .input(
      z.object({
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(50).default(12),
      }),
    )
    .query(async ({ input }) => {
      const [items, total] = await Promise.all([
        prisma.sensoryFriendlySalon.findMany({
          where: { isCertified: true },
          skip: (input.page - 1) * input.limit,
          take: input.limit,
        }),
        prisma.sensoryFriendlySalon.count({ where: { isCertified: true } }),
      ]);
      return { items, total, page: input.page, pages: Math.ceil(total / input.limit) };
    }),

  register: customerProcedure
    .input(
      z.object({
        salonName: z.string().min(2).max(200),
        features: z.array(z.string()),
        city: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return prisma.sensoryFriendlySalon.create({
        data: {
          name: input.salonName,
          features: input.features,
          city: input.city ?? null,
          ownerId: ctx.user.id,
        },
      });
    }),
});
