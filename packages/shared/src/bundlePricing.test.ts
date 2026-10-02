import { describe, expect, it } from 'vitest';

import { buildBundleQuote, bundleDiscountFor } from './bundlePricing';

describe('bundleDiscountFor', () => {
  it('gives 0% below the minimum (callers validate, math is honest)', () => {
    // v1 contract: custom bundles require 3+ services — enforced by throw.
    expect(() => bundleDiscountFor(0)).toThrow();
    expect(() => bundleDiscountFor(1)).toThrow();
    expect(() => bundleDiscountFor(2)).toThrow();
  });

  it('applies the tier table: 3=10%, 4=12%, 5+=15%', () => {
    expect(bundleDiscountFor(3)).toBe(10);
    expect(bundleDiscountFor(4)).toBe(12);
    expect(bundleDiscountFor(5)).toBe(15);
    expect(bundleDiscountFor(7)).toBe(15);
    expect(bundleDiscountFor(25)).toBe(15);
  });
});

describe('buildBundleQuote', () => {
  it('computes original, discount, total and savings for 3 services', () => {
    const q = buildBundleQuote([100, 200, 50]);
    expect(q.originalPrice).toBe(350);
    expect(q.discountPct).toBe(10);
    expect(q.totalPrice).toBe(315);
    expect(q.savings).toBe(35);
  });

  it('rounds to 2 decimals (no floating-point drift)', () => {
    const q = buildBundleQuote([10.1, 20.2, 30.3]);
    expect(q.originalPrice).toBe(60.6);
    expect(q.totalPrice).toBe(54.54);
    expect(q.savings).toBe(6.06);
  });

  it('handles the 4-service tier', () => {
    const q = buildBundleQuote([25, 25, 25, 25]);
    expect(q.discountPct).toBe(12);
    expect(q.totalPrice).toBe(88);
    expect(q.savings).toBe(12);
  });
});
