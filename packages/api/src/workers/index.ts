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
import {
  handleWalletJob,
  handleLoyaltyJob,
  handleNotificationJob,
  handleIntegrationJob,
} from './handlers';

// Job types are re-exported from handlers.ts (routers import them from '../workers')
export type {
  CashbackJob,
  LoyaltyPointsJob,
  NotificationJob,
  CalendarSyncJob,
} from './handlers';

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
