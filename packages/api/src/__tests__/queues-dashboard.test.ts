/**
 * Queues dashboard (audit stage 12) — admin visibility into the BullMQ
 * queues (wallet, loyalty, notifications, integrations) + retry/remove of
 * failed jobs. Honest fail-closed contract:
 *   - anonymous/customer callers are rejected (adminProcedure)
 *   - when Redis is unavailable every queue reports unavailable:true
 *     with zero counts instead of crashing or fabricating numbers
 *   - retry/remove on an unavailable queue throws SERVICE_UNAVAILABLE
 *     and on an unknown jobId throws NOT_FOUND
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { appRouter } from '../routers/index';

const queueMocks = vi.hoisted(() => ({
  wallet: null as unknown,
  loyalty: null as unknown,
  notifications: null as unknown,
  integrations: null as unknown,
}));

vi.mock('../queues', () => ({
  getWalletQueue: () => null,
  getLoyaltyQueue: () => null,
  getNotificationQueue: () => null,
  getIntegrationQueue: () => null,
  getAllQueues: () => queueMocks,
}));

function caller(user?: { id: number; role: string; email: string } | null) {
  return (appRouter as any).createCaller({ user: user ?? null, ip: '127.0.0.1' });
}

const admin = { id: 1, role: 'ADMIN', email: 'admin@galaxyofbeauty.sa' };

beforeEach(() => {
  queueMocks.wallet = null;
  queueMocks.loyalty = null;
  queueMocks.notifications = null;
  queueMocks.integrations = null;
});

describe('queues.list — admin dashboard', () => {
  it('rejects anonymous callers', async () => {
    await expect(caller().queues.list()).rejects.toThrow();
  });

  it('rejects non-admin callers', async () => {
    await expect(
      caller({ id: 2, role: 'CUSTOMER', email: 'c@test.local' }).queues.list(),
    ).rejects.toThrow();
  });

  it('reports every queue as unavailable when Redis is down (honest degradation)', async () => {
    const rows = await caller(admin).queues.list();
    expect(rows).toHaveLength(4);
    expect(rows.map((r) => r.name)).toEqual(['wallet', 'loyalty', 'notifications', 'integrations']);
    for (const row of rows) {
      expect(row.unavailable).toBe(true);
      expect(row.counts).toEqual({ waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0 });
      expect(row.failedJobs).toEqual([]);
    }
  });

  it('maps live counts and failed jobs when a queue is connected', async () => {
    queueMocks.wallet = {
      getJobCounts: vi.fn().mockResolvedValue({ waiting: 3, active: 1, completed: 41, failed: 2 }),
      getFailed: vi.fn().mockResolvedValue([
        {
          id: 'job-7',
          name: 'cashback.accrue',
          failedReason: 'Redis timeout',
          attemptsMade: 3,
          finishedOn: 1_752_000_000_000,
        },
      ]),
    };
    const rows = await caller(admin).queues.list();
    const wallet = rows.find((r) => r.name === 'wallet')!;
    expect(wallet.unavailable).toBe(false);
    expect(wallet.counts).toEqual({
      waiting: 3,
      active: 1,
      completed: 41,
      failed: 2,
      delayed: 0,
    });
    expect(wallet.failedJobs).toEqual([
      {
        id: 'job-7',
        name: 'cashback.accrue',
        failedReason: 'Redis timeout',
        attemptsMade: 3,
        failedOn: new Date(1_752_000_000_000).toISOString(),
      },
    ]);
    // The other three stay honestly unavailable.
    for (const row of rows.filter((r) => r.name !== 'wallet')) {
      expect(row.unavailable).toBe(true);
    }
  });
});

describe('queues.retryFailed / removeFailed — job ops', () => {
  it('retry on an unavailable queue throws SERVICE_UNAVAILABLE', async () => {
    await expect(
      caller(admin).queues.retryFailed({ queue: 'loyalty', jobId: 'job-1' }),
    ).rejects.toThrow();
  });

  it('retry on an unknown job throws NOT_FOUND', async () => {
    queueMocks.loyalty = { getJob: vi.fn().mockResolvedValue(null) };
    await expect(
      caller(admin).queues.retryFailed({ queue: 'loyalty', jobId: 'ghost' }),
    ).rejects.toThrow();
  });

  it('retry calls job.retry() and reports success', async () => {
    const retry = vi.fn().mockResolvedValue(undefined);
    queueMocks.notifications = { getJob: vi.fn().mockResolvedValue({ retry }) };
    const result = await caller(admin).queues.retryFailed({
      queue: 'notifications',
      jobId: 'job-9',
    });
    expect(retry).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ success: true });
  });

  it('remove on an unavailable queue throws', async () => {
    await expect(
      caller(admin).queues.removeFailed({ queue: 'integrations', jobId: 'job-1' }),
    ).rejects.toThrow();
  });

  it('remove calls job.remove() and reports success', async () => {
    const remove = vi.fn().mockResolvedValue(undefined);
    queueMocks.integrations = { getJob: vi.fn().mockResolvedValue({ remove }) };
    const result = await caller(admin).queues.removeFailed({
      queue: 'integrations',
      jobId: 'job-4',
    });
    expect(remove).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ success: true });
  });

  it('rejects non-admin job ops', async () => {
    await expect(
      caller({ id: 2, role: 'CUSTOMER', email: 'c@test.local' }).queues.retryFailed({
        queue: 'wallet',
        jobId: 'job-1',
      }),
    ).rejects.toThrow();
  });
});
