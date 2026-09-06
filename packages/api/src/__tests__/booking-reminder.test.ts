/**
 * B.26 worker-side tests — handleBookingReminderJob + dispatchNotificationJob
 * against the seeded notification_templates. No Redis needed: handlers are
 * pure business logic; the reminder path calls notifyUser which degrades to
 * in-app only when the queue is unavailable.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { Job } from 'bullmq';
import { prisma } from '@galaxy/db';
import { handleBookingReminderJob, dispatchNotificationJob } from '../workers/handlers';
import { buildUser, buildBooking } from './factories';

function job<T>(data: T, name = 'booking.reminder'): Job<T> {
  return { data, name } as Job<T>;
}

const createdUserIds: number[] = [];
const createdTechIds: number[] = [];
const createdBookingIds: number[] = [];
let serviceId: number;
let categoryId: number;
let addressId: number;
let techUserId: number;

async function makeBooking(status: string): Promise<number> {
  const booking = await prisma.booking.create({
    data: {
      ...buildBooking({
        customerId: createdUserIds[0]!,
        technicianId: techUserId,
        serviceId,
        status,
        startAt: new Date(Date.now() + 2 * 86_400_000),
        endAt: new Date(Date.now() + 2 * 86_400_000 + 3_600_000),
      }),
      addressId,
    },
  });
  createdBookingIds.push(booking.id);
  return booking.id;
}

describe('booking reminders (B.26)', () => {
  beforeAll(async () => {
    const customer = await prisma.user.create({ data: buildUser() });
    const tech = await prisma.user.create({ data: buildUser({ role: 'TECHNICIAN' }) });
    createdUserIds.push(customer.id, tech.id);
    techUserId = tech.id;

    const profile = await prisma.technician.create({
      data: { userId: tech.id, city: 'الرياض' },
    });
    createdTechIds.push(profile.id);

    const cat = await prisma.category.create({
      data: {
        nameJson: { ar: 'تصنيف التذكير', en: 'Reminder Category' },
        slug: `reminder-test-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
        iconUrl: '',
      },
    });
    categoryId = cat.id;
    const svc = await prisma.service.create({
      data: {
        categoryId: cat.id,
        titleJson: { ar: 'قص شعر', en: 'Haircut' },
        descriptionJson: { ar: 'وصف', en: 'Description' },
        basePrice: 150,
        durationMin: 60,
        isActive: true,
      },
    });
    serviceId = svc.id;

    const addr = await prisma.address.create({
      data: {
        userId: customer.id,
        label: 'المنزل',
        city: 'الرياض',
        area: 'النخيل',
        street: 'طريق الملك',
      },
    });
    addressId = addr.id;
  }, 20000);

  afterAll(async () => {
    try {
      await prisma.notification.deleteMany({ where: { userId: { in: createdUserIds } } });
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

  it('renders a reminder notification for an upcoming booking', async () => {
    const bookingId = await makeBooking('ACCEPTED');
    const userId = createdUserIds[0]!;

    await handleBookingReminderJob(job({ bookingId, date: 'الأحد ٧ سبتمبر', time: '١٠:٠٠ ص' }));

    const row = await prisma.notification.findFirst({
      where: { userId, type: 'booking_reminder' },
    });
    expect(row).not.toBeNull();
    expect((row!.titleJson as { ar: string }).ar).toBe('تذكير بموعدك');
    expect((row!.bodyJson as { ar: string }).ar).toContain('قص شعر');
    expect((row!.bodyJson as { ar: string }).ar).toContain('الأحد ٧ سبتمبر');
    expect(row!.sentVia).toEqual(['in_app', 'push']);
  });

  it('skips reminders for cancelled or completed bookings', async () => {
    const userId = createdUserIds[0]!;
    const cancelledId = await makeBooking('CANCELLED');
    const completedId = await makeBooking('COMPLETED');

    await handleBookingReminderJob(job({ bookingId: cancelledId, date: 'x', time: 'y' }));
    await handleBookingReminderJob(job({ bookingId: completedId, date: 'x', time: 'y' }));

    const cancelledRows = await prisma.notification.findMany({
      where: { userId, type: 'booking_reminder', bodyJson: { path: ['ar'], string_contains: 'x' } },
    });
    expect(cancelledRows.length).toBe(0);
  });

  it('is a silent no-op for a missing booking', async () => {
    await expect(
      handleBookingReminderJob(job({ bookingId: 99999999, date: 'x', time: 'y' })),
    ).resolves.toBeUndefined();
  });

  it('dispatchNotificationJob routes legacy names to handleNotificationJob', async () => {
    const userId = createdUserIds[0]!;
    await dispatchNotificationJob(
      job(
        {
          userId,
          type: 'legacy_test',
          titleAr: 'عنوان',
          titleEn: 'Title',
          bodyAr: 'نص',
          bodyEn: 'Body',
          channels: ['in_app'],
        },
        'booking.requested',
      ),
    );
    const row = await prisma.notification.findFirst({
      where: { userId, type: 'legacy_test' },
    });
    expect(row).not.toBeNull();
    expect(row!.sentVia).toEqual(['in_app']);
  });

  it('dispatchNotificationJob routes booking.reminder to the reminder handler', async () => {
    const bookingId = await makeBooking('PAID');
    const userId = createdUserIds[0]!;

    await dispatchNotificationJob(job({ bookingId, date: 'd', time: 't' }));

    const row = await prisma.notification.findFirst({
      where: { userId, type: 'booking_reminder' },
    });
    expect(row).not.toBeNull();
  });
});
