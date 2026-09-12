/**
 * womensCategoryImageKey — §3.5: maps the 94 womens-services catalog
 * category keys (pregnancy_safe, nails, bridal_glow, …) onto the shared
 * image registry keys so the E1 hub cards render real imagery instead of
 * empty glyphs. Tested from the api suite (shared has no vitest).
 *
 * Run: pnpm --filter @galaxy/api test -- womens-category-image.test.ts
 */
import { describe, it, expect } from 'vitest';
import { womensCategoryImageKey } from '@galaxy/shared';

describe('womensCategoryImageKey', () => {
  it('maps themed keys onto registry keys', () => {
    expect(womensCategoryImageKey('nails')).toBe('manicure');
    expect(womensCategoryImageKey('manicure_bar')).toBe('manicure');
    expect(womensCategoryImageKey('bridal_glow')).toBe('bridalPackage');
    expect(womensCategoryImageKey('hair_color')).toBe('hairStyling');
    expect(womensCategoryImageKey('facial_treatments')).toBe('facial');
    expect(womensCategoryImageKey('lash_extensions')).toBe('lashes');
    expect(womensCategoryImageKey('waxing_bar')).toBe('waxing');
    expect(womensCategoryImageKey('deep_massage')).toBe('massage');
    expect(womensCategoryImageKey('moroccan_spa')).toBe('spa');
    expect(womensCategoryImageKey('makeup_studio')).toBe('makeup');
    expect(womensCategoryImageKey('henna_art')).toBe('henna');
    expect(womensCategoryImageKey('body_scrub')).toBe('bodyScrub');
    expect(womensCategoryImageKey('laser_hair')).toBe('laserHairRemoval');
    expect(womensCategoryImageKey('aroma_therapy')).toBe('aromatherapy');
  });

  it('falls back to the generic beauty image for unmapped themes', () => {
    expect(womensCategoryImageKey('pregnancy_safe')).toBe('beautyService');
    expect(womensCategoryImageKey('fitness_lounge')).toBe('beautyService');
    expect(womensCategoryImageKey('unknown_xyz')).toBe('beautyService');
  });

  it('matches case-insensitively', () => {
    expect(womensCategoryImageKey('Nails_Club')).toBe('manicure');
  });
});
