import { test, expect } from '@playwright/test';

/**
 * Phase 3 sprint 3 — wellness hub stage-aware tabs.
 * - 5 tabs render with the ARIA tab pattern (role=tab).
 * - Default tab is cycle for the seeded customer (no stage override).
 * - Clicking a tab switches panels; hidden panels stay mounted.
 * - ?tab= deep link opens the matching panel.
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
  await page.getByRole('button', { name: 'دخول' }).click();
  await page.waitForTimeout(3000);
}

test('wellness hub renders 5 tabs and switches panels', async ({ page }) => {
  await loginAsCustomer(page);
  await page.goto('/wellness-hub');

  const tabs = page.getByRole('tab');
  await expect(tabs).toHaveCount(5);

  // Default: cycle panel visible; the others stay mounted but hidden.
  await expect(page.getByTestId('hub-panel-cycle')).toBeVisible();
  await expect(page.getByTestId('hub-panel-mind')).toBeHidden();

  // Switch to the mind tab (last).
  await tabs.nth(4).click();
  await expect(page.getByTestId('hub-panel-mind')).toBeVisible();
  await expect(page.getByTestId('hub-panel-cycle')).toBeHidden();

  // Quick actions persist across tabs.
  await expect(page.locator('a[href="/self-care"]')).toBeVisible();
});

test('wellness hub ?tab=pamper deep link opens the pamper panel', async ({ page }) => {
  await loginAsCustomer(page);
  await page.goto('/wellness-hub?tab=pamper');

  await expect(page.getByTestId('hub-panel-pamper')).toBeVisible();
  await expect(page.getByTestId('hub-panel-cycle')).toBeHidden();
});
