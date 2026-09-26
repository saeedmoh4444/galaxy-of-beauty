// ── 7.3 Observability 2.0 — SLO burn-rate math (pure) ──
// Burn rate = error rate ÷ error budget (1 − availability target).
// > 1 spends the budget faster than it accrues; SRE critical ≈ 14.

export const SLO_TARGET_AVAILABILITY = 0.999;
export const SLO_TARGET_P95_MS = 500;

export function burnRate(
  requests: number,
  errors: number,
  targetAvailability: number = SLO_TARGET_AVAILABILITY,
): number {
  if (requests <= 0) return 0;
  const errorRate = errors / requests;
  return Math.round((errorRate / (1 - targetAvailability)) * 100) / 100;
}
