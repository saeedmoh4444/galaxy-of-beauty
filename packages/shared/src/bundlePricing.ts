// ── 1.2 Service Bundles — progressive custom-bundle pricing ──
// Pure math shared by the beautyBundles router (quote) and UI previews.
// Tiers: 3 services = 10%, 4 = 12%, 5+ = 15% (v1; tune later).

export interface BundleQuote {
  originalPrice: number;
  discountPct: number;
  totalPrice: number;
  savings: number;
}

const TIERS: Array<{ minServices: number; discountPct: number }> = [
  { minServices: 5, discountPct: 15 },
  { minServices: 4, discountPct: 12 },
  { minServices: 3, discountPct: 10 },
];

export function bundleDiscountFor(serviceCount: number): number {
  const tier = TIERS.find((t) => serviceCount >= t.minServices);
  if (!tier) {
    throw new Error(`Custom bundles require 3+ services (got ${serviceCount})`);
  }
  return tier.discountPct;
}

const round2 = (n: number): number => Math.round(n * 100) / 100;

export function buildBundleQuote(servicePrices: number[]): BundleQuote {
  const discountPct = bundleDiscountFor(servicePrices.length);
  const originalPrice = round2(servicePrices.reduce((sum, p) => sum + p, 0));
  const totalPrice = round2(originalPrice * (1 - discountPct / 100));
  return {
    originalPrice,
    discountPct,
    totalPrice,
    savings: round2(originalPrice - totalPrice),
  };
}
