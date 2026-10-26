/**
 * B2 — vendor tier computation (VENDOR_PROFESSIONALIZATION_PLAN Wave B).
 * Pure, DB-free: the same inputs the A5 health score already gathers,
 * plus review volume and the E4 reply rate. Thresholds are deliberate
 * and tunable in one place — they power the storefront badges and (via
 * the A5 metrics) future quality-based commission tiers.
 */

export interface VendorTierInput {
  /** Denormalized vendor rating (0–5, null = no reviews). */
  ratingAvg: number | null;
  /** Denormalized review count. */
  totalReviews: number;
  /** A3 — avg hours order→fulfillment over 30d (null = no data). */
  fulfillmentSpeedHours: number | null;
  /** Fulfilled orders in the last 30 days. */
  fulfilled30d: number;
  /** A4 — escalated / all disputes over 30d (null = none). */
  disputeEscalationRate: number | null;
  /** E4 — replied reviews / all reviews (null = no reviews). */
  reviewReplyRate: number | null;
}

export type VendorTierBadge = 'top_rated' | 'fast_fulfillment' | 'responsive_seller';

/**
 * Full tier set — used by the storefront detail (one vendor at a time,
 * the extra factor queries are cheap there).
 */
export function computeVendorTierBadges(i: VendorTierInput): VendorTierBadge[] {
  const badges: VendorTierBadge[] = [];

  // Top Rated: sustained quality — ≥4.5 over ≥20 reviews.
  if (i.ratingAvg !== null && i.ratingAvg >= 4.5 && i.totalReviews >= 20) {
    badges.push('top_rated');
  }

  // Fast Fulfillment: ≤12h average with real volume (≥10 orders/30d).
  if (i.fulfillmentSpeedHours !== null && i.fulfillmentSpeedHours <= 12 && i.fulfilled30d >= 10) {
    badges.push('fast_fulfillment');
  }

  // Responsive Seller: ≥60% of reviews replied, ≥10 reviews.
  if (i.reviewReplyRate !== null && i.reviewReplyRate >= 0.6 && i.totalReviews >= 10) {
    badges.push('responsive_seller');
  }

  return badges;
}

/**
 * The cheap top-rated check — rating + volume only, for the stores LIST
 * where per-row factor gathering would cost N× queries.
 */
export function computeTopRated(ratingAvg: number | null, totalReviews: number): boolean {
  return ratingAvg !== null && ratingAvg >= 4.5 && totalReviews >= 20;
}
