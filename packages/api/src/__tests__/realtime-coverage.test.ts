/**
 * W6-4 — realtime domain coverage. chat/liveChat/notifications/
 * notificationPrefs shipped with 3/7 procedures exercised; this suite pins
 * the participant boundaries, pagination and read-state contracts.
 */
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { prisma } from '@galaxy/db';
import { appRouter } from '../routers/index';
import type { JwtPayload } from '../lib/jwt';
import { buildUser, buildBooking, safeFutureDate } from './factories';

// The routers only import the emit helpers — assert wiring without booting
// a socket server (per-file registry keeps other socket tests unaffected).
vi.mock('../socket/index', () => ({
  emitToUser: vi.fn(),
}));
import { emitToUser } from '../socket/index';

let customerA: JwtPayload;
let customerB: JwtPayload;
const createdUserIds: number[] = [];
const createdTechIds: number[] = [];
const createdBookingIds: number[] = [];
const createdNotificationIds: number[] = [];
const createdPushTokenIds: number[] = [];
let techUserId: number;
let activeBookingId: number;
let cancelledBookingId: number;

async function caller(u: JwtPayload) {
  return (appRouter as any).createCaller({ user: u, ip: '127.0.0.1' });
}

async function makeNotification(userId: number, opts: { isRead?: boolean; type?: string } = {}) {
  const n = await prisma.notification.create({
    data: {
      userId,
      type: opts.type ?? 'booking_created',
      titleJson: { ar: 'عنوان', en: 'Title' },
      bodyJson: { ar: 'نص', en: 'Body' },
      isRead: opts.isRead ?? false,
    },
  });
  createdNotificationIds.push(n.id);
  return n;
}

