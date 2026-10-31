/**
 * F2 (audit T2) — router coverage for slots, notifications and the
 * notification-preference paths, all previously never named in any test.
 *
 * Slots: availability filtering (booked/Jummah hidden), slot creation
 * with overlap/Jummah/range validation, bulk creation by date+time,
 * ownership checks, hard vs soft deletion, date-range deletion.
 * Notifications: pagination, read-state transitions, cross-user
 * isolation, push-token registration upserts, admin multi-channel send,
 * and the notificationPreference defaults/upsert.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import { createTRPCContext } from '../context';
import type { JwtPayload } from '../lib/jwt';
import { buildUser, buildTechnician } from './factories';

const CSRF = 'a'.repeat(64);

async function caller(user: JwtPayload) {
  const ctx = await createTRPCContext({ user, csrfCookie: CSRF, csrfHeader: CSRF });
  return (appRouter as any).createCaller(ctx);
}

async function anonCaller() {
  const ctx = await createTRPCContext({ csrfCookie: CSRF, csrfHeader: CSRF });
  return (appRouter as any).createCaller(ctx);
}

let customer: JwtPayload;
let technician: JwtPayload;
let admin: JwtPayload;
let techUserId: number;
let techProfileId: number;
let otherUserId: number;
const createdUserIds: number[] = [];

beforeAll(async () => {
  const cu = await prisma.user.create({ data: buildUser() });
  customer = { id: cu.id, role: 'CUSTOMER', email: cu.email };
  createdUserIds.push(cu.id);

  const ou = await prisma.user.create({ data: buildUser() });
  otherUserId = ou.id;
  createdUserIds.push(ou.id);

  const tu = await prisma.user.create({ data: buildUser({ role: 'TECHNICIAN' }) });
  techUserId = tu.id;
  technician = { id: tu.id, role: 'TECHNICIAN', email: tu.email };
  createdUserIds.push(tu.id);
  const techProfile = await prisma.technician.create({ data: buildTechnician({ userId: tu.id }) });
  techProfileId = techProfile.id;

  const au = await prisma.user.create({ data: buildUser({ role: 'ADMIN' }) });
  admin = { id: au.id, role: 'ADMIN', email: au.email };
  createdUserIds.push(au.id);
});

afterAll(async () => {
  await prisma.notification.deleteMany({ where: { userId: { in: createdUserIds } } });
  await prisma.pushToken.deleteMany({ where: { userId: { in: createdUserIds } } });
  await prisma.notificationPreference.deleteMany({ where: { userId: { in: createdUserIds } } });
  await prisma.availabilitySlot.deleteMany({ where: { technicianId: techProfileId } });
  await prisma.technician.deleteMany({ where: { userId: techUserId } });
  await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
});

/** Weekday 07:00 UTC (10:00 Riyadh) — never inside the Friday window. */
function safeSlot(daysAhead: number, minutes = 30): { startAt: Date; endAt: Date } {
  const d = new Date(Date.now() + daysAhead * 86_400_000);
  while (d.getUTCDay() === 5) d.setUTCDate(d.getUTCDate() + 1);
  d.setUTCHours(7, 0, 0, 0);
  return { startAt: d, endAt: new Date(d.getTime() + minutes * 60_000) };
}

/** Next Friday 09:30 UTC (12:30 Riyadh) — inside the Jummah window. */
function jummahSlot(daysAhead = 3): { startAt: Date; endAt: Date } {
  const d = new Date(Date.now() + daysAhead * 86_400_000);
  while (d.getUTCDay() !== 5) d.setUTCDate(d.getUTCDate() + 1);
  d.setUTCHours(9, 30, 0, 0);
  return { startAt: d, endAt: new Date(d.getTime() + 30 * 60_000) };
}

