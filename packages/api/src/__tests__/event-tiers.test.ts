/**
 * 2.4b — event tiers + meeting links + recording access.
 *
 * Tiers (FREE/PAID/VIP with goodie bag), online-event fields
 * (meetingProvider/meetingUrl/recordingUrl), and gated access: public
 * listings strip the meeting/recording URLs; accessDetails serves them
 * only to REGISTERED attendees.
 *
 * Fixtures are factory users + fresh events; cleanup is best-effort.
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
let customerA: JwtPayload;
let customerB: JwtPayload;

async function createEvent(overrides: Record<string, unknown> = {}): Promise<number> {
  const ev = await (
    await caller(admin)
  ).beautyEvents.create({
    nameAr: 'ماستر كلاس مكياج',
    nameEn: 'Makeup Masterclass',
    eventType: 'masterclass',
    startsAt: new Date(Date.now() + 86400000 * 20).toISOString(),
    endsAt: new Date(Date.now() + 86400000 * 20 + 10800000).toISOString(),
    isPublished: true,
    ...overrides,
  });
  createdEventIds.push(ev.id);
  return ev.id;
}

beforeAll(async () => {
  admin = await makeUser('ADMIN');
  customerA = await makeUser();
  customerB = await makeUser();
}, 15000);

afterAll(async () => {
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

describe('event tiers + access', () => {
  it('creates a VIP webinar with meeting and recording URLs', async () => {
    const id = await createEvent({
      eventType: 'webinar',
      tier: 'VIP',
      goodieBag: true,
      meetingProvider: 'zoom',
      meetingUrl: 'https://zoom.example/123',
      recordingUrl: 'https://zoom.example/rec/123',
    });
    const row = await prisma.beautyEvent.findUniqueOrThrow({ where: { id } });
    expect(row.tier).toBe('VIP');
    expect(row.goodieBag).toBe(true);
    expect(row.meetingProvider).toBe('zoom');
    expect(row.meetingUrl).toBe('https://zoom.example/123');
    expect(row.recordingUrl).toBe('https://zoom.example/rec/123');
  });

  it('strips meeting and recording URLs from public listings', async () => {
    await createEvent({
      meetingUrl: 'https://zoom.example/secret',
      recordingUrl: 'https://zoom.example/rec-secret',
    });

    const pub = await caller(null);
    const list = await pub.beautyEvents.list();
    for (const ev of list) {
      expect(ev.meetingUrl ?? null).toBeNull();
      expect(ev.recordingUrl ?? null).toBeNull();
    }
  });

  it('serves access details to a REGISTERED attendee only', async () => {
    const id = await createEvent({
      maxAttendees: 10,
      meetingUrl: 'https://zoom.example/join',
      recordingUrl: 'https://zoom.example/recording',
    });

    const a = await caller(customerA);
    await a.beautyEvents.register({ eventId: id });
    const details = await a.beautyEvents.accessDetails({ eventId: id });
    expect(details.meetingUrl).toBe('https://zoom.example/join');
    expect(details.recordingUrl).toBe('https://zoom.example/recording');

    // A non-attendee gets FORBIDDEN.
    const b = await caller(customerB);
    await expect(b.beautyEvents.accessDetails({ eventId: id })).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });
  });

  it('denies access details to waitlisted members', async () => {
    const id = await createEvent({
      maxAttendees: 1,
      meetingUrl: 'https://zoom.example/join2',
    });
    const a = await caller(customerA);
    const b = await caller(customerB);
    await a.beautyEvents.register({ eventId: id }); // takes the seat
    const wl = await b.beautyEvents.register({ eventId: id });
    expect(wl.status).toBe('WAITLIST');
    await expect(b.beautyEvents.accessDetails({ eventId: id })).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });
  });

  it('updates the tier after creation', async () => {
    const id = await createEvent({ tier: 'FREE' });
    await (await caller(admin)).beautyEvents.update({ id, tier: 'PAID', goodieBag: false });
    const row = await prisma.beautyEvent.findUniqueOrThrow({ where: { id } });
    expect(row.tier).toBe('PAID');
  });
});
