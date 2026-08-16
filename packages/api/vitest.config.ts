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
      // 55 → 60 → 65. Set just under current actuals (2026-08-16):
      // 51.91 stmts / 63.26 branches / 37.97 functions / 51.91 lines.
      // The laggards remain the 0%-covered workers/socket and the
      // payfort gateway integration.
      thresholds: {
        statements: 50,
        branches: 61,
        functions: 36,
        lines: 50,
      },
    },
  },
});
