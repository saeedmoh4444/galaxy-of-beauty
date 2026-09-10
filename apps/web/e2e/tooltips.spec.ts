import { test, expect } from '@playwright/test';

/**
 * §3.6 — hover tooltips layer (dashboard).
 * Desktop-only: hover is the primary trigger; keyboard focus triggers the
 * same tooltip via :focus-within (covered by the same locator).
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

test.describe('Dashboard tooltips (§3.6)', () => {
  test.skip(({ isMobile }) => isMobile, 'hover tooltips target desktop viewports');

  test('shows a helper tooltip on hover over Book now', async ({ page }) => {
    await loginAsCustomer(page);
    await page.goto('/dashboard');
    await page.waitForTimeout(1000);

    // Dismiss the first-run tour if it auto-opened in this context.
    const tourCard = page.getByTestId('tour-card');
    if (await tourCard.isVisible().catch(() => false)) {
      await page.getByTestId('tour-skip').click();
    }

    const bookNow = page.locator('[data-tour="book"]');
    await bookNow.hover();

    const tooltip = page.getByRole('tooltip', {
      name: /احجزي خدمة|Book a service/,
    });
    await expect(tooltip).toBeVisible();
  });

  test('shows tooltip via keyboard focus', async ({ page }) => {
    await loginAsCustomer(page);
    await page.goto('/dashboard');
    await page.waitForTimeout(1000);

    const tourCard = page.getByTestId('tour-card');
    if (await tourCard.isVisible().catch(() => false)) {
      await page.getByTestId('tour-skip').click();
    }

    await page.locator('[data-tour="book"]').focus();

    const tooltip = page.getByRole('tooltip', {
      name: /احجزي خدمة|Book a service/,
    });
    await expect(tooltip).toBeVisible();
  });
});
