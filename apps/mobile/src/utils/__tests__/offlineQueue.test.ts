import { describe, it, expect, vi, beforeEach } from 'vitest';

// In-memory store backing the mocked AsyncStorage — hoisted so the
// vi.mock factories below can reference it.
const memoryStore = vi.hoisted(() => new Map<string, string>());

vi.mock('@/utils/storage', () => ({
  AsyncStorage: {
    getItem: vi.fn(async (k: string) => memoryStore.get(k) ?? null),
    setItem: vi.fn(async (k: string, v: string) => {
      memoryStore.set(k, v);
    }),
    removeItem: vi.fn(async (k: string) => {
      memoryStore.delete(k);
    }),
  },
}));

vi.mock('@/lib/trpc-react', () => ({
  trpcClient: {
    bookings: {
      create: { mutate: vi.fn() },
      transition: { mutate: vi.fn() },
    },
  },
}));

import {
  enqueueAction,
  syncQueue,
  setOnlineStatus,
  clearQueue,
  getQueue,
  onSyncComplete,
  isNetworkError,
} from '../offlineQueue';
import { trpcClient } from '@/lib/trpc-react';
import { AsyncStorage } from '@/utils/storage';

const createMutate = vi.mocked(trpcClient.bookings.create.mutate);
const transitionMutate = vi.mocked(trpcClient.bookings.transition.mutate);

describe('isNetworkError', () => {
  it('recognizes fetch/network failures', () => {
    expect(isNetworkError(new Error('Network request failed'))).toBe(true);
    expect(isNetworkError(new Error('fetch failed'))).toBe(true);
    expect(isNetworkError(new Error('Failed to fetch'))).toBe(true);
    expect(isNetworkError(new Error('network error'))).toBe(true);
  });

  it('rejects server and validation errors', () => {
    expect(isNetworkError(new Error('UNAUTHORIZED'))).toBe(false);
    expect(isNetworkError(new Error('Input validation failed'))).toBe(false);
    expect(isNetworkError(null)).toBe(false);
  });
});

describe('offlineQueue', () => {
  beforeEach(() => {
    memoryStore.clear();
    vi.resetAllMocks(); // clears implementations too — mockRejectedValue must not leak across tests
    setOnlineStatus(true);
  });

  it('persists actions while offline and does not replay them', async () => {
    setOnlineStatus(false);
    await enqueueAction('create_booking', { serviceId: 1 });

    expect(await getQueue()).toHaveLength(1);
    expect(AsyncStorage.setItem).toHaveBeenCalled();
    expect(createMutate).not.toHaveBeenCalled();
  });

  it('auto-syncs queued actions when the device comes back online', async () => {
    setOnlineStatus(false);
    await enqueueAction('create_booking', { serviceId: 1 });

    setOnlineStatus(true);
    await vi.waitFor(async () => {
      expect(await getQueue()).toHaveLength(0);
    });

    expect(createMutate).toHaveBeenCalledTimes(1);
    expect(createMutate).toHaveBeenCalledWith({ serviceId: 1 });
  });

  it('replays multiple actions in enqueue order', async () => {
    setOnlineStatus(false);
    await enqueueAction('create_booking', { serviceId: 1 });
    await enqueueAction('create_booking', { serviceId: 2 });
    await enqueueAction('cancel_booking', { bookingId: 9 });

    setOnlineStatus(true);
    await vi.waitFor(async () => {
      expect(await getQueue()).toHaveLength(0);
    });

    expect(createMutate).toHaveBeenCalledTimes(2);
    expect(createMutate.mock.calls[0]).toEqual([{ serviceId: 1 }]);
    expect(createMutate.mock.calls[1]).toEqual([{ serviceId: 2 }]);
    expect(transitionMutate).toHaveBeenCalledWith({ id: 9, action: 'cancel' });
  });

  it('drops an action after 3 failed replay attempts', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    createMutate.mockRejectedValue(new Error('still offline'));

    setOnlineStatus(false);
    await enqueueAction('create_booking', { serviceId: 1 });

    setOnlineStatus(true); // attempt 1 (auto-sync)
    await vi.waitFor(() => expect(createMutate).toHaveBeenCalledTimes(1));
    await syncQueue(); // attempt 2
    await syncQueue(); // attempt 3
    await syncQueue(); // attempt 4 — retries exhausted, dropped

    expect(createMutate).toHaveBeenCalledTimes(4);
    expect(await getQueue()).toHaveLength(0);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('failed after 3 retries'));
    warn.mockRestore();
  });

  it('notifies listeners with the number of synced actions', async () => {
    setOnlineStatus(false);
    await enqueueAction('create_booking', { serviceId: 1 });

    const listener = vi.fn();
    const off = onSyncComplete(listener);

    setOnlineStatus(true);
    await vi.waitFor(() => expect(listener).toHaveBeenCalledWith(1));
    off();
  });

  it('clearQueue empties the persisted queue', async () => {
    setOnlineStatus(false);
    await enqueueAction('create_booking', { serviceId: 1 });
    await enqueueAction('cancel_booking', { bookingId: 2 });

    await clearQueue();

    expect(await getQueue()).toHaveLength(0);
  });
});
