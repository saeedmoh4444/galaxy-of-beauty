/**
 * Phase 3 sprint 1 — stage-aware discover ordering. prioritizeByLinks
 * (shared) surfaces tiles matching the life-stage quick links first; the
 * guest-safe homeGreeting procedure carries the stage's links so public
 * pages can order content without auth.
 */
import { describe, it, expect } from 'vitest';
import { prisma } from '@galaxy/db';
import { prioritizeByLinks } from '@galaxy/shared';
import { appRouter } from '../routers/index';
import { buildUser } from './factories';

function caller() {
  return (appRouter as any).createCaller({ user: null, ip: '127.0.0.1' });
}

describe('prioritizeByLinks — stage-aware ordering', () => {
  const items = [
    { href: '/a', n: 1 },
    { href: '/b', n: 2 },
    { href: '/c', n: 3 },
  ];

  it('keeps the original order when no links match', () => {
    expect(prioritizeByLinks(items, ['/x', '/y']).map((i) => i.n)).toEqual([1, 2, 3]);
  });

  it('keeps the original order for an empty link list', () => {
    expect(prioritizeByLinks(items, []).map((i) => i.n)).toEqual([1, 2, 3]);
  });

  it('surfaces matching tiles first, in link order', () => {
    expect(prioritizeByLinks(items, ['/c', '/a']).map((i) => i.n)).toEqual([3, 1, 2]);
  });

  it('preserves the relative order of unmatched tiles', () => {
    expect(prioritizeByLinks(items, ['/b']).map((i) => i.n)).toEqual([2, 1, 3]);
  });

  it('is stable and returns a new array', () => {
    const result = prioritizeByLinks(items, ['/b']);
    expect(result).not.toBe(items);
    expect(items.map((i) => i.n)).toEqual([1, 2, 3]);
  });
});

describe('homeGreeting links — stage quick links for public pages', () => {
  it('exposes the back_to_me links for anonymous callers', async () => {
    const c = caller();
    const g = await c.lifeStage.homeGreeting();
    expect(Array.isArray(g.links)).toBe(true);
    expect(g.links.length).toBeGreaterThanOrEqual(2);
    expect(g.links.every((l: { href: string; key: string }) => l.href && l.key)).toBe(true);
  });

  it('exposes the stage-specific links for a bride (auto-derived)', async () => {
    // Create a customer with a bridal concierge → bride stage.
    const u = await prisma.user.create({
      data: buildUser({ email: `bride-${Date.now()}@test.com` }),
    });
    try {
      await prisma.bridalConcierge.create({
        data: { userId: u.id, weddingDate: new Date(Date.now() + 90 * 86_400_000) },
      });
      const c = (appRouter as any).createCaller({
        user: { id: u.id, role: 'CUSTOMER', email: u.email },
        ip: '127.0.0.1',
      });
      const g = await c.lifeStage.homeGreeting();
      expect(g.stage).toBe('bride');
      expect(g.links[0].href).toBe('/bridal-concierge');
    } finally {
      await prisma.bridalConcierge.deleteMany({ where: { userId: u.id } });
      await prisma.user.deleteMany({ where: { id: u.id } });
    }
  });
});
