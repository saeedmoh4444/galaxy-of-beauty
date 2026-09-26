/**
 * 8.1 Referral Program 2.0 — tiered reward schedule.
 *
 * Referrer rewards escalate with lifetime completed referrals:
 *   1st–4th: 50 SAR, 5th–9th: 200 SAR, 10th+: 500 SAR.
 * The referred customer gets a flat bonus (REFERRED_REWARD).
 */

export const REFERRED_REWARD = 20;

/** Referrer reward for their Nth (1-based) completed referral. */
export function tieredReferrerReward(completedCount: number): number {
  if (completedCount >= 10) return 500;
  if (completedCount >= 5) return 200;
  return 50;
}

/** Monthly prize schedule by rank (1st–3rd). */
export const MONTHLY_PRIZE_AMOUNTS = [500, 300, 200];

/** UTC "YYYY-MM" key for a date. */
export function monthKey(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

/** Inclusive UTC [start, end) window for a "YYYY-MM" month key. */
export function monthRange(month: string): { start: Date; end: Date } {
  const [y, m] = month.split('-').map((p) => Number(p));
  const start = new Date(Date.UTC(y ?? 1970, (m ?? 1) - 1, 1));
  const end = new Date(Date.UTC(y ?? 1970, m ?? 1, 1));
  return { start, end };
}

/** Previous month's key relative to a date (UTC). */
export function previousMonthKey(d: Date = new Date()): string {
  return monthKey(new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() - 1, 1)));
}
