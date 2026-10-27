/**
 * C2 — inventory v2 (PROFESSIONALIZATION Wave C): stock-velocity forecast.
 * Pure composition — the daily-quantity gathering lives in the router.
 */

export interface StockForecast {
  /** Average units/day over the 30-day window (3-decimals rounded). */
  velocityPerDay: number;
  /** floor(stock / velocity); null when there is no velocity yet. */
  daysAtStock: number | null;
}

const WINDOW_DAYS = 30;

/** Velocity over the window from per-day sold quantities. */
export function forecastFromSales(dailyQuantities: number[], stock: number): StockForecast {
  const total = dailyQuantities.reduce((sum, q) => sum + q, 0);
  const velocityPerDay = Math.round((total / WINDOW_DAYS) * 1000) / 1000;
  const daysAtStock = velocityPerDay > 0 ? Math.floor(stock / velocityPerDay) : null;
  return { velocityPerDay, daysAtStock };
}
