/**
 * react-query cache persistence whitelist (offline-first, 5.5).
 *
 * Only public catalog reads survive restarts: they are identical for
 * every user, so persisting them leaks nothing and makes the app's
 * discovery screens render instantly offline. Everything user-scoped
 * (bookings, loyalty, wallet, auth…) stays in memory only.
 */

const PERSISTED_ROUTERS = new Set([
  'services',
  'categories',
  'search',
  'gallery',
  'recommendations',
  'serviceTrends',
  'marketplace',
  'flashDeals',
  'giftCardMarket',
  'clinics',
  'gyms',
  'nailBars',
  'beautyDiscovery',
]);

export const PERSIST_BUSTER = 'v1'; // bump to invalidate persisted caches after schema/data changes

/**
 * tRPC v11 query keys are [ [router, procedure], { input } ].
 */
export function isPersistedQueryKey(queryKey: unknown): boolean {
  const head = Array.isArray(queryKey) ? queryKey[0] : undefined;
  const router = Array.isArray(head) ? head[0] : undefined;
  return typeof router === 'string' && PERSISTED_ROUTERS.has(router);
}
