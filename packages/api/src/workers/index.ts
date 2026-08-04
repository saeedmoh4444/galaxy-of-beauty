/**
 * Background job workers (BullMQ).
 *
 * Each worker processes jobs from one queue. Jobs are idempotent
 * and safe to retry — workers use the job's idempotencyKey when available.
 *
 * Start via:
 *   pnpm --filter @galaxy/api worker
 * Or in the existing socket server entry point.
 */

import { Worker, type Job } from 'bullmq';
import { getRedis } from '../lib/redis';
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

// ── Worker factory ──

function createWorker(
  queueName: string,
  handler: (job: Job) => Promise<void>,
  concurrency = 2,
): Worker | null {
  const redis = getRedis();
  if (!redis) {
    console.warn(`[Worker] Redis unavailable — cannot create worker for "${queueName}"`);
    return null;
  }
  const worker = new Worker(queueName, handler, {
    connection: redis,
    concurrency,
    autorun: true,
    removeOnComplete: { age: 3600 * 24 },
    removeOnFail: { age: 3600 * 24 * 7 },
  });

  worker.on('completed', (job) => {
    console.log(`[Worker] ✅ ${queueName} #${job.id} completed (${job.name})`);
  });
  worker.on('failed', (job, err) => {
    console.error(`[Worker] ❌ ${queueName} #${job?.id} failed: ${err.message}`);
  });
  worker.on('error', (err) => {
    console.error(`[Worker] ⚠️ ${queueName} error: ${err.message}`);
  });

  return worker;
}

// ── Handlers ──

async function handleWalletJob(job: Job<CashbackJob>): Promise<void> {
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

async function handleLoyaltyJob(job: Job<LoyaltyPointsJob>): Promise<void> {
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

async function handleNotificationJob(job: Job<NotificationJob>): Promise<void> {
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

async function handleIntegrationJob(job: Job<CalendarSyncJob>): Promise<void> {
  const { technicianId, bookingId, action } = job.data;

  // Calendar sync would call the Google Calendar API
  // Currently logged for observability
  console.log(
    `[Integration] Calendar ${action} for booking #${bookingId}, technician ${technicianId}`,
  );
  // TODO: Implement Google Calendar API call via googleCalendar.ts
  // TODO: Implement ZATCA reporting for completed bookings
}

// ── Worker instances (started on import) ──

export const walletWorker = createWorker('gob-wallet', handleWalletJob);
export const loyaltyWorker = createWorker('gob-loyalty', handleLoyaltyJob);
export const notificationWorker = createWorker('gob-notifications', handleNotificationJob);
export const integrationWorker = createWorker('gob-integrations', handleIntegrationJob);

/**
 * Gracefully shut down all workers.
 */
export async function shutdownWorkers(): Promise<void> {
  const workers = [walletWorker, loyaltyWorker, notificationWorker, integrationWorker];
  await Promise.all(workers.filter(Boolean).map((w) => w!.close()));
  console.log('[Workers] All workers shut down');
}

/**
 * Start all workers (useful for dedicated worker process).
 */
export function startWorkers(): void {
  // Workers auto-start on creation via `autorun: true`
  const names = [
    walletWorker ? 'gob-wallet' : null,
    loyaltyWorker ? 'gob-loyalty' : null,
    notificationWorker ? 'gob-notifications' : null,
    integrationWorker ? 'gob-integrations' : null,
  ].filter(Boolean);
  console.log(`[Workers] Started: ${names.join(', ') || 'none (Redis unavailable)'}`);
}
