/**
 * Phase 3 sprint 1 — home reels row (E7). beautyShorts.home is the public
 * curated query feeding the "شاهدينا" section: approved + active shorts,
 * top by views, capped at 8.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';

function caller() {
  return (appRouter as any).createCaller({ user: null, ip: '127.0.0.1' });
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
      data: { ...base, views: 500, titleJson: { ar: 'خمسمائة', en: 'High views' } },
    });
    const low = await prisma.short.create({
      data: { ...base, views: 100, titleJson: { ar: 'مائة', en: 'Low views' } },
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
    createdShortIds.push(high.id, low.id, unapproved.id, inactive.id);
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

  it('returns only approved + active shorts', async () => {
    const c = caller();
    const rows = (await c.beautyShorts.home()) as Array<Record<string, unknown>>;
    const mine = rows.filter((r) => createdShortIds.includes(r.id as number));
    expect(mine).toHaveLength(2);
    expect(mine.every((r) => r.isApproved && r.isActive)).toBe(true);
  });

  it('orders by views desc and caps the row at 8', async () => {
    const c = caller();
    const rows = (await c.beautyShorts.home()) as Array<Record<string, unknown>>;
    expect(rows.length).toBeLessThanOrEqual(8);

    const mine = rows.filter((r) => createdShortIds.includes(r.id as number));
    expect(mine.map((r) => r.views)).toEqual([500, 100]);
  });
});
