import { test, expect } from '@playwright/test';

const ADMIN_EMAIL = 'admin@galaxyofbeauty.sa';
const ADMIN_PASSWORD = 'Admin@123456';

test.setTimeout(120_000);

async function loginAsAdmin(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.getByPlaceholder('example@email.com').fill(ADMIN_EMAIL);
  await page.getByPlaceholder('••••••••').fill(ADMIN_PASSWORD);
  await page.getByRole('button', { name: 'دخول' }).click();
  // Pre-hydration click flake: the first click can fire before the page
  // hydrates (native GET, no POST) — retry once if the URL didn't move.
  const moved = await page
    .waitForURL(/\/admin\//, { timeout: 15_000 })
    .then(() => true)
    .catch(() => false);
  if (!moved) {
    await page.getByRole('button', { name: 'دخول' }).click();
  }
  await expect(page).toHaveURL(/\/admin\//, { timeout: 60_000 });
}

/** Run a tRPC mutation through the app's own route (authed session cookie). */
async function trpcMutation(
  page: import('@playwright/test').Page,
  path: string,
  input: Record<string, unknown>,
): Promise<unknown> {
  const batch = await page.evaluate(
    async ({ path, input }) => {
      const url =
        `/api/trpc/${path}?batch=1&input=` +
        encodeURIComponent(JSON.stringify({ '0': { json: input } }));
      const res = await fetch(url, { method: 'POST', credentials: 'include' });
      return res.json();
    },
    { path, input },
  );
  const first = (batch as Array<{ result?: { data?: { json?: unknown } } }>)[0];
  return first?.result?.data?.json;
}

/** Read the public community feed through the app's own tRPC route. */
async function publicFeedContents(page: import('@playwright/test').Page): Promise<string[]> {
  const batch = await page.evaluate(async () => {
    const url =
      '/api/trpc/community.feed?batch=1&input=' +
      encodeURIComponent(JSON.stringify({ '0': { json: {} } }));
    const res = await fetch(url, { credentials: 'include' });
    return res.json();
  });
  const first = (
    batch as Array<{ result?: { data?: { json?: { items?: Array<{ content?: string }> } } } }>
  )[0];
  return (first?.result?.data?.json?.items ?? []).map((p) => p.content ?? '');
}

test('admin resolves a report: hide removes the content from the public feed', async ({ page }) => {
  // Each browser project creates its OWN fixture — the seeded report row
  // is consumed by whichever project runs first, so sharing it leaks
  // state across projects.
  const fixture = `mod-e2e-${Date.now()}`;
  await loginAsAdmin(page);

  const post = (await trpcMutation(page, 'community.create', {
    content: fixture,
  })) as { id?: number };
  expect(post.id).toBeGreaterThan(0);
  await trpcMutation(page, 'moderation.report', {
    targetType: 'community_post',
    targetId: post.id,
    reason: 'inappropriate',
  });

  await page.goto('/admin/moderation');
  const reportRow = page.locator('div', { hasText: fixture });
  await expect(reportRow.first()).toBeVisible({ timeout: 30_000 });

  // Sanity: the fixture is publicly visible before moderation acts.
  const before = await publicFeedContents(page);
  expect(before).toContain(fixture);

  // Hide it. (exact: the "hide + suspend" button also contains "إخفاء".)
  await reportRow.first().getByRole('button', { name: 'إخفاء', exact: true }).click();

  // The queue empties (this row is gone).
  await expect(page.getByText(fixture)).toHaveCount(0, { timeout: 15_000 });

  // And the public feed no longer serves the content.
  const after = await publicFeedContents(page);
  expect(after).not.toContain(fixture);
});
