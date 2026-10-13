import { test, expect } from '@playwright/test';

const STORE_EMAIL = 'demo-store@galaxyofbeauty.sa';
const PASSWORD = 'Admin@123456';

// Dev-server first-load compiles are slow; CI (production build) is fast.
test.setTimeout(120_000);

async function login(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.getByPlaceholder('example@email.com').fill(STORE_EMAIL);
  await page.getByPlaceholder('••••••••').fill(PASSWORD);
  await page.getByRole('button', { name: 'دخول' }).click();
  await expect(page).toHaveURL(/\/(dashboard|admin|store)/, { timeout: 60_000 });
}

test.describe('Store Orders (B1)', () => {
  test('fulfill flow: a seeded pending order flips to fulfilled', async ({ page }) => {
    await login(page);
    await page.goto('/store?tab=orders');

    const panel = page.getByTestId('vendor-panel-orders');
    const pendingRow = panel
      .locator('div.rounded-lg.border')
      .filter({ hasText: 'بانتظار التنفيذ' });
    const row = pendingRow.first();
    await expect(row).toBeVisible();

    await row.getByRole('button', { name: 'تنفيذ' }).click();
    await expect(row.getByText('تم التنفيذ')).toBeVisible();
    await expect(row.getByRole('button', { name: 'تنفيذ' })).toBeHidden();
  });

  test('cancel flow: the order drawer cancels a pending order', async ({ page }) => {
    await login(page);
    await page.goto('/store?tab=orders');

    const panel = page.getByTestId('vendor-panel-orders');
    const pendingRow = panel
      .locator('div.rounded-lg.border')
      .filter({ hasText: 'بانتظار التنفيذ' });
    const row = pendingRow.first();
    await expect(row).toBeVisible();

    // Drawer: line items + total + customer contact + cancel.
    await row.getByRole('button', { name: 'التفاصيل' }).click();
    await expect(page.getByText('الإجمالي')).toBeVisible();
    await page.getByRole('button', { name: 'إلغاء الطلب' }).click();

    await expect(row.getByText('ملغي')).toBeVisible();
    await expect(row.getByRole('button', { name: 'تنفيذ' })).toBeHidden();
  });
});
