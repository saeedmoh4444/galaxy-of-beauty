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
      // Coverage ratchet (audit rec #4) — NOW ENFORCED IN CI (the unit
      // job runs --coverage; previously the thresholds here were dead
      // because nothing ever requested coverage).
      // History: Aug 2026 actuals 63.72 stmts / 75.74 branches /
      // 70.17 functions / 63.72 lines. The estate has grown a lot since
      // (reels, store, wellness waves), so these are deliberately set
      // BELOW the last measured floor until the next clean CI run
      // prints fresh numbers — tighten toward 65/75/70/65 from CI data.
      thresholds: {
        statements: 60,
        branches: 70,
        functions: 65,
        lines: 60,
      },
    },
  },
});
