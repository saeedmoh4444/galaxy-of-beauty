import { defineConfig, devices } from '@playwright/test';

/**
 * E3 — mobile parity smoke: runs the Expo web export (dist/) at a phone
 * viewport against the API served on :3000. Serves the static export on
 * :8081 (npx serve -s — SPA fallback for Expo Router deep links).
 */
export default defineConfig({
  testDir: './e2e-web',
  timeout: 120_000,
  fullyParallel: false,
  retries: 1,
  reporter: [['list']],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:8081',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    ...devices['Pixel 5'],
  },
  projects: [{ name: 'mobile-web', use: { browserName: 'chromium' } }],
});
