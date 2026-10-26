import { describe, it, expect } from 'vitest';
import { healthTone, sellerHomeSummary } from '../vendorHome';

describe('healthTone', () => {
  it('mirrors the web StoreDashboard thresholds: ≥80 good, ≥60 fair, else poor', () => {
    expect(healthTone(100)).toBe('good');
    expect(healthTone(80)).toBe('good');
    expect(healthTone(79)).toBe('fair');
    expect(healthTone(60)).toBe('fair');
    expect(healthTone(59)).toBe('poor');
    expect(healthTone(0)).toBe('poor');
  });

  it('defaults to the neutral 60 baseline when the score is missing', () => {
    expect(healthTone(undefined)).toBe('fair');
    expect(healthTone(null)).toBe('fair');
  });
});

describe('sellerHomeSummary', () => {
  const baseStore = {
    storeName: 'Glow Studio',
    storeSlug: 'glow-studio',
    descriptionJson: { ar: 'نبذة عربية', en: 'English bio' },
    logoUrl: 'https://cdn.example.com/logo.png',
    bannerUrl: 'https://cdn.example.com/banner.png',
    ratingAvg: '4.6', // Decimal arrives as a string (superjson)
    totalReviews: 12,
    isVerified: true,
  };

  it('shapes a full store into the seller-home card payload', () => {
    const summary = sellerHomeSummary(
      baseStore as never,
      { pendingOrders: 3, health: { score: 88, hints: [] } } as never,
      'ar',
    );
    expect(summary).not.toBeNull();
    expect(summary?.name).toBe('Glow Studio');
    expect(summary?.slug).toBe('glow-studio');
    expect(summary?.bio).toBe('نبذة عربية');
    expect(summary?.logoUrl).toBe('https://cdn.example.com/logo.png');
    expect(summary?.bannerUrl).toBe('https://cdn.example.com/banner.png');
    expect(summary?.rating).toBe(4.6);
    expect(summary?.reviewCount).toBe(12);
    expect(summary?.isVerified).toBe(true);
    expect(summary?.healthScore).toBe(88);
    expect(summary?.healthTone).toBe('good');
    expect(summary?.pendingOrders).toBe(3);
  });

  it('falls back to the other-language bio when the requested one is missing', () => {
    const summary = sellerHomeSummary(
      { ...baseStore, descriptionJson: { ar: 'فقط عربي' } } as never,
      {} as never,
      'en',
    );
    expect(summary?.bio).toBe('فقط عربي');
  });

  it('yields an empty bio when both languages are missing (screen shows the noBio hint)', () => {
    const summary = sellerHomeSummary(
      { ...baseStore, descriptionJson: null } as never,
      {} as never,
      'en',
    );
    expect(summary?.bio).toBe('');
  });

  it('returns null for a missing store (unregistered caller)', () => {
    expect(sellerHomeSummary(null, {} as never, 'en')).toBeNull();
    expect(sellerHomeSummary(undefined, {} as never, 'ar')).toBeNull();
  });

  it('defends against Decimal-as-string and missing health/pending shapes', () => {
    const summary = sellerHomeSummary(
      {
        storeName: 'New Store',
        storeSlug: 'new-store',
        ratingAvg: '3.25',
        totalReviews: 0,
        isVerified: false,
      } as never,
      {} as never,
      'en',
    );
    expect(summary?.rating).toBe(3.25);
    expect(summary?.reviewCount).toBe(0);
    expect(summary?.isVerified).toBe(false);
    expect(summary?.healthScore).toBe(60);
    expect(summary?.healthTone).toBe('fair');
    expect(summary?.pendingOrders).toBe(0);
    expect(summary?.logoUrl).toBeNull();
    expect(summary?.bannerUrl).toBeNull();
    expect(summary?.bio).toBe('');
  });
});
