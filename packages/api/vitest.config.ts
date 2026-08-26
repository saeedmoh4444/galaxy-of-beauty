import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/__tests__/**/*.test.ts'],
    // All 65 test files share one dev database; parallel file execution
    // caused cross-file races (another file's in-flight bookings leaking
    // into calendar.sync's view, payout wipes swallowing payment rows).
    // Files run one at a time; tests within a file stay parallel.
    fileParallelism: false,
    env: {
      DATABASE_URL:
        process.env['DATABASE_URL'] ||
        'postgresql://gob_admin:gob_secure_pass_2024@localhost:5433/Galaxy_of_Beauty_db',
      JWT_ACCESS_SECRET:
        process.env['JWT_ACCESS_SECRET'] || 'dev-access-secret-at-least-32-chars-long',
      JWT_REFRESH_SECRET:
        process.env['JWT_REFRESH_SECRET'] || 'dev-refresh-secret-at-least-32-chars-long',
    },
    // ── Coverage (TEST-005) ──────────────────────────────
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      include: ['src/**/*.ts'],
      exclude: [
        'src/__tests__/**',
        'src/**/*.test.ts',
        'src/routers/index.ts', // barrel file
      ],
      // Coverage ratchet (audit rec #4) — raise quarterly toward
      // 55 → 60 → 65. Set under current actuals (2026-08-19):
      // 63.72 stmts / 75.74 branches / 70.17 functions / 63.72 lines.
      // Same-code runs jitter ±0.4 — keep ≥0.5 margin on every metric.
      // 2026-08-19 raise (the "push toward 60" campaign): 17 routers
      // covered by 6 agents (+188 tests); routers fixed en route:
      // beautyDiscovery emoji selects (was broken at runtime),
      // referrals applyCode circularity + unique-constraint,
      // payouts.calculate idempotency, technicianEarnings user-id
      // filter, waitlist rejoin P2002, calendar.pull fetch errors.
      thresholds: {
        statements: 62,
        branches: 74,
        functions: 69,
        lines: 62,
      },
    },
  },
});
