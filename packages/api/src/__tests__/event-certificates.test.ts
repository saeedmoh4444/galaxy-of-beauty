/**
 * 2.4c — certificates of completion for professional events.
 *
 * issueCertificates (admin) creates a certificate per REGISTERED
 * attendee of a finished professional event (workshop/masterclass/
 * retreat); idempotent, ignores waitlisted members, and refuses
 * unfinished or non-professional events. myCertificates returns the
 * caller's own.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import { buildUser } from './factories';
import type { JwtPayload } from '../lib/jwt';

const createdUserIds: number[] = [];
const createdEventIds: number[] = [];

async function caller(user: JwtPayload | null) {
  return (appRouter as any).createCaller({ user, ip: '127.0.0.1' });
}

async function makeUser(role: 'CUSTOMER' | 'ADMIN' = 'CUSTOMER'): Promise<JwtPayload> {
  const user = await prisma.user.create({ data: buildUser({ role }) });
  createdUserIds.push(user.id);
  return { id: user.id, role: user.role as JwtPayload['role'], email: user.email };
}

let admin: JwtPayload;
let attendee: JwtPayload;
let waiter: JwtPayload;

async function makeEvent(overrides: Record<string, unknown> = {}): Promise<number> {
  const ev = await (
    await caller(admin)
  ).beautyEvents.create({
    nameAr: 'ورشة احترافية',
    nameEn: 'Pro Workshop',
    eventType: 'workshop',
    startsAt: new Date(Date.now() - 86400000 * 2).toISOString(), // finished
    endsAt: new Date(Date.now() - 86400000 * 2 + 10800000).toISOString(),
    isPublished: true,
    ...overrides,
  });
  createdEventIds.push(ev.id);
  return ev.id;
}

async function seedRegistration(eventId: number, userId: number, status = 'REGISTERED') {
  return prisma.eventRegistration.create({
    data: { eventId, userId, status },
  });
}

beforeAll(async () => {
  admin = await makeUser('ADMIN');
  attendee = await makeUser();
  waiter = await makeUser();
}, 15000);

afterAll(async () => {
  try {
    await prisma.eventCertificate.deleteMany({
      where: { registration: { eventId: { in: createdEventIds } } },
    });
  } catch {
    /* best-effort */
  }
  try {
    await prisma.eventRegistration.deleteMany({ where: { eventId: { in: createdEventIds } } });
  } catch {
    /* best-effort */
  }
  try {
    await prisma.beautyEvent.deleteMany({ where: { id: { in: createdEventIds } } });
  } catch {
    /* best-effort */
  }
  try {
    await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
  } catch {
    /* best-effort */
  }
});

describe('event certificates', () => {
  it('issues certificates only to REGISTERED attendees of a finished professional event', async () => {
    const id = await makeEvent({ maxAttendees: 1 });
    await seedRegistration(id, attendee.id);
    await seedRegistration(id, waiter.id, 'WAITLIST');

    const res = await (await caller(admin)).beautyEvents.issueCertificates({ eventId: id });
    expect(res.issued).toBe(1);

    const certs = await prisma.eventCertificate.findMany({
      where: { registration: { eventId: id } },
      include: { registration: true },
    });
    expect(certs).toHaveLength(1);
    expect(certs[0]!.registration.userId).toBe(attendee.id);
    expect(certs[0]!.certificateNumber).toMatch(/^GOB-CERT-/);
  });

  it('is idempotent — a second issue creates nothing new', async () => {
    const id = await makeEvent();
    await seedRegistration(id, attendee.id);
    await (await caller(admin)).beautyEvents.issueCertificates({ eventId: id });
    const second = await (await caller(admin)).beautyEvents.issueCertificates({ eventId: id });
    expect(second.issued).toBe(0);
  });

  it('refuses unfinished events and non-professional types', async () => {
    const futureId = await makeEvent({
      startsAt: new Date(Date.now() + 86400000).toISOString(),
      endsAt: new Date(Date.now() + 86400000 + 7200000).toISOString(),
    });
    await expect(
      (await caller(admin)).beautyEvents.issueCertificates({ eventId: futureId }),
    ).rejects.toMatchObject({ code: 'BAD_REQUEST' });

    const launchId = await makeEvent({ eventType: 'launch' });
    await expect(
      (await caller(admin)).beautyEvents.issueCertificates({ eventId: launchId }),
    ).rejects.toMatchObject({ code: 'BAD_REQUEST' });
  });

  it('returns the caller their own certificates', async () => {
    const id = await makeEvent();
    await seedRegistration(id, attendee.id);
    await (await caller(admin)).beautyEvents.issueCertificates({ eventId: id });

    const mine = await (await caller(attendee)).beautyEvents.myCertificates();
    // The attendee may hold certificates from earlier tests in this file.
    expect(mine.find((c: any) => c.eventId === id)).toBeDefined();
    expect(mine.every((c: any) => c.certificateNumber.startsWith('GOB-CERT-'))).toBe(true);

    const others = await (await caller(waiter)).beautyEvents.myCertificates();
    expect(others).toHaveLength(0);
  });

  it('rejects non-admin issuance', async () => {
    await expect(
      (await caller(attendee)).beautyEvents.issueCertificates({ eventId: 1 }),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });
});
