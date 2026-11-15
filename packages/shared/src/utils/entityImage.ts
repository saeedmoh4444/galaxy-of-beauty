/**
 * Imagery plan I1 — fallback-chain resolver (docs/IMAGERY_PLAN_2026-11-15.md).
 *
 * Chain: entity imageUrl → category default (curated manifest) →
 * kind default (manifest) → brand pattern (last resort).
 *
 * The manifest starts with kind defaults; the AI starter library (content
 * task) fills category entries later by adding keys — no code change. The
 * brand pattern currently points at the shipped logo so the chain can
 * never resolve to a broken image.
 */

export type ImageEntityKind = 'service' | 'product' | 'store' | 'technician';

export interface EntityImageInput {
  kind: ImageEntityKind;
  /** The row's own image — highest priority. */
  entityImageUrl?: string | null;
  /** Category slug for the category-level default. */
  categorySlug?: string | null;
  /** Last-resort brand pattern (defaults to the manifest's brand entry). */
  brandFallback?: string | null;
}

export interface ImageManifest {
  [kind: string]: {
    default: string;
    [categorySlug: string]: string;
  };
}

/**
 * Curated fallback manifest (I2). Category entries plug in as content
 * lands; each entry must be a path served by the web app or the CDN
 * once I6 ships.
 */
export const IMAGE_FALLBACKS: ImageManifest = {
  service: {
    default: '/images/defaults/service.jpg',
  },
  product: {
    default: '/images/defaults/product.jpg',
  },
  store: {
    default: '/images/defaults/store.jpg',
  },
  technician: {
    default: '/images/defaults/technician.jpg',
  },
};

const BRAND_FALLBACK = '/logo.png';

export function resolveEntityImage(
  input: EntityImageInput,
  manifest: ImageManifest = IMAGE_FALLBACKS,
): string | undefined {
  const trimmed = input.entityImageUrl?.trim();
  if (trimmed) return trimmed;

  const kindEntry = manifest[input.kind];
  if (kindEntry) {
    if (input.categorySlug) {
      const categoryUrl = kindEntry[input.categorySlug];
      if (categoryUrl) return categoryUrl;
    }
    return kindEntry.default;
  }

  return input.brandFallback?.trim() || BRAND_FALLBACK;
}
