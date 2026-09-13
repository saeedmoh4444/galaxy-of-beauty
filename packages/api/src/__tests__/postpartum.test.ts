/**
 * E6b — postpartum care: curated content library (healing phases, tips,
 * when-to-seek-help signals), the postpartum-care services catalog, and
 * baby-friendly at-home salons — all riding existing engines (no new
 * provider types, per the scope guard).
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import type { JwtPayload } from '../lib/jwt';
import { buildUser } from './factories';

let user: JwtPayload;
const createdUserIds: number[] = [];
const createdVendorIds: number[] = [];

async function caller(u: JwtPayload | null) {
  return (appRouter as any).createCaller({ user: u, ip: '127.0.0.1' });
}

describe('postpartum care (E6b)', () => {
  beforeAll(async () => {
    const u = await prisma.user.create({ data: buildUser() });
    user = { id: u.id, role: 'CUSTOMER', email: u.email };
    createdUserIds.push(u.id);
  }, 15000);

  afterAll(async () => {
    try {
      await prisma.vendor.deleteMany({ where: { id: { in: createdVendorIds } } });
    } catch {}
    try {
      await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
    } catch {}
  });

  it('rejects anonymous access', async () => {
    const anon = await caller(null);
    await expect(anon.postpartum.library()).rejects.toThrow();
    await expect(anon.postpartum.services()).rejects.toThrow();
    await expect(anon.postpartum.babyFriendlySalons({})).rejects.toThrow();
  });

  it('library returns bilingual healing phases, tips and signals', async () => {
    const c = await caller(user);
    const lib = await c.postpartum.library();
    expect(lib.phases).toHaveLength(3);
    expect(lib.phases[0].rangeAr).toBeTruthy();
    expect(lib.phases[0].bodyEn).toBeTruthy();
    expect(lib.tips.length).toBeGreaterThanOrEqual(4);
    expect(lib.signals.length).toBeGreaterThanOrEqual(4);
  });

  it('services returns only the postpartum-care category', async () => {
    const c = await caller(user);
    const services = await c.postpartum.services();
    expect(services.length).toBeGreaterThanOrEqual(3);
    expect(services.every((s: any) => s.slug !== 'clean-fade')).toBe(true);
    expect(services.some((s: any) => s.slug === 'postpartum-recovery-massage')).toBe(true);
  });

  it('babyFriendlySalons returns verified baby-friendly ATHOME vendors in the city', async () => {
    const owner = await prisma.user.create({ data: buildUser() });
    createdUserIds.push(owner.id);
    const riyadh = await prisma.vendor.create({
      data: {
        userId: owner.id,
        storeName: 'زيارة منزلية ودّية',
        storeSlug: 'babyfriendly-riyadh-e6b',
        type: 'ATHOME',
        homeCity: 'الرياض',
        homeAddress: 'شمال الرياض',
        babyFriendly: true,
        isVerified: true,
      },
    });
    createdVendorIds.push(riyadh.id);
    const owner2 = await prisma.user.create({ data: buildUser() });
    createdUserIds.push(owner2.id);
    const notFlagged = await prisma.vendor.create({
      data: {
        userId: owner2.id,
        storeName: 'بدون علم',
        storeSlug: 'not-babyfriendly-e6b',
        type: 'ATHOME',
        homeCity: 'الرياض',
        homeAddress: 'شرق الرياض',
        babyFriendly: false,
        isVerified: true,
      },
    });
    createdVendorIds.push(notFlagged.id);

    const c = await caller(user);
    const salons = await c.postpartum.babyFriendlySalons({ city: 'الرياض' });
    expect(salons.some((v: any) => v.id === riyadh.id)).toBe(true);
    expect(salons.some((v: any) => v.id === notFlagged.id)).toBe(false);

    const jeddah = await c.postpartum.babyFriendlySalons({ city: 'جدة' });
    expect(jeddah).toHaveLength(0);
  });
});
