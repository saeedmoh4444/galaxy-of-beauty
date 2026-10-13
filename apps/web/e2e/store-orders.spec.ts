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
  // These flows CONSUME the two seeded demo orders (fulfill + cancel). The CI
  // E2E job shares one database across its browser projects, so chromium —
  // the first project — is the only one that can run them per CI run; the
  // API behavior itself is covered by unit tests across the whole matrix.
  test('fulfill flow: a seeded pending order flips to fulfilled', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'mutates the shared seeded orders — chromium only');
    await login(page);
    await page.goto('/store?tab=orders');

    const panel = page.getByTestId('vendor-panel-orders');
    // Rows are identified by their status chip; count-based assertions stay
    // valid after the chip flips (a hasText filter would re-resolve empty).
    const pendingRows = panel
      .locator('div.rounded-lg.border')
      .filter({ hasText: 'بانتظار التنفيذ' });
    await expect(pendingRows.first()).toBeVisible({ timeout: 15_000 });
    const countBefore = await pendingRows.count();

    await pendingRows.first().getByRole('button', { name: 'تنفيذ' }).click();

    await expect(pendingRows).toHaveCount(countBefore - 1);
    await expect(panel.getByText('تم التنفيذ').first()).toBeVisible();
  });

  test('cancel flow: the order drawer cancels a pending order', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'mutates the shared seeded orders — chromium only');
    await login(page);
    await page.goto('/store?tab=orders');

    const panel = page.getByTestId('vendor-panel-orders');
    const pendingRows = panel
      .locator('div.rounded-lg.border')
      .filter({ hasText: 'بانتظار التنفيذ' });
    await expect(pendingRows.first()).toBeVisible({ timeout: 15_000 });
    const countBefore = await pendingRows.count();

    // Drawer: line items + total + customer contact + cancel.
    await pendingRows.first().getByRole('button', { name: 'التفاصيل' }).click();
    await expect(page.getByText('الإجمالي')).toBeVisible();
    await page.getByRole('button', { name: 'إلغاء الطلب' }).click();

    await expect(pendingRows).toHaveCount(countBefore - 1);
    await expect(panel.getByText('ملغي').first()).toBeVisible();
  });
});
