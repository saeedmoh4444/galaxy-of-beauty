/**
 * Q4 Phase 3 (REELS_SHOPPABLE_PLAN) — vendor reel analytics. The portal
 * reads each store's own reels with 30-day aggregates: views (live
 * counter), watch seconds (ShortWatchLog), tag clicks (ShortTagClick)
 * and attributed orders/revenue (ReelDailyStat read-model). Only the
 * caller's store reels ever resolve.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import type { JwtPayload } from '../lib/jwt';
import { buildUser } from './factories';

const createdUserIds: number[] = [];
const createdVendorIds: number[] = [];
const createdShortIds: number[] = [];

let owner: JwtPayload;
let outsider: JwtPayload;
let vendorId: number;
let topShortId: number;
let lowShortId: number;
let outsiderShortId: number;

function caller(user: JwtPayload | null) {
  return (appRouter as any).createCaller({ user, ip: '127.0.0.1' });
}

beforeAll(async () => {
  const stamp = Date.now().toString(36);
  const ownerU = await prisma.user.create({ data: buildUser() });
  const outU = await prisma.user.create({ data: buildUser() });
  createdUserIds.push(ownerU.id, outU.id);
  owner = { id: ownerU.id, role: 'CUSTOMER', email: ownerU.email };
  outsider = { id: outU.id, role: 'CUSTOMER', email: outU.email };

  const v = await prisma.vendor.create({
    data: { userId: ownerU.id, storeName: 'Reel Store', storeSlug: `reelstats-${stamp}` },
  });
  const ov = await prisma.vendor.create({
    data: { userId: outU.id, storeName: 'Other Store', storeSlug: `reelstats-o-${stamp}` },
  });
  createdVendorIds.push(v.id, ov.id);
  vendorId = v.id;

  const mk = async (title: string, views: number, vid: number) => {
    const s = await prisma.short.create({
      data: {
        type: 'reel',
        titleJson: { ar: title, en: title },
        consentGiven: true,
        faceBlurred: true,
        vendorId: vid,
        isApproved: true,
        isActive: true,
        durationSec: 30,
        views,
        category: 'makeup',
      },
    });
    createdShortIds.push(s.id);
    return s;
  };
  const top = await mk('الريل الأول', 100, v.id);
  const low = await mk('الريل الثاني', 50, v.id);
  const other = await mk('ريل الآخرين', 999, ov.id);
  topShortId = top.id;
  lowShortId = low.id;
  outsiderShortId = other.id;

  // Watch + click + attributed stats for the top reel only.
  await prisma.shortWatchLog.createMany({
    data: [
      { shortId: top.id, seconds: 30, completed: true },
      { shortId: top.id, seconds: 15, completed: false },
    ],
  });
  const tag = await prisma.shortTag.create({ data: { shortId: top.id } });
  await prisma.shortTagClick.createMany({
    data: [{ tagId: tag.id, shortId: top.id, productId: null, userId: null }],
  });
  await prisma.reelDailyStat.create({
    data: { shortId: top.id, day: new Date(Date.now() - 86_400_000), orders: 2, revenue: 240 },
  });
}, 30000);

afterAll(async () => {
  try {
    await prisma.reelDailyStat.deleteMany({ where: { shortId: { in: createdShortIds } } });
  } catch {}
  try {
    await prisma.shortTagClick.deleteMany({ where: { shortId: { in: createdShortIds } } });
  } catch {}
  try {
    await prisma.shortTag.deleteMany({ where: { shortId: { in: createdShortIds } } });
  } catch {}
  try {
    await prisma.shortWatchLog.deleteMany({ where: { shortId: { in: createdShortIds } } });
  } catch {}
  try {
    await prisma.short.deleteMany({ where: { id: { in: createdShortIds } } });
  } catch {}
  try {
    await prisma.vendor.deleteMany({ where: { id: { in: createdVendorIds } } });
  } catch {}
  try {
    await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
  } catch {}
});

describe('vendor reel analytics (Q4)', () => {
  it('returns the store reels sorted by views with 30-day aggregates', async () => {
    const res = await caller(owner).vendorPortal.reelAnalytics();
    expect(res.reels.map((r: { shortId: number }) => r.shortId)).toEqual([topShortId, lowShortId]);

    const top = res.reels[0] as {
      views: number;
      watchSeconds: number;
      clicks: number;
      orders: number;
      revenue: number;
    };
    expect(top.views).toBe(100);
    expect(top.watchSeconds).toBe(45);
    expect(top.clicks).toBe(1);
    expect(top.orders).toBe(2);
    expect(top.revenue).toBe(240);
  });

  it("never leaks another store's reels", async () => {
    const res = await caller(owner).vendorPortal.reelAnalytics();
    const ids = res.reels.map((r: { shortId: number }) => r.shortId);
    expect(ids).not.toContain(outsiderShortId);

    const otherRes = await caller(outsider).vendorPortal.reelAnalytics();
    expect(otherRes.reels.map((r: { shortId: number }) => r.shortId)).toEqual([outsiderShortId]);
  });

  it('returns an empty list for users without a store', async () => {
    const plain = await prisma.user.create({ data: buildUser() });
    createdUserIds.push(plain.id);
    const res = await caller({
      id: plain.id,
      role: 'CUSTOMER',
      email: plain.email,
    }).vendorPortal.reelAnalytics();
    expect(res.reels).toEqual([]);
    expect(res.totals.views).toBe(0);
  });
});
