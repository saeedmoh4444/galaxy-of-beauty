import { test, expect } from '@playwright/test';

const STORE_EMAIL = 'demo-store@galaxyofbeauty.sa';
const CUSTOMER_EMAIL = 'customer@test.com';
const PASSWORD = 'Admin@123456';

// Dev-server first-load compiles are slow; CI (production build) is fast.
test.setTimeout(120_000);

async function login(page: import('@playwright/test').Page, email: string) {
  await page.goto('/login');
  await page.getByPlaceholder('example@email.com').fill(email);
  await page.getByPlaceholder('••••••••').fill(PASSWORD);
  await page.getByRole('button', { name: 'دخول' }).click();
  await expect(page).toHaveURL(/\/(dashboard|admin|store)/, { timeout: 60_000 });
}

test.describe('Store Dashboard (S1)', () => {
  test('store owner gets the /store shell with store navigation', async ({ page }) => {
    await login(page, STORE_EMAIL);
    await page.goto('/store');
    await expect(page).toHaveURL(/\/store$/, { timeout: 60_000 });

    const nav = page.locator('aside nav');
    // Mobile viewports hide the dashboard sidebar (hidden md:block) — the
    // store-shell assertions only apply where the sidebar renders.
    if (!(await nav.isVisible())) {
      await expect(nav).toBeHidden();
      return;
    }
    await expect(nav.getByText('لوحة المتجر')).toBeVisible();
    await expect(nav.getByText('بوابة البائعين')).toBeVisible();
    // The store name from the seeded provider shows on the dashboard.
    await expect(page.getByText('Galaxy Demo Store')).toBeVisible();
  });

  test('customer without a store is sent to the vendor portal', async ({ page }) => {
    await login(page, CUSTOMER_EMAIL);
    await page.goto('/store');
    await expect(page).toHaveURL(/\/vendor-portal/, { timeout: 60_000 });
  });

  test('A3 — store dashboard tabs: overview default, deep link, panel switching', async ({
    page,
  }) => {
    await login(page, STORE_EMAIL);
    await page.goto('/store');
    await expect(page).toHaveURL(/\/store$/, { timeout: 60_000 });

    // Four tabs, overview active by default.
    for (const key of ['overview', 'orders', 'products', 'deals']) {
      await expect(page.getByTestId(`vendor-tab-${key}`)).toBeVisible();
    }
    await expect(page.getByTestId('vendor-tab-overview')).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByTestId('vendor-panel-overview')).toBeVisible();

    // ?tab=orders deep link opens the orders panel.
    await page.goto('/store?tab=orders');
    await expect(page.getByTestId('vendor-tab-orders')).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByTestId('vendor-panel-orders')).toBeVisible();

    // Switching to products shows the catalog panel with the add button.
    await page.getByTestId('vendor-tab-products').click();
    await expect(page.getByTestId('vendor-panel-products')).toBeVisible();
    await expect(page.getByRole('button', { name: /منتج جديد/ })).toBeVisible();
  });
});
