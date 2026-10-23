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
import { getRedisForBull } from '../lib/redis';
import {
  handleWalletJob,
  handleLoyaltyJob,
  dispatchNotificationJob,
  handleIntegrationJob,
  handleCsvImportJob,
  handleDailyStatsJob,
} from './handlers';

// Job types + pure helpers are re-exported from handlers.ts (routers
// import them from '../workers')
export type {
  CashbackJob,
  LoyaltyPointsJob,
  NotificationJob,
  CalendarSyncJob,
  BookingReminderJob,
  CsvImportJob,
  CsvImportReport,
  DailyStatsJob,
} from './handlers';
export { noonUtcDay } from './handlers';

// ── Worker factory ──

function createWorker(
  queueName: string,
  // Handlers may return a value (stored as job.returnvalue — e.g. the C5
  // CSV import report polled by vendorPortal.importStatus).
  handler: (job: Job) => Promise<unknown>,
  concurrency = 2,
): Worker | null {
  const redis = getRedisForBull();
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
    console.log(`[Worker]  ${queueName} #${job.id} completed (${job.name})`);
  });
  worker.on('failed', (job, err) => {
    console.error(`[Worker]  ${queueName} #${job?.id} failed: ${err.message}`);
  });
  worker.on('error', (err) => {
    console.error(`[Worker]  ${queueName} error: ${err.message}`);
  });

  return worker;
}

// ── Worker instances (started on import) ──

export const walletWorker = createWorker('gob-wallet', handleWalletJob);
export const loyaltyWorker = createWorker('gob-loyalty', handleLoyaltyJob);
export const notificationWorker = createWorker('gob-notifications', dispatchNotificationJob);
export const integrationWorker = createWorker('gob-integrations', handleIntegrationJob);
export const csvImportWorker = createWorker('gob-csv-import', handleCsvImportJob, 1);
export const analyticsWorker = createWorker('gob-analytics', handleDailyStatsJob, 1);

/**
 * D1 — register the nightly materialization: fires at 00:30 KSA (21:30Z
 * previous day) which sits safely inside the just-closed NOON-UTC bucket.
 * Backfills run ad hoc via the admin/worker surface with { date }.
 */
export async function registerAnalyticsScheduler(): Promise<void> {
  const { getAnalyticsQueue } = await import('../queues');
  const queue = getAnalyticsQueue();
  if (!queue) {
    console.warn('[Workers] Redis unavailable — analytics scheduler not registered');
    return;
  }
  await queue.upsertJobScheduler(
    'daily-stats-nightly',
    { pattern: '30 21 * * *' },
    { name: 'daily.stats', data: {} },
  );
  console.log('[Workers] Analytics scheduler registered (30 21 * * * UTC)');
}

/**
 * Gracefully shut down all workers.
 */
export async function shutdownWorkers(): Promise<void> {
  const workers = [
    walletWorker,
    loyaltyWorker,
    notificationWorker,
    integrationWorker,
    csvImportWorker,
  ];
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
    csvImportWorker ? 'gob-csv-import' : null,
    analyticsWorker ? 'gob-analytics' : null,
  ].filter(Boolean);
  console.log(`[Workers] Started: ${names.join(', ') || 'none (Redis unavailable)'}`);
  void registerAnalyticsScheduler();
}
