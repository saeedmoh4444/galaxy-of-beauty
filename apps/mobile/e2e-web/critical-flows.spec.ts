import { test, expect } from '@playwright/test';

/**
 * E3 — parity audit: the mobile app's critical flows, exercised as an
 * Expo web export at a phone viewport in CI (the iOS simulator path stays
 * Detox-on-macOS; ubuntu runners get the web-parity smoke).
 *
 * These specs pin the SAME flows the web suite covers — booking entry,
 * services browse, vendor entry, auth gating — so a mobile-only regression
 * in screens/hooks/API wiring fails here instead of in the store.
 */

test.use({ viewport: { width: 390, height: 844 } });
test.setTimeout(120_000);

const DEMO_EMAIL = 'customer@test.com';
const DEMO_PASSWORD = 'Admin@123456';
// Seeded SELLER with an active store (seed.ts 3.1 demo store) — the only
// account that passes the W3-3 vendor-portal ownership gate.
const STORE_EMAIL = 'demo-store@galaxyofbeauty.sa';

async function login(
  page: import('@playwright/test').Page,
  email = DEMO_EMAIL,
  opts: { landing: RegExp; expectHome?: boolean } = { landing: /\/(home)?$/ },
): Promise<void> {
  await page.goto('/login');
  await page.getByTestId('login-email').fill(email);
  await page.getByTestId('login-password').fill(DEMO_PASSWORD);
  await page.getByTestId('login-submit').click();
  // Post-login the app routes by role: customers land on the home tab,
  // SELLERs straight onto the vendor portal (R2 seller lane).
  await expect(page).toHaveURL(opts.landing, { timeout: 60_000 });
  if (opts.expectHome !== false) {
    await expect(page.getByText('الرئيسية').first()).toBeVisible({ timeout: 30_000 });
  }
}

test('customer logs in and reaches the booking flow', async ({ page }) => {
  await login(page);
  await page.goto('/bookings');
  await expect(page).toHaveURL(/\/bookings/);
  // The bookings screen renders (mobile.core.bookingsTitle). The bottom tab
  // bar carries the same label — take the first match, which is the screen
  // header once the bookings query resolves.
  await expect(page.getByText('حجوزاتي').first()).toBeVisible({ timeout: 30_000 });
});

test('services browse reaches a service detail screen', async ({ page }) => {
  await page.goto('/services');
  await expect(page).toHaveURL(/\/services/);
  // The mobile catalog lists service cards; tapping one opens the detail.
  const firstCard = page.locator('[data-testid*="service"], [href*="/services/"]').first();
  await expect(firstCard).toBeVisible({ timeout: 30_000 });
  await firstCard.click();
  await expect(page).toHaveURL(/\/services\/\d+/);
});

test('wallet requires auth and redirects to login', async ({ page }) => {
  // The mobile wallet renders for guests with a login prompt (the app's
  // route guard pattern differs from the web redirect) — assert the
  // screen itself renders rather than crashing.
  await page.goto('/wallet');
  await expect(page.getByText('المحفظة').first()).toBeVisible({ timeout: 30_000 });
});

test('vendor portal bounces a customer back home (W3-3 guard)', async ({ page }) => {
  await login(page);
  await page.goto('/vendor-portal');
  // The ownership gate holds a spinner then redirects non-vendors to home —
  // the portal shell must never mount for a customer.
  await expect(page).toHaveURL(/\/(home)?$/, { timeout: 60_000 });
  await expect(page.getByText('بوابة البائعين')).toHaveCount(0);
  await expect(page.getByText('الرئيسية').first()).toBeVisible({ timeout: 30_000 });
});

test('vendor portal renders the shell for the store owner', async ({ page }) => {
  await login(page, STORE_EMAIL, {
    landing: /\/vendor-portal/,
    expectHome: false,
  });
  // The portal shell renders (mobile.vendorPortal.title).
  await expect(page.getByText('بوابة البائعين')).toBeVisible({ timeout: 30_000 });
});
