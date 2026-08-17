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

  // Always create in-app notification
  await prisma.notification.create({
    data: {
      userId,
      type,
      titleJson: { ar: titleAr, en: titleEn },
      bodyJson: { ar: bodyAr, en: bodyEn },
      sentVia: channels.length > 0 ? channels : ['in_app'],
    },
  });

  // For email/SMS/push — these would call external services
  // Currently logged for observability; real implementation depends on providers
  if (channels.includes('email')) {
    // TODO: Send via nodemailer/SendGrid
    console.log(`[Notification] Email queued for user ${userId}: ${titleEn}`);
  }
  if (channels.includes('sms')) {
    // TODO: Send via Twilio/Unifonic
    console.log(`[Notification] SMS queued for user ${userId}: ${titleAr}`);
  }
  if (channels.includes('push')) {
    // TODO: Send via Firebase Cloud Messaging / Expo Push
    console.log(`[Notification] Push queued for user ${userId}: ${titleEn}`);
  }
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
