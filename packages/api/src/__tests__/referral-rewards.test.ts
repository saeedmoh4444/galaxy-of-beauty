/**
 * 8.1 — tiered referral reward schedule (pure function).
 */
import { describe, expect, it } from 'vitest';

import { tieredReferrerReward, REFERRED_REWARD } from '../lib/referralRewards';

describe('tieredReferrerReward', () => {
  it('pays 50 SAR for referrals 1–4', () => {
    for (const n of [1, 2, 3, 4]) {
      expect(tieredReferrerReward(n)).toBe(50);
    }
  });

  it('pays 200 SAR for referrals 5–9', () => {
    for (const n of [5, 6, 9]) {
      expect(tieredReferrerReward(n)).toBe(200);
    }
  });

  it('pays 500 SAR from the 10th referral onward', () => {
    expect(tieredReferrerReward(10)).toBe(500);
    expect(tieredReferrerReward(42)).toBe(500);
  });

  it('keeps the referred-side bonus flat at 20 SAR', () => {
    expect(REFERRED_REWARD).toBe(20);
  });
});
