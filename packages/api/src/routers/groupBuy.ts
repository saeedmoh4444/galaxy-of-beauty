import { z } from 'zod';
import { customerProcedure, publicProcedure, router } from '../trpc';

const DEALS = [
  { id: 1, service: 'مكياج احترافي', originalPrice: 300, groupPrice: 200, minBuyers: 5, currentBuyers: 3, endsIn: '٣ أيام', emoji: '💄', savings: 100 },
  { id: 2, service: 'تنظيف بشرة', originalPrice: 200, groupPrice: 140, minBuyers: 3, currentBuyers: 2, endsIn: 'يومين', emoji: '✨', savings: 60 },
  { id: 3, service: 'مساج استرخائي', originalPrice: 250, groupPrice: 180, minBuyers: 4, currentBuyers: 4, endsIn: 'يوم', emoji: '💆‍♀️', savings: 70 },
];

export const groupBuyRouter = router({
  deals: publicProcedure.query(() => DEALS),
  join: customerProcedure
    .input(z.object({ dealId: z.number() }))
    .mutation(async ({ input }) => {
      const deal = DEALS.find((d) => d.id === input.dealId);
      if (!deal) throw new Error('الصفقة غير موجودة');
      deal.currentBuyers += 1;
      return { ...deal, joined: true, message: deal.currentBuyers >= deal.minBuyers ? '🎉 تم تفعيل الصفقة!' : `متبقي ${deal.minBuyers - deal.currentBuyers} مشتركات` };
    }),
});
