/**
 * Prometheus metrics (AUDIT_2026-10-30 item 10) — the real /metrics
 * endpoint behind deploy/prometheus.yml. One process-wide registry with
 * HTTP counters, per-breaker state gauges and per-queue depth gauges.
 * In-memory only (per-process) — the multi-replica aggregation story is
 * Redis, same as lib/requestCounters.
 */
import client from 'prom-client';

const registry = new client.Registry();
registry.setDefaultLabels({ app: 'galaxy-of-beauty' });
client.collectDefaultMetrics({ register: registry, prefix: 'gob_' });

export const httpRequestsTotal = new client.Counter({
  name: 'gob_http_requests_total',
  help: 'Total tRPC requests handled',
  registers: [registry],
});

export const httpErrorsTotal = new client.Counter({
  name: 'gob_http_errors_total',
  help: 'Total tRPC requests that errored',
  registers: [registry],
});

const breakerGauge = new client.Gauge({
  name: 'gob_gateway_breaker_state',
  help: 'Circuit breaker state per gateway (0=closed, 1=halfOpen, 2=open)',
  labelNames: ['breaker'] as const,
  registers: [registry],
});

export const BREAKER_STATE_VALUE = { closed: 0, halfOpen: 1, open: 2 } as const;

/** Called from the getBreaker default hook on every state transition. */
export function recordBreakerState(name: string, state: 'closed' | 'open' | 'halfOpen'): void {
  breakerGauge.set({ breaker: name }, BREAKER_STATE_VALUE[state]);
}

const queueDepthGauge = new client.Gauge({
  name: 'gob_queue_depth',
  help: 'Waiting jobs per BullMQ queue (0 when Redis is unavailable)',
  labelNames: ['queue'] as const,
  registers: [registry],
});

async function refreshQueueDepths(): Promise<void> {
  try {
    const { getQueueHealth } = await import('./queueHealth');
    const rows = await getQueueHealth();
    for (const row of rows) {
      if (row.counts) queueDepthGauge.set({ queue: row.name }, row.counts.waiting);
    }
  } catch {
    // Redis down — leave the gauges at their last values; the health
    // monitor + alerting own the outage signal.
  }
}

/** The text exposition for GET /api/metrics (fresh queue depths). */
export async function renderMetrics(): Promise<string> {
  await refreshQueueDepths();
  return registry.metrics();
}

/** Test seam — reset gauges between tests. */
export function resetMetricsForTests(): void {
  breakerGauge.reset();
  queueDepthGauge.reset();
  httpRequestsTotal.reset();
  httpErrorsTotal.reset();
}
