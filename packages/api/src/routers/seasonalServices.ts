/**
 * 1.4 Seasonal & Event Services — date-windowed seasonal offerings.
 *
 * Active seasonal services are those whose [startDate, endDate] window
 * contains "today" AND whose season is currently in effect (Hijri/Gregorian
 * detection from lib/season). Admin CRUD manages the catalog.
 */
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { prisma } from '@galaxy/db';
import { publicProcedure, adminProcedure, router } from '../trpc';
import { getActiveSeasons } from '../lib/season';

export const seasonalServicesRouter = router({
  /** Public: seasonal services whose window + season are active now. */
  active: publicProcedure.query(async () => {
    const now = new Date();
    const seasons = getActiveSeasons(now);
    if (seasons.length === 0) return { seasons, items: [] };
    return {
      seasons,
      items: await prisma.seasonalService.findMany({
        where: {
          isActive: true,
          season: { in: seasons },
          startDate: { lte: now },
          endDate: { gte: now },
        },
        orderBy: { season: 'asc' },
      }),
    };
  }),

  /** Admin: list all seasonal services (any window). */
  list: adminProcedure.query(async () =>
    prisma.seasonalService.findMany({ orderBy: { startDate: 'desc' } }),
  ),

  /** Admin: create. */
  create: adminProcedure
    .input(
      z.object({
        nameAr: z.string().min(2),
        nameEn: z.string().min(2),
        categoryId: z.number().int().positive(),
        season: z.enum(['EID', 'RAMADAN', 'GRADUATION', 'VALENTINE']),
        startDate: z.string(),
        endDate: z.string(),
        pricePremium: z.number().min(0).default(0),
      }),
    )
    .mutation(async ({ input }) => {
      const startDate = new Date(input.startDate);
      const endDate = new Date(input.endDate);
      if (startDate >= endDate) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'startDate must be before endDate' });
      }
      return prisma.seasonalService.create({
        data: {
          nameJson: { ar: input.nameAr, en: input.nameEn },
          categoryId: input.categoryId,
          season: input.season,
          startDate,
          endDate,
          pricePremium: input.pricePremium,
        },
      });
    }),

  /** Admin: toggle active / update window. */
  update: adminProcedure
    .input(
      z.object({
        id: z.number().int().positive(),
        isActive: z.boolean().optional(),
        pricePremium: z.number().min(0).optional(),
        endDate: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      const patch: Record<string, unknown> = { ...data };
      if (data.endDate) patch.endDate = new Date(data.endDate);
      return prisma.seasonalService.update({ where: { id }, data: patch });
    }),
});