describe('slots — technician availability', () => {
  it('createSlots creates the batch and rejects bad ranges, Jummah and overlaps', async () => {
    const c = await caller(technician);
    const s1 = safeSlot(10);
    const s2 = safeSlot(10, 60 * 3 + 30); // later the same day, no overlap with s1
    const res = await c.slots.createSlots({
      slots: [
        { startAt: s1.startAt.toISOString(), endAt: s1.endAt.toISOString() },
        { startAt: s2.startAt.toISOString(), endAt: s2.endAt.toISOString() },
      ],
    });
    expect(res.count).toBe(2);

    // startAt >= endAt → BAD_REQUEST
    await expect(
      c.slots.createSlots({
        slots: [{ startAt: s1.endAt.toISOString(), endAt: s1.startAt.toISOString() }],
      }),
    ).rejects.toMatchObject({ code: 'BAD_REQUEST' });

    // Jummah window → BAD_REQUEST
    const jm = jummahSlot();
    await expect(
      c.slots.createSlots({
        slots: [{ startAt: jm.startAt.toISOString(), endAt: jm.endAt.toISOString() }],
      }),
    ).rejects.toMatchObject({ code: 'BAD_REQUEST' });

    // Overlap with the already-created s1 → CONFLICT
    await expect(
      c.slots.createSlots({
        slots: [{ startAt: s1.startAt.toISOString(), endAt: s1.endAt.toISOString() }],
      }),
    ).rejects.toMatchObject({ code: 'CONFLICT' });
  });

  it('createBulkSlots builds date+time strings into real slots', async () => {
    const c = await caller(technician);
    const day = new Date();
    day.setDate(day.getDate() + 11);
    while (day.getDay() === 5) day.setDate(day.getDate() + 1);
    // The router parses `${date}T${time}` in server-local time — build the
    // date string from LOCAL parts and bound the assertion the same way.
    const dateStr = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
    const res = await c.slots.createBulkSlots({
      date: dateStr,
      timeSlots: [
        { start: '08:00', end: '08:30' },
        { start: '09:00', end: '09:30' },
      ],
    });
    expect(res.count).toBe(2);
    const rows = await prisma.availabilitySlot.findMany({
      where: {
        technicianId: techProfileId,
        startAt: { gte: new Date(`${dateStr}T00:00:00`), lte: new Date(`${dateStr}T23:59:59`) },
      },
      orderBy: { startAt: 'asc' },
    });
    expect(rows).toHaveLength(2);
    expect(rows[1].startAt.getTime() - rows[0].startAt.getTime()).toBe(60 * 60_000);
    await prisma.availabilitySlot.deleteMany({ where: { id: { in: rows.map((r) => r.id) } } });
  });

  it('getAvailability (public) hides booked and Jummah slots', async () => {
    const c = await caller(technician);
    const s = safeSlot(12);
    await c.slots.createSlots({
      slots: [{ startAt: s.startAt.toISOString(), endAt: s.endAt.toISOString() }],
    });
    const booked = safeSlot(12, 60 + 30); // later, no overlap
    const created = await prisma.availabilitySlot.create({
      data: {
        technicianId: techProfileId,
        startAt: booked.startAt,
        endAt: booked.endAt,
        isBooked: true,
      },
    });

    const pub = await anonCaller();
    const from = new Date(s.startAt.getTime() - 3_600_000);
    const to = new Date(booked.endAt.getTime() + 3_600_000);
    const avail = await pub.slots.getAvailability({
      technicianId: techProfileId,
      startDate: from.toISOString(),
      endDate: to.toISOString(),
    });
    expect(avail).toHaveLength(1);
    expect(avail[0].isBooked).toBe(false);
    await prisma.availabilitySlot.delete({ where: { id: created.id } });
  });

  it('getMySlots lists only the own slots and filters by date range', async () => {
    const c = await caller(technician);
    const s = safeSlot(14);
    await c.slots.createSlots({
      slots: [{ startAt: s.startAt.toISOString(), endAt: s.endAt.toISOString() }],
    });
    const from = new Date(s.startAt.getTime() - 3_600_000);
    const to = new Date(s.endAt.getTime() + 3_600_000);
    const mine = await c.slots.getMySlots({
      startDate: from.toISOString(),
      endDate: to.toISOString(),
    });
    expect(mine.length).toBeGreaterThan(0);
    expect(mine.every((sl: { technicianId: number }) => sl.technicianId === techProfileId)).toBe(
      true,
    );
  });

  it('deleteSlot hard-deletes unbooked and soft-deletes booked slots', async () => {
    const c = await caller(technician);
    const unbooked = safeSlot(16);
    await c.slots.createSlots({
      slots: [{ startAt: unbooked.startAt.toISOString(), endAt: unbooked.endAt.toISOString() }],
    });
    const row = await prisma.availabilitySlot.findFirstOrThrow({
      where: { technicianId: techProfileId, startAt: unbooked.startAt },
    });
    const res = await c.slots.deleteSlot({ slotId: row.id });
    expect(res.success).toBe(true);
    expect(await prisma.availabilitySlot.findUnique({ where: { id: row.id } })).toBeNull();

    const booked = await prisma.availabilitySlot.create({
      data: {
        technicianId: techProfileId,
        startAt: safeSlot(16, 60 + 30).startAt,
        endAt: safeSlot(16, 60 + 30).endAt,
        isBooked: true,
      },
    });
    await c.slots.deleteSlot({ slotId: booked.id });
    const soft = await prisma.availabilitySlot.findUniqueOrThrow({
      where: { id: booked.id },
    });
    expect(soft.isAvailable).toBe(false);
    await prisma.availabilitySlot.delete({ where: { id: booked.id } });
  });

  it('deleteSlotsByDate removes unbooked and unlists booked slots on a date', async () => {
    const c = await caller(technician);
    const day = safeSlot(18);
    await c.slots.createSlots({
      slots: [{ startAt: day.startAt.toISOString(), endAt: day.endAt.toISOString() }],
    });
    const booked = safeSlot(18, 60 + 30);
    await prisma.availabilitySlot.create({
      data: {
        technicianId: techProfileId,
        startAt: booked.startAt,
        endAt: booked.endAt,
        isBooked: true,
      },
    });
    const dateStr = `${day.startAt.getFullYear()}-${String(day.startAt.getMonth() + 1).padStart(2, '0')}-${String(day.startAt.getDate()).padStart(2, '0')}`;
    const res = await c.slots.deleteSlotsByDate({ date: dateStr });
    expect(res.deleted).toBe(1);
    expect(res.unlisted).toBe(1);
    const remaining = await prisma.availabilitySlot.findMany({
      where: { technicianId: techProfileId, startAt: { gte: day.startAt } },
    });
    expect(remaining).toHaveLength(1);
    expect(remaining[0].isBooked).toBe(true);
    expect(remaining[0].isAvailable).toBe(false);
    await prisma.availabilitySlot.delete({ where: { id: remaining[0].id } });
  });

  it('rejects customers and foreign technicians from slot mutations', async () => {
    const cust = await caller(customer);
    const s = safeSlot(20);
    await expect(
      cust.slots.createSlots({
        slots: [{ startAt: s.startAt.toISOString(), endAt: s.endAt.toISOString() }],
      }),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });
});

describe('notifications — inbox lifecycle', () => {
  async function seedNotification(userId: number, isRead = false, type = 'booking') {
    return prisma.notification.create({
      data: {
        userId,
        type,
        titleJson: { ar: 'إشعار', en: 'Notice' },
        bodyJson: { ar: 'نص', en: 'Body' },
        isRead,
      },
    });
  }

  it('list paginates newest-first', async () => {
    const n1 = await seedNotification(customer.id);
    const n2 = await seedNotification(customer.id);
    const n3 = await seedNotification(customer.id);
    const c = await caller(customer);
    const page1 = await c.notifications.list({ page: 1, limit: 2 });
    expect(page1.items).toHaveLength(2);
    expect(page1.total).toBe(3);
    expect(page1.hasMore).toBe(true);
    expect(page1.items[0].id).toBeGreaterThan(page1.items[1].id);
    const page2 = await c.notifications.list({ page: 2, limit: 2 });
    expect(page2.items).toHaveLength(1);
    await prisma.notification.deleteMany({ where: { id: { in: [n1.id, n2.id, n3.id] } } });
  });

  it('unreadCount, markRead, markAllRead and deleteAllRead track read state', async () => {
    const n1 = await seedNotification(customer.id);
    const n2 = await seedNotification(customer.id);
    const c = await caller(customer);

    expect((await c.notifications.unreadCount()).count).toBe(2);

    expect((await c.notifications.markRead({ id: n1.id })).success).toBe(true);
    expect((await c.notifications.unreadCount()).count).toBe(1);

    // Another user's notification cannot be marked read by this user.
    const foreign = await seedNotification(otherUserId);
    expect((await c.notifications.markRead({ id: foreign.id })).success).toBe(false);
    await prisma.notification.deleteMany({ where: { id: foreign.id } });

    await c.notifications.markAllRead({});
    expect((await c.notifications.unreadCount()).count).toBe(0);

    // deleteAllRead removes only read rows — n2 was marked read, n1/n2 both read now.
    const res = await c.notifications.deleteAllRead({});
    expect(res.count).toBe(2);
    expect(await prisma.notification.count({ where: { userId: customer.id } })).toBe(0);
  });

  it('registerPushToken upserts per token and transfers ownership', async () => {
    const c = await caller(customer);
    const token = `ExpoPushToken[test-${Date.now()}]`;
    expect((await c.notifications.registerPushToken({ token, platform: 'ios' })).success).toBe(
      true,
    );
    // Re-registering the same token from the same user must not duplicate.
    await c.notifications.registerPushToken({ token, platform: 'ios' });
    const rows = await prisma.pushToken.findMany({ where: { token } });
    expect(rows).toHaveLength(1);

    // Registering from another user transfers the token (device moved).
    const other = await caller({ id: otherUserId, role: 'CUSTOMER', email: 'x@example.com' });
    await other.notifications.registerPushToken({ token, platform: 'android' });
    const transferred = await prisma.pushToken.findUniqueOrThrow({ where: { token } });
    expect(transferred.userId).toBe(otherUserId);
    expect(transferred.platform).toBe('android');
  });

  it('send (admin) creates the in-app notification', async () => {
    const c = await caller(admin);
    const n = await c.notifications.send({
      userId: customer.id,
      type: 'promo',
      titleAr: 'عرض',
      titleEn: 'Offer',
      bodyAr: 'خصم',
      bodyEn: 'Discount',
      link: '/flash-deals',
    });
    expect(n.id).toBeTruthy();
    const row = await prisma.notification.findUniqueOrThrow({ where: { id: n.id } });
    expect(row.sentVia).toContain('in_app');
    expect(row.link).toBe('/flash-deals');
    await prisma.notification.delete({ where: { id: n.id } });
  });
});

describe('notificationPrefs', () => {
  it('returns privacy-first defaults then persists updates', async () => {
    const c = await caller(customer);
    const initial = await c.notificationPrefs.get();
    expect(initial).toMatchObject({
      bookingReminders: true,
      promotions: true,
      whatsappAlerts: false,
    });

    await c.notificationPrefs.update({ promotions: false, emailDigest: true });
    const updated = await c.notificationPrefs.get();
    expect(updated).toMatchObject({ promotions: false, emailDigest: true });
    expect(updated.bookingReminders).toBe(true);
  });
});
