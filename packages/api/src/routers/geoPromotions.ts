import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { publicProcedure, adminProcedure, router } from '../trpc';

export const geoPromotionsRouter = router({
  // Public: list active promotions (optionally filtered by city)
  list: publicProcedure
    .input(z.object({ city: z.string().optional() }).optional())
    .query(async ({ input }) => {
      const where: Record<string, unknown> = {
        isActive: true,
        startsAt: { lte: new Date() },
        endsAt: { gte: new Date() },
      };
      if (input?.city) where.city = input.city;

      return prisma.geoPromotion.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 20,
      });
    }),

  // Admin: list all promotions
  adminList: adminProcedure.query(async () => {
    return prisma.geoPromotion.findMany({ orderBy: { createdAt: 'desc' } });
  }),

  // Admin: create
  create: adminProcedure
    .input(z.object({
      titleJson: z.object({ ar: z.string(), en: z.string() }),
      descriptionJson: z.object({ ar: z.string(), en: z.string() }).optional(),
      city: z.string(),
      lat: z.number().optional(),
      lng: z.number().optional(),
      radiusKm: z.number().default(5),
      discountPct: z.number().min(1).max(100),
      maxDiscount: z.number().optional(),
      minOrderAmount: z.number().optional(),
      startsAt: z.string().datetime(),
      endsAt: z.string().datetime(),
    }))
    .mutation(async ({ ctx, input }) => {
      return prisma.geoPromotion.create({
        data: { ...input, createdBy: ctx.user.id },
      });
    }),

  // Admin: update
  update: adminProcedure
    .input(z.object({
      id: z.number(),
      isActive: z.boolean().optional(),
      discountPct: z.number().min(1).max(100).optional(),
      maxDiscount: z.number().optional(),
      endsAt: z.string().datetime().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return prisma.geoPromotion.update({ where: { id }, data });
    }),
});
