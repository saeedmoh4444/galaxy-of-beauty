/**
 * B2 — Vendor tiers & trust badges (VENDOR_PROFESSIONALIZATION_PLAN
 * Wave B). Computed tiers from the A5 health signals + review volume:
 * top_rated (rating ≥4.5 over ≥20 reviews), fast_fulfillment (≤12h avg
 * over ≥10 fulfilled orders/30d), responsive_seller (≥60% review reply
 * rate over ≥10 reviews). Badges surface on the storefront, the stores
 * list (top-rated only — cheap signals), and the mobile detail.
 */
import { describe, it, expect } from 'vitest';
import { computeVendorTierBadges, computeTopRated, type VendorTierInput } from '../lib/vendorTiers';

const base: VendorTierInput = {
  ratingAvg: 4.8,
  totalReviews: 25,
  fulfillmentSpeedHours: 10,
  fulfilled30d: 15,
  disputeEscalationRate: 0,
  reviewReplyRate: 0.8,
};

describe('B2 — tier computation (pure)', () => {
  it('a store clearing every threshold earns all three badges', () => {
    expect(computeVendorTierBadges(base)).toEqual([
      'top_rated',
      'fast_fulfillment',
      'responsive_seller',
    ]);
  });

  it('rating volume gates top_rated (quality alone is not enough)', () => {
    expect(computeVendorTierBadges({ ...base, totalReviews: 10 })).not.toContain('top_rated');
    expect(computeVendorTierBadges({ ...base, ratingAvg: 4.4 })).not.toContain('top_rated');
    expect(computeVendorTierBadges({ ...base, ratingAvg: null })).not.toContain('top_rated');
  });

  it('fulfillment speed AND volume gate fast_fulfillment', () => {
    expect(computeVendorTierBadges({ ...base, fulfillmentSpeedHours: 20 })).not.toContain(
      'fast_fulfillment',
    );
    expect(computeVendorTierBadges({ ...base, fulfilled30d: 5 })).not.toContain('fast_fulfillment');
    expect(computeVendorTierBadges({ ...base, fulfillmentSpeedHours: null })).not.toContain(
      'fast_fulfillment',
    );
  });

  it('reply rate and review volume gate responsive_seller', () => {
    expect(computeVendorTierBadges({ ...base, reviewReplyRate: 0.5 })).not.toContain(
      'responsive_seller',
    );
    expect(computeVendorTierBadges({ ...base, totalReviews: 5 })).not.toContain(
      'responsive_seller',
    );
    expect(computeVendorTierBadges({ ...base, reviewReplyRate: null })).not.toContain(
      'responsive_seller',
    );
  });

  it('no data → no badges (a fresh store earns nothing)', () => {
    expect(
      computeVendorTierBadges({
        ratingAvg: null,
        totalReviews: 0,
        fulfillmentSpeedHours: null,
        fulfilled30d: 0,
        disputeEscalationRate: null,
        reviewReplyRate: null,
      }),
    ).toEqual([]);
  });

  it('the cheap top-rated check matches the full computation', () => {
    expect(computeTopRated(4.8, 30)).toBe(true);
    expect(computeTopRated(4.8, 5)).toBe(false);
    expect(computeTopRated(null, 30)).toBe(false);
    expect(computeTopRated(4.2, 30)).toBe(false);
  });
});
