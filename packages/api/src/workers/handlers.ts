/**
 * Worker job handlers — pure business logic, no BullMQ/Redis side effects.
 *
 * Extracted from index.ts (which creates BullMQ worker instances on
 * import) so tests can exercise the handlers directly without spawning
 * workers that poll Redis.
 */
import type { Job } from 'bullmq';
import { prisma } from '@galaxy/db';
import {
  createGoogleCalendarEvent,
  updateGoogleCalendarEvent,
  deleteGoogleCalendarEvent,
  refreshGoogleToken,
} from '../lib/googleCalendar';

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
  /** Both sides are optional so one job can target one or both calendars. */
  technicianId?: number;
  customerId?: number;
  bookingId: number;
  /** 'delete' is a legacy alias of 'cancel' (kept for old queued jobs). */
  action: 'create' | 'update' | 'cancel' | 'delete';
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

/**
 * Booking auto-sync (E9 follow-up) — push booking lifecycle events to the
 * connected Google Calendars of BOTH sides (customer first, then
 * technician). Fully graceful: any missing integration or Google failure
 * is logged and swallowed so a calendar outage can never break the
 * booking flow (the BullMQ retry would only duplicate events anyway —
 * event ids are persisted exactly once on success).
 */
export async function handleIntegrationJob(job: Job<CalendarSyncJob>): Promise<void> {
  const { technicianId, customerId, bookingId, action, startAt, endAt, summary } = job.data;

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { service: { select: { titleJson: true } } },
  });
  if (!booking) {
    console.log(`[Integration] Calendar ${action} skipped — booking #${bookingId} not found`);
    return;
  }

  const serviceTitle =
    ((booking.service?.titleJson as Record<string, string> | null)?.ar ?? '') || 'حجز';
  const event = {
    summary: summary ?? `💅 ${serviceTitle} — ${booking.bookingCode}`,
    description: 'حجز من منصة دلال — Dalal booking',
    start: startAt ?? booking.startAt.toISOString(),
    end: endAt ?? booking.endAt.toISOString(),
  };

  const sides: Array<{
    userId?: number;
    eventIdColumn: 'googleEventId' | 'technicianGoogleEventId';
  }> = [
    { userId: customerId, eventIdColumn: 'googleEventId' },
    { userId: technicianId, eventIdColumn: 'technicianGoogleEventId' },
  ];

  for (const side of sides) {
    if (!side.userId) continue;
    try {
      await syncSideToCalendar(side.userId, side.eventIdColumn, bookingId, action, event);
    } catch (err) {
      console.log(`[Integration] Calendar ${action} failed for user #${side.userId}:`, err);
    }
  }
}

async function syncSideToCalendar(
  userId: number,
  eventIdColumn: 'googleEventId' | 'technicianGoogleEventId',
  bookingId: number,
  action: CalendarSyncJob['action'],
  event: { summary: string; description: string; start: string; end: string },
): Promise<void> {
  const integration = await prisma.beautyIntegration.findUnique({
    where: { userId_provider: { userId, provider: 'google_calendar' } },
  });
  if (!integration || integration.status !== 'CONNECTED' || !integration.accessToken) {
    return; // not connected — nothing to do
  }

  // Refresh the token when it is (almost) expired; a failed refresh or a
  // missing refresh token means this side is skipped this cycle.
  let accessToken = integration.accessToken;
  if (integration.tokenExpiry && integration.tokenExpiry.getTime() < Date.now() + 60_000) {
    if (!integration.refreshToken) return;
    const refreshed = await refreshGoogleToken(integration.refreshToken);
    if (!refreshed) {
      console.log(`[Integration] Calendar token refresh failed for user #${userId}`);
      return;
    }
    accessToken = refreshed.accessToken;
    await prisma.beautyIntegration.update({
      where: { id: integration.id },
      data: { accessToken, tokenExpiry: new Date(refreshed.expiryDate) },
    });
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: { [eventIdColumn]: true } as never,
  });
  const eventId = (booking as Record<string, string | null> | null)?.[eventIdColumn];

  if (action === 'cancel' || action === 'delete') {
    if (eventId) {
      await deleteGoogleCalendarEvent(accessToken, eventId);
      await prisma.booking.update({
        where: { id: bookingId },
        data: { [eventIdColumn]: null } as never,
      });
    }
    return;
  }

  if (eventId && action === 'update') {
    const ok = await updateGoogleCalendarEvent(accessToken, eventId, event);
    if (!ok) {
      console.log(`[Integration] Calendar update failed for user #${userId}, event ${eventId}`);
    }
    return;
  }

  const createdId = await createGoogleCalendarEvent(accessToken, event);
  if (createdId) {
    await prisma.booking.update({
      where: { id: bookingId },
      data: { [eventIdColumn]: createdId } as never,
    });
  } else {
    console.log(`[Integration] Calendar create failed for user #${userId}, booking #${bookingId}`);
  }
}
