/**
 * W2-2 (audit 2026-11-11) — the booking picker must reach the core
 * catalog. The 289 D2 womens-services rows flood `services.list`'s
 * newest-first window, hiding the technician-bearing core services.
 * excludeWomensFacade + search give the picker a working catalog.
 */
import { describe, it, expect } from 'vitest';
import { appRouter } from '../routers/index';
import { createTRPCContext } from '../context';

const CSRF = 'a'.repeat(64);

async function anonCaller() {
  const ctx = await createTRPCContext({ csrfCookie: CSRF, csrfHeader: CSRF });
  return (
    appRouter as never as { createCaller: (c: unknown) => Record<string, unknown> }
  ).createCaller(ctx) as Record<string, unknown>;
}

describe('W2 booking picker query', () => {
  it('excludeWomensFacade removes the D2 facade rows from the list', async () => {
    const caller = (await anonCaller()) as {
      services: {
        list: (
          i: unknown,
        ) => Promise<{ items: Array<{ category?: { slug?: string } }>; total: number }>;
      };
    };
    const withFacade = await caller.services.list({ page: 1, limit: 100 });
    const withoutFacade = await caller.services.list({
      page: 1,
      limit: 100,
      excludeWomensFacade: true,
    });

    expect(withFacade.total).toBeGreaterThan(withoutFacade.total);
    for (const item of withoutFacade.items) {
      expect(item.category?.slug).not.toBe('womens-services');
    }
    // The facade was the biggest chunk — excluding it must free the window
    // for the core catalog.
    expect(withoutFacade.total).toBeLessThan(withFacade.total);
  });

  it('search narrows by title and still respects the facade exclusion', async () => {
    const caller = (await anonCaller()) as {
      services: {
        list: (
          i: unknown,
        ) => Promise<{ items: Array<{ titleJson?: { ar?: string; en?: string } }>; total: number }>;
      };
    };
    const res = await caller.services.list({
      page: 1,
      limit: 100,
      search: 'مانيكير',
      excludeWomensFacade: true,
    });
    expect(res.total).toBeGreaterThan(0);
    for (const item of res.items) {
      const hay = `${item.titleJson?.ar ?? ''} ${item.titleJson?.en ?? ''}`;
      expect(hay).toContain('مانيكير');
    }
  });

  it('default list (browse) keeps the facade rows', async () => {
    const caller = (await anonCaller()) as {
      services: {
        list: (
          i: unknown,
        ) => Promise<{ items: Array<{ category?: { slug?: string } }>; total: number }>;
      };
    };
    const res = await caller.services.list({ page: 1, limit: 100 });
    expect(res.items.some((i) => i.category?.slug === 'womens-services')).toBe(true);
  });
});
