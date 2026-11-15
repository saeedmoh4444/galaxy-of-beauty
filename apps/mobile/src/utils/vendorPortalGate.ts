/**
 * W3-3 — mobile vendor-portal access decision (pure, unit-tested).
 *
 * The portal is a vendor-management surface on mobile (no registration
 * wizard here — that lives on web, which is why the web boundary stays
 * open to any authenticated user). The API guards every query by vendor
 * ownership, so the layout only needs to bounce:
 *   guests → login · authenticated non-vendors (myStore NOT_FOUND) → home
 */
export type VendorPortalGateDecision = 'allow' | 'login' | 'home';

export function vendorPortalGate(
  isAuthed: boolean,
  storeCheckLoading: boolean,
  isNonVendor: boolean,
): VendorPortalGateDecision {
  if (!isAuthed) return 'login';
  if (storeCheckLoading) return 'allow'; // hold with a spinner while checking
  if (isNonVendor) return 'home';
  return 'allow';
}
