/**
 * D1 (SELLER_FIRST_CLASS_ROLE_PLAN) — pure analytics transforms for the
 * mobile seller dashboard. The screen renders; these stay testable.
 */

export interface AnalyticsPoint {
  day: string;
  revenue: number;
  orders: number;
  aov: number;
  newCustomers?: number;
  returningCustomers?: number;
  reelOrders?: number;
  reelRevenue?: number;
}

/** Sum a numeric field across the series. */
export function sumSeries(points: AnalyticsPoint[], key: keyof AnalyticsPoint): number {
  return points.reduce((acc, p) => {
    const v = p[key];
    return acc + (typeof v === 'number' ? v : 0);
  }, 0);
}

/**
 * Period-over-period delta as a display string ('+10%' / '−10%' / '±0%'),
 * or null when there is no previous baseline (UI hides the badge).
 */
export function deltaPct(current: number, previous: number): string | null {
  if (previous <= 0) return null;
  const delta = Math.round(((current - previous) / previous) * 100);
  if (delta === 0) return '±0%';
  return delta > 0 ? `+${delta}%` : `−${-delta}%`;
}

/**
 * Normalize a series into 4–100 bar heights so tiny values stay visible
 * and the max bar always tops the chart.
 */
export function barHeights(points: AnalyticsPoint[], key: keyof AnalyticsPoint): number[] {
  if (points.length === 0) return [];
  const values = points.map((p) => {
    const v = p[key];
    return typeof v === 'number' ? v : 0;
  });
  const max = Math.max(...values);
  if (max <= 0) return values.map(() => 50);
  return values.map((v) => Math.max(4, Math.round((v / max) * 100)));
}
