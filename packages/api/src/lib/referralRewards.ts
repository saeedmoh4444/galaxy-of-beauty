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
