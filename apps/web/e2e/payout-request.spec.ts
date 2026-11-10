import { test, expect } from '@playwright/test';

/**
 * D2 (SELLER_FIRST_CLASS_ROLE_PLAN) — the payout-request journey:
 * seller requests from the accrued balance → admin approves → the seller
 * sees the request flip to approved (simulate-safe: the approval records
 * a MANUAL transfer reference on the covered payout rows).
 */

const STORE_EMAIL = 'demo-store@galaxyofbeauty.sa';
const ADMIN_EMAIL = 'admin@galaxyofbeauty.sa';
const PASSWORD = 'Admin@123456';

// Two-user journey (seller → admin → seller) — cold compiles + bcrypt.
test.setTimeout(240_000);

async function login(page: import('@playwright/test').Page, email: string, expectUrl: RegExp) {
  await page.goto('/login');
  await page.getByPlaceholder('example@email.com').fill(email);
  await page.getByPlaceholder('••••••••').fill(PASSWORD);
  await page.getByRole('button', { name: 'دخول' }).click();
  await expect(page).toHaveURL(expectUrl, { timeout: 60_000 });
}

test.describe('Payout requests (D2)', () => {
  test('seller requests a payout and the admin approves it', async ({ page }) => {
    // 1. Seller opens the earnings tab; the seeded balance is available.
    await login(page, STORE_EMAIL, /\/store/);
    await page.goto('/store?tab=earnings');
    const card = page.getByTestId('payout-request-card');
    await expect(card).toBeVisible({ timeout: 20_000 });

    // 2. Request 150 SAR.
    await card.getByLabel('المبلغ (ر.س)', { exact: true }).fill('150');
    await card.getByRole('button', { name: 'إرسال الطلب' }).click();
    await expect(card.getByText('قيد المراجعة')).toBeVisible({ timeout: 20_000 });

    // 3. Admin sees the queue and approves — a SEPARATE browser context
    //    (a sibling page would share the seller's auth cookies and the
    //    /login route redirects authenticated users away).
    const adminContext = await page
      .context()
      .browser()
      ?.newContext({ storageState: './e2e-consent-state.json' });
    if (!adminContext) throw new Error('no browser');
    const adminPage = await adminContext.newPage();
    await login(adminPage, ADMIN_EMAIL, /\/admin/);
    await adminPage.goto('/admin/payouts');
    const queue = adminPage.getByTestId('payout-requests-queue');
    await expect(queue).toBeVisible({ timeout: 20_000 });
    await expect(queue.getByText('Galaxy Demo Store')).toBeVisible();
    await queue.getByRole('button', { name: 'قبول' }).first().click();
    await expect(queue.getByText('Galaxy Demo Store')).toBeHidden({ timeout: 20_000 });
    await adminContext.close();

    // 4. The seller's request flips to approved (after a reload — the
    //    dashboard has no polling by design). .first(): earlier browser
    //    projects' approved requests share the same seeded store history.
    await page.reload();
    await expect(card.getByText('مقبول').first()).toBeVisible({ timeout: 20_000 });
  });
});
