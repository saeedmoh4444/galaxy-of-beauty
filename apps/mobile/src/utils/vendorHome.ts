/**
 * E1 — mobile seller home (Wave E): pure shaping helpers for the
 * vendor-portal profile card. Node-testable — no react-native imports.
 *
 * Decimal columns (ratingAvg) arrive as strings through superjson —
 * always coerce with Number() at the boundary, never inside JSX.
 */
import type { MyStore, VendorDashboard } from '@galaxy/api';

export type HealthTone = 'good' | 'fair' | 'poor';

/** Mirrors the web StoreDashboard chip thresholds (≥80 green, ≥60 amber). */
export function healthTone(score: number | undefined | null): HealthTone {
  const s = score ?? 60; // neutral baseline when the dashboard has no data
  if (s >= 80) return 'good';
  if (s >= 60) return 'fair';
  return 'poor';
}

export interface SellerHomeSummary {
  name: string;
  slug: string;
  bio: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  healthScore: number;
  healthTone: HealthTone;
  pendingOrders: number;
}

/**
 * Shapes the caller's store + dashboard into the seller-home card payload.
 * Returns null when the caller has no store — the screen skips the card.
 * The dashboard zero-shape (unregistered callers) lacks health and
 * pendingOrders, so both are defensive.
 */
export function sellerHomeSummary(
  store: MyStore | null | undefined,
  dash: VendorDashboard | null | undefined,
  locale: 'ar' | 'en',
): SellerHomeSummary | null {
  if (!store) return null;

  const desc = (store.descriptionJson as { ar?: string; en?: string } | null) ?? {};
  const bio = (locale === 'ar' ? desc.ar : desc.en) ?? (locale === 'ar' ? desc.en : desc.ar) ?? '';

  return {
    name: store.storeName,
    slug: store.storeSlug,
    bio,
    logoUrl: store.logoUrl ?? null,
    bannerUrl: store.bannerUrl ?? null,
    rating: Number(store.ratingAvg ?? 0),
    reviewCount: store.totalReviews,
    isVerified: store.isVerified,
    healthScore: dash?.health?.score ?? 60,
    healthTone: healthTone(dash?.health?.score),
    pendingOrders: dash?.pendingOrders ?? 0,
  };
}
