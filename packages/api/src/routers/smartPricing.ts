import { z } from 'zod';
import { adminProcedure, publicProcedure, router } from '../trpc';

const DYNAMIC_PRICES = [
  { service: 'مكياج', basePrice: 300, currentPrice: 280, demand: 'medium', discount: 7, reason: 'الطلب متوسط — خصم ٧٪', emoji: '💄' },
  { service: 'تنظيف بشرة', basePrice: 200, currentPrice: 220, demand: 'high', discount: 0, reason: 'طلب مرتفع — السعر الأساسي', emoji: '✨' },
  { service: 'مساج', basePrice: 250, currentPrice: 225, demand: 'low', discount: 10, reason: 'الطلب منخفض — خصم ١٠٪', emoji: '💆‍♀️' },
  { service: 'مانيكير', basePrice: 100, currentPrice: 90, demand: 'low', discount: 10, reason: 'عرض الأحد — خصم ١٠٪', emoji: '💅' },
];

export const smartPricingRouter = router({
  current: publicProcedure.query(() => DYNAMIC_PRICES),
  update: adminProcedure
    .input(z.object({ service: z.string(), price: z.number() }))
    .mutation(async ({ input }) => {
      const svc = DYNAMIC_PRICES.find((s) => s.service === input.service);
      if (svc) svc.currentPrice = input.price;
      return { updated: true, service: input.service, newPrice: input.price };
    }),
});
