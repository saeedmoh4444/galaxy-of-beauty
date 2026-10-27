import { describe, it, expect } from 'vitest';
import { evaluateVendorRules } from '../lib/vendorPricing';

const fri = new Date('2026-11-06T10:00:00Z'); // Friday
const wed = new Date('2026-11-04T10:00:00Z'); // Wednesday

const baseCtx = {
  productId: 1,
  stock: 10,
  lowStockThreshold: 5,
  basePrice: 100,
};

describe('evaluateVendorRules', () => {
  it('returns the base price with no rules', () => {
    expect(evaluateVendorRules([], { ...baseCtx, date: fri })).toEqual({
      price: 100,
      appliedRuleIds: [],
    });
  });

  it('applies a weekend uplift on Friday but not Wednesday', () => {
    const rule = {
      id: 1,
      isActive: true,
      productId: null,
      ruleType: 'weekend_uplift' as const,
      dayOfWeek: 5,
      multiplier: 1.2,
      adminOverrideMultiplier: null,
    };
    expect(evaluateVendorRules([rule], { ...baseCtx, date: fri })).toEqual({
      price: 120,
      appliedRuleIds: [1],
    });
    expect(evaluateVendorRules([rule], { ...baseCtx, date: wed }).price).toBe(100);
  });

  it('applies the low-stock floor only at or below the threshold', () => {
    const rule = {
      id: 2,
      isActive: true,
      productId: null,
      ruleType: 'lowstock_floor' as const,
      dayOfWeek: null,
      multiplier: 1.15,
      adminOverrideMultiplier: null,
    };
    expect(evaluateVendorRules([rule], { ...baseCtx, stock: 5, date: wed }).price).toBe(115);
    expect(evaluateVendorRules([rule], { ...baseCtx, stock: 6, date: wed }).price).toBe(100);
  });

  it('stacks matching rules multiplicatively', () => {
    const rules = [
      {
        id: 1,
        isActive: true,
        productId: null,
        ruleType: 'weekend_uplift' as const,
        dayOfWeek: 5,
        multiplier: 1.2,
        adminOverrideMultiplier: null,
      },
      {
        id: 2,
        isActive: true,
        productId: null,
        ruleType: 'lowstock_floor' as const,
        dayOfWeek: null,
        multiplier: 1.1,
        adminOverrideMultiplier: null,
      },
    ];
    // 100 × 1.2 × 1.1 = 132
    expect(evaluateVendorRules(rules, { ...baseCtx, stock: 5, date: fri })).toEqual({
      price: 132,
      appliedRuleIds: [1, 2],
    });
  });

  it('lets the admin override win over the vendor multiplier (precedence)', () => {
    const rule = {
      id: 3,
      isActive: true,
      productId: null,
      ruleType: 'weekend_uplift' as const,
      dayOfWeek: 5,
      multiplier: 1.2,
      adminOverrideMultiplier: 1.05,
    };
    expect(evaluateVendorRules([rule], { ...baseCtx, date: fri }).price).toBe(105);
  });

  it('ignores inactive rules and product-scopes correctly', () => {
    const rules = [
      {
        id: 4,
        isActive: false,
        productId: null,
        ruleType: 'weekend_uplift' as const,
        dayOfWeek: 5,
        multiplier: 2,
        adminOverrideMultiplier: null,
      },
      {
        id: 5,
        isActive: true,
        productId: 999, // another product
        ruleType: 'weekend_uplift' as const,
        dayOfWeek: 5,
        multiplier: 2,
        adminOverrideMultiplier: null,
      },
      {
        id: 6,
        isActive: true,
        productId: 1,
        ruleType: 'weekend_uplift' as const,
        dayOfWeek: 5,
        multiplier: 1.1,
        adminOverrideMultiplier: null,
      },
    ];
    expect(evaluateVendorRules(rules, { ...baseCtx, date: fri }).price).toBe(110);
  });
});
