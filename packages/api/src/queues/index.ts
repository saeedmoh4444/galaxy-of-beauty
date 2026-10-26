/**
 * Redis-backed job queues (BullMQ).
 *
 * Queues:
 *   wallet      — cashback accrual, bonus credits, referral rewards
 *   loyalty     — points earning, tier upgrades, streak updates, achievement checks
 *   notifications — email, SMS, push notification dispatch
 *   integrations — calendar sync (Google), ZATCA reporting, external webhooks
 *   csv-import   — vendor bulk product imports (C5)
 *   analytics    — D1 vendor daily-stat materialization (nightly)
 *   advisor      — D3 weekly advisor digest
 *
 * Usage:
 *   import { walletQueue } from '../queues';
 *   await walletQueue.add('cashback.accrue', { userId, bookingId, amount });
 */

import { Queue, type JobsOptions } from 'bullmq';
import { getRedisForBull } from '../lib/redis';

// Default job options
const defaultOpts: JobsOptions = {
  attempts: 3,
  backoff: { type: 'exponential', delay: 1000 },
  removeOnComplete: { age: 3600 * 24 }, // keep completed jobs for 24h
  removeOnFail: { age: 3600 * 24 * 7 }, // keep failed jobs for 7 days
};

function createQueue(name: string): Queue {
  const redis = getRedisForBull();
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
let _csvImportQueue: Queue | null = null;
let _analyticsQueue: Queue | null = null;
let _advisorQueue: Queue | null = null;

export function getWalletQueue(): Queue | null {
  if (_walletQueue) return _walletQueue;
  try {
    _walletQueue = createQueue('gob-wallet');
    return _walletQueue;
  } catch {
    return null;
  }
}

export function getLoyaltyQueue(): Queue | null {
  if (_loyaltyQueue) return _loyaltyQueue;
  try {
    _loyaltyQueue = createQueue('gob-loyalty');
    return _loyaltyQueue;
  } catch {
    return null;
  }
}

export function getNotificationQueue(): Queue | null {
  if (_notificationQueue) return _notificationQueue;
  try {
    _notificationQueue = createQueue('gob-notifications');
    return _notificationQueue;
  } catch {
    return null;
  }
}

export function getIntegrationQueue(): Queue | null {
  if (_integrationQueue) return _integrationQueue;
  try {
    _integrationQueue = createQueue('gob-integrations');
    return _integrationQueue;
  } catch {
    return null;
  }
}

export function getCsvImportQueue(): Queue | null {
  if (_csvImportQueue) return _csvImportQueue;
  try {
    _csvImportQueue = createQueue('gob-csv-import');
    return _csvImportQueue;
  } catch {
    return null;
  }
}

export function getAnalyticsQueue(): Queue | null {
  if (_analyticsQueue) return _analyticsQueue;
  try {
    _analyticsQueue = createQueue('gob-analytics');
    return _analyticsQueue;
  } catch {
    return null;
  }
}

export function getAdvisorQueue(): Queue | null {
  if (_advisorQueue) return _advisorQueue;
  try {
    _advisorQueue = createQueue('gob-advisor');
    return _advisorQueue;
  } catch {
    return null;
  }
}

// G3 — license-expiry reminder sweep queue.
let _remindersQueue: Queue | null = null;
export function getRemindersQueue(): Queue | null {
  if (_remindersQueue) return _remindersQueue;
  try {
    _remindersQueue = createQueue('gob-reminders');
    return _remindersQueue;
  } catch {
    return null;
  }
}

// A2 — payout automation sweep (settles WEEKLY/MONTHLY vendor windows).
let _payoutsQueue: Queue | null = null;
export function getPayoutsQueue(): Queue | null {
  if (_payoutsQueue) return _payoutsQueue;
  try {
    _payoutsQueue = createQueue('gob-payouts');
    return _payoutsQueue;
  } catch {
    return null;
  }
}

// A3 — fulfillment SLA sweep (flags orders past their vendor's window).
let _slaQueue: Queue | null = null;
export function getSlaQueue(): Queue | null {
  if (_slaQueue) return _slaQueue;
  try {
    _slaQueue = createQueue('gob-sla');
    return _slaQueue;
  } catch {
    return null;
  }
}

// A4 — dispute escalation sweep (48h vendor-response deadline).
let _disputesQueue: Queue | null = null;
export function getDisputesQueue(): Queue | null {
  if (_disputesQueue) return _disputesQueue;
  try {
    _disputesQueue = createQueue('gob-disputes');
    return _disputesQueue;
  } catch {
    return null;
  }
}

// Convenience: all queues
export function getAllQueues(): Record<string, Queue | null> {
  return {
    wallet: getWalletQueue(),
    loyalty: getLoyaltyQueue(),
    notifications: getNotificationQueue(),
    integrations: getIntegrationQueue(),
    csvImport: getCsvImportQueue(),
    analytics: getAnalyticsQueue(),
    advisor: getAdvisorQueue(),
    reminders: getRemindersQueue(),
    payouts: getPayoutsQueue(),
    sla: getSlaQueue(),
    disputes: getDisputesQueue(),
  };
}
