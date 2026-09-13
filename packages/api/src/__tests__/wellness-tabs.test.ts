/**
 * Wellness-hub tab resolution — Phase 3 sprint 3.
 * Pure matrix for defaultTabFor (stage → pamper window → menopause →
 * saved → cycle), tested from the api suite because @galaxy/shared has no
 * vitest of its own.
 *
 * Run: pnpm --filter @galaxy/api test -- wellness-tabs.test.ts
 */
import { describe, it, expect } from 'vitest';
import { defaultTabFor, WELLNESS_TABS, type WellnessTabKey } from '@galaxy/shared';

const TAB_KEYS = Object.values(WELLNESS_TABS) as WellnessTabKey[];

describe('wellnessTabs — tab model', () => {
  it('exposes the five hub tabs in display order', () => {
    expect(TAB_KEYS).toEqual(['cycle', 'pamper', 'postpartum', 'menopause', 'mind']);
  });

  it('defaults to cycle with no inputs', () => {
    expect(defaultTabFor({})).toBe('cycle');
  });

  it('new_mom stage resolves to postpartum', () => {
    expect(defaultTabFor({ stage: 'new_mom' })).toBe('postpartum');
  });

  it('pamper window beats stage and saved tab', () => {
    expect(defaultTabFor({ stage: 'new_mom', pamperActive: true, savedTab: 'mind' })).toBe(
      'pamper',
    );
  });

  it('menopause enabled beats stage (but not the pamper window)', () => {
    expect(defaultTabFor({ stage: 'back_to_me', menopauseEnabled: true })).toBe('menopause');
    expect(defaultTabFor({ stage: 'back_to_me', menopauseEnabled: true, pamperActive: true })).toBe(
      'pamper',
    );
  });

  it('saved tab wins over stage-derived defaults', () => {
    expect(defaultTabFor({ stage: 'new_mom', savedTab: 'mind' })).toBe('mind');
  });

  it('an explicit param beats everything except validity', () => {
    expect(
      defaultTabFor({ stage: 'new_mom', pamperActive: true, savedTab: 'mind', param: 'cycle' }),
    ).toBe('cycle');
    // Invalid param falls through to the next rule in the chain.
    expect(defaultTabFor({ stage: 'new_mom', param: 'nonsense' })).toBe('postpartum');
  });

  it('other stages (bride/trying/pregnant/back_to_me) fall through to saved → cycle', () => {
    for (const stage of ['bride', 'trying', 'pregnant', 'back_to_me'] as const) {
      expect(defaultTabFor({ stage })).toBe('cycle');
      expect(defaultTabFor({ stage, savedTab: 'mind' })).toBe('mind');
    }
  });
});
