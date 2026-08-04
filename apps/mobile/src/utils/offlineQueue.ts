/**
 * Offline Action Queue — Queue booking actions when offline, sync when online.
 *
 * Uses AsyncStorage for persistence and NetInfo for connectivity detection.
 * When the device goes online, queued actions are replayed in order.
 *
 * Usage:
 *   import { enqueueAction, syncQueue } from '@/utils/offlineQueue';
 *   await enqueueAction({ type: 'create_booking', payload: {...} });
 */

// AsyncStorage from expo — try require to avoid type issues
const AsyncStorage = (() => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require('@react-native-async-storage/async-storage').default;
  } catch {
    // Fallback in-memory store if package not installed
    const store = new Map<string, string>();
    return {
      getItem: async (k: string) => store.get(k) ?? null,
      setItem: async (k: string, v: string) => { store.set(k, v); },
      removeItem: async (k: string) => { store.delete(k); },
    };
  }
})() as { getItem(k: string): Promise<string | null>; setItem(k: string, v: string): Promise<void>; removeItem(k: string): Promise<void> };

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
let listeners: Array<() => void> = [];

export function setOnlineStatus(online: boolean): void {
  const wasOffline = !isOnline;
  isOnline = online;
  if (wasOffline && online) {
    syncQueue(); // Auto-sync when coming back online
  }
}

export function getOnlineStatus(): boolean {
  return isOnline;
}

export function onSyncComplete(cb: () => void): () => void {
  listeners.push(cb);
  return () => { listeners = listeners.filter((l) => l !== cb); };
}

export async function enqueueAction(
  type: string,
  payload: Record<string, unknown>,
): Promise<void> {
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
    syncQueue();
  }
}

export async function getQueue(): Promise<QueuedAction[]> {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function saveQueue(queue: QueuedAction[]): Promise<void> {
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export async function syncQueue(): Promise<void> {
  if (syncInProgress || !isOnline) return;
  syncInProgress = true;

  try {
    const queue = await getQueue();
    if (queue.length === 0) {
      syncInProgress = false;
      return;
    }

    const remaining: QueuedAction[] = [];

    for (const action of queue) {
      try {
        // Attempt to replay the action
        await replayAction(action);
        // Success — don't add to remaining
      } catch (err: any) {
        // Failed — keep in queue if under max retries
        if (action.retries < 3) {
          remaining.push({ ...action, retries: action.retries + 1 });
        } else {
          console.warn(`[OfflineQueue] Action ${action.id} failed after 3 retries: ${err.message}`);
        }
      }
    }

    await saveQueue(remaining);

    // Notify listeners
    for (const cb of listeners) cb();
  } finally {
    syncInProgress = false;
  }
}

async function replayAction(action: QueuedAction): Promise<void> {
  // Dynamic import to avoid circular dependency
  const { trpc } = await import('@/lib/trpc-react');

  switch (action.type) {
    case 'create_booking':
      await (trpc as any).bookings.create.mutate(action.payload);
      break;
    case 'cancel_booking':
      await (trpc as any).bookings.cancel.mutate(action.payload);
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
