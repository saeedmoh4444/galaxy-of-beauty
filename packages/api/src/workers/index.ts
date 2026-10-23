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
} from './handlers';

// Job types are re-exported from handlers.ts (routers import them from '../workers')
export type {
  CashbackJob,
  LoyaltyPointsJob,
  NotificationJob,
  CalendarSyncJob,
  BookingReminderJob,
  CsvImportJob,
  CsvImportReport,
} from './handlers';

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
  ].filter(Boolean);
  console.log(`[Workers] Started: ${names.join(', ') || 'none (Redis unavailable)'}`);
}
