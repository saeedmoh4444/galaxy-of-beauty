import { publicProcedure, router } from '../trpc';

// Market-trend analytics are not computed from real platform data — never
// present hardcoded monthly numbers or growth ranks as platform trends.
export const serviceTrendsRouter = router({
  trends: publicProcedure.query(() => ({
    monthly: [],
    top: [],
    categories: ['makeup', 'skincare', 'hair', 'nails', 'massage'],
    unavailable: true,
    reason: 'TRENDS_NOT_AVAILABLE',
  })),
});
