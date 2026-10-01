import { EXPERIMENTAL_FEATURES } from '@galaxy/shared';
import { adminProcedure, customerProcedure, router, requireFeatureFlag } from '../trpc';

// Demand forecasting is not wired to a model — never present invented
// booking counts, confidence percentages, or growth rates as predictions.
const flag = requireFeatureFlag(EXPERIMENTAL_FEATURES.PREDICTIVE_DEMAND);

export const predictiveDemandRouter = router({
  forecast: adminProcedure.use(flag).query(() => ({
    status: 'NOT_CONFIGURED',
    reason: 'FORECAST_NOT_AVAILABLE',
    nextWeek: null,
    nextMonth: null,
    byService: [],
  })),
  myInsights: customerProcedure.use(flag).query(() => ({
    bestTimeToBook: null,
    popularThisWeek: [],
    tip: null,
    reason: 'FORECAST_NOT_AVAILABLE',
  })),
});