describe('realtime domain coverage (W6-4)', () => {
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
        nameJson: { ar: 'تصنيف اللحظي', en: 'Realtime Category' },
        slug: `realtime-test-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
        iconUrl: '',
      },
    });
    const svc = await prisma.service.create({
      data: {
        categoryId: cat.id,
        titleJson: { ar: 'خدمة لحظية', en: 'Realtime Service' },
        descriptionJson: { ar: 'وصف', en: 'Description' },
        basePrice: 150,
        durationMin: 60,
        isActive: true,
      },
    });
    const addr = await prisma.address.create({
      data: { userId: a.id, label: 'المنزل', city: 'الرياض', area: 'النخيل', street: 'طريق الملك' },
    });

    const active = await prisma.booking.create({
      data: {
        ...buildBooking({
          customerId: a.id,
          technicianId: techUserId,
          serviceId: svc.id,
          status: 'ACCEPTED',
          startAt: safeFutureDate(2),
          endAt: new Date(safeFutureDate(2).getTime() + 3_600_000),
        }),
        addressId: addr.id,
      },
    });
    const cancelled = await prisma.booking.create({
      data: {
        ...buildBooking({
          customerId: a.id,
          technicianId: techUserId,
          serviceId: svc.id,
          status: 'CANCELLED',
          startAt: safeFutureDate(3),
          endAt: new Date(safeFutureDate(3).getTime() + 3_600_000),
        }),
        addressId: addr.id,
      },
    });
    activeBookingId = active.id;
    cancelledBookingId = cancelled.id;
    createdBookingIds.push(active.id, cancelled.id);
  }, 20000);

  afterAll(async () => {
    try {
      await prisma.pushToken.deleteMany({ where: { userId: { in: createdUserIds } } });
    } catch {}
    try {
      await prisma.liveChatMessage.deleteMany({ where: { userId: { in: createdUserIds } } });
    } catch {}
    try {
      await prisma.chatMessage.deleteMany({ where: { senderId: { in: createdUserIds } } });
    } catch {}
    try {
      await prisma.notification.deleteMany({ where: { id: { in: createdNotificationIds } } });
    } catch {}
    try {
      await prisma.notificationPreference.deleteMany({ where: { userId: { in: createdUserIds } } });
    } catch {}
    try {
      await prisma.booking.deleteMany({ where: { id: { in: createdBookingIds } } });
    } catch {}
    try {
      await prisma.technician.deleteMany({ where: { id: { in: createdTechIds } } });
    } catch {}
    try {
      await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
    } catch {}
  });

  describe('chat', () => {
    it('messages enforces the booking-participant boundary', async () => {
      const cA = await caller(customerA);
      const cB = await caller(customerB);

      await expect(cB.chat.messages({ bookingId: activeBookingId })).rejects.toMatchObject({
        code: 'FORBIDDEN',
      });
      await expect(cA.chat.messages({ bookingId: 999999999 })).rejects.toMatchObject({
        code: 'NOT_FOUND',
      });
    });

    it('send persists the message for the receiver and emits new_message', async () => {
      const cB = await caller(customerB);
      const cA = await caller(customerA);

      const msg = await cB.chat.send({
        receiverId: customerA.id,
        bookingId: activeBookingId,
        content: 'مرحباً، هل الموعد مؤكد؟',
      });
      expect(msg.senderId).toBe(customerB.id);
      expect(msg.receiverId).toBe(customerA.id);
      expect(emitToUser).toHaveBeenCalledWith(customerA.id, 'new_message', expect.anything());

      const inbox = await cA.chat.messages({ bookingId: activeBookingId });
      expect(inbox.total).toBeGreaterThanOrEqual(1);
      expect(inbox.items[0].content).toBe('مرحباً، هل الموعد مؤكد؟');
    });

    it('conversations lists only live bookings with the correct otherParty', async () => {
      const cA = await caller(customerA);
      const convos = await cA.chat.conversations();
      const ids = convos.map((c: { bookingId: number }) => c.bookingId);
      expect(ids).toContain(activeBookingId);
      expect(ids).not.toContain(cancelledBookingId);
      const mine = convos.find((c: { bookingId: number }) => c.bookingId === activeBookingId);
      expect(mine.otherParty.id).toBe(techUserId);
    });
  });

  describe('liveChat', () => {
    it('send stores the user message and an agent auto-reply for a booking keyword', async () => {
      const cB = await caller(customerB);
      const res = await cB.liveChat.send({ message: 'أريد حجز خدمة' });
      expect(res.userMsg.isAgent).toBe(false);
      expect(res.userMsg.message).toBe('أريد حجز خدمة');
      expect(res.agentMsg.isAgent).toBe(true);
      expect(res.agentMsg.message).toContain('احجزي الآن');
    });

    it('falls back to the generic reply for unknown keywords', async () => {
      const cA = await caller(customerA);
      const res = await cA.liveChat.send({ message: 'مرحباً' });
      expect(res.agentMsg.message).toContain('شكراً');
    });

    it('history returns only the caller’s thread in ascending order', async () => {
      const cA = await caller(customerA);
      const cB = await caller(customerB);
      const aHistory = await cA.liveChat.history();
      const bHistory = await cB.liveChat.history();
      expect(aHistory.length).toBe(2); // own send + agent reply
      expect(bHistory.length).toBe(2);
      expect(aHistory.every((m: { userId: number }) => m.userId === customerA.id)).toBe(true);
      expect(aHistory[0].createdAt <= aHistory[1].createdAt).toBe(true);
    });
  });

  describe('notifications', () => {
    it('list paginates newest-first and isolates per user', async () => {
      const n1 = await makeNotification(customerA.id, { type: 'reminder' });
      const n2 = await makeNotification(customerA.id, { type: 'payment_success' });
      const n3 = await makeNotification(customerB.id, { type: 'booking_created' });

      const cA = await caller(customerA);
      const cB = await caller(customerB);
      const aList = await cA.notifications.list({ page: 1, limit: 10 });
      expect(aList.total).toBe(2);
      expect(aList.hasMore).toBe(false);
      expect(aList.totalPages).toBe(1);
      expect(aList.items[0].id).toBe(n2.id); // newest first

      const bList = await cB.notifications.list({ page: 1, limit: 10 });
      expect(bList.total).toBe(1);
      expect(bList.items[0].id).toBe(n3.id);
      expect(n1.id).toBeTruthy();
    });

    it('unreadCount, markRead (ownership), markAllRead and deleteAllRead', async () => {
      // The previous test left 2 unread rows for A — everything here is
      // asserted relative to that baseline so test order cannot break it.
      const cA = await caller(customerA);
      const cB = await caller(customerB);
      const base = (await cA.notifications.unreadCount()).count;

      await makeNotification(customerA.id, { type: 'a' });
      await makeNotification(customerA.id, { type: 'b' });
      const readOne = await makeNotification(customerA.id, { type: 'c', isRead: true });
      const foreign = await makeNotification(customerB.id, { type: 'd' });
      expect((await cA.notifications.unreadCount()).count).toBe(base + 2);

      // A cannot mark B's notification read.
      const refused = await cA.notifications.markRead({ id: foreign.id });
      expect(refused.success).toBe(false);
      const stillUnread = await prisma.notification.findUniqueOrThrow({
        where: { id: foreign.id },
      });
      expect(stillUnread.isRead).toBe(false);

      const mine = await cA.notifications.list({ page: 1, limit: 100 });
      const unreadId = mine.items.find((n: { isRead: boolean }) => !n.isRead)!.id;
      const ok = await cA.notifications.markRead({ id: unreadId });
      expect(ok.success).toBe(true);
      expect((await cA.notifications.unreadCount()).count).toBe(base + 1);

      await cA.notifications.markAllRead({});
      expect((await cA.notifications.unreadCount()).count).toBe(0);

      const del = await cA.notifications.deleteAllRead({});
      expect(del.count).toBe(base + 3); // base 2 + the 2 new unread + readOne
      expect(await prisma.notification.findUnique({ where: { id: readOne.id } })).toBeNull();
      // B's untouched.
      expect(await prisma.notification.findUnique({ where: { id: foreign.id } })).not.toBeNull();
      await expect(cB.notifications.markRead({ id: unreadId })).resolves.toMatchObject({
        success: false,
      });
    });
  });

  describe('notificationPrefs', () => {
    it('get returns privacy-first defaults and update upserts', async () => {
      const cA = await caller(customerA);
      const defaults = await cA.notificationPrefs.get();
      expect(defaults.bookingReminders).toBe(true);
      expect(defaults.emailDigest).toBe(false);
      expect(defaults.whatsappAlerts).toBe(false);

      const updated = await cA.notificationPrefs.update({
        emailDigest: true,
        whatsappAlerts: true,
      });
      expect(updated.emailDigest).toBe(true);

      const again = await cA.notificationPrefs.get();
      expect(again.emailDigest).toBe(true);
      expect(again.whatsappAlerts).toBe(true);
      expect(again.bookingReminders).toBe(true); // untouched field preserved
    });
  });
});
