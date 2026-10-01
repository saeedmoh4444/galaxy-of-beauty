import { z } from 'zod';
import { adminProcedure, publicProcedure, router } from '../trpc';

// Legacy smart-pricing showcase surface. Real dynamic pricing lives in
// lib/pricing.ts (ServicePricing rules × Booking demand, feature 1.1).
// Fail closed here instead of presenting hardcoded "live" prices — and
// never confirm an admin edit that was not persisted.
export const smartPricingRouter = router({
  current: publicProcedure.query(() => ({
    configured: false,
    reason: 'NOT_CONFIGURED',
    prices: [],
  })),
  update: adminProcedure
    .input(z.object({ service: z.string(), price: z.number() }))
    .mutation(async ({ input }) => ({
      updated: false,
      service: input.service,
      reason: 'NOT_CONFIGURED',
    })),
});
