/**
 * A/B significance math (audit stage 12) — chi-square contract tests with
 * hand-computable fixtures.
 */
import { describe, it, expect } from 'vitest';
import { abSignificance } from '../lib/abStats';

describe('abSignificance', () => {
  it('returns null without enough data', () => {
    expect(
      abSignificance({ impressions: 0, conversions: 0 }, { impressions: 0, conversions: 0 }),
    ).toBeNull();
    expect(
      abSignificance({ impressions: 10, conversions: 1 }, { impressions: 0, conversions: 0 }),
    ).toBeNull();
  });

  it('is significant for a strong effect (10% vs 30% conversion)', () => {
    const r = abSignificance(
      { impressions: 200, conversions: 20 },
      { impressions: 200, conversions: 60 },
    );
    expect(r).not.toBeNull();
    expect(r!.significant).toBe(true);
    expect(r!.pValue).toBeLessThan(0.05);
    expect(r!.winnerHint).toBe('B');
  });

  it('is not significant for a negligible difference', () => {
    const r = abSignificance(
      { impressions: 200, conversions: 40 },
      { impressions: 200, conversions: 42 },
    );
    expect(r).not.toBeNull();
    expect(r!.significant).toBe(false);
  });

  it('hints A when A converts better', () => {
    const r = abSignificance(
      { impressions: 100, conversions: 25 },
      { impressions: 100, conversions: 10 },
    );
    expect(r!.winnerHint).toBe('A');
  });
});
