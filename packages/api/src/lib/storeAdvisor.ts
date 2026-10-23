/**
 * D3 — AI store advisor, rule-based v1 (no LLM): restock suggestions from
 * stock-vs-velocity, expired-deal nudges, weekend-peak hints and AOV-drop
 * flags. Pure rules — the DB input gathering lives in vendorPortal.advisor
 * and the weekly digest handler; the LLM layer stays gated on the OpenAI
 * key (VISIONARY Phase 3).
 */

export interface AdvisorProduct {
  id: number;
  nameAr: string;
  stock: number;
  threshold: number;
  /** Sales per week (velocity), 0 when the product is too new to judge. */
  salesPerWeek: number;
}

export interface AdvisorInputs {
  products: AdvisorProduct[];
  /** Deals whose window has passed but are still flagged active. */
  expiredDeals: Array<{ id: number; titleAr: string }>;
  /** Share (0–1) of the last 30 days' orders placed on Friday/Saturday. */
  weekendShare: number | null;
  aov7d: number | null;
  aov30d: number | null;
}

export interface AdvisorRule {
  /** i18n key under vendorPortal.advisor.* */
  key: string;
  params?: Record<string, string | number>;
}

const MAX_RULES = 5;

/**
 * computeAdvisorRules — deterministic, ordered by priority: restock
 * (by velocity, most urgent first), expired deals, weekend peak, AOV
 * drop. At most MAX_RULES rules so the Overview card stays digestible.
 */
export function computeAdvisorRules(inputs: AdvisorInputs): AdvisorRule[] {
  const rules: AdvisorRule[] = [];

  // Restock: below/at threshold with positive velocity — the fastest
  // movers lead (they sell out first).
  const restock = inputs.products
    .filter((p) => p.stock <= p.threshold && p.salesPerWeek > 0)
    .sort((a, b) => b.salesPerWeek - a.salesPerWeek)
    .slice(0, 3);
  for (const p of restock) {
    rules.push({
      key: 'vendorPortal.advisor.restock',
      params: { name: p.nameAr, stock: p.stock, weekly: Math.round(p.salesPerWeek) },
    });
  }

  // Expired deals: ended windows still flagged active.
  for (const d of inputs.expiredDeals.slice(0, 3)) {
    rules.push({ key: 'vendorPortal.advisor.expired-deal', params: { name: d.titleAr } });
  }

  // Weekend peak: Fri+Sat ≥ half of the last 30 days' orders.
  if (inputs.weekendShare !== null && inputs.weekendShare >= 0.5) {
    rules.push({ key: 'vendorPortal.advisor.weekend-peak' });
  }

  // AOV drop: 7-day average below 80% of the 30-day average.
  if (
    inputs.aov7d !== null &&
    inputs.aov30d !== null &&
    inputs.aov30d > 0 &&
    inputs.aov7d < inputs.aov30d * 0.8
  ) {
    rules.push({
      key: 'vendorPortal.advisor.aov-drop',
      params: { current: Math.round(inputs.aov7d), before: Math.round(inputs.aov30d) },
    });
  }

  return rules.slice(0, MAX_RULES);
}
