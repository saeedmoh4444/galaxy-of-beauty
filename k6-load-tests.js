/**
 * k6 Load Testing Script — Galaxy of Beauty API
 *
 * Tests critical API endpoints under load to identify bottlenecks.
 *
 * Usage:
 *   k6 run k6-load-tests.js
 *   k6 run --vus 50 --duration 60s k6-load-tests.js
 *
 * Scenarios:
 *   1. Browse catalog (anonymous users) — 60% of traffic
 *   2. Search services — 20%
 *   3. Auth (login) — 10%
 *   4. Health check — 10%
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const searchTrend = new Trend('search_duration');
const loginTrend = new Trend('login_duration');

// Configuration
const BASE_URL = __ENV.API_URL || 'http://localhost:4000/api';
const VUS = __ENV.VUS || 10;
const DURATION = __ENV.DURATION || '30s';

export const options = {
  vus: VUS,
  duration: DURATION,
  thresholds: {
    http_req_duration: ['p(95)<2000'],  // 95% of requests under 2s
    http_req_failed: ['rate<0.05'],      // <5% error rate
    errors: ['rate<0.05'],
  },
  stages: [
    { duration: '10s', target: Math.floor(VUS * 0.3) },  // Ramp up
    { duration: DURATION, target: VUS },                   // Steady load
    { duration: '10s', target: 0 },                        // Ramp down
  ],
};

// Demo credentials (from seed)
const DEMO_EMAIL = 'sara.demo@example.com';
const DEMO_PASSWORD = 'Demo@123456';

// Shared auth token
let authToken = null;

export default function () {
  // ── Scenario 1: Browse Catalog (60%) ──────────────────
  group('Catalog - Browse', () => {
    // Categories
    const catRes = http.get(`${BASE_URL}/categories`, {
      headers: { 'Accept-Language': 'ar' },
    });
    check(catRes, {
      'categories: status 200': (r) => r.status === 200,
      'categories: is array': (r) => Array.isArray(r.json()),
    }) || errorRate.add(1);

    sleep(1);

    // Services list (paginated)
    const svcRes = http.get(`${BASE_URL}/services?limit=12&sortBy=popularity`);
    check(svcRes, {
      'services: status 200': (r) => r.status === 200,
      'services: has pagination': (r) => r.json().pagination !== undefined,
    }) || errorRate.add(1);

    sleep(1);

    // Service detail (random ID 1-10)
    const randomId = Math.floor(Math.random() * 10) + 1;
    const detailRes = http.get(`${BASE_URL}/services/${randomId}`);
    check(detailRes, {
      'detail: status 200 or 404': (r) => r.status === 200 || r.status === 404,
    }) || errorRate.add(1);

    sleep(2);
  });

  // ── Scenario 2: Search (20%) ──────────────────────────
  group('Catalog - Search', () => {
    const start = Date.now();
    const searchTerms = ['شعر', 'مكياج', 'بشرة', 'مساج', 'أظافر'];
    const term = searchTerms[Math.floor(Math.random() * searchTerms.length)];

    const res = http.get(`${BASE_URL}/services?search=${term}&limit=10`);
    searchTrend.add(Date.now() - start);

    check(res, {
      'search: status 200': (r) => r.status === 200,
    }) || errorRate.add(1);

    sleep(1);
  });

  // ── Scenario 3: Auth (10%) ────────────────────────────
  group('Auth - Login', () => {
    const start = Date.now();

    const res = http.post(`${BASE_URL}/auth/login`, JSON.stringify({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
    }), {
      headers: { 'Content-Type': 'application/json' },
    });

    loginTrend.add(Date.now() - start);

    check(res, {
      'login: status 200': (r) => r.status === 200,
      'login: has token': (r) => r.json().accessToken !== undefined,
    }) || errorRate.add(1);

    if (res.status === 200) {
      authToken = res.json().accessToken;
    }

    sleep(3);
  });

  // ── Scenario 4: Authenticated (if token available) ────
  if (authToken) {
    group('Authenticated - Wallet', () => {
      const res = http.get(`${BASE_URL}/wallet`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      check(res, {
        'wallet: status 200': (r) => r.status === 200,
      }) || errorRate.add(1);

      sleep(1);
    });

    group('Authenticated - Bookings', () => {
      const res = http.get(`${BASE_URL}/bookings?limit=5`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      check(res, {
        'bookings: status 200': (r) => r.status === 200,
      }) || errorRate.add(1);

      sleep(1);
    });
  }

  // ── Scenario 5: Health Check (10%) ────────────────────
  group('System - Health', () => {
    const res = http.get(`${BASE_URL}/health`);
    check(res, {
      'health: status 200': (r) => r.status === 200,
      'health: has status': (r) => r.json().status !== undefined,
    }) || errorRate.add(1);
  });

  // Total sleep between iterations
  sleep(2);
}

// Summary report
export function handleSummary(data) {
  return {
    'k6-summary.json': JSON.stringify(data, null, 2),
    stdout: `
╔══════════════════════════════════════════════╗
║     Galaxy of Beauty — Load Test Report      ║
╠══════════════════════════════════════════════╣
║  Total Requests:  ${data.metrics.http_reqs.values.count}
║  Failed:          ${data.metrics.http_req_failed.values.passes || 0}
║  Avg Duration:    ${data.metrics.http_req_duration.values.avg.toFixed(2)}ms
║  P95 Duration:    ${data.metrics.http_req_duration.values['p(95)'].toFixed(2)}ms
║  Peak VUs:        ${data.metrics.vus_max.values.max}
╚══════════════════════════════════════════════╝
`,
  };
}
