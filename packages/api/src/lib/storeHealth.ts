/**
 * D2 — store health score (0–100): a composite, honest mirror of store
 * trust, computed from fulfillment speed, cancel rate, review trend
 * (recency-decayed), stock health and (post-F1) response rate.
 *
 * Pure composition logic — the DB factor gathering lives in
 * gatherStoreHealthFactors below; the composition thresholds and decay
 * stay unit-testable without a database.
 */
import type { prisma } from '@galaxy/db';

export interface StoreHealthFactors {
  /** Average hours from order to fulfillment over the last 30 days (null = no data). */
  fulfillmentSpeedHours: number | null;
  /** Cancelled / (fulfilled + cancelled) over the last 30 days (0–1, null = no data). */
  cancelRate: number | null;
  /** Recency-decayed average rating 1–5 (null = no reviews). */
  reviewTrend: number | null;
  /** Share of active products above their low-stock threshold (0–1, null = no products). */
  stockHealth: number | null;
  /** Response rate 0–1 (F1 inbox); null = neutral until the feature lands. */
  responseRate: number | null;
}

export interface StoreHealthHint {
  /** i18n key under vendorPortal.health.hint.* */
  key: string;
  params?: Record<string, string | number>;
}

export interface StoreHealthResult {
  score: number;
  hints: StoreHealthHint[];
}

/** Recency decay for reviews: a review's weight halves every 30 days. */
export function decayWeight(ageDays: number): number {
  return Math.pow(0.5, ageDays / 30);
}

/**
 * Per-factor 0–100 sub-scores. Each factor is neutral (60) when there is
 * no data — a store with no history is not punished. `decayedReviewAvg`
 * feeds reviewTrend directly (the caller applies decayWeight per review).
 */
export function computeStoreHealthScore(f: StoreHealthFactors): StoreHealthResult {
  const hints: StoreHealthHint[] = [];

  // Fulfillment speed: ≤12h = 100, linear to 0 at ≥72h.
  let fulfillment = 60;
  if (f.fulfillmentSpeedHours !== null) {
    const h = f.fulfillmentSpeedHours;
    fulfillment = h <= 12 ? 100 : h >= 72 ? 0 : Math.round(100 - ((h - 12) / 60) * 100);
    if (fulfillment < 60)
      hints.push({ key: 'vendorPortal.health.hint.fulfillment', params: { hours: Math.round(h) } });
  }

  // Cancel rate: 0% = 100, linear to 0 at ≥30%.
  let cancel = 60;
  if (f.cancelRate !== null) {
    const r = f.cancelRate;
    cancel = r <= 0 ? 100 : r >= 0.3 ? 0 : Math.round(100 - (r / 0.3) * 100);
    if (cancel < 60)
      hints.push({
        key: 'vendorPortal.health.hint.cancel',
        params: { percent: Math.round(r * 100) },
      });
  }

  // Review trend: decayed 1–5 mapped to 0–100 (3 = 60).
  let review = 60;
  if (f.reviewTrend !== null) {
    const avg = Math.min(5, Math.max(1, f.reviewTrend));
    review = Math.round(((avg - 1) / 4) * 100);
    if (review < 60) hints.push({ key: 'vendorPortal.health.hint.reviews' });
  }

  // Stock health: share of stocked products, 0–1 → 0–100.
  let stock = 60;
  if (f.stockHealth !== null) {
    stock = Math.round(Math.min(1, Math.max(0, f.stockHealth)) * 100);
    if (stock < 60) hints.push({ key: 'vendorPortal.health.hint.stock' });
  }

  // Response rate (F1): neutral 60 until the inbox feature lands.
  let response = 60;
  if (f.responseRate !== null) {
    response = Math.round(Math.min(1, Math.max(0, f.responseRate)) * 100);
  }

  // Weighted composite: fulfillment 30, cancel 20, review 20, stock 20,
  // response 10.
  const score = Math.round(
    fulfillment * 0.3 + cancel * 0.2 + review * 0.2 + stock * 0.2 + response * 0.1,
  );

  return { score, hints: hints.slice(0, 3) };
}

/**
 * gatherStoreHealthFactors — D2: collect the per-store factor inputs from
 * live data (last-30d fulfillment speed + cancel rate, 90d decayed review
 * trend, active-stock health). Callers pass the result to
 * computeStoreHealthScore; responseRate stays null until F1 lands.
 */
export async function gatherStoreHealthFactors(
  prismaClient: typeof prisma,
  vendorId: number,
): Promise<StoreHealthFactors> {
  const since30 = new Date(Date.now() - 30 * 86_400_000);

  const orders = await prismaClient.storeOrder.findMany({
    where: { vendorId, createdAt: { gte: since30 }, status: { in: ['FULFILLED', 'CANCELLED'] } },
    select: { status: true, createdAt: true, updatedAt: true },
  });
  const fulfilled = orders.filter((o) => o.status === 'FULFILLED');
  const cancelled = orders.filter((o) => o.status === 'CANCELLED');
  const fulfillmentSpeedHours = fulfilled.length
    ? fulfilled.reduce(
        (s, o) => s + (o.updatedAt.getTime() - o.createdAt.getTime()) / 3_600_000,
        0,
      ) / fulfilled.length
    : null;
  const decided = fulfilled.length + cancelled.length;
  const cancelRate = decided ? cancelled.length / decided : null;

  const reviews = await prismaClient.productReview.findMany({
    where: { product: { vendorId }, createdAt: { gte: new Date(Date.now() - 90 * 86_400_000) } },
    select: { rating: true, createdAt: true },
  });
  let reviewTrend: number | null = null;
  if (reviews.length > 0) {
    let weightedSum = 0;
    let totalWeight = 0;
    for (const r of reviews) {
      const weight = decayWeight((Date.now() - r.createdAt.getTime()) / 86_400_000);
      weightedSum += r.rating * weight;
      totalWeight += weight;
    }
    reviewTrend = weightedSum / totalWeight;
  }

  const active = await prismaClient.product.count({ where: { vendorId, isActive: true } });
  let stockHealth: number | null = null;
  if (active > 0) {
    const healthy = await prismaClient.product.count({
      where: {
        vendorId,
        isActive: true,
        stock: { gt: prismaClient.product.fields.lowStockThreshold },
      },
    });
    stockHealth = healthy / active;
  }

  return { fulfillmentSpeedHours, cancelRate, reviewTrend, stockHealth, responseRate: null };
}
