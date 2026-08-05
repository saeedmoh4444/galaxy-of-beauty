import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { publicProcedure, adminProcedure, router } from '../trpc';

export const beautyBundlesRouter = router({
  // Public: list active bundles
  list: publicProcedure
    .input(z.object({ season: z.string().optional() }).optional())
    .query(async ({ input }) => {
      const where: Record<string, unknown> = { isActive: true };
      if (input?.season) where.season = input.season;
      return prisma.beautyBundle.findMany({
        where,
        orderBy: { sortOrder: 'asc' },
        take: 20,
      });
    }),

  // Admin: list all
  adminList: adminProcedure.query(async () => {
    return prisma.beautyBundle.findMany({ orderBy: { createdAt: 'desc' } });
  }),

  // Admin: create
  create: adminProcedure
    .input(z.object({
      titleJson: z.object({ ar: z.string(), en: z.string() }),
      descriptionJson: z.object({ ar: z.string(), en: z.string() }).optional(),
      serviceIds: z.array(z.number()).min(2),
      discountPct: z.number().min(5).max(50),
      totalPrice: z.number().positive(),
      originalPrice: z.number().positive(),
      imageUrl: z.string().optional(),
      isSeasonal: z.boolean().default(false),
      season: z.string().optional(),
      validUntil: z.string().datetime().optional(),
      sortOrder: z.number().default(0),
    }))
    .mutation(async ({ input }) => {
      return prisma.beautyBundle.create({ data: input });
    }),
});
