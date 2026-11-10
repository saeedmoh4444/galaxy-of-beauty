import { describe, expect, it } from 'vitest';
import { sumSeries, deltaPct, barHeights, type AnalyticsPoint } from '../vendorAnalytics';

/**
 * D1 (SELLER_FIRST_CLASS_ROLE_PLAN) — mobile analytics helpers: pure
 * transforms over the vendorPortal.analyticsSeries read-model so the
 * screen stays a dumb renderer (and these stay unit-testable without RN).
 */

const points: AnalyticsPoint[] = [
  { day: '2026-11-01T00:00:00.000Z', revenue: 100, orders: 2, aov: 50 },
  { day: '2026-11-02T00:00:00.000Z', revenue: 300, orders: 3, aov: 100 },
  { day: '2026-11-03T00:00:00.000Z', revenue: 200, orders: 4, aov: 50 },
];

describe('vendorAnalytics (D1)', () => {
  it('sumSeries totals a numeric field', () => {
    expect(sumSeries(points, 'revenue')).toBe(600);
    expect(sumSeries(points, 'orders')).toBe(9);
    expect(sumSeries([], 'revenue')).toBe(0);
  });

  it('deltaPct formats a period-over-period delta', () => {
    expect(deltaPct(110, 100)).toBe('+10%');
    expect(deltaPct(90, 100)).toBe('−10%');
    expect(deltaPct(100, 100)).toBe('±0%');
    // No previous baseline → null (the UI hides the badge).
    expect(deltaPct(100, 0)).toBeNull();
  });

  it('barHeights normalizes to 4–100 so tiny series stay visible', () => {
    const heights = barHeights(points, 'revenue');
    expect(heights).toEqual([33, 100, 67]);
    // Flat series: every bar still renders at a visible height.
    const p0 = points[0];
    const p1 = points[1];
    if (!p0 || !p1) throw new Error('fixture');
    expect(
      barHeights(
        [
          { ...p0, revenue: 100 },
          { ...p1, revenue: 100 },
        ],
        'revenue',
      ),
    ).toEqual([100, 100]);
    expect(barHeights([], 'revenue')).toEqual([]);
  });
});
