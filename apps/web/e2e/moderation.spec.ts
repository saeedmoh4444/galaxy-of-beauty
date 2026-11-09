import { test, expect } from '@playwright/test';

const ADMIN_EMAIL = 'admin@galaxyofbeauty.sa';
const CUSTOMER_EMAIL = 'customer@test.com';
const PASSWORD = 'Admin@123456';

test.setTimeout(120_000);

async function loginAs(page: import('@playwright/test').Page, email: string, target: RegExp) {
  await page.goto('/login');
  // Hydration signal: the page's client mount fires a health pre-warm (CSRF
  // provisioning) — once it resolves, React handlers are attached and
  // clicks land. Fast builds resolve it during goto, so the race falls
  // through after a short grace.
  await Promise.race([
    page.waitForResponse((r) => r.url().includes('/api/trpc/health'), { timeout: 30_000 }),
    page.waitForTimeout(2500),
  ]).catch(() => undefined);

  // Pre-hydration click flake: a click can still fire before the handler
  // attaches (native submit, no POST, fields reset) — re-fill and retry
  // until the URL moves or the attempts run out.
  for (let attempt = 0; attempt < 3; attempt += 1) {
    await page.getByPlaceholder('example@email.com').fill(email);
    await page.getByPlaceholder('••••••••').fill(PASSWORD);
    await page.getByRole('button', { name: 'دخول' }).click();
    const moved = await page
      .waitForURL(target, { timeout: 10_000 })
      .then(() => true)
      .catch(() => false);
    if (moved) break;
  }
  await expect(page).toHaveURL(target, { timeout: 60_000 });
}

/**
 * Run a tRPC mutation through the app's own route (authed session cookie).
 * The web API enforces CSRF on browser POSTs (x-csrf-token from the cookie),
 * so the raw fetch replays the app client's header.
 */
async function trpcMutation(
  page: import('@playwright/test').Page,
  path: string,
  input: Record<string, unknown>,
): Promise<unknown> {
  const batch = await page.evaluate(
    async ({ path, input }) => {
      const csrf = document.cookie.match(/(?:^|;\s*)csrf-token=([^;]*)/)?.[1] ?? '';
      // POSTs must carry the batch input in the BODY with a JSON content
      // type (the tRPC handler 415s without it and ignores ?input= on POST).
      const res = await fetch(`/api/trpc/${path}?batch=1`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(csrf ? { 'x-csrf-token': csrf } : {}),
        },
        body: JSON.stringify({ '0': { json: input } }),
      });
      return res.json();
    },
    { path, input },
  );
  const first = (batch as Array<{ result?: { data?: { json?: unknown } } }>)[0];
  // The web tRPC route uses the superjson transformer — mutation payloads
  // come back as { json: <actual>, meta } — unwrap when present.
  const raw = first?.result?.data?.json as { json?: unknown } | undefined;
  return (raw && typeof raw === 'object' && 'json' in raw ? raw.json : raw) ?? {};
}

/** Read the public community feed through the app's own tRPC route. */
async function publicFeedContents(page: import('@playwright/test').Page): Promise<string[]> {
  const batch = await page.evaluate(async () => {
    const url =
      '/api/trpc/community.feed?batch=1&input=' +
      encodeURIComponent(JSON.stringify({ '0': { json: {} } }));
    const csrf = document.cookie.match(/(?:^|;\s*)csrf-token=([^;]*)/)?.[1] ?? '';
    const res = await fetch(url, {
      credentials: 'include',
      headers: csrf ? { 'x-csrf-token': csrf } : undefined,
    });
    return res.json();
  });
  const first = (batch as Array<{ result?: { data?: { json?: unknown } } }>)[0];
  const raw = first?.result?.data?.json as { json?: unknown } | undefined;
  const payload = (raw && typeof raw === 'object' && 'json' in raw ? raw.json : raw) as
    { items?: Array<{ content?: string }> } | undefined;
  return (payload?.items ?? []).map((p) => p.content ?? '');
}

test('admin resolves a report: hide removes the content from the public feed', async ({ page }) => {
  // Each browser project creates its OWN fixture — the seeded report row
  // is consumed by whichever project runs first, so sharing it leaks
  // state across projects.
  const fixture = `mod-e2e-${Date.now()}`;

  // community.create and moderation.report are customer-scoped — create and
  // report the fixture as the customer, then resolve it as the admin.
  await loginAs(page, CUSTOMER_EMAIL, /\/dashboard/);

  const post = (await trpcMutation(page, 'community.create', {
    content: fixture,
  })) as { id?: number };
  expect(post.id).toBeGreaterThan(0);
  await trpcMutation(page, 'moderation.report', {
    targetType: 'community_post',
    targetId: post.id,
    reason: 'inappropriate',
  });

  // Sanity: the fixture is publicly visible before moderation acts.
  const before = await publicFeedContents(page);
  expect(before).toContain(fixture);

  // Admin resolves: hide removes the content from the public feed.
  // The login page redirects an authenticated session to its dashboard, so
  // clear the customer session before the admin login.
  await trpcMutation(page, 'auth.clearSession', {});
  await loginAs(page, ADMIN_EMAIL, /\/admin\//);
  await page.goto('/admin/moderation');
  // The fixture text appears in nested divs AND the queue container holds
  // every row's buttons — the innermost div matching BOTH the text and an
  // exact-إخفاء button is the row's card (parents precede children in DOM
  // order, so .last() is the card, not the container).
  const reportRow = page
    .locator('div', { hasText: fixture })
    .filter({ has: page.getByRole('button', { name: 'إخفاء', exact: true }) })
    .last();
  await expect(reportRow).toBeVisible({ timeout: 30_000 });

  // Hide it. (exact: the "hide + suspend" button also contains "إخفاء".)
  await reportRow.getByRole('button', { name: 'إخفاء', exact: true }).click();

  // The queue empties (this row is gone).
  await expect(page.getByText(fixture)).toHaveCount(0, { timeout: 15_000 });

  // And the public feed no longer serves the content.
  const after = await publicFeedContents(page);
  expect(after).not.toContain(fixture);
});
