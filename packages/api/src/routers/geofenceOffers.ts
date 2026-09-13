import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { publicProcedure, customerProcedure, adminProcedure, router } from '../trpc';

export const geofenceOffersRouter = router({
  // Public: active promotions near a city
  nearMe: publicProcedure
    .input(z.object({ city: z.string().optional() }))
    .query(async ({ input }) => {
      const where: Record<string, unknown> = {
        isActive: true,
        startsAt: { lte: new Date() },
        endsAt: { gte: new Date() },
      };
      if (input.city) where.city = input.city;

      return prisma.geoPromotion.findMany({
        where,
        orderBy: { discountPct: 'desc' },
        take: 10,
      });
    }),

  // Customer: claimed/viewed offers
  history: customerProcedure.query(async () => {
    // Track which promotions the customer has seen/claimed
    return prisma.geoPromotion.findMany({
      where: {
        isActive: true,
        startsAt: { lte: new Date() },
        endsAt: { gte: new Date() },
      },
      take: 5,
    });
  }),

  // Admin: list all
  adminList: adminProcedure.query(async () => {
    return prisma.geoPromotion.findMany({ orderBy: { createdAt: 'desc' } });
  }),

  // Admin: create
  create: adminProcedure
    .input(
      z.object({
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
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return prisma.geoPromotion.create({ data: { ...input, createdBy: ctx.user.id } });
    }),

  // Admin: toggle
  toggle: adminProcedure
    .input(z.object({ id: z.number(), isActive: z.boolean() }))
    .mutation(async ({ input }) => {
      return prisma.geoPromotion.update({
        where: { id: input.id },
        data: { isActive: input.isActive },
      });
    }),
});
