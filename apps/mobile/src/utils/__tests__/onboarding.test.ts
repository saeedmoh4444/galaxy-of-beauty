/**
 * First-run onboarding funnel (audit stage 12) — the public/onboarding
 * walkthrough was orphaned (no route led to it). The flag gate makes it a
 * once-per-install funnel: unseen → show, then mark so it never returns.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

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

import { hasSeenOnboarding, markSeenOnboarding, ONBOARDING_FLAG_KEY } from '../onboarding';
import { AsyncStorage } from '@/utils/storage';

beforeEach(() => {
  memoryStore.clear();
  vi.clearAllMocks();
});

describe('onboarding flag', () => {
  it('is unseen on a fresh install', async () => {
    await expect(hasSeenOnboarding()).resolves.toBe(false);
  });

  it('persists the seen flag under the versioned key', async () => {
    await markSeenOnboarding();
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(ONBOARDING_FLAG_KEY, '1');
    await expect(hasSeenOnboarding()).resolves.toBe(true);
  });

  it('is idempotent — marking twice stays seen', async () => {
    await markSeenOnboarding();
    await markSeenOnboarding();
    await expect(hasSeenOnboarding()).resolves.toBe(true);
  });

  it('treats garbage values as unseen (fail-open to showing the funnel)', async () => {
    memoryStore.set(ONBOARDING_FLAG_KEY, 'not-a-one');
    await expect(hasSeenOnboarding()).resolves.toBe(false);
  });
});
