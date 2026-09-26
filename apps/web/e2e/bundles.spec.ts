/**
 * 1.2 Service Bundles — catalog, detail, and booking preselection (web).
 * The seed ships 5+1 Arabic packages (seed.ts 1.2 section); guests browse
 * the catalog, customers book through the create wizard (?beautyBundleId=).
 */
import { test, expect } from '@playwright/test';

const TEST_EMAIL = 'customer@test.com';
const TEST_PASSWORD = 'Admin@123456';

async function loginAsCustomer(page: any) {
  await page.goto('/login');
  await page.getByPlaceholder('example@email.com').fill(TEST_EMAIL);
  await page.getByPlaceholder('••••••••').fill(TEST_PASSWORD);
  await page.getByRole('button', { name: 'دخول' }).click();
  await page.waitForTimeout(3000);
}

test.setTimeout(120_000);

test('bundles catalog lists seeded packages with savings badges', async ({ page }) => {
  await page.goto('/bundles');

  const cards = page.getByTestId('bundle-card');
  await expect(cards.first()).toBeVisible();

  // Every card shows a title and a savings badge (original > total).
  await expect(page.getByTestId('bundle-title').first()).not.toBeEmpty();
  await expect(page.getByTestId('bundle-savings').first()).toBeVisible();
});

test('bundle detail shows included services and a book CTA', async ({ page }) => {
  await page.goto('/bundles');
  await page.getByTestId('bundle-card').first().click();

  await expect(page.getByTestId('bundle-detail')).toBeVisible();
  await expect(page.getByTestId('bundle-service-row').first()).toBeVisible();

  const cta = page.getByTestId('bundle-book-cta');
  await expect(cta).toBeVisible();
  const href = (await cta.getAttribute('href')) ?? '';
  expect(new URL(href, 'http://x').searchParams.get('beautyBundleId')).toBeTruthy();
});

test('booking wizard preselects the bundle with bundle pricing', async ({ page }) => {
  await loginAsCustomer(page);

  await page.goto('/bundles');
  await page.getByTestId('bundle-card').first().click();
  await page.getByTestId('bundle-book-cta').click();

  // The wizard lands on the details step with the bundle banner.
  await expect(page.getByTestId('beauty-bundle-banner')).toBeVisible();

  // Confirm step shows the bundle price (original strikethrough + total).
  await page.getByTestId('step-next').click();
  await expect(page.getByTestId('bundle-price-row')).toBeVisible();
});
