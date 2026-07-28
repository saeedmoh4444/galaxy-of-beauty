import { z } from 'zod';
import { customerProcedure, publicProcedure, router } from '../trpc';

const SAUDI_CITIES = [
  'الرياض', 'جدة', 'مكة المكرمة', 'المدينة المنورة', 'الدمام', 'الخبر',
  'الظهران', 'الطائف', 'أبها', 'بريدة', 'تبوك', 'حائل', 'الجبيل', 'ينبع',
];

export const homeServiceRouter = router({
  // Get service pricing for at-home services (includes travel fee)
  estimate: publicProcedure
    .input(z.object({ city: z.string(), serviceCategory: z.string().optional() }))
    .query(async ({ input }) => {
      const baseFee = 50; // SAR
      const travelFee = input.city === 'الرياض' || input.city === 'جدة' ? 30 : input.city ? 50 : 30;
      const serviceFee = 100; // average service
      return {
        city: input.city,
        baseFee,
        travelFee,
        serviceFee,
        total: baseFee + travelFee + serviceFee,
        currency: 'SAR',
        cities: SAUDI_CITIES,
      };
    }),

  // Request home service booking
  request: customerProcedure
    .input(z.object({
      serviceId: z.number(),
      city: z.string(), address: z.string().min(5),
      preferredDate: z.string(), preferredTime: z.string(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => ({
      requestId: `HOME-${ctx.user.id}-${Date.now()}`,
      status: 'PENDING',
      ...input,
      estimatedArrival: 'خلال ٤٥-٦٠ دقيقة',
      confirmationSms: true,
    })),
});
