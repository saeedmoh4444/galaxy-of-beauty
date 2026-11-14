import { test, expect } from '@playwright/test';

/**
 * Phase 3 sprint 4 — dashboard shell: grouped customer sidebar.
 * - 6 collapsible group headers render (data-testid=nav-group-toggle).
 * - The group holding the active route is expanded by default; the rest
 *   are collapsed.
 * - Clicking a group header toggles aria-expanded and reveals its links.
 * - Mobile keeps the 5-item bottom nav.
 * Requires seeded test customer: customer@test.com / Admin@123456
 */

const TEST_EMAIL = 'customer@test.com';
const TEST_PASSWORD = 'Admin@123456';

// First hit per locale compiles the route on-demand — be generous.
test.setTimeout(120_000);

async function loginAsCustomer(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.getByPlaceholder('example@email.com').fill(TEST_EMAIL);
  await page.getByPlaceholder('••••••••').fill(TEST_PASSWORD);
  const submitBtn = page.getByRole('button', { name: 'دخول' });
  await expect(submitBtn).toBeEnabled({ timeout: 30_000 });
  await page.getByPlaceholder('example@email.com').fill(TEST_EMAIL);
  await page.getByPlaceholder('••••••••').fill(TEST_PASSWORD);
  await submitBtn.click();
  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 45_000 });
}

// The sidebar is desktop-only (md+); the second test covers the mobile nav.
test.skip(({ isMobile }) => isMobile, 'sidebar targets md+ (desktop) viewports only');

test('dashboard sidebar shows 6 collapsible groups, active group open', async ({ page }) => {
  await loginAsCustomer(page);
  await page.goto('/dashboard');

  const toggles = page.getByTestId('nav-group-toggle');
  // 20s: the sidebar renders after auth hydration — under CI CPU contention
  // the 5s default lost the race (the pre-hydration flake war).
  await expect(toggles).toHaveCount(6, { timeout: 20_000 });

  // Core group (holds /dashboard) is expanded by default.
  await expect(toggles.first()).toHaveAttribute('aria-expanded', 'true');
  // :visible — on mobile the sidebar copy of this link is hidden and the
  // bottom-nav copy is the one that must render.
  await expect(page.locator('a[href="/wallet"]:visible')).toBeVisible({ timeout: 20_000 });

  // Shopping group is collapsed by default and expands on click.
  const shopping = toggles.nth(3);
  await expect(shopping).toHaveAttribute('aria-expanded', 'false');
  await shopping.click();
  await expect(shopping).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('a[href="/cart"]:visible')).toBeVisible({ timeout: 20_000 });
});

test('mobile viewport keeps the 5-item bottom nav', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await loginAsCustomer(page);
  await page.goto('/dashboard');

  const bottomNav = page.locator('nav.fixed.bottom-0');
  await expect(bottomNav).toBeVisible({ timeout: 20_000 });
  await expect(bottomNav.locator('a')).toHaveCount(5);
});
