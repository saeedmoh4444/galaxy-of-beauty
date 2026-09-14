/**
 * E5 — nail bars: venue vertical riding the unified provider pipeline
 * (becomeNailBar → review → verified) with station-capacity slots and
 * pay-at-venue bookings (GymClass capacity-claim pattern).
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import type { JwtPayload } from '../lib/jwt';
import { buildUser } from './factories';

let owner: JwtPayload;
let customer: JwtPayload;
const createdUserIds: number[] = [];
const createdVendorIds: number[] = [];

async function caller(u: JwtPayload | null) {
  return (appRouter as any).createCaller({ user: u, ip: '127.0.0.1' });
}

const DOCS = {
  crUrl: 'https://example.com/cr.pdf',
  nationalIdUrl: 'https://example.com/id.pdf',
  licenseUrl: 'https://example.com/license.pdf',
};

describe('nail bars (E5)', () => {
  beforeAll(async () => {
    const o = await prisma.user.create({ data: buildUser() });
    const c = await prisma.user.create({ data: buildUser() });
    owner = { id: o.id, role: 'CUSTOMER', email: o.email };
    customer = { id: c.id, role: 'CUSTOMER', email: c.email };
    createdUserIds.push(o.id, c.id);
  }, 15000);

  afterAll(async () => {
    try {
      await prisma.nailBarBooking.deleteMany({ where: { customerId: { in: createdUserIds } } });
    } catch {}
    try {
      await prisma.nailBarSlot.deleteMany({ where: { nailBarId: { in: createdVendorIds } } });
    } catch {}
    try {
      await prisma.providerSubmission.deleteMany({ where: { providerId: { in: createdUserIds } } });
    } catch {}
    try {
      await prisma.vendor.deleteMany({ where: { id: { in: createdVendorIds } } });
    } catch {}
    try {
      await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
    } catch {}
  });

  it('bookSlot rejects anonymous access', async () => {
    const anon = await caller(null);
    await expect(anon.nailBars.bookSlot({ slotId: 1 })).rejects.toThrow();
    await expect(anon.nailBars.myBookings()).rejects.toThrow();
  });

  it('becomeNailBar creates an unverified NAIL_BAR vendor + review submission', async () => {
    const c = await caller(owner);
    const vendor = await c.marketplace.becomeNailBar({
      storeName: 'نيل آرت الرياض',
      storeSlug: 'nail-art-riyadh-e5',
      nailBarType: 'standard',
      nailBarCity: 'الرياض',
      nailBarAddress: 'حي العليا — طريق الملك فهد',
      licenseNumber: 'NAIL-5555',
      licenseAgency: 'MUNICIPALITY',
      documents: DOCS,
    });

    expect(vendor.type).toBe('NAIL_BAR');
    expect(vendor.isVerified).toBe(false);
    createdVendorIds.push(vendor.id);

    const submission = await prisma.providerSubmission.findFirst({
      where: { providerId: owner.id, kind: 'nail_bar' },
    });
    expect(submission?.status).toBe('PENDING_REVIEW');

    // One vendor per user.
    await expect(
      c.marketplace.becomeNailBar({
        storeName: 'ثاني',
        storeSlug: 'second-e5',
        nailBarType: 'express',
        nailBarCity: 'جدة',
        nailBarAddress: 'شارع التحلية ١',
        licenseNumber: 'NAIL-6666',
        licenseAgency: 'MUNICIPALITY',
        documents: DOCS,
      }),
    ).rejects.toThrow();
  });

  it('nailBars.list shows only verified + active nail bars', async () => {
    const vendorId = createdVendorIds[0]!;
    await prisma.vendor.update({ where: { id: vendorId }, data: { isVerified: true } });

    const c = await caller(customer);
    const page = await c.nailBars.list({});
    const found = page.items.find((v: any) => v.id === vendorId);
    expect(found).toBeTruthy();
    expect(found.nailBarType).toBe('standard');

    await prisma.vendor.update({ where: { id: vendorId }, data: { isActive: false } });
    const hidden = await c.nailBars.list({});
    expect(hidden.items.some((v: any) => v.id === vendorId)).toBe(false);
    await prisma.vendor.update({ where: { id: vendorId }, data: { isActive: true } });
  });

  it('the nail bar owner opens capacity slots and lists them', async () => {
    const c = await caller(owner);
    const startAt = new Date(Date.now() + 3 * 86_400_000).toISOString();
    const endAt = new Date(Date.now() + 3 * 86_400_000 + 3600_000).toISOString();

    const slot = await c.vendorPortal['nailBarSlots.add']({
      startAt,
      endAt,
      capacity: 2,
    });
    expect(slot.capacity).toBe(2);
    expect(slot.bookedCount).toBe(0);

    const owned = await c.vendorPortal['nailBarSlots.list']();
    expect(owned.some((s: any) => s.id === slot.id)).toBe(true);
  });

  it('a customer books a station; duplicate booking is rejected BEFORE the slot fills', async () => {
    const c = await caller(customer);
    const slots = await c.nailBars.list({});
    // Fetch slots via the public procedure for the verified nail bar.
    const from = new Date(Date.now() + 2 * 86_400_000).toISOString();
    const to = new Date(Date.now() + 5 * 86_400_000).toISOString();
    const available = await c.nailBars.slots({
      nailBarId: createdVendorIds[0]!,
      from,
      to,
    });
    expect(available.length).toBe(1);
    const slot = available[0]!;
    expect(slot.spotsLeft).toBe(2);

    const booking = await c.nailBars.bookSlot({ slotId: slot.id });
    expect(booking.code.startsWith('GON-')).toBe(true);
    expect(booking.slotId).toBe(slot.id);

    // Duplicate (slotId, customerId) → clean error. Must run BEFORE the
    // second station is claimed or the full-slot error fires first.
    await expect(c.nailBars.bookSlot({ slotId: slot.id })).rejects.toThrow();

    const after = await prisma.nailBarSlot.findUniqueOrThrow({ where: { id: slot.id } });
    expect(after.bookedCount).toBe(1);
  });

  it('the last station fills the slot; further bookings get CONFLICT', async () => {
    const c = await caller(customer);
    const second = await prisma.user.create({ data: buildUser() });
    createdUserIds.push(second.id);
    const c2 = await caller({ id: second.id, role: 'CUSTOMER', email: second.email });

    const slots = await prisma.nailBarSlot.findMany({
      where: { nailBarId: createdVendorIds[0]! },
      orderBy: { id: 'asc' },
    });
    const slot = slots[0]!;

    await c2.nailBars.bookSlot({ slotId: slot.id });

    const full = await prisma.nailBarSlot.findUniqueOrThrow({ where: { id: slot.id } });
    expect(full.bookedCount).toBe(2);

    const third = await prisma.user.create({ data: buildUser() });
    createdUserIds.push(third.id);
    const c3 = await caller({ id: third.id, role: 'CUSTOMER', email: third.email });
    await expect(c3.nailBars.bookSlot({ slotId: slot.id })).rejects.toThrow(/full/i);
  });

  it('myBookings returns only the caller bookings with slot + nail bar info', async () => {
    const c = await caller(customer);
    const mine = await c.nailBars.myBookings();
    expect(mine.length).toBeGreaterThanOrEqual(1);
    expect(mine.every((b: any) => b.customerId === customer.id)).toBe(true);
    expect(mine[0].slot.nailBarId).toBe(createdVendorIds[0]);
  });
});
