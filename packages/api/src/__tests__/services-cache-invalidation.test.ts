/**
 * W2-10 (audit 2026-11-11) — the catalog-write cache invalidation in
 * services.create/update/delete sat AFTER the `return` statement — dead
 * code, so admin edits left the cached browse listings stale. These tests
 * plant a sentinel under the services cache prefix and assert each
 * mutation clears it.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import { createTRPCContext } from '../context';
import { getRedis } from '../lib/redis';
import { catalogCache } from '../lib/cacheKeys';
import { buildCategory } from './factories';
import type { JwtPayload } from '../lib/jwt';

const CSRF = 'a'.repeat(64);
const SENTINEL = `${catalogCache.services.prefix}w2-10-sentinel`;

let admin: JwtPayload;
let categoryId: number;
const createdServiceIds: number[] = [];

async function adminCaller() {
  const ctx = await createTRPCContext({ user: admin, csrfCookie: CSRF, csrfHeader: CSRF });
  return (appRouter as any).createCaller(ctx);
}

async function setSentinel(): Promise<void> {
  const redis = getRedis();
  if (!redis) throw new Error('Redis unavailable');
  if (redis.status !== 'ready') {
    await new Promise<void>((resolve) => redis.once('ready', () => resolve()));
  }
  await redis.set(`cache:${SENTINEL}`, 'stale');
}

async function sentinelPresent(): Promise<boolean> {
  const redis = getRedis();
  if (!redis) throw new Error('Redis unavailable');
  return (await redis.get(`cache:${SENTINEL}`)) !== null;
}

describe('services cache invalidation (W2-10)', () => {
  beforeAll(async () => {
    const anonCtx = await createTRPCContext({ csrfCookie: CSRF, csrfHeader: CSRF });
    const anon = (appRouter as any).createCaller(anonCtx);
    const login = await anon.auth.login({
      email: 'admin@galaxyofbeauty.sa',
      password: 'Admin@123456',
    });
    admin = { id: login.user.id, role: login.user.role, email: login.user.email };
    const cat = await prisma.category.create({ data: buildCategory() });
    categoryId = cat.id;
  }, 30_000);

  afterAll(async () => {
    try {
      await prisma.service.deleteMany({ where: { id: { in: createdServiceIds } } });
    } catch {}
    try {
      await prisma.category.deleteMany({ where: { id: categoryId } });
    } catch {}
    const redis = getRedis();
    await redis?.del(`cache:${SENTINEL}`);
  });

  it('create invalidates the cached services listings', async () => {
    await setSentinel();
    const c = await adminCaller();
    const svc = await c.services.create({
      categoryId,
      titleAr: 'اختبار الكاش',
      titleEn: 'Cache Test',
      basePrice: 10,
      durationMin: 15,
    });
    createdServiceIds.push(svc.id);
    expect(await sentinelPresent()).toBe(false);
  });

  it('update invalidates the cached services listings', async () => {
    await setSentinel();
    const c = await adminCaller();
    await c.services.update({ id: createdServiceIds[0]!, titleAr: 'اختبار الكاش ٢' });
    expect(await sentinelPresent()).toBe(false);
  });

  it('delete invalidates the cached services listings', async () => {
    await setSentinel();
    const c = await adminCaller();
    await c.services.delete({ id: createdServiceIds[0]! });
    expect(await sentinelPresent()).toBe(false);
  });
});
