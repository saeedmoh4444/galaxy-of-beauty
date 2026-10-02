/**
 * Axe-core accessibility gate (FE-009).
 *
 * Scans representative routes per budget class and fails CI on any
 * violation with impact `critical` or `serious` (WCAG 2.1 A/AA).
 * Moderate findings are allowlisted per page (see MODERATE_ALLOWLIST);
 * color-contrast violations are `serious` and must always be FIXED.
 *
 * Runs chromium-only in CI to respect the 15-minute E2E budget — set
 * AXE_ALL_BROWSERS=1 to run against chromium+firefox locally. Mobile
 * project is skipped (axe is DOM-static; mobile-chrome reuses the
 * chromium binary, so this costs nothing).
 */
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import type { AxeResults } from 'axe-core';

// First hit per locale compiles the route on-demand — be generous.
test.setTimeout(120_000);

const CUSTOMER_EMAIL = 'customer@test.com';
const ADMIN_EMAIL = 'admin@galaxyofbeauty.sa';
const DEMO_PASSWORD = 'Admin@123456';

async function loginAsCustomer(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.getByPlaceholder('example@email.com').fill(CUSTOMER_EMAIL);
  await page.getByPlaceholder('••••••••').fill(DEMO_PASSWORD);
  await page.getByRole('button', { name: 'دخول' }).click();
  await page.waitForTimeout(3000);
}

async function loginAsAdmin(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.getByPlaceholder('example@email.com').fill(ADMIN_EMAIL);
  await page.getByPlaceholder('••••••••').fill(DEMO_PASSWORD);
  await page.getByRole('button', { name: 'دخول' }).click();
  // Admin user lands on /admin/dashboard after login
  await page.waitForTimeout(3000);
}

async function scan(page: import('@playwright/test').Page) {
  // Freeze animations/transitions so axe never reads a transient state.
  await page.addStyleTag({
    content: '*,*::before,*::after{animation:none!important;transition:none!important}',
  });
  await page.waitForTimeout(1200);
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  return results.violations;
}

type Violation = AxeResults['violations'][number];

const assertNoSerious = (label: string, violations: Violation[]) => {
  const bad = violations.filter((v) => ['critical', 'serious'].includes(v.impact ?? ''));
  expect(
    bad,
    `${label} serious/critical violations:\n${JSON.stringify(
      bad.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.map((n) => n.target) })),
      null,
      2,
    )}`,
  ).toEqual([]);
};

/**
 * Moderate-impact violations we consciously accept per page. Policy:
 * - Only `moderate` impact may ever appear here — serious/critical are
 *   always fixed (see assertNoSerious), and minor findings are below the bar.
 * - Entries must carry a TODO referencing the owning backlog item and only
 *   shrink; a NEW moderate rule id that is not listed here fails the gate.
 * - Measured 2026-09-20: all five scanned routes report zero moderate
 *   violations, so this starts EMPTY (zero-tolerance policy).
 */
const MODERATE_ALLOWLIST: Record<string, Record<string, { max: number; todo: string }>> = {};

const assertModerateAllowed = (label: string, violations: Violation[]) => {
  const moderate = violations.filter((v) => v.impact === 'moderate');
  for (const v of moderate) {
    const entry = MODERATE_ALLOWLIST[label]?.[v.id];
    expect(
      entry && v.nodes.length <= entry.max,
      `${label}: moderate violation "${v.id}" x${v.nodes.length} is not allowlisted — ` +
        `add it to MODERATE_ALLOWLIST with a TODO, or fix it`,
    ).toBe(true);
  }
};

