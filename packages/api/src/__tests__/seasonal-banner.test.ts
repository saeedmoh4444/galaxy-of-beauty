/**
 * ENHANCEMENT_PLAN 1.4 — Seasonal & Event Services: themed banner matrix.
 *
 * Tests @galaxy/shared from the api suite (shared has no vitest of its own).
 * The banner shows only when a season is active AND the catalog has items;
 * priority when seasons overlap: EID > RAMADAN > VALENTINE > GRADUATION.
 */
import { describe, expect, it } from 'vitest';
import { seasonalBannerFor } from '@galaxy/shared';

describe('seasonalBannerFor', () => {
  it('returns null without an active season', () => {
    expect(seasonalBannerFor([], 3)).toBeNull();
  });

  it('returns null when the catalog has no items', () => {
    expect(seasonalBannerFor(['EID'], 0)).toBeNull();
    expect(seasonalBannerFor(['RAMADAN', 'GRADUATION'], 0)).toBeNull();
  });

  it('maps a single season to its theme', () => {
    expect(seasonalBannerFor(['EID'], 2)).toMatchObject({
      theme: 'eid',
      season: 'EID',
      itemCount: 2,
    });
    expect(seasonalBannerFor(['RAMADAN'], 4)).toMatchObject({ theme: 'ramadan', itemCount: 4 });
    expect(seasonalBannerFor(['VALENTINE'], 1)).toMatchObject({ theme: 'valentine', itemCount: 1 });
    expect(seasonalBannerFor(['GRADUATION'], 3)).toMatchObject({
      theme: 'graduation',
      itemCount: 3,
    });
  });

  it('applies priority when seasons overlap', () => {
    expect(seasonalBannerFor(['GRADUATION', 'EID'], 2)?.theme).toBe('eid');
    expect(seasonalBannerFor(['RAMADAN', 'EID'], 2)?.theme).toBe('eid');
    expect(seasonalBannerFor(['VALENTINE', 'RAMADAN'], 2)?.theme).toBe('ramadan');
    expect(seasonalBannerFor(['GRADUATION', 'VALENTINE'], 2)?.theme).toBe('valentine');
  });

  it('falls back to graduation for unknown seasons and keeps the first season', () => {
    expect(seasonalBannerFor(['MYSTERY_SEASON'], 2)).toEqual({
      theme: 'graduation',
      season: 'MYSTERY_SEASON',
      itemCount: 2,
    });
  });
});
