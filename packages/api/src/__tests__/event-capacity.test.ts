/**
 * 2.4a — event capacity + waitlist.
 *
 * Registration enforces maxAttendees (REGISTERED vs WAITLIST),
 * cancellation promotes the oldest waitlisted member, re-registration
 * never downgrades, and past events reject registration. Fixture events
 * are fresh rows with far-future dates; cleanup is best-effort.
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

async function makeUser(): Promise<JwtPayload> {
  const user = await prisma.user.create({ data: buildUser() });
  createdUserIds.push(user.id);
  return { id: user.id, role: user.role as JwtPayload['role'], email: user.email };
}

async function makeEvent(opts: { maxAttendees?: number; startsAt?: Date }) {
  const ev = await prisma.beautyEvent.create({
    data: {
      nameJson: { ar: 'فعالية اختبار', en: 'Test Event' },
      eventType: 'workshop',
      maxAttendees: opts.maxAttendees ?? null,
      startsAt: opts.startsAt ?? new Date(Date.now() + 86400000 * 10),
      endsAt: new Date(Date.now() + 86400000 * 10 + 7200000),
      isPublished: true,
    },
  });
  createdEventIds.push(ev.id);
  return ev.id;
}

let users: JwtPayload[] = [];

beforeAll(async () => {
  users = [await makeUser(), await makeUser(), await makeUser(), await makeUser()];
}, 15000);

afterAll(async () => {
  try {
    await prisma.eventRegistration.deleteMany({
      where: { eventId: { in: createdEventIds } },
    });
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

describe('event capacity + waitlist', () => {
  it('registers normally while capacity remains', async () => {
    const eventId = await makeEvent({ maxAttendees: 2 });
    const reg = await (await caller(users[0]!)).beautyEvents.register({ eventId });
    expect(reg.status).toBe('REGISTERED');
  });

  it('moves overflow registrations onto the waitlist', async () => {
    const eventId = await makeEvent({ maxAttendees: 1 });
    await (await caller(users[0]!)).beautyEvents.register({ eventId });
    const second = await (await caller(users[1]!)).beautyEvents.register({ eventId });
    expect(second.status).toBe('WAITLIST');

    const rows = await prisma.eventRegistration.findMany({
      where: { eventId },
      orderBy: { id: 'asc' },
    });
    expect(rows.map((r) => r.status)).toEqual(['REGISTERED', 'WAITLIST']);
  });

  it('promotes the oldest waitlisted member when a spot frees up', async () => {
    const eventId = await makeEvent({ maxAttendees: 1 });
    await (await caller(users[0]!)).beautyEvents.register({ eventId });
    await (await caller(users[1]!)).beautyEvents.register({ eventId });
    await (await caller(users[2]!)).beautyEvents.register({ eventId });

    const res = await (await caller(users[0]!)).beautyEvents.cancelRegistration({ eventId });
    expect(res.success).toBe(true);
    expect(res.promotedUserId).toBe(users[1]!.id); // oldest waiter

    const rows = await prisma.eventRegistration.findMany({
      where: { eventId },
      orderBy: { id: 'asc' },
    });
    const byUser = new Map(rows.map((r) => [r.userId, r.status]));
    expect(byUser.get(users[1]!.id)).toBe('REGISTERED');
    expect(byUser.get(users[2]!.id)).toBe('WAITLIST');
  });

  it('never downgrades an existing REGISTERED row on re-register', async () => {
    const eventId = await makeEvent({ maxAttendees: 1 });
    await (await caller(users[0]!)).beautyEvents.register({ eventId });
    // Second user lands on the waitlist; re-registering must keep them there.
    const wl = await (await caller(users[1]!)).beautyEvents.register({ eventId });
    expect(wl.status).toBe('WAITLIST');
    const again = await (await caller(users[1]!)).beautyEvents.register({ eventId });
    expect(again.status).toBe('WAITLIST');
    // And the registered user stays registered.
    const re = await (await caller(users[0]!)).beautyEvents.register({ eventId });
    expect(re.status).toBe('REGISTERED');
  });

  it('reports the waitlist position for a waitlisted member', async () => {
    const eventId = await makeEvent({ maxAttendees: 1 });
    await (await caller(users[0]!)).beautyEvents.register({ eventId });
    await (await caller(users[1]!)).beautyEvents.register({ eventId });
    await (await caller(users[2]!)).beautyEvents.register({ eventId });

    const pos2 = await (await caller(users[2]!)).beautyEvents.waitlistPosition({ eventId });
    expect(pos2.position).toBe(2);
    const pos0 = await (await caller(users[0]!)).beautyEvents.waitlistPosition({ eventId });
    expect(pos0.position).toBe(0); // registered, not waiting
  });

  it('rejects registration for past events', async () => {
    const eventId = await makeEvent({ startsAt: new Date(Date.now() - 86400000) });
    await expect(
      (await caller(users[3]!)).beautyEvents.register({ eventId }),
    ).rejects.toMatchObject({ code: 'BAD_REQUEST' });
  });
});
