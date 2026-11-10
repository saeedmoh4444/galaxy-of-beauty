import { test, expect } from '@playwright/test';

/**
 * R3 (SELLER_FIRST_CLASS_ROLE_PLAN) — Seller is a first-class registration
 * option, and a freshly registered seller lands straight in the store
 * onboarding wizard (store identity + KYC, as before).
 */

// Generate per attempt: a retry after a successful registration would
// otherwise collide on the registration rate limit / unique email.
function freshEmail(): string {
  return `seller-e2e-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`;
}

test.describe('Seller registration (R3)', () => {
  test('register page offers the Seller account type', async ({ page }) => {
    await page.goto('/register');
    const select = page.locator('#rg-account-type');
    await expect(select).toBeVisible();
    await expect(select.locator('option')).toHaveCount(3);
    await expect(select.locator('option[value="SELLER"]')).toContainText('صاحبة متجر');
  });

  test('seller journey: register → store shell → vendor wizard', async ({ page }) => {
    test.setTimeout(120_000);
    const email = freshEmail();
    await page.goto('/register');
    await page.getByLabel('الاسم', { exact: true }).fill('بائعة اختبار');
    await page.getByLabel('البريد الإلكتروني', { exact: true }).fill(email);
    await page.getByLabel('رقم الجوال', { exact: true }).fill('+966599000321');
    await page.getByLabel('كلمة المرور', { exact: true }).fill('SellerPass123!');
    await page.getByLabel('تأكيد كلمة المرور', { exact: true }).fill('SellerPass123!');
    await page.selectOption('#rg-account-type', 'SELLER');
    await page.getByRole('checkbox').check();
    await page.getByRole('button', { name: 'إنشاء حساب' }).click();

    // SELLER registration routes to /store; a vendor-less seller is
    // bounced into the portal wizard exactly like the legacy path.
    await expect(page).toHaveURL(/\/vendor-portal$/, { timeout: 60_000 });
    await expect(page.getByRole('heading', { level: 1 })).toContainText('سجّلي متجرك');
  });
});
