import { z } from 'zod';
import { customerProcedure, router } from '../trpc';

// Ride-hailing providers (Uber/Careem) are NOT wired — no API integration,
// no fare feed. Fail closed: never fabricate a price, an ETA, a ride id, or
// a driver/car assignment.
const PROVIDERS = [
  { key: 'uber', nameAr: 'أوبر', emoji: '🚗', available: false },
  { key: 'careem', nameAr: 'كريم', emoji: '🚕', available: false },
];

export const rideHailingRouter = router({
  providers: customerProcedure.query(() => PROVIDERS),
  estimate: customerProcedure
    .input(z.object({ bookingId: z.number(), provider: z.enum(['uber', 'careem']) }))
    .query(async ({ input }) => ({
      provider: input.provider,
      bookingId: input.bookingId,
      available: false,
      reason: 'PROVIDER_NOT_CONFIGURED',
    })),
  book: customerProcedure
    .input(
      z.object({
        bookingId: z.number(),
        provider: z.enum(['uber', 'careem']),
        pickupAddress: z.string(),
      }),
    )
    .mutation(async ({ input }) => ({
      provider: input.provider,
      bookingId: input.bookingId,
      booked: false,
      status: 'PROVIDER_NOT_CONFIGURED',
      reason: 'PROVIDER_NOT_CONFIGURED',
    })),
});
