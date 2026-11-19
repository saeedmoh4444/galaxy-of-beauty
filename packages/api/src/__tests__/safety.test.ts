/**
 * W6-3 — safety router contract tests. The trust/safety surface (emergency
 * contacts, panic alerts, walk-me-to-car escorts, location sharing, home-safe
 * check-ins) shipped with ZERO tests; every procedure below is pinned to its
 * ownership + persistence contract, with the NOT_FOUND boundary for
 * cross-user access.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import type { JwtPayload } from '../lib/jwt';
import { buildUser, buildBooking, safeFutureDate } from './factories';

let customerA: JwtPayload;
let customerB: JwtPayload;
const createdUserIds: number[] = [];
const createdTechIds: number[] = [];
const createdBookingIds: number[] = [];
const createdContactIds: number[] = [];
let serviceId: number;
let categoryId: number;
let addressId: number;
let techUserId: number;

async function caller(u: JwtPayload) {
  return (appRouter as any).createCaller({ user: u, ip: '127.0.0.1' });
}

describe('safety router (W6-3)', () => {
  beforeAll(async () => {
    const a = await prisma.user.create({ data: buildUser() });
    const b = await prisma.user.create({ data: buildUser() });
    const tech = await prisma.user.create({ data: buildUser({ role: 'TECHNICIAN' }) });
    createdUserIds.push(a.id, b.id, tech.id);
    customerA = { id: a.id, role: 'CUSTOMER', email: a.email };
    customerB = { id: b.id, role: 'CUSTOMER', email: b.email };
    techUserId = tech.id;

    const profile = await prisma.technician.create({
      data: { userId: tech.id, city: 'الرياض' },
    });
    createdTechIds.push(profile.id);

    const cat = await prisma.category.create({
      data: {
        nameJson: { ar: 'تصنيف السلامة', en: 'Safety Category' },
        slug: `safety-test-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
        iconUrl: '',
      },
    });
    categoryId = cat.id;
    const svc = await prisma.service.create({
      data: {
        categoryId: cat.id,
        titleJson: { ar: 'خدمة السلامة', en: 'Safety Service' },
        descriptionJson: { ar: 'وصف', en: 'Description' },
        basePrice: 150,
        durationMin: 60,
        isActive: true,
      },
    });
    serviceId = svc.id;

    const addr = await prisma.address.create({
      data: {
        userId: a.id,
        label: 'المنزل',
        city: 'الرياض',
        area: 'النخيل',
        street: 'طريق الملك',
      },
    });
    addressId = addr.id;

    const booking = await prisma.booking.create({
      data: {
        ...buildBooking({
          customerId: a.id,
          technicianId: techUserId,
          serviceId,
          status: 'ACCEPTED',
          startAt: safeFutureDate(2),
          endAt: new Date(safeFutureDate(2).getTime() + 3_600_000),
        }),
        addressId,
      },
    });
    createdBookingIds.push(booking.id);
  }, 20000);

  afterAll(async () => {
    try {
      await prisma.emergencyContact.deleteMany({ where: { userId: { in: createdUserIds } } });
    } catch {}
    try {
      await prisma.locationShare.deleteMany({ where: { userId: { in: createdUserIds } } });
    } catch {}
    try {
      await prisma.escortRequest.deleteMany({ where: { userId: { in: createdUserIds } } });
    } catch {}
    try {
      await prisma.panicAlert.deleteMany({ where: { userId: { in: createdUserIds } } });
    } catch {}
    try {
      await prisma.safetyCheckIn.deleteMany({ where: { userId: { in: createdUserIds } } });
    } catch {}
    try {
      await prisma.booking.deleteMany({ where: { id: { in: createdBookingIds } } });
    } catch {}
    try {
      await prisma.service.deleteMany({ where: { id: serviceId } });
    } catch {}
    try {
      await prisma.address.deleteMany({ where: { id: addressId } });
    } catch {}
    try {
      await prisma.category.deleteMany({ where: { id: categoryId } });
    } catch {}
    try {
      await prisma.technician.deleteMany({ where: { id: { in: createdTechIds } } });
    } catch {}
    try {
      await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
    } catch {}
  });

  // ── Emergency Contacts ──

  it('addContact stores a caller-owned contact and getContacts returns it', async () => {
    const c = await caller(customerA);
    const contact = await c.safety.addContact({
      name: 'أختي نورة',
      phone: '0551234567',
      relation: 'أخت',
    });
    createdContactIds.push(contact.id);
    expect(contact.userId).toBe(customerA.id);
    expect(contact.name).toBe('أختي نورة');

    const list = await c.safety.getContacts();
    expect(list.length).toBe(1);
    expect(list[0].phone).toBe('0551234567');
    expect(list[0].relation).toBe('أخت');
  });

  it('getContacts isolates per user and caps at 5', async () => {
    const cA = await caller(customerA);
    const cB = await caller(customerB);

    // A already has 1 — add 5 more so the cap (take: 5) is exercised.
    for (let i = 0; i < 5; i++) {
      const added = await cA.safety.addContact({ name: `جهة ${i}`, phone: `05000000${i}0` });
      createdContactIds.push(added.id);
    }
    await cB.safety.addContact({ name: 'شقيق سارة', phone: '0559999999' });

    const aList = await cA.safety.getContacts();
    const bList = await cB.safety.getContacts();
    expect(aList).toHaveLength(5); // 6 created for A, capped at 5
    expect(bList).toHaveLength(1);
    expect(bList[0].name).toBe('شقيق سارة');
  });

  it('deleteContact removes own contacts and refuses others’ with NOT_FOUND', async () => {
    const cA = await caller(customerA);
    const cB = await caller(customerB);

    const foreign = await prisma.emergencyContact.findFirstOrThrow({
      where: { userId: customerB.id },
    });
    await expect(cA.safety.deleteContact({ id: foreign.id })).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
    const stillThere = await prisma.emergencyContact.findUnique({ where: { id: foreign.id } });
    expect(stillThere).not.toBeNull();

    const mine = await prisma.emergencyContact.findFirstOrThrow({
      where: { userId: customerA.id },
    });
    const res = await cA.safety.deleteContact({ id: mine.id });
    expect(res.success).toBe(true);
    expect(await prisma.emergencyContact.findUnique({ where: { id: mine.id } })).toBeNull();

    await expect(cB.safety.deleteContact({ id: mine.id })).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
  });

  // ── Panic Alerts ──

  it('triggerPanic stores the alert with coordinates and booking', async () => {
    const c = await caller(customerA);
    const res = await c.safety.triggerPanic({
      latitude: 24.7136,
      longitude: 46.6753,
      bookingId: createdBookingIds[0],
    });
    expect(res.alertId).toBeGreaterThan(0);
    expect(res.message).toContain('Help');

    const alert = await prisma.panicAlert.findUniqueOrThrow({ where: { id: res.alertId } });
    expect(alert.userId).toBe(customerA.id);
    expect(alert.latitude).toBe(24.7136);
    expect(alert.longitude).toBe(46.6753);
    expect(alert.bookingId).toBe(createdBookingIds[0]);
  });

  it('triggerPanic works without coordinates or booking', async () => {
    const c = await caller(customerB);
    const res = await c.safety.triggerPanic({});
    const alert = await prisma.panicAlert.findUniqueOrThrow({ where: { id: res.alertId } });
    expect(alert.userId).toBe(customerB.id);
    expect(alert.latitude).toBeNull();
    expect(alert.longitude).toBeNull();
    expect(alert.bookingId).toBeNull();
  });

  // ── Walk Me To Car ──

  it('requestEscort refuses a booking the caller does not own', async () => {
    const c = await caller(customerB);
    await expect(c.safety.requestEscort({ bookingId: createdBookingIds[0] })).rejects.toMatchObject(
      { code: 'NOT_FOUND' },
    );
    const rows = await prisma.escortRequest.count({ where: { userId: customerB.id } });
    expect(rows).toBe(0);
  });

  it('requestEscort creates a REQUESTED escort and getEscortStatus reads the latest', async () => {
    const c = await caller(customerA);
    const first = await c.safety.requestEscort({ bookingId: createdBookingIds[0] });
    expect(first.status).toBe('REQUESTED');

    const stored = await prisma.escortRequest.findUniqueOrThrow({ where: { id: first.requestId } });
    expect(stored.userId).toBe(customerA.id);
    expect(stored.technicianId).toBe(techUserId);

    const second = await c.safety.requestEscort({ bookingId: createdBookingIds[0] });
    const status = await c.safety.getEscortStatus({ bookingId: createdBookingIds[0] });
    expect(status.id).toBe(second.requestId); // newest first
    expect(status.technicianId).toBe(techUserId);
  });

  // ── Location Sharing ──

  it('startSharing opens an active session and stopSharing closes only the owner’s', async () => {
    const cA = await caller(customerA);
    const cB = await caller(customerB);

    const session = await cA.safety.startSharing({
      bookingId: createdBookingIds[0],
      contactIds: [createdContactIds[0]!],
    });
    expect(session.active).toBe(true);

    // Another user cannot stop it.
    await expect(cB.safety.stopSharing({ sessionId: session.sessionId })).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
    const stillActive = await prisma.locationShare.findUniqueOrThrow({
      where: { id: session.sessionId },
    });
    expect(stillActive.active).toBe(true);

    const done = await cA.safety.stopSharing({ sessionId: session.sessionId });
    expect(done.success).toBe(true);
    const closed = await prisma.locationShare.findUniqueOrThrow({
      where: { id: session.sessionId },
    });
    expect(closed.active).toBe(false);
    expect(closed.endedAt).toBeTruthy();
  });

  // ── I'm Home Safe ──

  it('checkIn stores HOME_SAFE and getCheckInStatus reads it back (owner-scoped)', async () => {
    const cA = await caller(customerA);
    const cB = await caller(customerB);

    const checkin = await cA.safety.checkIn({ bookingId: createdBookingIds[0] });
    const stored = await prisma.safetyCheckIn.findUniqueOrThrow({ where: { id: checkin.id } });
    expect(stored.userId).toBe(customerA.id);
    expect(stored.type).toBe('HOME_SAFE');

    const status = await cA.safety.getCheckInStatus({ bookingId: createdBookingIds[0] });
    expect(status.id).toBe(checkin.id);

    // Another user's read returns null (no leak, no throw).
    const foreign = await cB.safety.getCheckInStatus({ bookingId: createdBookingIds[0] });
    expect(foreign).toBeNull();
  });
});
