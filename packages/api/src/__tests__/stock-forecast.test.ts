import { describe, it, expect } from 'vitest';
import { forecastFromSales } from '../lib/stockForecast';

describe('forecastFromSales', () => {
  it('computes the 30-day velocity and days-at-stock', () => {
    // 30 units over 30 days → velocity 1/day; stock 12 → 12 days.
    const daily = Array.from({ length: 30 }, (_, i) => (i < 30 ? 1 : 0));
    expect(forecastFromSales(daily, 12)).toEqual({ velocityPerDay: 1, daysAtStock: 12 });
  });

  it('floors fractional days (honest, never over-promises)', () => {
    const daily = [3, 0, 0, ...Array.from({ length: 27 }, () => 0)]; // 3/30 = 0.1/day
    expect(forecastFromSales(daily, 2)).toEqual({ velocityPerDay: 0.1, daysAtStock: 20 });
  });

  it('returns null days when there is no velocity (new product)', () => {
    expect(forecastFromSales([], 50)).toEqual({ velocityPerDay: 0, daysAtStock: null });
    expect(
      forecastFromSales(
        Array.from({ length: 30 }, () => 0),
        50,
      ),
    ).toEqual({
      velocityPerDay: 0,
      daysAtStock: null,
    });
  });

  it('rounds the velocity to 3 decimals for display', () => {
    const daily = Array.from({ length: 30 }, () => 0);
    daily[0] = 7; // 7/30 = 0.2333…
    expect(forecastFromSales(daily, 10).velocityPerDay).toBe(0.233);
  });
});
