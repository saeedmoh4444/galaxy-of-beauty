/**
 * Prometheus metrics (AUDIT_2026-10-30 item 10) — the /metrics registry
 * behind deploy/prometheus.yml. HTTP counters increment from the tRPC
 * middleware, breaker gauges track gateway state, queue gauges degrade
 * to zeros when Redis is absent.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  httpRequestsTotal,
  httpErrorsTotal,
  recordBreakerState,
  renderMetrics,
  resetMetricsForTests,
} from '../lib/metrics';

describe('prometheus metrics', () => {
  beforeEach(() => {
    resetMetricsForTests();
  });

  it('increments the HTTP counters independently', async () => {
    httpRequestsTotal.inc();
    httpRequestsTotal.inc();
    httpErrorsTotal.inc();
    const text = await renderMetrics();
    expect(text).toContain('gob_http_requests_total{app="galaxy-of-beauty"} 2');
    expect(text).toContain('gob_http_errors_total{app="galaxy-of-beauty"} 1');
  });

  it('tracks breaker states per gateway name', async () => {
    recordBreakerState('fatoorah', 'open');
    recordBreakerState('openai', 'halfOpen');
    const text = await renderMetrics();
    expect(text).toContain(
      'gob_gateway_breaker_state{breaker="fatoorah",app="galaxy-of-beauty"} 2',
    );
    expect(text).toContain('gob_gateway_breaker_state{breaker="openai",app="galaxy-of-beauty"} 1');
  });

  it('renders a valid exposition with the counter lines', async () => {
    httpRequestsTotal.inc();
    const text = await renderMetrics();
    expect(text).toContain('# HELP gob_http_requests_total');
    expect(text).toContain('gob_http_requests_total{app="galaxy-of-beauty"} 1');
    expect(text).toContain('# HELP gob_gateway_breaker_state');
  });

  it('degrades queue-depth collection when Redis is unavailable', async () => {
    // No Redis in the unit env — the async collect must resolve anyway.
    const text = await renderMetrics();
    expect(text.length).toBeGreaterThan(0);
  });
});
