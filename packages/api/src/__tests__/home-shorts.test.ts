/**
 * Phase 3 sprint 1 — home reels row (E7). beautyShorts.home is the
 * curated query feeding the "شاهدينا" section: approved + active shorts,
 * top by views, capped at 8. Women-only privacy (stage 12): anonymous
 * callers only see face-blurred shorts.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';

function caller(user?: { id: number; role: string; email: string } | null) {
  return (appRouter as any).createCaller({ user: user ?? null, ip: '127.0.0.1' });
}

const createdShortIds: number[] = [];

describe('beautyShorts.home — curated reels row (Phase 3 sprint 1)', () => {
  beforeAll(async () => {
    const base = {
      type: 'reel',
      durationSec: 30,
      category: 'makeup',
      isApproved: true,
      isActive: true,
      consentGiven: true,
    };
    const high = await prisma.short.create({
      data: {
        ...base,
        views: 500,
        faceBlurred: true,
        titleJson: { ar: 'خمسمائة', en: 'High views' },
      },
    });
    const low = await prisma.short.create({
      data: { ...base, views: 100, faceBlurred: true, titleJson: { ar: 'مائة', en: 'Low views' } },
    });
    const unblurred = await prisma.short.create({
      data: {
        ...base,
        views: 999,
        faceBlurred: false,
        titleJson: { ar: 'بدون تمويه', en: 'Unblurred' },
      },
    });
    const unapproved = await prisma.short.create({
      data: {
        ...base,
        views: 999,
        isApproved: false,
        titleJson: { ar: 'غير معتمد', en: 'Unapproved' },
      },
    });
    const inactive = await prisma.short.create({
      data: {
        ...base,
        views: 888,
        isActive: false,
        titleJson: { ar: 'غير نشط', en: 'Inactive' },
      },
    });
    createdShortIds.push(high.id, low.id, unblurred.id, unapproved.id, inactive.id);
  }, 15000);

  afterAll(async () => {
    try {
      await prisma.shortLike.deleteMany({ where: { shortId: { in: createdShortIds } } });
    } catch {}
    try {
      await prisma.short.deleteMany({ where: { id: { in: createdShortIds } } });
    } catch {}
  });

  it('is public — anonymous callers can fetch the home row', async () => {
    const c = caller();
    const rows = await c.beautyShorts.home();
    expect(Array.isArray(rows)).toBe(true);
  });

  it('anonymous callers see only face-blurred shorts (women-only privacy)', async () => {
    const c = caller();
    const rows = (await c.beautyShorts.home()) as Array<Record<string, unknown>>;
    const mine = rows.filter((r) => createdShortIds.includes(r.id as number));
    expect(mine).toHaveLength(2); // high + low (blurred); unblurred excluded
    expect(mine.every((r) => r.faceBlurred === true)).toBe(true);
  });

  it('authenticated callers see unblurred shorts too', async () => {
    const c = caller({ id: 1, role: 'CUSTOMER', email: 'privacy@test.local' });
    const rows = (await c.beautyShorts.home()) as Array<Record<string, unknown>>;
    const mine = rows.filter((r) => createdShortIds.includes(r.id as number));
    // The unblurred short becomes visible once authenticated (seeded shorts
    // with higher views may crowd the capped row, so assert membership).
    const unblurred = createdShortIds[2];
    expect(mine.some((r) => r.id === unblurred)).toBe(true);
    expect(mine.every((r) => r.isApproved === true && r.isActive === true)).toBe(true);
  });

  it('orders by views desc and caps the row at 8', async () => {
    const c = caller();
    const rows = (await c.beautyShorts.home()) as Array<Record<string, unknown>>;
    expect(rows.length).toBeLessThanOrEqual(8);

    const mine = rows.filter((r) => createdShortIds.includes(r.id as number));
    expect(mine.map((r) => r.views)).toEqual([500, 100]);
  });
});
