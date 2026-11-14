import { test, expect } from '@playwright/test';

/**
 * W2-4 (audit 2026-11-11) — the confirm screen showed a placeholder
 * '———' booking code because the create flow never passed ?code=&date=
 * to /bookings/confirm. This spec drives the full create → confirm
 * journey and asserts the REAL bookingCode (GOB-…) and its startAt
 * reach the success page.
 * Requires seeded test customer: customer@test.com / Admin@123456
 * (seeded with a default address in packages/db/prisma/seed.ts).
 */

const TEST_EMAIL = 'customer@test.com';
const TEST_PASSWORD = 'Admin@123456';

// First hit per locale compiles the route on-demand — be generous.
test.setTimeout(120_000);

async function loginAsCustomer(page: import('@playwright/test').Page) {
  await page.goto('/login');
  // Hydration gate: the submit button stays disabled in SSR HTML until
  // hydrated. Fill AFTER it enables, or React's hydration wipes the inputs.
  const submit = page.getByRole('button', { name: 'دخول' });
  await expect(submit).toBeEnabled({ timeout: 30_000 });
  await page.getByPlaceholder('example@email.com').fill(TEST_EMAIL);
  await page.getByPlaceholder('••••••••').fill(TEST_PASSWORD);
  await submit.click();
  // bcrypt-12 verify under local dev-DB contention can exceed the 3s
  // wait used elsewhere — wait for the actual redirect off /login.
  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 45_000 });
}

test('confirm page receives the real booking code and date', async ({ page }) => {
  await loginAsCustomer(page);
  await page.goto('/bookings/create');

  // Step 1: pick the first service (jumps to step 2).
  const firstOption = page.getByTestId('service-option').first();
  await expect(firstOption).toBeVisible({ timeout: 20_000 });
  await firstOption.click();

  // Step 2: select the seeded customer's default address, then advance.
  const addressSelect = page.locator('#bc-address');
  await expect(addressSelect).toBeVisible({ timeout: 20_000 });
  await addressSelect.selectOption({ index: 1 });
  const next = page.getByTestId('step-next');
  await expect(next).toBeVisible();
  await next.click();

  // Step 3: submit (booking defaults are tomorrow 10:00 — a valid future slot).
  const submit = page.getByRole('button', { name: 'تأكيد الحجز' });
  await expect(submit).toBeVisible();
  await submit.click();

  // The success page must carry the created booking's code + start date.
  await page.waitForURL(/\/bookings\/confirm\?.*code=GOB-/, { timeout: 30_000 });
  const url = new URL(page.url());
  const code = url.searchParams.get('code') ?? '';
  expect(code).toMatch(/^GOB-[0-9A-F]{8}$/);

  const date = url.searchParams.get('date') ?? '';
  expect(date).toBeTruthy();
  expect(Number.isNaN(Date.parse(date))).toBe(false);

  // The rendered card shows the code, not the placeholder.
  await expect(page.getByText(/GOB-[0-9A-F]{8}/)).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText('———')).toHaveCount(0);
});
