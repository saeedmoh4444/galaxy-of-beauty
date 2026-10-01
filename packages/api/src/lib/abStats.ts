/**
 * A/B significance (audit stage 12) — 2×2 chi-square with Yates
 * correction on impression/conversion counts. Pure and testable.
 */

/** 2×2 chi-square p-value via the regularised incomplete gamma function. */
function igf(s: number, x: number): number {
  if (x < 0) return 0;
  const sc = 1 / s;
  let sum = sc;
  let t = sc;
  for (let k = 1; k < 200; k++) {
    t *= x / (s + k);
    sum += t;
    if (t < sum * 1e-15) break;
  }
  return Math.exp(-x + s * Math.log(x) - lgamma(s)) * sum;
}

function lgamma(x: number): number {
  // Lanczos approximation (g=7, n=9)
  const c = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313,
    -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6,
    1.5056327351493116e-7,
  ];
  const g = 7;
  if (x < 0.5) {
    return Math.log(Math.PI / Math.sin(Math.PI * x)) - lgamma(1 - x);
  }
  x -= 1;
  let a = c[0]!;
  const t = x + g + 0.5;
  for (let i = 1; i < c.length; i++) {
    a += c[i]! / (x + i);
  }
  return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
}

/** Regularised upper incomplete gamma Q(s, x). */
function igfQ(s: number, x: number): number {
  if (x < s + 1) return 1 - igf(s, x);
  // Continued fraction (Lentz) for the upper tail
  const tiny = 1e-30;
  let b = x + 1 - s;
  let c = 1 / tiny;
  let d = 1 / b;
  let h = d;
  for (let i = 1; i <= 200; i++) {
    const an = -i * (i - s);
    b += 2;
    d = an * d + b;
    if (Math.abs(d) < tiny) d = tiny;
    c = b + an / c;
    if (Math.abs(c) < tiny) c = tiny;
    d = 1 / d;
    const delta = d * c;
    h *= delta;
    if (Math.abs(delta - 1) < 1e-15) break;
  }
  return Math.exp(-x + s * Math.log(x) - lgamma(s)) * h;
}

export interface AbVariantCounts {
  impressions: number;
  conversions: number;
}

export interface AbSignificance {
  pValue: number;
  significant: boolean;
  /** Which variant wins on raw conversion rate (null on tie/insufficient data). */
  winnerHint: 'A' | 'B' | null;
}

/**
 * Chi-square (Yates) p-value for the difference between two variants.
 * Returns null when there is not enough data (zero impressions either side).
 */
export function abSignificance(a: AbVariantCounts, b: AbVariantCounts): AbSignificance | null {
  const n = a.impressions + b.impressions;
  if (n === 0 || a.impressions === 0 || b.impressions === 0) return null;

  const aC = a.conversions;
  const aN = a.impressions - a.conversions;
  const bC = b.conversions;
  const bN = b.impressions - b.conversions;
  const rowA = a.impressions;
  const rowB = b.impressions;
  const colC = aC + bC;
  const colN = aN + bN;

  const expected = (row: number, col: number): number => (row * col) / n;
  const cells = [
    { o: aC, e: expected(rowA, colC) },
    { o: aN, e: expected(rowA, colN) },
    { o: bC, e: expected(rowB, colC) },
    { o: bN, e: expected(rowB, colN) },
  ];
  const chi2 = cells.reduce((sum, { o, e }) => {
    const d = Math.abs(o - e) - 0.5; // Yates correction
    return sum + (e > 0 ? (d * d) / e : 0);
  }, 0);

  // 1 degree of freedom: Q(0.5, chi2/2)
  const pValue = igfQ(0.5, chi2 / 2);
  const rateA = a.conversions / a.impressions;
  const rateB = b.conversions / b.impressions;
  return {
    pValue,
    significant: pValue < 0.05,
    winnerHint: rateA === rateB ? null : rateA > rateB ? 'A' : 'B',
  };
}
