import { describe, it, expect } from 'vitest';
import { imageFor, resolvePoolKey, IMAGERY_POOLS } from './imagery';

describe('resolvePoolKey', () => {
  it('maps product categories by suffix', () => {
    expect(resolvePoolKey('product-fragrance')).toBe('products-fragrance');
    expect(resolvePoolKey('product-makeup')).toBe('products-makeup');
    expect(resolvePoolKey('product-skincare')).toBe('products-skincare');
    expect(resolvePoolKey('product-haircare')).toBe('products-haircare');
  });

  it('maps known service slugs to their pools', () => {
    expect(resolvePoolKey('bridal-makeup')).toBe('bridal');
    expect(resolvePoolKey('swedish-massage')).toBe('massage');
    expect(resolvePoolKey('manicure')).toBe('nails');
    expect(resolvePoolKey('kids-care')).toBe('kids');
    expect(resolvePoolKey('mens-grooming')).toBe('mens');
    expect(resolvePoolKey('black-henna')).toBe('henna');
    expect(resolvePoolKey('lashes')).toBe('lashes');
    expect(resolvePoolKey('spa-wellness')).toBe('spa');
  });

  it('falls back to the generic beauty pool for unknown slugs', () => {
    expect(resolvePoolKey('summer-skincare-secrets')).toBe('beauty');
    expect(resolvePoolKey('')).toBe('beauty');
  });
});

describe('IMAGERY_POOLS', () => {
  it('every pool has at least 6 unique https Unsplash URLs', () => {
    for (const [key, pool] of Object.entries(IMAGERY_POOLS)) {
      expect(pool.length, `pool ${key} too small`).toBeGreaterThanOrEqual(6);
      expect(new Set(pool).size, `pool ${key} has duplicates`).toBe(pool.length);
      for (const url of pool) {
        expect(url, `pool ${key} bad url`).toMatch(
          /^https:\/\/images\.unsplash\.com\/photo-[0-9a-f-]+\?w=800&q=80&auto=format&fit=crop$/,
        );
      }
    }
  });
});

describe('imageFor', () => {
  it('rotates deterministically through the pool', () => {
    const pool = IMAGERY_POOLS['beauty']!;
    expect(imageFor('beauty', 0)).toBe(pool[0]);
    expect(imageFor('beauty', pool.length)).toBe(pool[0]);
    expect(imageFor('beauty', 1)).toBe(pool[1]);
  });

  it('returns null for unknown pool keys', () => {
    expect(imageFor('does-not-exist', 0)).toBeNull();
  });
});
