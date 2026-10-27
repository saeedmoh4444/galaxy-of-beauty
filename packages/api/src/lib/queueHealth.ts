/**
 * D2 — queue alerting + ops visibility (PROFESSIONALIZATION Wave D): the
 * brain_code P0 "nobody is paged when queues stall" fix. Per-queue depth/
 * failure health over the lazy queue registry, with a pure threshold
 * assessment and a periodic monitor that raises Sentry warnings.
 */
import type { Queue } from 'bullmq';
import {
  getWalletQueue,
  getLoyaltyQueue,
  getNotificationQueue,
  getIntegrationQueue,
  getCsvImportQueue,
  getAnalyticsQueue,
  getAdvisorQueue,
  getRemindersQueue,
  getPayoutsQueue,
  getSlaQueue,
  getDisputesQueue,
  getReviewsQueue,
} from '../queues';

export const QUEUE_REGISTRY: Array<{ name: string; get: () => Queue | null }> = [
  { name: 'gob-wallet', get: getWalletQueue },
  { name: 'gob-loyalty', get: getLoyaltyQueue },
  { name: 'gob-notifications', get: getNotificationQueue },
  { name: 'gob-integrations', get: getIntegrationQueue },
  { name: 'gob-csv-import', get: getCsvImportQueue },
  { name: 'gob-analytics', get: getAnalyticsQueue },
  { name: 'gob-advisor', get: getAdvisorQueue },
  { name: 'gob-reminders', get: getRemindersQueue },
  { name: 'gob-payouts', get: getPayoutsQueue },
  { name: 'gob-sla', get: getSlaQueue },
  { name: 'gob-disputes', get: getDisputesQueue },
  { name: 'gob-reviews', get: getReviewsQueue },
];

export interface QueueCounts {
  waiting: number;
  active: number;
  delayed: number;
  failed: number;
  completed: number;
}

export interface QueueHealthRow {
  name: string;
  /** null = queue unavailable (Redis down) — degraded, never fatal. */
  counts: QueueCounts | null;
  sampleFailed: Array<{ id: string; failedReason: string }>;
}

export interface QueueHealthThresholds {
  failedCritical: number;
  waitingWarn: number;
  waitingCritical: number;
  delayedWarn: number;
}

export const DEFAULT_THRESHOLDS: QueueHealthThresholds = {
  failedCritical: 20,
  waitingWarn: 100,
  waitingCritical: 500,
  delayedWarn: 200,
};

/** Depth + failure snapshot across the registry; every queue is isolated
 *  in its own try/catch so one bad connection never hides the rest. */
export async function getQueueHealth(): Promise<QueueHealthRow[]> {
  const rows: QueueHealthRow[] = [];
  for (const q of QUEUE_REGISTRY) {
    try {
      const queue = q.get();
      if (!queue) {
        rows.push({ name: q.name, counts: null, sampleFailed: [] });
        continue;
      }
      const raw = await queue.getJobCounts('waiting', 'active', 'delayed', 'failed', 'completed');
      const counts: QueueCounts = {
        waiting: raw.waiting ?? 0,
        active: raw.active ?? 0,
        delayed: raw.delayed ?? 0,
        failed: raw.failed ?? 0,
        completed: raw.completed ?? 0,
      };
      const failed = counts.failed > 0 ? await queue.getFailed(0, 3) : [];
      rows.push({
        name: q.name,
        counts,
        sampleFailed: failed.map((j) => ({ id: j.id ?? '', failedReason: j.failedReason ?? '' })),
      });
    } catch {
      rows.push({ name: q.name, counts: null, sampleFailed: [] });
    }
  }
  return rows;
}

export interface QueueHealthAssessment {
  status: 'ok' | 'warn' | 'critical';
  reasons: string[];
}

/** Pure threshold classification — critical beats warn; reasons carry the
 *  queue name + number for the alert text. Null-count rows are skipped
 *  (an unreachable queue is an infrastructure issue, not a stall). */
export function assessQueueHealth(
  rows: QueueHealthRow[],
  thresholds: QueueHealthThresholds = DEFAULT_THRESHOLDS,
): QueueHealthAssessment {
  const reasons: string[] = [];
  let critical = false;
  let warn = false;
  for (const row of rows) {
    if (!row.counts) continue;
    if (row.counts.failed >= thresholds.failedCritical) {
      critical = true;
      reasons.push(`${row.name}: ${row.counts.failed} failed jobs`);
    }
    if (row.counts.waiting >= thresholds.waitingCritical) {
      critical = true;
      reasons.push(`${row.name}: ${row.counts.waiting} waiting`);
    } else if (row.counts.waiting >= thresholds.waitingWarn) {
      warn = true;
      reasons.push(`${row.name}: ${row.counts.waiting} waiting`);
    }
    if (row.counts.delayed >= thresholds.delayedWarn) {
      warn = true;
      reasons.push(`${row.name}: ${row.counts.delayed} delayed`);
    }
  }
  return { status: critical ? 'critical' : warn ? 'warn' : 'ok', reasons };
}
