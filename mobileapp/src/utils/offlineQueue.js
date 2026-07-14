/**
 * Offline Action Queue
 *
 * Queues API mutations (bookings, payments, profile updates) when the
 * device is offline and replays them when connectivity is restored.
 *
 * Architecture:
 *   1. API calls are intercepted. If the network is unavailable,
 *      the action is stored in AsyncStorage with a unique ID.
 *   2. When the network comes back, queued actions are replayed
 *      in FIFO order with exponential backoff on failure.
 *   3. Idempotency keys ensure no double-processing.
 *
 * Usage:
 *   import { enqueueOffline, processQueue } from '../utils/offlineQueue';
 *   await enqueueOffline({ method: 'POST', url: '/bookings', data: {...} });
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import api from '../lib/api';

const QUEUE_KEY = '@gob_offline_queue';
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

/**
 * Enqueue an action to be replayed when online.
 *
 * @param {{ method: string, url: string, data?: object, idempotencyKey?: string }} action
 */
export async function enqueueOffline(action) {
  const queue = await getQueue();
  const entry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    action,
    createdAt: new Date().toISOString(),
    retries: 0,
  };

  queue.push(entry);
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));

  // Try to process immediately (might have brief connectivity)
  setTimeout(() => processQueue(), 1000);

  return entry.id;
}

/**
 * Process all queued offline actions.
 * Replays in FIFO order. Failed actions are retried up to MAX_RETRIES.
 *
 * @returns {Promise<{ processed: number, failed: number }>}
 */
export async function processQueue() {
  const netState = await NetInfo.fetch();
  if (!netState.isConnected) {
    return { processed: 0, failed: 0, skipped: true };
  }

  const queue = await getQueue();
  if (queue.length === 0) {
    return { processed: 0, failed: 0 };
  }

  let processed = 0;
  let failed = 0;
  const remaining = [];

  for (const entry of queue) {
    try {
      await api({
        method: entry.action.method,
        url: entry.action.url,
        data: entry.action.data,
        headers: entry.action.idempotencyKey
          ? { 'X-Idempotency-Key': entry.action.idempotencyKey }
          : {},
      });
      processed++;
    } catch (error) {
      entry.retries++;

      if (entry.retries < MAX_RETRIES) {
        // Exponential backoff: 2s, 4s, 8s
        const delay = RETRY_DELAY_MS * Math.pow(2, entry.retries - 1);
        entry.nextRetryAt = new Date(Date.now() + delay).toISOString();
        remaining.push(entry);

        // Schedule retry
        setTimeout(() => processQueue(), delay);
      } else {
        // Max retries exceeded — keep in queue for manual review
        entry.failed = true;
        entry.failedAt = new Date().toISOString();
        remaining.push(entry);
        failed++;
      }
    }
  }

  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(remaining));

  return { processed, failed, remaining: remaining.length };
}

/**
 * Get the current offline queue.
 */
async function getQueue() {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Clear the entire offline queue.
 */
export async function clearQueue() {
  await AsyncStorage.removeItem(QUEUE_KEY);
}

/**
 * Get queue statistics.
 */
export async function getQueueStats() {
  const queue = await getQueue();
  return {
    total: queue.length,
    pending: queue.filter((e) => !e.failed).length,
    failed: queue.filter((e) => e.failed).length,
    oldestCreatedAt: queue[0]?.createdAt || null,
  };
}

/**
 * Initialize offline queue listener.
 * Call once at app startup to register network change handler.
 */
export function initializeOfflineSupport() {
  // Listen for network changes and process queue on reconnect
  const unsubscribe = NetInfo.addEventListener((state) => {
    if (state.isConnected) {
      processQueue().catch(() => {
        /* silently retry on next connect */
      });
    }
  });

  // Process any pending items on startup
  processQueue().catch(() => {
    /* retry later */
  });

  return unsubscribe;
}

export default {
  enqueueOffline,
  processQueue,
  clearQueue,
  getQueueStats,
  initializeOfflineSupport,
};
