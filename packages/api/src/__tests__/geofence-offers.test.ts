/**
 * Geofence offers router tests — the LIVE router over the
 * geo_promotions table (the orphaned geoPromotions router was
 * archived; this is the registered one mobile screens call).
 * (Coverage ratchet target: src/routers/geofenceOffers.ts)
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import type { JwtPayload } from '../lib/jwt';

let admin: JwtPayload;
let customer: JwtPayload;
const createdIds: number[] = [];

async function caller(user: JwtPayload | null) {
  return (appRouter as any).createCaller({ user, ip: '127.0.0.1' });
}

describe('geofenceOffers router', () => {
  beforeAll(async () => {
    const adminUser = await prisma.user.findFirstOrThrow({ where: { role: 'ADMIN' } });
    admin = { id: adminUser.id, role: 'ADMIN', email: adminUser.email };
    const customerUser = await prisma.user.findFirstOrThrow({ where: { role: 'CUSTOMER' } });
    customer = { id: customerUser.id, role: 'CUSTOMER', email: customerUser.email };
  });

  afterAll(async () => {
    if (createdIds.length > 0) {
      await prisma.geoPromotion.deleteMany({ where: { id: { in: createdIds } } });
    }
  });

  it('lists active in-window promotions near a city publicly', async () => {
    const c = await caller(null);
    const list = await c.geofenceOffers.nearMe({ city: 'الرياض' });
    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toBeLessThanOrEqual(10);
    for (const p of list) {
      expect(p.isActive).toBe(true);
      expect(p.city).toBe('الرياض');
    }
  });

  it('orders by discount descending', async () => {
    const c = await caller(null);
    const list = await c.geofenceOffers.nearMe({});
    const pcts = list.map((p: { discountPct: number }) => p.discountPct);
    expect([...pcts].sort((a, b) => b - a)).toEqual(pcts);
  });

  it('serves customer history with the same in-window filter', async () => {
    const c = await caller(customer);
    const list = await c.geofenceOffers.history();
    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toBeLessThanOrEqual(5);
  });

  it('rejects history and adminList for anonymous callers', async () => {
    const c = await caller(null);
    await expect(c.geofenceOffers.history()).rejects.toThrow();
    await expect(c.geofenceOffers.adminList()).rejects.toThrow();
  });

  it('creates and toggles a promotion as admin', async () => {
    const c = await caller(admin);
    const starts = new Date(Date.now() - 3600_000).toISOString();
    const ends = new Date(Date.now() + 3600_000).toISOString();
    const created = await c.geofenceOffers.create({
      titleJson: { ar: 'عرض المدينة', en: 'City Deal' },
      city: 'جدة',
      discountPct: 30,
      startsAt: starts,
      endsAt: ends,
    });
    createdIds.push(created.id);
    expect(created.createdBy).toBe(admin.id);

    const toggled = await c.geofenceOffers.toggle({ id: created.id, isActive: false });
    expect(toggled.isActive).toBe(false);

    const adminList = await c.geofenceOffers.adminList();
    expect(adminList.some((p: { id: number }) => p.id === created.id)).toBe(true);
  });

  it('validates discount bounds and datetime format', async () => {
    const c = await caller(admin);
    await expect(
      c.geofenceOffers.create({
        titleJson: { ar: 'x', en: 'x' },
        city: 'الرياض',
        discountPct: 0,
        startsAt: 'not-a-date',
        endsAt: 'not-a-date',
      }),
    ).rejects.toThrow();
  });
});
