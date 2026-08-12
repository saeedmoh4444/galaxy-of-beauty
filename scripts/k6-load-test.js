/**
 * k6 Load Test — Galaxy of Beauty tRPC API
 *
 * Usage:
 *   k6 run scripts/k6-load-test.js
 *
 * Environment variables:
 *   BASE_URL  — API base URL (default: http://localhost:3000/api/trpc)
 *   VUS       — Virtual users (default: 10)
 *   DURATION  — Test duration (default: 30s)
 *   RAMP_TIME — Ramp-up time (default: 5s)
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const errorRate = new Rate('errors');
const bookingTime = new Trend('booking_create_time');
const healthTime = new Trend('health_check_time');

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000/api/trpc';
const VUS = parseInt(__ENV.VUS || '10');
const DURATION = __ENV.DURATION || '30s';
const RAMP_TIME = __ENV.RAMP_TIME || '5s';

export const options = {
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests under 2s
    errors: ['rate<0.1'], // Error rate under 10%
  },
  scenarios: {
    ramping_load: {
      executor: 'ramping-vus',
      startVUs: 1,
      stages: [
        { duration: RAMP_TIME, target: VUS },
        { duration: DURATION, target: VUS },
        { duration: '5s', target: 0 },
      ],
    },
  },
};

const COMMON_HEADERS = {
  'Content-Type': 'application/json',
  'Accept-Language': 'ar',
};

function trpcCall(procedure, input) {
  const url = `${BASE_URL}/${procedure}`;
  const payload = input ? JSON.stringify(input) : undefined;
  const params = { headers: COMMON_HEADERS };

  let response;
  if (payload) {
    response = http.post(url, payload, params);
  } else {
    response = http.get(url, params);
  }

  const ok = check(response, {
    [`${procedure}: status 200`]: (r) => r.status === 200,
  });
  errorRate.add(!ok);

  return response;
}

export default function () {
  // ── Health Check ──
  group('Health Check', () => {
    const start = Date.now();
    const res = trpcCall('health');
    healthTime.add(Date.now() - start);

    check(res, {
      'health returns ok': (r) => {
        try {
          const data = JSON.parse(r.body);
          return data?.result?.data?.status === 'ok';
        } catch {
          return false;
        }
      },
    });
    sleep(0.5);
  });

  // ── Browse Services ──
  group('Service Catalog', () => {
    // List categories
    const catsRes = trpcCall('categories.list');
    check(catsRes, {
      'categories list ok': (r) => r.status === 200,
    });
    sleep(0.5);

    // List services
    trpcCall('services.list', { sort: 'popular', limit: 6 });
    sleep(0.5);

    // Search
    trpcCall('search.search', { q: 'شعر', limit: 10 });
    sleep(0.5);
  });

  // ── Browse Technicians ──
  group('Technicians', () => {
    trpcCall('technicians.list', { page: 1, limit: 10 });
    sleep(0.3);
  });

  // ── Browse Blog + Events ──
  group('Content', () => {
    trpcCall('blog.list', { page: 1, limit: 6 });
    sleep(0.3);
  });

  // ── Browse Marketplace ──
  group('Marketplace', () => {
    trpcCall('marketplace.products', { sortBy: 'newest', page: 1, limit: 10 });
    sleep(0.3);
    trpcCall('marketplace.productCategories');
    sleep(0.3);
  });

  // ── Booking Flow (light) ──
  group('Booking Flow', () => {
    const start = Date.now();

    // Browse services
    trpcCall('services.list', { sort: 'popular', limit: 10 });
    sleep(0.3);

    bookingTime.add(Date.now() - start);
  });
}

export function handleSummary(data) {
  const summary = {
    timestamp: new Date().toISOString(),
    duration_seconds: data.state.testRunDurationMs / 1000,
    vus_max: data.metrics.vus_max?.values?.max || 0,
    http_reqs: data.metrics.http_reqs?.values?.count || 0,
    http_req_duration_p95: data.metrics.http_req_duration?.values?.['p(95)'] || 0,
    http_req_duration_avg: data.metrics.http_req_duration?.values?.avg || 0,
    errors_rate: data.metrics.errors?.values?.rate || 0,
    health_check_avg_ms: data.metrics.health_check_time?.values?.avg || 0,
    booking_create_avg_ms: data.metrics.booking_create_time?.values?.avg || 0,
    checks_passed: data.metrics.checks?.values?.passes || 0,
    checks_failed: data.metrics.checks?.values?.fails || 0,
  };

  return {
    stdout: `\n📊 Load Test Complete
   Duration:  ${summary.duration_seconds.toFixed(1)}s
   VUs max:   ${summary.vus_max}
   Requests:  ${summary.http_reqs}
   P95:       ${summary.http_req_duration_p95.toFixed(0)}ms
   Avg:       ${summary.http_req_duration_avg.toFixed(0)}ms
   Errors:    ${(summary.errors_rate * 100).toFixed(1)}%
   Checks:    ${summary.checks_passed} passed / ${summary.checks_failed} failed
`,
    'results/summary.json': JSON.stringify(summary, null, 2),
  };
}
