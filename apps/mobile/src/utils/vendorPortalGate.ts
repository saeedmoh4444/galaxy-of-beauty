/**
 * W3-3 — mobile vendor-portal access decision (pure, unit-tested).
 *
 * The portal is a vendor-management surface on mobile (no registration
 * wizard here — that lives on web, which is why the web boundary stays
 * open to any authenticated user). The API guards every query by vendor
 * ownership, so the layout only needs to bounce:
 *   guests → login · authenticated non-vendors (myStore NOT_FOUND) → home
 *
 * 'hold' covers both pre-restore auth hydration (full-page loads render
 * before loadAuthToken resolves — bouncing straight to login would log
 * out a session that was about to hydrate) and the in-flight store check.
 */
export type VendorPortalGateDecision = 'allow' | 'login' | 'home' | 'hold';

export function vendorPortalGate(
  isAuthed: boolean,
  authHydrating: boolean,
  storeCheckLoading: boolean,
  isNonVendor: boolean,
): VendorPortalGateDecision {
  if (authHydrating) return 'hold';
  if (!isAuthed) return 'login';
  if (storeCheckLoading) return 'hold';
  if (isNonVendor) return 'home';
  return 'allow';
}
