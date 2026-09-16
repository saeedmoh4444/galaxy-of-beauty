/**
 * pageHeroKey — §3.5 hero-emoji sweep: maps (public) marketing page slugs
 * onto shared image registry keys so page headers render real photography
 * (ServiceImage) instead of emoji glyphs. Tested from the api suite
 * (shared has no vitest).
 *
 * Run: pnpm --filter @galaxy/api test -- page-hero-key.test.ts
 */
import { describe, it, expect } from 'vitest';
import { pageHeroKey } from '@galaxy/shared';

describe('pageHeroKey', () => {
  it('maps themed page slugs onto registry keys', () => {
    expect(pageHeroKey('bridal-concierge')).toBe('bridalPackage');
    expect(pageHeroKey('shop-the-look')).toBe('makeup');
    expect(pageHeroKey('look-of-the-day')).toBe('makeup');
    expect(pageHeroKey('behind-scenes')).toBe('makeup');
    expect(pageHeroKey('beauty-shorts')).toBe('makeup');
    expect(pageHeroKey('live-stream')).toBe('makeup');
    expect(pageHeroKey('tutorials')).toBe('makeup');
    expect(pageHeroKey('video-testimonials')).toBe('makeup');
    expect(pageHeroKey('featured-tech')).toBe('makeup');
    expect(pageHeroKey('beauty-quiz')).toBe('facial');
    expect(pageHeroKey('ingredient-analyzer')).toBe('facial');
    expect(pageHeroKey('ingredient-sub')).toBe('facial');
    expect(pageHeroKey('before-after')).toBe('facial');
    expect(pageHeroKey('mommy-and-me')).toBe('facial');
    expect(pageHeroKey('pregnancy-beauty')).toBe('facial');
    expect(pageHeroKey('booking-heatmap')).toBe('massage');
    expect(pageHeroKey('group-buy')).toBe('spa');
    expect(pageHeroKey('surprise-me')).toBe('spa');
    expect(pageHeroKey('audio-rooms')).toBe('spa');
  });

  it('falls back to the generic beauty image for unmapped pages', () => {
    expect(pageHeroKey('api-docs')).toBe('beautyService');
    expect(pageHeroKey('beauty-stats')).toBe('beautyService');
    expect(pageHeroKey('whatsapp-bot')).toBe('beautyService');
    expect(pageHeroKey('blog-post')).toBe('beautyService');
    expect(pageHeroKey('unknown-page')).toBe('beautyService');
    expect(pageHeroKey('')).toBe('beautyService');
    expect(pageHeroKey(null)).toBe('beautyService');
  });
});
