/**
 * W3-5 — women-only catalog posture. categories.list excluded the legacy
 * mens-grooming root from the public browse, but categories.tree returned
 * EVERY active category — so the mobile browse (public/services uses tree)
 * rendered the mens-grooming chip, and selecting it returned an empty list
 * (contradiction with services.ts:45). Pins the contract: both endpoints
 * exclude mens-grooming.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';

async function caller(user: null = null) {
  return (appRouter as any).createCaller({ user, ip: '127.0.0.1' });
}

let mensRootId: number | null = null;

beforeAll(async () => {
  const mens = await prisma.category.findUnique({ where: { slug: 'mens-grooming' } });
  mensRootId = mens?.id ?? null;
});

describe('categories women-only posture (W3-5)', () => {
  it('list excludes the mens-grooming root', async () => {
    const c = await caller();
    const list = await c.categories.list();
    const slugs = list.map((x: { slug: string }) => x.slug);
    expect(slugs).not.toContain('mens-grooming');
  });

  it('tree excludes the mens-grooming root (mobile browse leak)', async () => {
    const c = await caller();
    const tree = await c.categories.tree();

    const walk = (nodes: Array<{ slug: string; children?: unknown[] }>): string[] =>
      nodes.flatMap((n) => [n.slug, ...walk((n.children ?? []) as never)]);
    const slugs = walk(tree);

    expect(slugs).not.toContain('mens-grooming');
  });

  it('tree still returns the other roots', async () => {
    const c = await caller();
    const tree = await c.categories.tree();
    expect(tree.length).toBeGreaterThan(0);
  });

  it('mens-grooming rows remain in the DB (legacy data, just not surfaced)', async () => {
    expect(mensRootId).not.toBeNull();
  });
});
