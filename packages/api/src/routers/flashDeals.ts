import { z } from 'zod';
import { prisma } from '@galaxy/db';
import { DEFAULT_PAGE_SIZE, SMALL_PAGE_SIZE } from '@galaxy/shared';
import { publicProcedure, adminProcedure, router } from '../trpc';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

export const flashDealRouter = router({
  active: publicProcedure.query(async () => {
    const now = new Date();
    const deals = await db.flashDeal.findMany({
      where: { isActive: true, startsAt: { lte: now }, endsAt: { gte: now } },
      orderBy: { endsAt: 'asc' },
      take: DEFAULT_PAGE_SIZE,
    });
    // Enrich with service info
    const enriched = await Promise.all(
      deals.map(async (d: any) => {
        const service = await db.service.findUnique({ where: { id: d.serviceId } });
        const nameJson = service?.nameJson as Record<string, string> | undefined;
        return {
          ...d,
          discountValue: Number(d.discountValue),
          originalPrice: Number(d.originalPrice),
          dealPrice: Number(d.dealPrice),
          serviceNameAr: nameJson?.ar ?? '',
          serviceNameEn: nameJson?.en ?? '',
          serviceEmoji: service?.emoji ?? '💅',
        };
      }),
    );
    return enriched;
  }),
  upcoming: publicProcedure.query(async () => {
    const now = new Date();
    const deals = await db.flashDeal.findMany({
      where: { isActive: true, startsAt: { gt: now } },
      orderBy: { startsAt: 'asc' },
      take: SMALL_PAGE_SIZE,
    });
    return deals.map((d: any) => ({
      ...d,
      discountValue: Number(d.discountValue),
      originalPrice: Number(d.originalPrice),
      dealPrice: Number(d.dealPrice),
    }));
  }),
  create: adminProcedure
    .input(
      z.object({
        serviceId: z.number(),
        discountPercent: z.number().min(10).max(80),
        maxRedemptions: z.number().min(1).default(20),
        durationHours: z.number().min(1).max(72).default(24),
        titleAr: z.string().optional(),
        titleEn: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const service = await db.service.findUnique({ where: { id: input.serviceId } });
      if (!service) throw new Error('Service not found');
      const originalPrice = Number(service.basePrice);
      const discountValue = Math.round((originalPrice * input.discountPercent) / 100);
      const dealPrice = originalPrice - discountValue;
      return db.flashDeal.create({
        data: {
          serviceId: input.serviceId,
          discountPercent: input.discountPercent,
          originalPrice,
          dealPrice,
          discountValue,
          maxRedemptions: input.maxRedemptions,
          currentRedemptions: 0,
          startsAt: new Date(),
          endsAt: new Date(Date.now() + input.durationHours * 3600000),
          titleAr: input.titleAr,
          titleEn: input.titleEn,
          isActive: true,
        },
      });
    }),
  claim: publicProcedure.input(z.object({ dealId: z.number() })).mutation(async ({ input }) => {
    const deal = await db.flashDeal.findUnique({ where: { id: input.dealId } });
    if (!deal || !deal.isActive) throw new Error('العرض غير متاح');
    if (deal.currentRedemptions >= deal.maxRedemptions) throw new Error('نفذت الكمية');
    await db.flashDeal.update({
      where: { id: input.dealId },
      data: { currentRedemptions: { increment: 1 } },
    });
    return {
      dealPrice: Number(deal.dealPrice),
      originalPrice: Number(deal.originalPrice),
      discountPercent: deal.discountPercent,
      serviceId: deal.serviceId,
    };
  }),
});
