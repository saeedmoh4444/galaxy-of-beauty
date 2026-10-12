'use client';
import { useAuth } from '@galaxy/ui';
import { api } from '@/lib/trpc';

export interface VendorStoreState {
  /** The caller's store row — undefined while loading or when they own none. */
  store: NonNullable<ReturnType<typeof api.vendorPortal.myStore.useQuery>['data']>;
  /** True until auth hydration and the myStore lookup have both resolved. */
  isLoading: boolean;
  /** Auth resolved, store lookup resolved, and the caller owns a store. */
  isOwner: boolean;
}

/**
 * Shared ownership check for vendor-facing pages.
 *
 * Store accounts are CUSTOMER-role users with a Vendor row (no VENDOR role —
 * see brain_code.md weaknesses), so "is a vendor" = "has a myStore row".
 * One hook = one definition; owner-only pages consume it instead of
 * duplicating the query + redirect dance.
 */
export function useVendorStore(): VendorStoreState {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { data, isLoading: storeLoading } = api.vendorPortal.myStore.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Auth hydration AND the store lookup must both resolve before ownership
  // can be judged — while auth is hydrating the query is disabled, so its
  // isLoading is false and a naive check would bounce owners to the portal.
  const isLoading = authLoading || storeLoading;

  return {
    store: data as VendorStoreState['store'],
    isLoading,
    isOwner: isAuthenticated && !isLoading && !!data,
  };
}
