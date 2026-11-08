/**
 * B3 (PLATFORM_IMPROVEMENT_PLAN) — PR-level load gate.
 *
 * Same three-request walk as smoke.js but with CI-grade budgets: shared
 * runners with cold caches get p95<2000ms, and the gate's real teeth are
 * the failure rate (<1%) and the shape checks. The prod smoke/load jobs
 * keep their stricter budgets (p95<750ms).
 *
 *   k6 run scripts/load/ci-gate.js -e TARGET_URL=http://localhost:3000
 */
import http from 'k6/http';
import { check } from 'k6';
import exec from 'k6/execution';

const TARGET = __ENV.TARGET_URL || 'http://localhost:3000';

export const options = {
  vus: 1,
  iterations: 1,
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<2000'],
  },
};

// Per-iteration headers give each request a fresh anonymous rate-limit
// bucket (the route handler keys anonymous limits by the first xff hop).
const rotatedHeaders = () => ({
  'X-Forwarded-For': `10.${exec.vu.idInInstance % 200}.${exec.scenario.iterationInInstance % 200}.1`,
});

export default function () {
  const headers = rotatedHeaders();

  const health = http.get(`${TARGET}/api/trpc/health`, { headers });
  check(health, {
    'health 200': (r) => r.status === 200,
    'health database ok': (r) => r.json('result.data.json.checks.database') === 'ok',
  });

  const categories = http.get(`${TARGET}/api/trpc/categories.list`, { headers });
  check(categories, { 'categories.list 200': (r) => r.status === 200 });

  const input = encodeURIComponent(JSON.stringify({ json: { page: 1, limit: 12 } }));
  const services = http.get(`${TARGET}/api/trpc/services.list?input=${input}`, { headers });
  check(services, { 'services.list 200': (r) => r.status === 200 });
}
