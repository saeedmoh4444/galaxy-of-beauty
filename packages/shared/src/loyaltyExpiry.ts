// ── 8.2 Loyalty 2.0 — points expiry + boost math (pure) ──
// Earned points expire 12 months after earn; boost events multiply
// positive earns (rounded to whole points).

export const LOYALTY_EXPIRY_MONTHS = 12;

export function pointsExpiryDate(earnedAt: Date = new Date()): Date {
  const d = new Date(earnedAt);
  d.setMonth(d.getMonth() + LOYALTY_EXPIRY_MONTHS);
  return d;
}

export function boostedPoints(base: number, multiplier: number): number {
  return Math.round(base * multiplier);
}
