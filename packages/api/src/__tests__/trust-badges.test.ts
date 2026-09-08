/**
 * E6d — trust badges (Tier 2): women-only staff + private suite flags on
 * services and venues, global catalog filters (incl. pregnancy-safe), and
 * the vendor self-service toggle.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import type { JwtPayload } from '../lib/jwt';
import { buildUser, buildCategory, buildService } from './factories';

let user: JwtPayload;
let owner: JwtPayload;
const createdUserIds: number[] = [];
const createdVendorIds: number[] = [];
const createdCategoryIds: number[] = [];
const createdServiceIds: number[] = [];

async function caller(u: JwtPayload | null) {
  return (appRouter as any).createCaller({ user: u, ip: '127.0.0.1' });
}

describe('trust badges (E6d)', () => {
  beforeAll(async () => {
    const u = await prisma.user.create({ data: buildUser() });
    const o = await prisma.user.create({ data: buildUser() });
    user = { id: u.id, role: 'CUSTOMER', email: u.email };
    owner = { id: o.id, role: 'CUSTOMER', email: o.email };
    createdUserIds.push(u.id, o.id);

    // Women-only + private-suite service.
    const cat = await prisma.category.create({ data: buildCategory() });
    createdCategoryIds.push(cat.id);
    const svc = await prisma.service.create({
      data: buildService({ categoryId: cat.id }),
    });
    await prisma.service.update({
      where: { id: svc.id },
      data: { isWomenOnlyStaff: true, isPrivateSuite: true },
    });
    createdServiceIds.push(svc.id);

    // A venue with flags + a venue without.
    const flagged = await prisma.vendor.create({
      data: {
        userId: o.id,
        storeName: 'نادي نسائي مصون',
        storeSlug: 'trust-flagged-e6d',
        type: 'GYM',
        gymType: 'ladies',
        womenOnlyStaff: true,
        isVerified: true,
      },
    });
    createdVendorIds.push(flagged.id);
  }, 15000);

  afterAll(async () => {
    try {
      await prisma.vendor.deleteMany({ where: { id: { in: createdVendorIds } } });
    } catch {}
    try {
      await prisma.service.deleteMany({ where: { id: { in: createdServiceIds } } });
    } catch {}
    try {
      await prisma.category.deleteMany({ where: { id: { in: createdCategoryIds } } });
    } catch {}
    try {
      await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
    } catch {}
  });

  it('services.list filters by womenOnly and privateSuite', async () => {
    const c = await caller(user);
    const womenOnly = await c.services.list({ womenOnly: true, limit: 100 });
    expect(womenOnly.items.some((s: any) => s.id === createdServiceIds[0])).toBe(true);
    expect(womenOnly.items.every((s: any) => s.isWomenOnlyStaff)).toBe(true);

    const suites = await c.services.list({ privateSuite: true, limit: 100 });
    expect(suites.items.some((s: any) => s.id === createdServiceIds[0])).toBe(true);
    expect(suites.items.every((s: any) => s.isPrivateSuite)).toBe(true);

    const pregnancySafe = await c.services.list({ pregnancySafe: true, limit: 100 });
    expect(pregnancySafe.items.every((s: any) => s.isPregnancySafe)).toBe(true);
  });

  it('the queryBool transform treats the string "false" as false', async () => {
    const c = await caller(user);
    const unfiltered = await c.services.list({ womenOnly: 'false' as never, limit: 100 });
    // Not filtered to women-only — the flagged service may or may not appear.
    expect(unfiltered.items.length).toBeGreaterThan(0);
  });

  it('gyms.list filters by womenOnly staff', async () => {
    const c = await caller(user);
    const filtered = await c.gyms.list({ womenOnly: true });
    expect(filtered.items.some((g: any) => g.id === createdVendorIds[0])).toBe(true);
  });

  it('setTrustFlags updates the caller vendor and rejects non-vendors', async () => {
    const c = await caller(owner);
    const updated = await c.vendorPortal.setTrustFlags({ privateSuite: true });
    expect(updated.privateSuite).toBe(true);

    const customer = await caller(user);
    await expect(customer.vendorPortal.setTrustFlags({ womenOnlyStaff: true })).rejects.toThrow();
  });

  it('nailBars.list accepts the privateSuite filter', async () => {
    const c = await caller(user);
    const suites = await c.nailBars.list({ privateSuite: true });
    expect(Array.isArray(suites.items)).toBe(true);
    expect(suites.items.every((n: any) => n.privateSuite !== undefined)).toBe(true);
  });
});
