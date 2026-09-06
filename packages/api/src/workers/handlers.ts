/**
 * Worker job handlers — pure business logic, no BullMQ/Redis side effects.
 *
 * Extracted from index.ts (which creates BullMQ worker instances on
 * import) so tests can exercise the handlers directly without spawning
 * workers that poll Redis.
 */
import type { Job } from 'bullmq';
import { prisma } from '@galaxy/db';

// ── Job type definitions ──

export interface CashbackJob {
  userId: number;
  bookingId: number;
  amount: number;
  idempotencyKey?: string;
}

export interface LoyaltyPointsJob {
  userId: number;
  bookingId: number;
  points: number;
  reason: string;
  idempotencyKey?: string;
}

export interface NotificationJob {
  userId: number;
  type: string;
  titleAr: string;
  titleEn: string;
  bodyAr: string;
  bodyEn: string;
  channels: string[]; // ['email', 'sms', 'push', 'in_app']
  idempotencyKey?: string;
  /** B.26: notifyUser() already created the in-app row — skip it here. */
  skipInApp?: boolean;
}

export interface CalendarSyncJob {
  technicianId: number;
  bookingId: number;
  action: 'create' | 'update' | 'delete';
  googleCalendarToken?: string;
  startAt?: string;
  endAt?: string;
  summary?: string;
  idempotencyKey?: string;
}

/** B.26 — delayed booking reminder (24h/48h before startAt). */
export interface BookingReminderJob {
  bookingId: number;
  date: string; // pre-formatted for the recipient locale
  time: string;
}

// ── Handlers ──

export async function handleWalletJob(job: Job<CashbackJob>): Promise<void> {
  const { userId, bookingId, amount } = job.data;

  const wallet = await prisma.wallet.findUnique({ where: { userId } });
  if (!wallet) throw new Error(`Wallet not found for user ${userId}`);

  await prisma.$transaction([
    prisma.wallet.update({
      where: { userId },
      data: { bonusBalance: { increment: amount } },
    }),
    prisma.walletTransaction.create({
      data: {
        walletId: wallet.id,
        type: 'CREDIT',
        source: 'CASHBACK',
        amount,
        description: `كاش باك من الحجز #${bookingId}`,
        referenceId: `booking_${bookingId}`,
        idempotencyKey: job.data.idempotencyKey ?? `cashback_${bookingId}`,
      },
    }),
  ]);
}

export async function handleLoyaltyJob(job: Job<LoyaltyPointsJob>): Promise<void> {
  const { userId, bookingId, points, reason } = job.data;

  let account = await prisma.loyaltyAccount.findUnique({ where: { userId } });
  if (!account) {
    account = await prisma.loyaltyAccount.create({
      data: { userId, points: 0, lifetimePoints: 0, tier: 'SILVER' },
    });
  }

  const newPoints = account.points + points;
  const newLifetime = account.lifetimePoints + points;

  // Determine tier
  let tier = 'SILVER';
  if (newLifetime >= 2000) tier = 'PLATINUM';
  else if (newLifetime >= 500) tier = 'GOLD';

  await prisma.$transaction([
    prisma.loyaltyAccount.update({
      where: { userId },
      data: { points: newPoints, lifetimePoints: newLifetime, tier },
    }),
    prisma.loyaltyTransaction.create({
      data: {
        accountId: account.id,
        points,
        reason,
        referenceId: `booking_${bookingId}`,
      },
    }),
  ]);
}

export async function handleNotificationJob(job: Job<NotificationJob>): Promise<void> {
  const { userId, type, titleAr, titleEn, bodyAr, bodyEn, channels } = job.data;

  // Legacy callers rely on this job to create the in-app row. B.26
  // notifyUser() creates the row itself and sets skipInApp on the job so
  // this handler only dispatches the external channels.
  if (!job.data.skipInApp) {
    await prisma.notification.create({
      data: {
        userId,
        type,
        titleJson: { ar: titleAr, en: titleEn },
        bodyJson: { ar: bodyAr, en: bodyEn },
        sentVia: channels.length > 0 ? channels : ['in_app'],
      },
    });
  }

  // External channels — real dispatch (B.26). All senders are failure-
  // tolerant: unconfigured providers log and return, never throw.
  if (channels.includes('email') || channels.includes('sms') || channels.includes('push')) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, phone: true, preferredLanguage: true },
    });
    if (!user) return;

    if (channels.includes('email') && user.email) {
      const { sendEmail } = await import('../lib/email');
      await sendEmail({
        to: user.email,
        subject: titleEn,
        html: `<h2>${titleEn}</h2><p>${bodyEn}</p>`,
      });
    }
    if (channels.includes('sms') && user.phone) {
      const { sendSms } = await import('../lib/sms');
      // Arabic-first for SMS (KSA audience); fall back to English title.
      await sendSms(user.phone, bodyAr || titleAr);
    }
    if (channels.includes('push')) {
      const { sendPushToUser } = await import('../lib/push');
      await sendPushToUser(userId, {
        title: user.preferredLanguage === 'en' ? titleEn : titleAr,
        body: user.preferredLanguage === 'en' ? bodyEn : bodyAr,
      });
    }
  }
}

/**
 * B.26 — render and deliver a booking reminder through the template
 * framework. Silent no-op if the booking was cancelled or completed since
 * the job was scheduled.
 */
export async function handleBookingReminderJob(job: Job<BookingReminderJob>): Promise<void> {
  const { bookingId, date, time } = job.data;

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      service: { select: { titleJson: true } },
      customer: { select: { id: true, name: true, preferredLanguage: true } },
    },
  });
  if (!booking || !['REQUESTED', 'ACCEPTED', 'PAID', 'IN_PROGRESS'].includes(booking.status)) {
    return;
  }

  const { notifyUser } = await import('../lib/notify');
  const title = booking.service.titleJson as { ar: string; en: string };
  await notifyUser({
    userId: booking.customerId,
    templateKey: 'booking_reminder',
    vars: {
      customerName: booking.customer.name,
      serviceName:
        booking.customer.preferredLanguage === 'en' ? (title.en ?? '') : (title.ar ?? ''),
      date,
      time,
    },
    link: `/bookings/${booking.id}`,
  });
}

/**
 * Job-name dispatcher for the gob-notifications queue. 'notification.send'
 * (and legacy names) → handleNotificationJob; 'booking.reminder' →
 * handleBookingReminderJob.
 */
export async function dispatchNotificationJob(job: Job): Promise<void> {
  if (job.name === 'booking.reminder') {
    return handleBookingReminderJob(job as Job<BookingReminderJob>);
  }
  return handleNotificationJob(job as Job<NotificationJob>);
}

export async function handleIntegrationJob(job: Job<CalendarSyncJob>): Promise<void> {
  const { technicianId, bookingId, action } = job.data;

  // Calendar sync would call the Google Calendar API
  // Currently logged for observability
  console.log(
    `[Integration] Calendar ${action} for booking #${bookingId}, technician ${technicianId}`,
  );
  // TODO: Implement Google Calendar API call via googleCalendar.ts
  // TODO: Implement ZATCA reporting for completed bookings
}
