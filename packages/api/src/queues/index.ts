/**
 * Redis-backed job queues (BullMQ).
 *
 * Queues:
 *   wallet      — cashback accrual, bonus credits, referral rewards
 *   loyalty     — points earning, tier upgrades, streak updates, achievement checks
 *   notifications — email, SMS, push notification dispatch
 *   integrations — calendar sync (Google), ZATCA reporting, external webhooks
 *
 * Usage:
 *   import { walletQueue } from '../queues';
 *   await walletQueue.add('cashback.accrue', { userId, bookingId, amount });
 */

import { Queue, type JobsOptions } from 'bullmq';
import { getRedis } from '../lib/redis';

// Default job options
const defaultOpts: JobsOptions = {
  attempts: 3,
  backoff: { type: 'exponential', delay: 1000 },
  removeOnComplete: { age: 3600 * 24 },  // keep completed jobs for 24h
  removeOnFail: { age: 3600 * 24 * 7 },   // keep failed jobs for 7 days
};

function createQueue(name: string): Queue {
  const redis = getRedis();
  if (!redis) {
    throw new Error(`Redis unavailable — cannot create queue "${name}"`);
  }
  return new Queue(name, {
    connection: redis,
    defaultJobOptions: defaultOpts,
  });
}

// Lazy-initialized queues (created on first access)
let _walletQueue: Queue | null = null;
let _loyaltyQueue: Queue | null = null;
let _notificationQueue: Queue | null = null;
let _integrationQueue: Queue | null = null;

export function getWalletQueue(): Queue | null {
  if (_walletQueue) return _walletQueue;
  try { _walletQueue = createQueue('gob-wallet'); return _walletQueue; } catch { return null; }
}

export function getLoyaltyQueue(): Queue | null {
  if (_loyaltyQueue) return _loyaltyQueue;
  try { _loyaltyQueue = createQueue('gob-loyalty'); return _loyaltyQueue; } catch { return null; }
}

export function getNotificationQueue(): Queue | null {
  if (_notificationQueue) return _notificationQueue;
  try { _notificationQueue = createQueue('gob-notifications'); return _notificationQueue; } catch { return null; }
}

export function getIntegrationQueue(): Queue | null {
  if (_integrationQueue) return _integrationQueue;
  try { _integrationQueue = createQueue('gob-integrations'); return _integrationQueue; } catch { return null; }
}

// Convenience: all queues
export function getAllQueues(): Record<string, Queue | null> {
  return {
    wallet: getWalletQueue(),
    loyalty: getLoyaltyQueue(),
    notifications: getNotificationQueue(),
    integrations: getIntegrationQueue(),
  };
}
