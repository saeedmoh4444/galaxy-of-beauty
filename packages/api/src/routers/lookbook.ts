import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { publicProcedure, adminProcedure, router } from '../trpc';

export const lookbookRouter = router({
  getBySeason: publicProcedure
    .input(z.object({ season: z.enum(['spring', 'summer', 'autumn', 'winter', 'ramadan', 'eid']) }))
    .query(async ({ input }) => {
      return prisma.seasonalLook.findMany({
        where: { season: input.season, isPublished: true },
        orderBy: { sortOrder: 'asc' },
        take: 20,
      });
    }),

  current: publicProcedure.query(async () => {
    const month = new Date().getMonth();
    const season =
      month >= 2 && month <= 4
        ? 'spring'
        : month >= 5 && month <= 7
          ? 'summer'
          : month >= 8 && month <= 10
            ? 'autumn'
            : 'winter';
    return prisma.seasonalLook.findMany({
      where: { season, isPublished: true },
      orderBy: { sortOrder: 'asc' },
      take: 10,
    });
  }),

  list: adminProcedure
    .input(
      z.object({
        season: z.string().optional(),
        limit: z.number().int().min(1).max(100).default(50),
      }),
    )
    .query(async ({ input }) => {
      const where = input.season ? { season: input.season } : {};
      return prisma.seasonalLook.findMany({ where, orderBy: { season: 'asc' }, take: input.limit });
    }),

  create: adminProcedure
    .input(
      z.object({
        season: z.enum(['spring', 'summer', 'autumn', 'winter', 'ramadan', 'eid']),
        name: z.string().min(2).max(200),
        description: z.string().max(500),
        emoji: z.string().default(''),
      }),
    )
    .mutation(async ({ input }) => {
      return prisma.seasonalLook.create({
        data: {
          season: input.season,
          name: input.name,
          description: input.description,
          emoji: input.emoji,
        },
      });
    }),
});
