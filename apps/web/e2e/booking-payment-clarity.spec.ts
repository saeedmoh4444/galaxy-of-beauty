import { test, expect } from '@playwright/test';

/**
 * Phase 3 sprint 2 — booking flow payment clarity.
 * The create page must explain the two payment options up front:
 * pay online (wallet, after the provider accepts) vs pay at venue
 * (cash/card on arrival). The section lives on the confirm step (step 3),
 * next to the total. Requires seeded test customer:
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

  // Step 1: pick the first service (jumps to step 2).
  const firstOption = page.getByTestId('service-option').first();
  await expect(firstOption).toBeVisible();
  await firstOption.click();

  // Step 2 → step 3: date/time have defaults; advance to confirm.
  const next = page.getByTestId('step-next');
  await expect(next).toBeVisible();
  await next.click();

  // Step 3: payment clarity section with the two options.
  const clarity = page.getByTestId('payment-clarity');
  await expect(clarity).toBeVisible();
  await expect(clarity).toContainText('طريقة الدفع');
  await expect(clarity).toContainText('ادفعي إلكترونياً');
  await expect(clarity).toContainText('ادفعي عند الوصول');
});
