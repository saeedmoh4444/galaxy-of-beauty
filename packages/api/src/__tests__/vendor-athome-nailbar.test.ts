/**
 * E3 — Nail-bar & at-home ops (VENDOR_DASHBOARD_ENHANCEMENT_PLAN Wave 5).
 * At-home: city-matching request queue with accept/decline and completion
 * confirmation. Nail-bar: per-day capacity analytics (slots filled %).
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import type { JwtPayload } from '../lib/jwt';
import { buildUser } from './factories';

const createdUserIds: number[] = [];
const createdVendorIds: number[] = [];
const createdRequestIds: number[] = [];
const createdSlotIds: number[] = [];

let salonOwner: JwtPayload;
let nailOwner: JwtPayload;
let requester: JwtPayload;
let bystander: JwtPayload;

let salonVendorId: number;
let nailVendorId: number;

const DAY = 86_400_000;
const HOUR = 3_600_000;

async function caller(user: JwtPayload | null) {
  return (appRouter as any).createCaller({ user, ip: '127.0.0.1' });
}

async function addRequest(
  city: string,
  overrides: Record<string, unknown> = {},
): Promise<{ id: number; serviceId: number; city: string; address: string }> {
  const r = await prisma.homeServiceRequest.create({
    data: {
      userId: requester.id,
      serviceId: 1,
      city,
      address: 'حي النرجس',
      preferredDate: '2026-11-01',
      preferredTime: '10:00',
      status: 'PENDING',
      ...overrides,
    } as never,
  });
  createdRequestIds.push(r.id);
  return r as never;
}

beforeAll(async () => {
  const salonU = await prisma.user.create({ data: buildUser() });
  const nailU = await prisma.user.create({ data: buildUser() });
  const requesterU = await prisma.user.create({ data: buildUser() });
  const bystanderU = await prisma.user.create({ data: buildUser() });
  createdUserIds.push(salonU.id, nailU.id, requesterU.id, bystanderU.id);
  salonOwner = { id: salonU.id, role: 'CUSTOMER', email: salonU.email };
  nailOwner = { id: nailU.id, role: 'CUSTOMER', email: nailU.email };
  requester = { id: requesterU.id, role: 'CUSTOMER', email: requesterU.email };
  bystander = { id: bystanderU.id, role: 'CUSTOMER', email: bystanderU.email };

  const salon = await prisma.vendor.create({
    data: {
      userId: salonU.id,
      type: 'ATHOME',
      storeName: 'At-home Salon',
      storeSlug: `ah-${Date.now()}`,
      homeCity: 'الرياض',
    },
  });
  const nail = await prisma.vendor.create({
    data: {
      userId: nailU.id,
      type: 'NAIL_BAR',
      storeName: 'Nail Studio',
      storeSlug: `nb-${Date.now()}`,
    },
  });
  createdVendorIds.push(salon.id, nail.id);
  salonVendorId = salon.id;
  nailVendorId = nail.id;
}, 15000);

afterAll(async () => {
  await prisma.homeServiceRequest.deleteMany({ where: { id: { in: createdRequestIds } } });
  await prisma.nailBarSlot.deleteMany({ where: { id: { in: createdSlotIds } } });
  await prisma.vendor.deleteMany({ where: { id: { in: createdVendorIds } } });
  await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
});

describe('E3 — homeRequests.queue', () => {
  it('lists only unassigned PENDING requests in the salon city', async () => {
    await addRequest('الرياض');
    await addRequest('الرياض');
    await addRequest('جدة'); // other city — invisible
    await addRequest('الرياض', { vendorId: salonVendorId, status: 'ACCEPTED' }); // assigned — invisible

    const c = await caller(salonOwner);
    const queue = await c.vendorPortal['homeRequests.queue']();
    expect(queue).toHaveLength(2);
    expect(queue.every((r: { city: string }) => r.city === 'الرياض')).toBe(true);
  });

  it('returns an empty queue for a non-ATHOME caller', async () => {
    const c = await caller(bystander);
    const queue = await c.vendorPortal['homeRequests.queue']();
    expect(queue).toEqual([]);
  });
});

describe('E3 — homeRequests.accept', () => {
  it('assigns a PENDING city request to the salon', async () => {
    const r = await addRequest('الرياض');
    const c = await caller(salonOwner);
    const updated = await c.vendorPortal['homeRequests.accept']({ requestId: r.id });
    expect(updated.status).toBe('ACCEPTED');
    expect(updated.vendorId).toBe(salonVendorId);
    expect(updated.assignedAt).toBeTruthy();
  });

  it('rejects accepting a request already taken', async () => {
    const r = await addRequest('الرياض', { vendorId: 999, status: 'ACCEPTED' });
    const c = await caller(salonOwner);
    await expect(c.vendorPortal['homeRequests.accept']({ requestId: r.id })).rejects.toThrow(
      /already/,
    );
  });

  it('rejects accepting a request in another city', async () => {
    const r = await addRequest('جدة');
    const c = await caller(salonOwner);
    await expect(c.vendorPortal['homeRequests.accept']({ requestId: r.id })).rejects.toThrow(
      /not found|city/,
    );
  });
});

describe('E3 — homeRequests.decline + complete', () => {
  it('declines with a reason and timestamps it', async () => {
    const r = await addRequest('الرياض');
    const c = await caller(salonOwner);
    const updated = await c.vendorPortal['homeRequests.decline']({
      requestId: r.id,
      reason: 'خارج نطاق الخدمة',
    });
    expect(updated.status).toBe('DECLINED');
    expect(updated.declinedAt).toBeTruthy();
    const row = await prisma.homeServiceRequest.findUniqueOrThrow({ where: { id: r.id } });
    expect(row.declineReason).toBe('خارج نطاق الخدمة');
  });

  it('completes an ACCEPTED request and stamps completedAt', async () => {
    const r = await addRequest('الرياض');
    const c = await caller(salonOwner);
    await c.vendorPortal['homeRequests.accept']({ requestId: r.id });
    const updated = await c.vendorPortal['homeRequests.complete']({ requestId: r.id });
    expect(updated.status).toBe('COMPLETED');
    const row = await prisma.homeServiceRequest.findUniqueOrThrow({ where: { id: r.id } });
    expect(row.completedAt).toBeTruthy();
  });

  it('rejects completing a request not assigned to the caller', async () => {
    const r = await addRequest('الرياض');
    const c = await caller(salonOwner);
    await expect(c.vendorPortal['homeRequests.complete']({ requestId: r.id })).rejects.toThrow(
      /not found/,
    );
  });
});

describe('E3 — nailBarCapacity', () => {
  it('computes filled capacity over the last 30 days', async () => {
    const mk = async (startAt: Date, capacity: number, booked: number) => {
      const s = await prisma.nailBarSlot.create({
        data: {
          nailBarId: nailVendorId,
          startAt,
          endAt: new Date(startAt.getTime() + HOUR),
          capacity,
          bookedCount: booked,
        },
      });
      createdSlotIds.push(s.id);
    };
    await mk(new Date(Date.now() - 1 * DAY), 2, 2); // full
    await mk(new Date(Date.now() - 2 * DAY), 2, 1); // half
    await mk(new Date(Date.now() + 3 * DAY), 2, 0); // future — excluded

    const c = await caller(nailOwner);
    const util = await c.vendorPortal.nailBarCapacity();
    expect(util.totalCapacity).toBe(4);
    expect(util.booked).toBe(3);
    expect(util.fillPct).toBe(75);
    expect(util.byDay.length).toBe(2);
  });

  it('is FORBIDDEN for a non-nail-bar caller', async () => {
    const c = await caller(bystander);
    await expect(c.vendorPortal.nailBarCapacity()).rejects.toThrow(/Nail bar not found/);
  });
});
