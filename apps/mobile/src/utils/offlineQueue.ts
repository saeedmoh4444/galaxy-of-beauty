/**
 * Offline Action Queue — Queue booking actions when offline, sync when online.
 *
 * Persists via AsyncStorage (utils/storage) and replays through the
 * vanilla tRPC client (trpcClient — usable outside React, unlike the
 * hooks client which needs a QueryClient context).
 *
 * Wiring (OfflineSyncProvider):
 *   - NetInfo listener feeds setOnlineStatus() — coming back online auto-syncs
 *   - syncQueue() is also called once at app start to drain leftovers
 *   - onSyncComplete(n) notifies with the number of synced actions
 *
 * Usage:
 *   await enqueueAction('create_booking', { serviceId, ... });
 */

import { AsyncStorage } from '@/utils/storage';
import { trpcClient } from '@/lib/trpc-react';

const QUEUE_KEY = 'gob_offline_queue';

interface QueuedAction {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  createdAt: string;
  retries: number;
}

let isOnline = true;
let syncInProgress = false;
let listeners: Array<(syncedCount: number) => void> = [];

export function setOnlineStatus(online: boolean): void {
  const wasOffline = !isOnline;
  isOnline = online;
  if (wasOffline && online) {
    void syncQueue(); // Auto-sync when coming back online
  }
}

export function getOnlineStatus(): boolean {
  return isOnline;
}

export function onSyncComplete(cb: (syncedCount: number) => void): () => void {
  listeners.push(cb);
  return () => {
    listeners = listeners.filter((l) => l !== cb);
  };
}

export async function enqueueAction(type: string, payload: Record<string, unknown>): Promise<void> {
  const queue = await getQueue();
  queue.push({
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    type,
    payload,
    createdAt: new Date().toISOString(),
    retries: 0,
  });
  await saveQueue(queue);

  if (isOnline) {
    void syncQueue();
  }
}

export async function getQueue(): Promise<QueuedAction[]> {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    return raw ? (JSON.parse(raw) as QueuedAction[]) : [];
  } catch {
    return [];
  }
}

async function saveQueue(queue: QueuedAction[]): Promise<void> {
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

/** Replay queued actions in order. Returns how many were synced. */
export async function syncQueue(): Promise<number> {
  if (syncInProgress || !isOnline) return 0;
  syncInProgress = true;

  try {
    const queue = await getQueue();
    if (queue.length === 0) {
      return 0;
    }

    const remaining: QueuedAction[] = [];
    let synced = 0;

    for (const action of queue) {
      try {
        await replayAction(action);
        synced += 1;
      } catch (err: unknown) {
        // Failed — keep in queue if under max retries
        if (action.retries < 3) {
          remaining.push({ ...action, retries: action.retries + 1 });
        } else {
          console.warn(
            `[OfflineQueue] Action ${action.id} failed after 3 retries: ${(err as Error).message}`,
          );
        }
      }
    }

    await saveQueue(remaining);

    if (synced > 0) {
      for (const cb of listeners) cb(synced);
    }
    return synced;
  } finally {
    syncInProgress = false;
  }
}

async function replayAction(action: QueuedAction): Promise<void> {
  switch (action.type) {
    case 'create_booking':
      await trpcClient.bookings.create.mutate(
        action.payload as Parameters<typeof trpcClient.bookings.create.mutate>[0],
      );
      break;
    case 'cancel_booking':
      // The router has no standalone cancel — it goes through transition.
      await trpcClient.bookings.transition.mutate({
        id: action.payload.bookingId as number,
        action: 'cancel',
      });
      break;
    default:
      console.warn(`[OfflineQueue] Unknown action type: ${action.type}`);
  }
}

export async function clearQueue(): Promise<void> {
  await AsyncStorage.removeItem(QUEUE_KEY);
}

export function getQueueLength(): Promise<number> {
  return getQueue().then((q) => q.length);
}

/**
 * True when an error means the request never reached the server (so a
 * queued retry is safe and cannot double-charge) — not a server or
 * validation rejection.
 */
export function isNetworkError(err: unknown): boolean {
  const msg = (err as Error | null)?.message ?? '';
  return /network request failed|fetch failed|failed to fetch|network error/i.test(msg);
}
