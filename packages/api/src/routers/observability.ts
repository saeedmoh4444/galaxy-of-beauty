/**
 * 7.3 Observability 2.0 — SLO/SLI surface.
 *
 * sloStatus is public so the future /status page can render uptime
 * without auth; the counters feed from the requestCounter middleware.
 */
import { publicProcedure, router } from '../trpc';
import { getSloSnapshot } from '../lib/slo';
import { SLO_TARGET_AVAILABILITY, SLO_TARGET_P95_MS } from '@galaxy/shared';

export const observabilityRouter = router({
  sloStatus: publicProcedure.query(() => {
    const snap = getSloSnapshot();
    return {
      ...snap,
      targets: { availability: SLO_TARGET_AVAILABILITY, p95Ms: SLO_TARGET_P95_MS },
    };
  }),
});
