import { test, expect } from '@playwright/test';

const OWNER_EMAIL = 'demo-store@galaxyofbeauty.sa';
const STAFF_EMAIL = 'staff-demo@galaxyofbeauty.sa';
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

test.describe('A1 — store staff accounts', () => {
  test('staff member gets the portal with capability-filtered tabs', async ({ page }) => {
    await login(page, STAFF_EMAIL);
    await page.goto('/store');
    await expect(page).toHaveURL(/\/store$/, { timeout: 60_000 });

    // The staff member resolves to the demo store.
    await expect(page.getByText('Galaxy Demo Store')).toBeVisible();

    // ORDERS_MANAGE + PRODUCTS_MANAGE only: orders and products visible,
    // the management tabs are not.
    await expect(page.getByTestId('vendor-tab-orders')).toBeVisible();
    await expect(page.getByTestId('vendor-tab-products')).toBeVisible();
    await expect(page.getByTestId('vendor-tab-staff')).toBeHidden();
    await expect(page.getByTestId('vendor-tab-earnings')).toBeHidden();
  });

  test('owner invites a customer and the invitee accepts into the portal', async ({ page }) => {
    // Owner opens the Team tab and invites the seeded customer.
    await login(page, OWNER_EMAIL);
    await page.goto('/store?tab=staff');
    await expect(page.getByTestId('vendor-panel-staff')).toBeVisible();

    const emailInput = page.getByLabel('البريد الإلكتروني');
    await emailInput.fill(CUSTOMER_EMAIL);
    await page.getByTestId('staff-invite-button').click();

    // The PENDING row appears in the owner's list.
    await expect(page.getByText(CUSTOMER_EMAIL)).toBeVisible({ timeout: 30_000 });

    // The invitee sees the banner on the portal and accepts.
    await page
      .getByRole('button', { name: 'خروج' })
      .click()
      .catch(() => {});
    await login(page, CUSTOMER_EMAIL);
    await page.goto('/vendor-portal');
    await expect(page.getByTestId('staff-invitation-accept')).toBeVisible({
      timeout: 30_000,
    });
    await page.getByTestId('staff-invitation-accept').click();

    // Accepting flips myStore to the vendor — the portal opens with the
    // default ORDERS_MANAGE capability: orders visible, products not.
    await expect(page).toHaveURL(/\/store/, { timeout: 60_000 });
    await expect(page.getByText('Galaxy Demo Store')).toBeVisible();
    await expect(page.getByTestId('vendor-tab-orders')).toBeVisible();
    await expect(page.getByTestId('vendor-tab-products')).toBeHidden();
    await expect(page.getByTestId('vendor-tab-staff')).toBeHidden();
  });
});
