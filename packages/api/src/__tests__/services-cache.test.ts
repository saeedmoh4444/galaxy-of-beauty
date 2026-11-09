/**
 * D3 — the plan's invalidation gate end-to-end: an admin edit of a service
 * must invalidate the cached listing, so the very next public read returns
 * the new title (no stale window). Uses the real router + Redis + DB.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import { createTRPCContext } from '../context';
import type { JwtPayload } from '../lib/jwt';
import { buildUser } from './factories';
import { getCacheStats, resetCacheStats } from '../lib/cache';
import { getRedis } from '../lib/redis';

const CSRF = 'a'.repeat(64);

let redisAvailable = false;
let adminUser: JwtPayload;
let adminUserId: number;

async function anonCaller() {
  const ctx = await createTRPCContext({ csrfCookie: CSRF, csrfHeader: CSRF });
  return (appRouter as any).createCaller(ctx);
}

async function adminCaller() {
  const ctx = await createTRPCContext({ user: adminUser, csrfCookie: CSRF, csrfHeader: CSRF });
  return (appRouter as any).createCaller(ctx);
}

beforeAll(async () => {
  const r = getRedis();
  if (r) {
    try {
      await r.ping();
      redisAvailable = true;
    } catch {
      redisAvailable = false;
    }
  }
  const u = await prisma.user.create({ data: buildUser({ role: 'ADMIN' }) });
  adminUserId = u.id;
  adminUser = { id: u.id, role: 'ADMIN', email: u.email };
}, 20000);

afterAll(async () => {
  await prisma.user.deleteMany({ where: { id: adminUserId } }).catch(() => undefined);
});

describe('services.list caching through the router', () => {
  it('serves the second identical list from the cache', async (ctx) => {
    if (!redisAvailable) return;
    resetCacheStats();
    const caller = await anonCaller();

    await caller.services.list({ page: 1, limit: 5 });
    const before = getCacheStats();
    await caller.services.list({ page: 1, limit: 5 });
    const after = getCacheStats();

    expect(after.hits).toBeGreaterThan(before.hits);
  });

  it('admin edit invalidates the listing — the next read sees the new title', async (ctx) => {
    if (!redisAvailable) return;
    const anon = await anonCaller();
    const admin = await adminCaller();

    // Warm the cache with the current listing.
    const first = await anon.services.list({ page: 1, limit: 5 });
    const service = first.items[0];
    expect(service).toBeDefined();

    // Admin edits the title — the mutation must invalidate the cache.
    const marker = `D3-${Date.now()}`;
    await admin.services.update({ id: service.id, titleEn: marker });

    const second = await anon.services.list({ page: 1, limit: 5 });
    const titles = second.items.map((s: { titleJson?: { en?: string } }) => s.titleJson?.en);
    expect(titles).toContain(marker);
  });
});
