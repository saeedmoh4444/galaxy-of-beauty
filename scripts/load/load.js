/**
 * Load scenario (7.2) — ramp → hold → ramp-down against the public
 * catalog endpoints, 30/30/40 weighted.
 *
 *   k6 run scripts/load/load.js -e TARGET_URL=http://localhost:3000 \
 *     -e VUS=30 -e DURATION=60s -e P95_MS=1500
 *
 * Threshold breach aborts the run with a non-zero exit — by design, the
 * workflow_dispatch/scheduled job goes red on regressions. Rate-limit
 * rationale: see smoke.js.
 */
import http from 'k6/http';
import { check } from 'k6';
import exec from 'k6/execution';

const TARGET = __ENV.TARGET_URL || 'https://galaxyofbeauty.sa';
const VUS = Number(__ENV.VUS || 30);
const DURATION = __ENV.DURATION || '60s';
const P95 = Number(__ENV.P95_MS || 1500);

export const options = {
  stages: [
    { duration: '30s', target: VUS },
    { duration: DURATION, target: VUS },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: [`p(95)<${P95}`],
  },
};

// k6 2.x removed the __VU/__ITER globals — read ids from k6/execution.
// Per-iteration headers give each request a fresh rate-limit bucket.
const rotatedHeaders = () => ({
  'X-Forwarded-For': `10.${exec.vu.idInInstance % 200}.${exec.scenario.iterationInInstance % 200}.1`,
});
const servicesInput = encodeURIComponent(JSON.stringify({ json: { page: 1, limit: 12 } }));

export default function () {
  const headers = rotatedHeaders();
  const bucket = exec.scenario.iterationInInstance % 10;
  let res;
  if (bucket < 3) {
    res = http.get(`${TARGET}/api/trpc/health`, { headers });
  } else if (bucket < 6) {
    res = http.get(`${TARGET}/api/trpc/categories.list`, { headers });
  } else {
    res = http.get(`${TARGET}/api/trpc/services.list?input=${servicesInput}`, {
      headers,
    });
  }
  check(res, { 'response 200': (r) => r.status === 200 });
}
