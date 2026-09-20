/**
 * Load-test smoke script (7.2) — 1 VU, one iteration per endpoint.
 *
 *   k6 run scripts/load/smoke.js -e TARGET_URL=http://localhost:3000
 *
 * Rate limiting: the API rate-limits anonymous requests by client IP —
 * the first `x-forwarded-for` hop, which the route handler trusts
 * (20 req/min per IP+procedure). Rotating a fresh IP per iteration gives
 * each request its own bucket, so this measures handler performance, not
 * the limiter. Do not raise VUs without ops awareness.
 */
import http from 'k6/http';
import { check } from 'k6';
import exec from 'k6/execution';

const TARGET = __ENV.TARGET_URL || 'https://galaxyofbeauty.sa';

export const options = {
  vus: 1,
  iterations: 1,
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<750'],
  },
};

// k6 2.x removed the __VU/__ITER globals — read ids from k6/execution.
// Per-iteration headers give each request a fresh rate-limit bucket.
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

  // superjson wire format (verified against @trpc/client): input =
  // encodeURIComponent(JSON.stringify(transformer.input.serialize(input)))
  const input = encodeURIComponent(JSON.stringify({ json: { page: 1, limit: 12 } }));
  const services = http.get(`${TARGET}/api/trpc/services.list?input=${input}`, {
    headers,
  });
  check(services, { 'services.list 200': (r) => r.status === 200 });
}
