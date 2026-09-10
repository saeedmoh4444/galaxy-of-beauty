import { test, expect } from '@playwright/test';

/**
 * Phase 3 sprint 2 — booking flow payment clarity.
 * The create page must explain the two payment options up front:
 * pay online (wallet, after the provider accepts) vs pay at venue
 * (cash/card on arrival). Requires seeded test customer:
 * customer@test.com / Admin@123456
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

test('booking create page explains pay-at-venue vs online', async ({ page }) => {
  await loginAsCustomer(page);
  await page.goto('/bookings/create');

  const clarity = page.getByTestId('payment-clarity');
  await expect(clarity).toBeVisible();
  await expect(clarity).toContainText('طريقة الدفع');
  await expect(clarity).toContainText('ادفعي إلكترونياً');
  await expect(clarity).toContainText('ادفعي عند الوصول');
});
