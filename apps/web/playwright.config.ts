import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  workers: process.env['CI'] ? 1 : undefined,
  reporter: [['html'], ['list']],
  use: {
    baseURL: process.env['PLAYWRIGHT_BASE_URL'] || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
  ],
  webServer: process.env['CI']
    ? undefined
    : {
        command: 'npx next start --port 3000',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env['CI'],
        env: {
          // Strong, non-blacklisted secrets: next start runs in production mode
          // and the API's env validator rejects the old weak test defaults.
          JWT_ACCESS_SECRET: 'e2e-access-9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c',
          JWT_REFRESH_SECRET: 'e2e-refresh-1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d',
          DATABASE_URL:
            process.env['DATABASE_URL'] ||
            'postgresql://gob_admin:gob_secure_pass_2024@localhost:5433/Galaxy_of_Beauty_db',
        },
        timeout: 30000,
      },
});
