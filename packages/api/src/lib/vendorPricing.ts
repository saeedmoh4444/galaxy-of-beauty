/**
 * C3 — vendor pricing rules (PROFESSIONALIZATION Wave C): the dynamic-
 * pricing engine's vendor scope. Vendor rules are UPLIFT-ONLY (multiplier
 * ≥ 1.0 — the below-cost guardrail is structural); the admin override
 * replaces a rule's multiplier (precedence: admin > vendor).
 *
 * Pure composition — the DB rule gathering lives in the router.
 */
import type { prisma, Prisma } from '@galaxy/db';

export type VendorRuleType = 'weekend_uplift' | 'lowstock_floor';

export interface VendorPriceRuleLike {
  id: number;
  isActive: boolean;
  productId: number | null; // null = all of the vendor's products
  ruleType: VendorRuleType;
  dayOfWeek: number | null; // 0=Sun..6=Sat; null = all days
  multiplier: number;
  adminOverrideMultiplier: number | null;
}

export interface VendorRuleContext {
  productId: number;
  date: Date;
  stock: number;
  lowStockThreshold: number;
  basePrice: number;
}

export interface VendorRuleResult {
  price: number;
  appliedRuleIds: number[];
}

const SAUDI_WEEKEND_DAYS = new Set([5, 6]); // Friday, Saturday

/** Does this rule fire for the given product/date/stock? */
export function vendorRuleMatches(rule: VendorPriceRuleLike, ctx: VendorRuleContext): boolean {
  if (!rule.isActive) return false;
  if (rule.productId !== null && rule.productId !== ctx.productId) return false;
  if (rule.ruleType === 'weekend_uplift') {
    if (rule.dayOfWeek !== null && rule.dayOfWeek !== ctx.date.getDay()) return false;
    return SAUDI_WEEKEND_DAYS.has(ctx.date.getDay());
  }
  // lowstock_floor
  if (rule.dayOfWeek !== null && rule.dayOfWeek !== ctx.date.getDay()) return false;
  return ctx.stock <= ctx.lowStockThreshold;
}

/** Effective price = base × product of matching rule multipliers
 *  (admin override replaces the vendor's), rounded to 2 decimals. */
export function evaluateVendorRules(
  rules: VendorPriceRuleLike[],
  ctx: VendorRuleContext,
): VendorRuleResult {
  let total = ctx.basePrice;
  const appliedRuleIds: number[] = [];
  for (const rule of rules) {
    if (!vendorRuleMatches(rule, ctx)) continue;
    const m = rule.adminOverrideMultiplier ?? rule.multiplier;
    total *= m;
    appliedRuleIds.push(rule.id);
  }
  return { price: Math.round(total * 100) / 100, appliedRuleIds };
}

/** Maps a VendorPriceRule row to the lib shape (Decimal → number). */
export function toRuleLike(r: {
  id: number;
  isActive: boolean;
  productId: number | null;
  ruleType: string;
  dayOfWeek: number | null;
  multiplier: unknown;
  adminOverrideMultiplier: unknown;
}): VendorPriceRuleLike {
  return {
    id: r.id,
    isActive: r.isActive,
    productId: r.productId,
    ruleType: r.ruleType as VendorRuleType,
    dayOfWeek: r.dayOfWeek,
    multiplier: Number(r.multiplier),
    adminOverrideMultiplier:
      r.adminOverrideMultiplier === null ? null : Number(r.adminOverrideMultiplier),
  };
}

/** The DB-side change-log writer: for every affected product, logs the
 *  price change chronologically — `applied=true` (create/update/override)
 *  records without→with; `applied=false` (deactivation) records with→
 *  without, so the log always shows the real direction of the change. */
export async function writeVendorPriceLogs(
  db: Prisma.TransactionClient | typeof prisma,
  vendorId: number,
  ruleId: number,
  changedBy: 'vendor' | 'admin',
  changedRuleLike: VendorPriceRuleLike,
  applied: boolean,
  onlyProductId?: number,
): Promise<void> {
  const products = await db.product.findMany({
    where: { vendorId, isActive: true, ...(onlyProductId ? { id: onlyProductId } : {}) },
    select: { id: true, price: true, stock: true, lowStockThreshold: true },
  });
  if (products.length === 0) return;

  const rules = await db.vendorPriceRule.findMany({ where: { vendorId, isActive: true } });
  const liked = rules
    .filter((r) => r.id !== ruleId)
    .map((r) => ({
      id: r.id,
      isActive: r.isActive,
      productId: r.productId,
      ruleType: r.ruleType as VendorRuleType,
      dayOfWeek: r.dayOfWeek,
      multiplier: Number(r.multiplier),
      adminOverrideMultiplier:
        r.adminOverrideMultiplier === null ? null : Number(r.adminOverrideMultiplier),
    }));

  await db.productPriceLog.createMany({
    data: products.map((p) => {
      const ctx = {
        productId: p.id,
        date: new Date(),
        stock: p.stock,
        lowStockThreshold: p.lowStockThreshold,
        basePrice: Number(p.price),
      };
      const without = evaluateVendorRules(liked, ctx);
      const withRule = evaluateVendorRules([...liked, changedRuleLike], ctx);
      return {
        productId: p.id,
        ruleId,
        oldPrice: applied ? without.price : withRule.price,
        newPrice: applied ? withRule.price : without.price,
        changedBy,
      };
    }),
  });
}
