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

  test('A4 — add product flow: new product appears in the Products tab', async ({ page }) => {
    await login(page, STORE_EMAIL);
    const name = `منتج اختبار ${Date.now()}`;

    await page.goto('/store?tab=products');
    await page.getByRole('button', { name: /منتج جديد/ }).click();
    await page.getByPlaceholder('اسم المنتج').fill(name);
    await page.getByPlaceholder('السعر (ر.س)').fill('77');
    await page.getByPlaceholder('المخزون').fill('3');
    await page.getByRole('button', { name: 'إضافة' }).click();

    await expect(page.getByText(name)).toBeVisible();
  });

  test('C1 — edit price, duplicate, and draft-toggle a product', async ({ page }) => {
    // Mutates the shared CI store — chromium project only (see B1 notes).
    test.skip(
      test.info().project.name !== 'chromium',
      'mutates the shared seeded store — chromium only',
    );
    await login(page, STORE_EMAIL);
    const name = `منتج تعديل ${Date.now()}`;

    await page.goto('/store?tab=products');
    await page.getByRole('button', { name: /منتج جديد/ }).click();
    await page.getByPlaceholder('اسم المنتج').fill(name);
    await page.getByPlaceholder('السعر (ر.س)').fill('50');
    await page.getByPlaceholder('المخزون').fill('4');
    await page.getByRole('button', { name: 'إضافة' }).click();
    await expect(page.getByText(name)).toBeVisible();

    const row = page
      .getByTestId('vendor-panel-products')
      .locator('div.flex.items-center.justify-between')
      .filter({ hasText: name })
      .first();

    // Edit → price change persists. formatCurrency renders Arabic-Indic
    // numerals in the AR locale, so match the ٩٩ glyphs, not ASCII 99.
    await row.getByRole('button', { name: 'تعديل' }).click();
    await page.getByPlaceholder('السعر (ر.س)').fill('99');
    await page.getByRole('button', { name: 'حفظ' }).click();
    await expect(row.getByText(/٩٩/)).toBeVisible();

    // Duplicate → a draft copy appears with the (نسخة) suffix.
    await row.getByRole('button', { name: 'نسخ' }).click();
    await expect(page.getByText(`${name} (نسخة)`)).toBeVisible();

    // Draft toggle on the copy: the copy starts as a draft, so its action
    // button reads نشر — publish it and assert the publish action is gone
    // (the chip clears; the button now offers مسودة to re-draft).
    const copyRow = page
      .getByTestId('vendor-panel-products')
      .locator('div.flex.items-center.justify-between')
      .filter({ hasText: `${name} (نسخة)` })
      .first();
    await copyRow.getByRole('button', { name: 'نشر' }).click();
    await expect(copyRow.getByRole('button', { name: 'نشر' })).toHaveCount(0);
  });

  test('A4 — propose deal flow: pending deal appears in the Deals tab', async ({ page }) => {
    await login(page, STORE_EMAIL);
    const name = `منتج عرض ${Date.now()}`;

    // Seed a product through the UI, then propose a deal on it.
    await page.goto('/store?tab=products');
    await page.getByRole('button', { name: /منتج جديد/ }).click();
    await page.getByPlaceholder('اسم المنتج').fill(name);
    await page.getByPlaceholder('السعر (ر.س)').fill('120');
    await page.getByPlaceholder('المخزون').fill('5');
    await page.getByRole('button', { name: 'إضافة' }).click();
    await expect(page.getByText(name)).toBeVisible();

    await page.getByTestId('vendor-tab-deals').click();
    await page.getByRole('button', { name: /اقترح عرضاً/ }).click();
    // The option label is "<nameAr> · <localized price>" — formatCurrency
    // renders Arabic-Indic numerals, so match the option by text and select
    // its value instead of guessing the label.
    // D5 added a second select (seasonal templates) to the modal — the
    // product picker and the template picker each carry their own testid.
    const productSelect = page.getByTestId('deal-product-select');
    const option = productSelect.locator('option').filter({ hasText: name });
    await expect(option).toHaveCount(1);
    await productSelect.selectOption((await option.getAttribute('value')) ?? '');
    await page.getByLabel('سعر العرض (ر.س)').fill('80');
    await page.getByRole('button', { name: 'حفظ' }).click();

    // The proposal rides the admin review queue — pending chip + title.
    // (.first(): retries accumulate pending deals in the shared CI DB, so
    // the chip matches more than one card.)
    await expect(page.getByText(name)).toBeVisible();
    await expect(page.getByText('قيد المراجعة').first()).toBeVisible();
  });

  test('A4 — trust toggle persists across reload', async ({ page }) => {
    await login(page, STORE_EMAIL);
    await page.goto('/store');

    const cb = page.locator('label').filter({ hasText: '🙋‍♀️' }).locator('input');
    await expect(cb).toBeVisible();
    if (!(await cb.isChecked())) await cb.click();
    await expect(cb).toBeChecked();

    await page.reload();
    await expect(page.locator('label').filter({ hasText: '🙋‍♀️' }).locator('input')).toBeChecked();
  });
});
