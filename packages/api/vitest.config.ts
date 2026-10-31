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
      // Wallet purchases in tests go through payments.payCart, which calls
      // the Fatoorah shipping calc — simulate mode keeps them hermetic
      // (matching the dev environment).
      FATOORAH_SIMULATE: process.env['FATOORAH_SIMULATE'] || 'true',
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
      // Coverage ratchet (audit rec #4) — NOW ENFORCED IN CI (the unit
      // job runs --coverage; previously the thresholds here were dead
      // because nothing ever requested coverage).
      // History: Aug 2026 actuals 63.72 stmts / 75.74 branches /
      // 70.17 functions / 63.72 lines. The estate has grown a lot since
      // (reels, store, wellness waves), so the ratchet floors at the
      // 2026-10-31 CI measurement (64.35 / 56.45 / 54.25 / 66.01) minus
      // the ±0.5 jitter margin — tighten from each clean CI run's
      // printed numbers, never below this floor.
      thresholds: {
        statements: 63,
        branches: 55,
        functions: 53,
        lines: 65,
      },
    },
  },
});
