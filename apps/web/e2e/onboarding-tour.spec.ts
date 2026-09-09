import { test, expect } from '@playwright/test';

/**
 * §3.6 — customer first-run onboarding tour (web).
 *
 * Covers the acceptance contract from docs/UI_DESIGN_SYSTEM_PLAN.md §3.6:
 * tour auto-opens once on /dashboard, is 100% skippable, persists the
 * dismissal across reloads, and can be replayed from the dashboard header.
 */

const CUSTOMER_EMAIL = 'customer@test.com';
const CUSTOMER_PASSWORD = 'Admin@123456';

async function loginAsCustomer(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.waitForTimeout(1000);
  await page.getByPlaceholder('example@email.com').fill(CUSTOMER_EMAIL);
  await page.getByPlaceholder('••••••••').fill(CUSTOMER_PASSWORD);
  await page.getByRole('button', { name: 'دخول' }).click();
  await page.waitForTimeout(3000);
}

test.describe('Onboarding tour (§3.6)', () => {
  test('auto-opens on first dashboard visit and skip persists', async ({ page }) => {
    await loginAsCustomer(page);
    await page.goto('/dashboard');

    // First visit in a fresh context → tour opens (after the settle delay).
    await expect(page.getByTestId('tour-card')).toBeVisible({ timeout: 15000 });

    // Skip must hide it immediately.
    await page.getByTestId('tour-skip').click();
    await expect(page.getByTestId('tour-card')).toBeHidden();

    // Dismissal persists across reloads.
    await page.reload();
    await page.waitForTimeout(2000);
    await expect(page.getByTestId('tour-card')).toBeHidden();
  });

  test('replay button re-opens the tour', async ({ page }) => {
    await loginAsCustomer(page);
    await page.goto('/dashboard');

    // Dismiss if it auto-opened (context may be fresh).
    const card = page.getByTestId('tour-card');
    if (await card.isVisible().catch(() => false)) {
      await page.getByTestId('tour-skip').click();
    }

    await page.getByTestId('tour-replay').click();
    await expect(page.getByTestId('tour-card')).toBeVisible({ timeout: 5000 });

    // Completing the tour (walk to the last step → done) closes it.
    for (let i = 0; i < 4; i += 1) {
      await page.getByTestId('tour-next').click();
    }
    await page.getByTestId('tour-done').click();
    await expect(page.getByTestId('tour-card')).toBeHidden();
  });
});
