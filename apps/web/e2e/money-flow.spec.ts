import { test, expect } from '@playwright/test';

/**
 * F3 (audit T4) — REAL money movement, end to end, against the seeded
 * demo store. The suite had zero money tests before: this spec walks
 * wallet balance → store checkout (payCart, wallet method) → balance
 * delta, and pins the money-integrity invariant that a wallet payment
 * actually debits the paid amount.
 *
 * Requires: customer@test.com / Admin@123456 (seeded wallet 500 + 50
 * bonus) and FATOORAH_SIMULATE=true on the E2E server so the shipping
 * calculator serves the deterministic dev stubs (RIYADH, 25 SAR charge).
 */

const TEST_EMAIL = 'customer@test.com';
const TEST_PASSWORD = 'Admin@123456';

test.setTimeout(180_000);

// ar-SA currency renders Arabic-Indic digits — normalize before parsing.
const AR_DIGITS: Record<string, string> = {
  '٠': '0',
  '١': '1',
  '٢': '2',
  '٣': '3',
  '٤': '4',
  '٥': '5',
  '٦': '6',
  '٧': '7',
  '٨': '8',
  '٩': '9',
};
function parseAmount(text: string): number {
  const normalized = text.replace(/[٠-٩]/g, (d) => AR_DIGITS[d] ?? d);
  const amount = normalized.match(/([\d,]+(?:\.\d+)?)/)?.[1];
  if (!amount) throw new Error(`No amount found in: ${text}`);
  return parseFloat(amount.replace(/,/g, ''));
}

async function loginAsCustomer(page: import('@playwright/test').Page) {
  await page.goto('/login');
  // Let React hydrate the submit handler — clicking before hydration
  // submits the form natively (GET /login, no-op). Production hydrates
  // in milliseconds; the dev server can take seconds on first compile.
  await page.waitForTimeout(2000);
  await page.getByPlaceholder('example@email.com').fill(TEST_EMAIL);
  await page.getByPlaceholder('••••••••').fill(TEST_PASSWORD);
  await page.getByRole('button', { name: 'دخول' }).click();
  await expect(page).toHaveURL(/\/(dashboard|admin|store)/, { timeout: 60_000 });
}

async function withdrawableBalance(page: import('@playwright/test').Page): Promise<number> {
  await page.goto('/wallet');
  const label = page.getByText('الرصيد القابل للسحب');
  await expect(label).toBeVisible();
  // The KPI value is the green figure rendered right after the label.
  const value = page.locator('p.text-green-600').first();
  await expect(value).toBeVisible();
  return parseAmount((await value.textContent()) ?? '');
}

test('a wallet store purchase moves real money', async ({ page }) => {
  await loginAsCustomer(page);

  // Before: capture the withdrawable wallet balance.
  const before = await withdrawableBalance(page);
  expect(before).toBeGreaterThan(0);

  // Add the first demo-store product to the cart.
  await page.goto('/stores/galaxy-demo-store');
  const addToCart = page.getByRole('button', { name: 'أضيفي للسلة' }).first();
  await expect(addToCart).toBeVisible();
  await addToCart.click();
  await expect(page.getByText('تمت الإضافة للسلة').first()).toBeVisible();

  // Checkout: fill shipping, pick the wallet method, read the total.
  await page.goto('/checkout');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('إتمام الشراء');

  await page.getByPlaceholder('Saeed').fill('Saeed Test');
  await page.getByPlaceholder('05xxxxxxxx').fill('0500000000');
  await page.getByPlaceholder('Street, building, floor').fill('Test Street 1');
  await page.getByPlaceholder('12345').fill('12345');

  // City select (labelled 'المدينة') — populated only when a Fatoorah
  // config exists (simulate in dev, or the live token once it lands).
  const citySelect = page
    .locator('label', { hasText: 'المدينة' })
    .locator('xpath=following-sibling::select');
  await expect(citySelect).toBeVisible();
  // Enabled means the cities query settled (data or fail-closed empty).
  await expect(citySelect).toBeEnabled({ timeout: 30_000 });
  const options = await citySelect.locator('option').allTextContents();
  test.skip(
    !options.includes('RIYADH'),
    'Fatoorah shipping config absent (user-gated token) — money E2E runs where a gateway config exists',
  );
  await citySelect.selectOption({ label: 'RIYADH' });

  // The shipping charge query settles after the city lands — wait for the
  // charge row to leave the '—' placeholder.
  await expect(
    page.getByText('رسوم الشحن').locator('xpath=following-sibling::span'),
  ).not.toHaveText('—');

  // What payCart actually debits = subtotal + shipping charge (the UI's
  // platform fee is display-only — never charged).
  const subtotal = parseAmount(
    (await page
      .getByText('المجموع')
      .first()
      .locator('xpath=following-sibling::span')
      .textContent()) ?? '',
  );
  const shippingCharge = parseAmount(
    (await page.getByText('رسوم الشحن').locator('xpath=following-sibling::span').textContent()) ??
      '',
  );
  const expectedDebit = subtotal + shippingCharge;
  expect(expectedDebit).toBeGreaterThan(0);

  const walletMethod = page.getByRole('button', { name: /المحفظة/ });
  await expect(walletMethod).toBeVisible();
  await walletMethod.click();

  const payButton = page.getByRole('button', { name: /ادفعي/ });
  await expect(payButton).toBeVisible();

  await payButton.click();
  await expect(page.getByText('تم تقديم الطلب بنجاح')).toBeVisible({ timeout: 60_000 });

  // After: the withdrawable balance dropped by exactly the charged total.
  const after = await withdrawableBalance(page);
  expect(after).toBe(before - expectedDebit);
});
