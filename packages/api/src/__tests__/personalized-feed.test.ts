/**
 * Personalized feed router tests — capped mixed feed (services + products),
 * role gating, and the refresh mutation. Read-only against seeded data.
 * (Coverage ratchet target: src/routers/personalizedFeed.ts — was 11.3%)
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import type { JwtPayload } from '../lib/jwt';

let admin: JwtPayload;
let customer: JwtPayload;

async function caller(user: JwtPayload | null) {
  return (appRouter as any).createCaller({ user, ip: '127.0.0.1' });
}

describe('personalizedFeed router', () => {
  beforeAll(async () => {
    const adminUser = await prisma.user.findFirstOrThrow({ where: { role: 'ADMIN' } });
    admin = { id: adminUser.id, role: 'ADMIN', email: adminUser.email };
    const customerUser = await prisma.user.findFirstOrThrow({ where: { role: 'CUSTOMER' } });
    customer = { id: customerUser.id, role: 'CUSTOMER', email: customerUser.email };
  });

  it('returns a capped feed of services and products for a customer', async () => {
    const c = await caller(customer);
    const feed = await c.personalizedFeed.feed();

    expect(Array.isArray(feed.items)).toBe(true);
    // services (SMALL_PAGE_SIZE=5) + products (3) is at most 8, sliced to 10
    expect(feed.items.length).toBeLessThanOrEqual(10);
    for (const item of feed.items) {
      expect(['service', 'product']).toContain(item.type);
      expect(typeof item.id).toBe('number');
      expect(item.title === undefined || typeof item.title === 'string').toBe(true);
      expect(typeof item.price).toBe('number');
      expect(typeof item.relevance).toBe('number');
      expect(typeof item.emoji).toBe('string');
    }

    // Fixed catalog labels
    expect(feed.categories).toEqual(['متابَع', 'مقترح', 'رائج']);
    expect(feed.interests).toEqual(['skincare', 'makeup', 'wellness']);
  }, 15000);

  it('rejects admin and anonymous callers on feed', async () => {
    const adminCaller = await caller(admin);
    await expect(adminCaller.personalizedFeed.feed()).rejects.toThrow();
    const anon = await caller(null);
    await expect(anon.personalizedFeed.feed()).rejects.toThrow();
  }, 15000);

  it('refreshes the feed for customers', async () => {
    const c = await caller(customer);
    const res = await c.personalizedFeed.refresh();
    expect(res).toEqual({ refreshed: true, newItems: 3 });
  }, 15000);

  it('rejects refresh for admin and anonymous callers', async () => {
    const adminCaller = await caller(admin);
    await expect(adminCaller.personalizedFeed.refresh()).rejects.toThrow();
    const anon = await caller(null);
    await expect(anon.personalizedFeed.refresh()).rejects.toThrow();
  }, 15000);
});
