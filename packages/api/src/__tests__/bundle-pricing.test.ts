/**
 * ENHANCEMENT_PLAN 1.2 — Service Bundles (Slice 1): pure pricing matrix.
 *
 * Tests @galaxy/shared from the api suite (shared has no vitest of its own).
 * Progressive tiers: 3 services = 10%, 4 = 12%, 5+ = 15%.
 */
import { describe, expect, it } from 'vitest';
import { bundleDiscountFor, buildBundleQuote } from '@galaxy/shared';

describe('bundleDiscountFor', () => {
  it('applies progressive tiers', () => {
    expect(bundleDiscountFor(3)).toBe(10);
    expect(bundleDiscountFor(4)).toBe(12);
    expect(bundleDiscountFor(5)).toBe(15);
    expect(bundleDiscountFor(9)).toBe(15);
  });

  it('rejects bundles smaller than 3 services', () => {
    expect(() => bundleDiscountFor(0)).toThrow();
    expect(() => bundleDiscountFor(1)).toThrow();
    expect(() => bundleDiscountFor(2)).toThrow();
  });
});

describe('buildBundleQuote', () => {
  it('computes 3-service quote (10%)', () => {
    expect(buildBundleQuote([80, 60, 45])).toEqual({
      originalPrice: 185,
      discountPct: 10,
      totalPrice: 166.5,
      savings: 18.5,
    });
  });

  it('computes 4-service quote (12%)', () => {
    expect(buildBundleQuote([100, 100, 100, 100])).toEqual({
      originalPrice: 400,
      discountPct: 12,
      totalPrice: 352,
      savings: 48,
    });
  });

  it('computes 5-service quote (15%)', () => {
    expect(buildBundleQuote([100, 100, 100, 100, 100])).toEqual({
      originalPrice: 500,
      discountPct: 15,
      totalPrice: 425,
      savings: 75,
    });
  });

  it('rounds money to 2 decimals', () => {
    const quote = buildBundleQuote([33.33, 33.33, 33.33]);
    expect(quote.originalPrice).toBe(99.99);
    expect(quote.totalPrice).toBe(89.99);
    expect(quote.savings).toBe(10);
  });
});
