import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { publicProcedure, adminProcedure, router } from '../trpc';

export const campaignRouter = router({
  // List active campaigns (public)
  active: publicProcedure.query(async () => {
    const now = new Date();
    return prisma.campaign.findMany({
      where: { isActive: true, startsAt: { lte: now }, endsAt: { gte: now } },
      orderBy: { endsAt: 'asc' },
    });
  }),

  // Upcoming campaigns
  upcoming: publicProcedure.query(async () => {
    const now = new Date();
    return prisma.campaign.findMany({
      where: { isActive: true, startsAt: { gt: now } },
      orderBy: { startsAt: 'asc' },
      take: 5,
    });
  }),

  // Admin: create campaign
  create: adminProcedure
    .input(z.object({
      nameAr: z.string().min(1),
      nameEn: z.string().min(1),
      descriptionAr: z.string().optional(),
      descriptionEn: z.string().optional(),
      imageUrl: z.string().optional(),
      discountType: z.enum(['percent', 'fixed']).default('percent'),
      discountValue: z.number().positive(),
      promoCode: z.string().optional(),
      startsAt: z.string().datetime(),
      endsAt: z.string().datetime(),
    }))
    .mutation(async ({ input }) => {
      const campaign = await prisma.campaign.create({
        data: {
          nameJson: { ar: input.nameAr, en: input.nameEn },
          descriptionJson: input.descriptionAr ? { ar: input.descriptionAr, en: input.descriptionEn || input.descriptionAr } : undefined,
          imageUrl: input.imageUrl,
          discountType: input.discountType,
          discountValue: input.discountValue,
          promoCode: input.promoCode,
          startsAt: new Date(input.startsAt),
          endsAt: new Date(input.endsAt),
        },
      });
      return campaign;
    }),

  // Admin: list all
  listAll: adminProcedure.query(async () => {
    return prisma.campaign.findMany({ orderBy: { createdAt: 'desc' } });
  }),
});
