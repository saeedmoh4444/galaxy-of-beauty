/**
 * E4 — mobile earnings glance (Wave E): pure helper for the payout
 * schedule card. Node-testable — no react-native imports.
 */

export type PayoutSchedule = 'MANUAL' | 'WEEKLY' | 'MONTHLY';

/**
 * Estimated next settlement run. The gob-payouts job sweeps daily at
 * 09:00 UTC and settles vendors whose window since lastPayoutRunAt has
 * elapsed — WEEKLY = +7d, MONTHLY = +30d. MANUAL stays admin-driven, so
 * there is no estimate (null).
 */
export function scheduleNextRun(
  schedule: PayoutSchedule | string | null | undefined,
  lastRunAt: string | Date | null | undefined,
): Date | null {
  if (schedule !== 'WEEKLY' && schedule !== 'MONTHLY') return null;
  const base = lastRunAt ? new Date(lastRunAt) : new Date();
  const days = schedule === 'WEEKLY' ? 7 : 30;
  return new Date(base.getTime() + days * 24 * 60 * 60 * 1000);
}
