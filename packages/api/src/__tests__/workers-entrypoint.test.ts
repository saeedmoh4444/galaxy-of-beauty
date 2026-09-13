/**
 * Workers entrypoint tests — the BullMQ wiring in workers/index.ts.
 *
 * Redis is mocked to return null so the module's import-time worker
 * creation takes the degraded path (no real queue pollers spawned).
 * (Coverage ratchet target: src/workers/index.ts)
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../lib/redis', () => ({
  getRedis: () => null,
}));

// Import AFTER the mock — the module creates workers at import time.
import {
  walletWorker,
  loyaltyWorker,
  notificationWorker,
  integrationWorker,
  startWorkers,
  shutdownWorkers,
} from '../workers/index';

let logSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
});

describe('workers entrypoint (Redis unavailable)', () => {
  it('creates no workers when Redis is unavailable', () => {
    expect(walletWorker).toBeNull();
    expect(loyaltyWorker).toBeNull();
    expect(notificationWorker).toBeNull();
    expect(integrationWorker).toBeNull();
  });

  it('startWorkers reports the degraded state', () => {
    startWorkers();
    const output = logSpy.mock.calls.map((c) => c.join(' ')).join(' ');
    expect(output).toContain('none (Redis unavailable)');
  });

  it('shutdownWorkers resolves without workers', async () => {
    await expect(shutdownWorkers()).resolves.toBeUndefined();
  });
});
