import { z } from 'zod';
import { customerProcedure, router } from '../trpc';

const PROVIDERS = [
  { key: 'uber', nameAr: 'أوبر', emoji: '', estimatedPrice: 35, estimatedTime: '٨ دقائق' },
  { key: 'careem', nameAr: 'كريم', emoji: '', estimatedPrice: 30, estimatedTime: '١٠ دقائق' },
];

export const rideHailingRouter = router({
  providers: customerProcedure.query(() => PROVIDERS),
  estimate: customerProcedure
    .input(z.object({ bookingId: z.number(), provider: z.enum(['uber', 'careem']) }))
    .query(async ({ input }) => {
      const provider = PROVIDERS.find((p) => p.key === input.provider);
      return {
        provider: input.provider,
        pickupLocation: 'موقعكِ الحالي',
        dropoff: 'صالون التجميل',
        estimatedPrice: provider?.estimatedPrice ?? 30,
        estimatedTime: provider?.estimatedTime ?? '١٠ دقائق',
        bookingId: input.bookingId,
      };
    }),
  book: customerProcedure
    .input(
      z.object({
        bookingId: z.number(),
        provider: z.enum(['uber', 'careem']),
        pickupAddress: z.string(),
      }),
    )
    .mutation(async ({ input }) => ({
      rideId: `RIDE-${Date.now()}`,
      provider: input.provider,
      status: 'SEARCHING',
      estimatedArrival: '٥-١٠ دقائق',
      driverName: 'محمد',
      carModel: 'كامري ٢٠٢٥',
      plateNumber: 'أ ب ج ١٢٣٤',
    })),
});
