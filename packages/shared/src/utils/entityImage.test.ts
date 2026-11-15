/**
 * Imagery plan I1 — fallback-chain resolver (docs/IMAGERY_PLAN_2026-11-15.md).
 *
 * Every customer-facing surface shows a real, distinct image via a chain:
 *   entity imageUrl → category default (curated manifest) →
 *   kind default (manifest) → brand pattern.
 *
 * The manifest starts with kind defaults only (content task fills category
 * entries later); the resolver must degrade gracefully at every level so
 * nothing ever renders as a broken image or emoji placeholder.
 */
import { describe, expect, it } from 'vitest';
import { resolveEntityImage, IMAGE_FALLBACKS } from './entityImage';

const MANIFEST = {
  service: {
    default: '/images/defaults/service.jpg',
    hair: '/images/defaults/hair.jpg',
  },
  product: {
    default: '/images/defaults/product.jpg',
  },
  technician: {
    default: '/images/defaults/technician.jpg',
  },
  store: {
    default: '/images/defaults/store.jpg',
  },
};

describe('resolveEntityImage (imagery I1)', () => {
  it('returns the entity image when present', () => {
    expect(
      resolveEntityImage(
        { kind: 'service', entityImageUrl: '/uploads/svc-1.webp', categorySlug: 'hair' },
        MANIFEST,
      ),
    ).toBe('/uploads/svc-1.webp');
  });

  it('skips empty/whitespace entity images', () => {
    for (const empty of [null, undefined, '', '   ']) {
      expect(
        resolveEntityImage(
          { kind: 'service', entityImageUrl: empty, categorySlug: 'hair' },
          MANIFEST,
        ),
      ).toBe('/images/defaults/hair.jpg');
    }
  });

  it('falls back to the category default when the entity has no image', () => {
    expect(resolveEntityImage({ kind: 'service', categorySlug: 'hair' }, MANIFEST)).toBe(
      '/images/defaults/hair.jpg',
    );
  });

  it('falls back to the kind default for an unmapped category', () => {
    expect(resolveEntityImage({ kind: 'service', categorySlug: 'laser' }, MANIFEST)).toBe(
      '/images/defaults/service.jpg',
    );
  });

  it('falls back to the kind default when no category is known', () => {
    expect(resolveEntityImage({ kind: 'product' }, MANIFEST)).toBe('/images/defaults/product.jpg');
  });

  it('falls back to the brand pattern when the manifest lacks the kind', () => {
    // Unknown kind → last-resort brand pattern (never a broken reference).
    expect(resolveEntityImage({ kind: 'booking' as never, categorySlug: 'x' }, MANIFEST)).toBe(
      '/logo.png',
    );
  });

  it('uses the real curated manifest without throwing', () => {
    // The shipped manifest must always resolve to *something* for every
    // supported kind — never undefined, never a broken reference.
    for (const kind of ['service', 'product', 'store', 'technician'] as const) {
      const url = resolveEntityImage({ kind }, IMAGE_FALLBACKS);
      expect(typeof url).toBe('string');
      expect(url!.length).toBeGreaterThan(0);
    }
  });

  it('supports a custom brand pattern as the last resort', () => {
    // Known kinds always resolve inside the manifest; the brand pattern
    // only shows for kinds the manifest doesn't know at all.
    expect(
      resolveEntityImage(
        { kind: 'booking' as never, categorySlug: 'x', brandFallback: '/brand.svg' },
        MANIFEST,
      ),
    ).toBe('/brand.svg');
  });
});
