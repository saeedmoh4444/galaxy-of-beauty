import { renderMetrics } from '@galaxy/api';

export const runtime = 'node';
export const dynamic = 'force-dynamic';

/**
 * GET /api/metrics — the Prometheus scrape endpoint behind
 * deploy/prometheus.yml (AUDIT_2026-10-30 item 10). Node runtime only
 * (prom-client), always fresh (collect-on-scrape queue depths).
 */
export async function GET(): Promise<Response> {
  const text = await renderMetrics();
  return new Response(text, {
    headers: { 'Content-Type': 'text/plain; version=0.0.4; charset=utf-8' },
  });
}