const axeTests = (browserName: string) => {
  test('home page has no serious/critical a11y violations', async ({ page }) => {
    await page.goto('/');
    const violations = await scan(page);
    assertNoSerious('/', violations);
    assertModerateAllowed('/', violations);
  });

  test('services page has no serious/critical a11y violations', async ({ page }) => {
    await page.goto('/services');
    const violations = await scan(page);
    assertNoSerious('/services', violations);
    assertModerateAllowed('/services', violations);
  });

  test('login page has no serious/critical a11y violations', async ({ page }) => {
    await page.goto('/login');
    const violations = await scan(page);
    assertNoSerious('/login', violations);
    assertModerateAllowed('/login', violations);
  });

  test('customer dashboard has no serious/critical a11y violations', async ({ page }) => {
    await loginAsCustomer(page);
    await page.goto('/dashboard');
    const violations = await scan(page);
    assertNoSerious('/dashboard', violations);
    assertModerateAllowed('/dashboard', violations);
  });

  test('admin dashboard has no serious/critical a11y violations', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/dashboard');
    const violations = await scan(page);
    assertNoSerious('/admin/dashboard', violations);
    assertModerateAllowed('/admin/dashboard', violations);
  });

  test('events page has no serious/critical a11y violations', async ({ page }) => {
    await page.goto('/events');
    const violations = await scan(page);
    assertNoSerious('/events', violations);
    assertModerateAllowed('/events', violations);
  });

  test('bundles page has no serious/critical a11y violations', async ({ page }) => {
    await page.goto('/bundles');
    const violations = await scan(page);
    assertNoSerious('/bundles', violations);
    assertModerateAllowed('/bundles', violations);
  });

  test('marketplace page has no serious/critical a11y violations', async ({ page }) => {
    await page.goto('/marketplace');
    const violations = await scan(page);
    assertNoSerious('/marketplace', violations);
    assertModerateAllowed('/marketplace', violations);
  });

  test('technicians page has no serious/critical a11y violations', async ({ page }) => {
    await page.goto('/technicians');
    const violations = await scan(page);
    assertNoSerious('/technicians', violations);
    assertModerateAllowed('/technicians', violations);
  });

  test('womens-services page has no serious/critical a11y violations', async ({ page }) => {
    await page.goto('/womens-services');
    const violations = await scan(page);
    assertNoSerious('/womens-services', violations);
    assertModerateAllowed('/womens-services', violations);
  });

  // Stage-12 surfaces (trainers, queues, pricing) + checkout — new pages
  // that had never been axe-scanned (audit stage 10: axe route expansion).
  test('trainers page has no serious/critical a11y violations', async ({ page }) => {
    await page.goto('/trainers');
    const violations = await scan(page);
    assertNoSerious('/trainers', violations);
    assertModerateAllowed('/trainers', violations);
  });

  test('checkout page has no serious/critical a11y violations', async ({ page }) => {
    await loginAsCustomer(page);
    await page.goto('/checkout');
    const violations = await scan(page);
    assertNoSerious('/checkout', violations);
    assertModerateAllowed('/checkout', violations);
  });

  test('admin queues page has no serious/critical a11y violations', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/queues');
    const violations = await scan(page);
    assertNoSerious('/admin/queues', violations);
    assertModerateAllowed('/admin/queues', violations);
  });

  test('admin pricing page has no serious/critical a11y violations', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/pricing');
    const violations = await scan(page);
    assertNoSerious('/admin/pricing', violations);
    assertModerateAllowed('/admin/pricing', violations);
  });
};

test.describe('Axe a11y gate (chromium)', () => {
  test.skip(
    ({ isMobile }) => isMobile,
    'axe is DOM-static; the mobile-chrome project reuses the chromium binary',
  );
  test.skip(
    ({ browserName }) => browserName !== 'chromium' && !process.env['AXE_ALL_BROWSERS'],
    'CI runs chromium only to respect the E2E budget (AXE_ALL_BROWSERS=1 locally for firefox)',
  );
  axeTests('chromium');
});

test.describe('Axe a11y gate (firefox, local-only)', () => {
  test.skip(
    ({ isMobile, browserName }) =>
      isMobile || browserName !== 'firefox' || !process.env['AXE_ALL_BROWSERS'],
    'firefox pass is opt-in via AXE_ALL_BROWSERS=1',
  );
  axeTests('firefox');
});
