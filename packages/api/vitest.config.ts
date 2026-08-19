import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/__tests__/**/*.test.ts'],
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
      // 55.34 stmts / 72.22 branches / 61.4 functions / 55.34 lines.
      // Same-code runs jitter ±0.4 — keep ≥0.5 margin on every metric.
      // 2026-08-19 raise: +46 tests (zatcaMock, sentry, sms, push,
      // googleCalendar, geofenceOffers) and the orphaned
      // geoPromotions/serviceBundles routers archived (dead code
      // removal also lifted the denominator).
      thresholds: {
        statements: 54,
        branches: 70,
        functions: 60,
        lines: 54,
      },
    },
  },
});
