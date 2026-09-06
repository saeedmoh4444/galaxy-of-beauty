/**
 * notify.ts framework tests — B.26. Exercises renderTemplate and notifyUser
 * against the seeded notification_templates rows (booking_created etc.).
 * The queue path is exercised in workers-handlers tests; here the queue is
 * unavailable (no Redis in tests) so notifyUser must degrade to in-app only.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@galaxy/db';
import { notifyUser, renderTemplate } from '../lib/notify';

const createdUserIds: number[] = [];

describe('notify framework (B.26)', () => {
  beforeAll(async () => {
    const u = await prisma.user.create({
      data: {
        email: `notify-${Date.now()}@example.com`,
        phone: `+9665${String(Math.floor(Math.random() * 1e8)).padStart(8, '0')}`,
        name: 'مستخدم الإشعارات',
        role: 'CUSTOMER',
        passwordHash: '$2b$10$placeholderhashfortestingpurposesonly',
        isActive: true,
        emailVerified: true,
        twoFactorEnabled: false,
        preferredLanguage: 'ar',
      },
    });
    createdUserIds.push(u.id);
  });

  afterAll(async () => {
    try {
      await prisma.notification.deleteMany({ where: { userId: { in: createdUserIds } } });
    } catch {}
    try {
      await prisma.notificationPreference.deleteMany({
        where: { userId: { in: createdUserIds } },
      });
    } catch {}
    try {
      await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
    } catch {}
  });

  describe('renderTemplate', () => {
    it('interpolates placeholders and leaves unknown ones intact', () => {
      expect(
        renderTemplate('Hi {{name}}, your total is {{total}}', { name: 'Sara', total: 150 }),
      ).toBe('Hi Sara, your total is 150');
      expect(renderTemplate('Hi {{name}} {{missing}}', { name: 'Sara' })).toBe(
        'Hi Sara {{missing}}',
      );
      expect(renderTemplate('No placeholders', {})).toBe('No placeholders');
    });

    it('coerces numbers to strings', () => {
      expect(renderTemplate('{{n}} points', { n: 50 })).toBe('50 points');
    });
  });

  describe('notifyUser', () => {
    it('creates a rendered in-app notification from a seeded template', async () => {
      const userId = createdUserIds[0]!;
      await notifyUser({
        userId,
        templateKey: 'booking_created',
        vars: { customerName: 'سارة', serviceName: 'قص الشعر' },
      });

      const row = await prisma.notification.findFirst({
        where: { userId, type: 'booking_created' },
      });
      expect(row).not.toBeNull();
      expect((row!.titleJson as { ar: string }).ar).toBe('تم استلام طلب الحجز');
      expect((row!.bodyJson as { ar: string }).ar).toContain('سارة');
      expect((row!.bodyJson as { ar: string }).ar).toContain('قص الشعر');
      // Same vars render into both languages.
      expect((row!.bodyJson as { en: string }).en).toContain('سارة');
      // Template default channels: ['in_app','push'] → sentVia carries both.
      expect(row!.sentVia).toEqual(['in_app', 'push']);
    });

    it('stores the link when provided', async () => {
      const userId = createdUserIds[0]!;
      await notifyUser({
        userId,
        templateKey: 'booking_created',
        vars: { customerName: 'x', serviceName: 'y' },
        link: '/bookings/1',
      });
      const row = await prisma.notification.findFirst({
        where: { userId, type: 'booking_created', link: '/bookings/1' },
      });
      expect(row).not.toBeNull();
    });

    it('respects the category preference toggle (bookingReminders=false → no row)', async () => {
      const userId = createdUserIds[0]!;
      await prisma.notificationPreference.create({
        data: { userId, bookingReminders: false },
      });
      await notifyUser({
        userId,
        templateKey: 'booking_accepted',
        vars: {
          customerName: 'سارة',
          serviceName: 'مساج',
          techName: 'نورة',
          date: '2026-09-07',
          time: '10:00',
        },
      });
      const rows = await prisma.notification.findMany({
        where: { userId, type: 'booking_accepted' },
      });
      expect(rows.length).toBe(0);
      await prisma.notificationPreference.delete({ where: { userId } });
    });

    it('drops sms when smsAlerts=false but keeps in_app + push', async () => {
      const userId = createdUserIds[0]!;
      await prisma.notificationPreference.create({
        data: { userId, smsAlerts: false },
      });
      await notifyUser({
        userId,
        templateKey: 'booking_accepted',
        vars: {
          customerName: 'سارة',
          serviceName: 'مساج',
          techName: 'نورة',
          date: '2026-09-07',
          time: '10:00',
        },
      });
      const row = await prisma.notification.findFirst({
        where: { userId, type: 'booking_accepted' },
      });
      expect(row).not.toBeNull();
      expect(row!.sentVia).not.toContain('sms');
      expect(row!.sentVia).toContain('in_app');
      expect(row!.sentVia).toContain('push');
      await prisma.notificationPreference.delete({ where: { userId } });
    });

    it('is a silent no-op for an unknown or inactive template', async () => {
      const userId = createdUserIds[0]!;
      await expect(
        notifyUser({ userId, templateKey: 'does_not_exist', vars: {} }),
      ).resolves.toBeUndefined();
      const rows = await prisma.notification.findMany({
        where: { userId, type: 'does_not_exist' },
      });
      expect(rows.length).toBe(0);
    });
  });
});
