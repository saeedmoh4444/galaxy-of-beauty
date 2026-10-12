import { test, expect } from '@playwright/test';

const STORE_EMAIL = 'demo-store@galaxyofbeauty.sa';
const CUSTOMER_EMAIL = 'customer@test.com';
const PASSWORD = 'Admin@123456';

// Dev-server first-load compiles are slow; CI (production build) is fast.
test.setTimeout(120_000);

async function loginAsCustomer(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.getByPlaceholder('example@email.com').fill(CUSTOMER_EMAIL);
  await page.getByPlaceholder('••••••••').fill(PASSWORD);
  await page.getByRole('button', { name: 'دخول' }).click();
  await expect(page).toHaveURL(/\/(dashboard|admin|store)/, { timeout: 60_000 });
}

test.describe('Vendor Portal (vendor route group)', () => {
  test('unauthenticated visitors are sent to /login', async ({ page }) => {
    await page.goto('/vendor-portal');
    await expect(page).toHaveURL(/\/login/, { timeout: 60_000 });
  });

  test('authenticated customer without a store sees the registration wizard (not bounced)', async ({
    page,
  }) => {
    await loginAsCustomer(page);
    await page.goto('/vendor-portal');
    await expect(page).toHaveURL(/\/vendor-portal$/, { timeout: 60_000 });
    // The portal hosts the provider registration wizard for non-owners.
    await expect(page.getByRole('heading', { level: 1 })).toContainText('سجّلي متجرك');
  });

  test('store owner reaching /vendor-portal gets the portal', async ({ page }) => {
    await loginAsCustomer(page);
    // Use the store owner account for the ownership-positive path.
    await page.goto('/login');
    await page.getByPlaceholder('example@email.com').fill(STORE_EMAIL);
    await page.getByPlaceholder('••••••••').fill(PASSWORD);
    await page.getByRole('button', { name: 'دخول' }).click();
    await expect(page).toHaveURL(/\/(dashboard|admin|store)/, { timeout: 60_000 });

    await page.goto('/vendor-portal');
    await expect(page).toHaveURL(/\/vendor-portal$/, { timeout: 60_000 });
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      /بوابة البائعين|Galaxy Demo Store/,
    );
  });

  test('legacy /customer/vendor-portal redirects to /vendor-portal', async ({ page }) => {
    await loginAsCustomer(page);
    await page.goto('/customer/vendor-portal');
    await expect(page).toHaveURL(/\/vendor-portal$/, { timeout: 60_000 });
  });
});
