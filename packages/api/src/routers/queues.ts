/**
 * Queues dashboard (audit stage 12) — admin visibility into the BullMQ
 * queues + retry/remove of failed jobs.
 *
 * Honest fail-closed contract: when Redis is unavailable each queue reports
 * unavailable:true with zero counts — never fabricated queue health. Job ops
 * on an unavailable queue throw SERVICE_UNAVAILABLE.
 */
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { adminProcedure, router } from '../trpc';
import { getAllQueues } from '../queues';

const QUEUE_NAMES = ['wallet', 'loyalty', 'notifications', 'integrations'] as const;

const EMPTY_COUNTS = { waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0 };

export const queuesRouter = router({
  /** Per-queue counts + the 10 most recent failed jobs. */
  list: adminProcedure.query(async () => {
    const queues = getAllQueues();
    return Promise.all(
      QUEUE_NAMES.map(async (name) => {
        const q = queues[name];
        if (!q) {
          return { name, unavailable: true, counts: { ...EMPTY_COUNTS }, failedJobs: [] };
        }
        const [counts, failed] = await Promise.all([
          q.getJobCounts('waiting', 'active', 'completed', 'failed', 'delayed'),
          q.getFailed(0, 9),
        ]);
        return {
          name,
          unavailable: false,
          counts: { ...EMPTY_COUNTS, ...counts },
          failedJobs: failed.map((job) => ({
            id: job.id,
            name: job.name,
            failedReason: job.failedReason,
            attemptsMade: job.attemptsMade,
            failedOn: job.finishedOn ? new Date(job.finishedOn).toISOString() : null,
          })),
        };
      }),
    );
  }),

  /** Re-queue one failed job (attempts counter resets per BullMQ retry()). */
  retryFailed: adminProcedure
    .input(z.object({ queue: z.enum(QUEUE_NAMES), jobId: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const q = getAllQueues()[input.queue];
      if (!q) {
        throw new TRPCError({
          code: 'SERVICE_UNAVAILABLE',
          message: 'Queue unavailable (Redis down)',
        });
      }
      const job = await q.getJob(input.jobId);
      if (!job) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Job not found' });
      }
      await job.retry();
      return { success: true };
    }),

  /** Permanently discard one failed job. */
  removeFailed: adminProcedure
    .input(z.object({ queue: z.enum(QUEUE_NAMES), jobId: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const q = getAllQueues()[input.queue];
      if (!q) {
        throw new TRPCError({
          code: 'SERVICE_UNAVAILABLE',
          message: 'Queue unavailable (Redis down)',
        });
      }
      const job = await q.getJob(input.jobId);
      if (!job) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Job not found' });
      }
      await job.remove();
      return { success: true };
    }),
});
