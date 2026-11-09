/**
 * D3 — typed cache-key builders. Keys must be deterministic (same input →
 * same key across processes) and namespaced so invalidation can clear
 * whole families with one prefix.
 */
import { describe, expect, it } from 'vitest';
import { catalogCache } from '../lib/cacheKeys';

describe('catalogCache key builders', () => {
  it('produces the same key for the same input', () => {
    const a = catalogCache.services.list({ page: 1, limit: 12, sort: 'popular' });
    const b = catalogCache.services.list({ page: 1, limit: 12, sort: 'popular' });
    expect(a).toBe(b);
  });

  it('produces different keys for different inputs', () => {
    expect(catalogCache.services.list({ page: 1, limit: 12 })).not.toBe(
      catalogCache.services.list({ page: 2, limit: 12 }),
    );
  });

  it('ignores JSON key order (stable serialization)', () => {
    expect(catalogCache.services.list({ limit: 12, page: 1 })).toBe(
      catalogCache.services.list({ page: 1, limit: 12 }),
    );
  });

  it('namespaces every key under the catalog family for prefix invalidation', () => {
    expect(catalogCache.services.list({ page: 1, limit: 12 })).toMatch(/^catalog:services:list:/);
    expect(catalogCache.bundles.list()).toBe('catalog:bundles:list');
    expect(catalogCache.technicians.list({ page: 1, limit: 12 })).toMatch(
      /^catalog:technicians:list:/,
    );
  });
});
