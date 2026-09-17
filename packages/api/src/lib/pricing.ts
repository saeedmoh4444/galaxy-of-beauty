/**
 * Dynamic service pricing (ENHANCEMENT_PLAN 1.1).
 *
 * Effective price = base × tier × peak-rules × surge:
 * - Tier multipliers: NEW 1.0 → EXPERIENCED 1.2 → PREMIUM 1.5 → CELEBRITY 2.0
 * - Peak rules: ServicePricing rows matching service/category/tier/day/hour
 *   (all matching multipliers stack multiplicatively)
 * - Surge: +15% when the technician's slot fill around the booking
 *   reaches 80% (ratio ≥ 0.8)
 *
 * Opt-in per service: bookings.create only applies the engine when
 * Service.dynamicPricingEnabled is true — static pricing stays the
 * default for every existing service.
 */

export const TIER_MULTIPLIERS: Record<string, number> = {
  NEW: 1.0,
  EXPERIENCED: 1.2,
  PREMIUM: 1.5,
  CELEBRITY: 2.0,
};

export const SURGE_THRESHOLD = 0.8;
export const SURGE_MULTIPLIER = 1.15;

/** A ServicePricing row, in the shape bookings.create fetches it. */
export interface PricingRuleLike {
  isActive: boolean;
  serviceId: number | null;
  categoryId: number | null;
  technicianTier: string | null;
  dayOfWeek: number | null;
  hourStart: number | null;
  hourEnd: number | null;
  priceMultiplier: number;
}

export interface RuleContext {
  serviceId: number;
  categoryId: number;
  tier: string;
  date: Date;
}

export interface PriceBreakdown {
  base: number;
  tierMultiplier: number;
  peakMultiplier: number;
  surgeMultiplier: number;
  total: number;
}

/** Does this rule apply to the given service/tier/date? Null rule fields
 *  are wildcards (apply to everything). */
export function ruleMatches(rule: PricingRuleLike, ctx: RuleContext): boolean {
  if (!rule.isActive) return false;
  if (rule.serviceId !== null && rule.serviceId !== ctx.serviceId) return false;
  if (rule.categoryId !== null && rule.categoryId !== ctx.categoryId) return false;
  if (rule.technicianTier !== null && rule.technicianTier !== ctx.tier) return false;
  if (rule.dayOfWeek !== null && rule.dayOfWeek !== ctx.date.getDay()) return false;
  if (rule.hourStart !== null && ctx.date.getHours() < rule.hourStart) return false;
  if (rule.hourEnd !== null && ctx.date.getHours() >= rule.hourEnd) return false;
  return true;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function computeDynamicPrice(input: {
  base: number;
  tier: string;
  serviceId: number;
  categoryId: number;
  rules: PricingRuleLike[];
  date: Date;
  surgeRatio: number;
}): PriceBreakdown {
  const tierMultiplier = TIER_MULTIPLIERS[input.tier] ?? 1.0;
  const ctx: RuleContext = {
    serviceId: input.serviceId,
    categoryId: input.categoryId,
    tier: input.tier,
    date: input.date,
  };
  const peakMultiplier = input.rules.reduce(
    (acc, rule) => acc * (ruleMatches(rule, ctx) ? Number(rule.priceMultiplier) : 1),
    1,
  );
  const surgeMultiplier = input.surgeRatio >= SURGE_THRESHOLD ? SURGE_MULTIPLIER : 1;
  return {
    base: round2(input.base),
    tierMultiplier,
    peakMultiplier,
    surgeMultiplier,
    total: round2(input.base * tierMultiplier * peakMultiplier * surgeMultiplier),
  };
}
