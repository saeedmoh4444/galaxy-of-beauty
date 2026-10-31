/**
 * E1 — catalog browse fixes: subcategory chips resolve to their root's
 * services, and the legacy mens-grooming rows stay out of the public
 * browse (women-only platform).
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import { createTRPCContext } from '../context';

const CSRF = 'a'.repeat(64);

async function anonCaller() {
  const ctx = await createTRPCContext({ csrfCookie: CSRF, csrfHeader: CSRF });
  return (appRouter as any).createCaller(ctx);
}

let caller: ReturnType<typeof anonCaller> extends Promise<infer T> ? T : never;

beforeAll(async () => {
  caller = await anonCaller();
});

describe('services.list — E1 browse fixes', () => {
  it('a subcategory id resolves to its parent services (chips no longer empty)', async () => {
    const child = await prisma.category.findFirstOrThrow({
      where: { slug: 'pedicure' },
    });
    expect(child.parentId).toBeTruthy();

    const res = await caller.services.list({ page: 1, limit: 50, categoryId: child.id });
    expect(res.items.length).toBeGreaterThan(0);

    const parent = await prisma.category.findUniqueOrThrow({ where: { id: child.parentId! } });
    expect(
      res.items.every((s: { category: { slug: string } }) => s.category.slug === parent.slug),
    ).toBe(true);
  });

  it('a root category id still filters directly', async () => {
    const root = await prisma.category.findFirstOrThrow({ where: { slug: 'nail-care' } });
    const res = await caller.services.list({ page: 1, limit: 50, categoryId: root.id });
    expect(res.items.length).toBeGreaterThan(0);
    expect(
      res.items.every((s: { category: { slug: string } }) => s.category.slug === 'nail-care'),
    ).toBe(true);
  });

  it('excludes the mens-grooming category from the public browse', async () => {
    const res = await caller.services.list({ page: 1, limit: 100 });
    expect(res.items.length).toBeGreaterThan(0);
    expect(
      res.items.every((s: { category: { slug: string } }) => s.category.slug !== 'mens-grooming'),
    ).toBe(true);
  });
});
