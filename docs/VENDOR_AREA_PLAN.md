# Vendor Area — Route Separation & Hardening Plan

> Found during live testing (2026-10-12): `/store` bounced non-owners to the dead
> path `/customer/vendor-portal` (404); the vendor portal still lived inside the
> `(customer)` route group; two more dead links existed (web sidebar, mobile
> profile). This plan separates the vendor area professionally.

## Goal

A first-class vendor area: its own route group, its own auth boundary, a shared
ownership hook, a protected owner zone, and zero dead paths.

## Design

1. **`(vendor)` route group** — URL-transparent home for vendor-facing pages.
   - `(vendor)/layout.tsx`: auth gate only (hydration-safe). The portal stays
     open to authenticated non-owners — it hosts the registration wizard
     (`providerSubmission → PENDING_REVIEW`).
2. **`(vendor)/(owner)` subgroup** — ownership-gated zone; protection by
   _placement_, not repetition:
   - `(vendor)/(owner)/layout.tsx`: `useVendorStore()` guard — loading →
     skeleton, no store → redirect `/vendor-portal`, store → children.
   - **`/store` moves under it** → `(vendor)/(owner)/store/page.tsx`. Route
     groups are URL-transparent, so the URL stays `/store` — E2E contract and
     nav unchanged. The page sheds its inline guard.
3. **Shared hook `useVendorStore()`** — wraps the `vendorPortal.myStore` query:
   `{ store, isLoading, isOwner }`. Single source of truth for ownership.
4. **Dead-path eradication** — store redirect → `/vendor-portal`; web sidebar
   nav → `/vendor-portal`; mobile profile href → `/vendor-portal` (matches the
   mobile app's own top-level route); permanent redirect
   `/customer/vendor-portal` → `/vendor-portal` for stale bookmarks.
5. **Tests (TDD)**:
   - `store-dashboard.spec.ts`: redirect target updated to `/vendor-portal`.
   - New `vendor-portal.spec.ts`: (a) unauthenticated → `/login`;
     (b) authenticated non-owner sees the registration wizard (not bounced);
     (c) store owner reaching `/vendor-portal` gets the portal.
6. **Verification**: web type-check + lint, mobile type-check (href change),
   run both E2E specs against the local dev stack, then CI.

## Non-goals (scope discipline)

- No new `VENDOR` user role — role-less store accounts are a separate known
  weakness (brain_code.md); needs a schema + auth migration. Not here.
- No vendor dashboard redesign — chrome/UX stays as-is.
- No mobile vendor-portal rework — mobile already has its own top-level route;
  only the dead href is fixed.

## Files touched

| File                                                 | Change                                 |
| ---------------------------------------------------- | -------------------------------------- |
| `apps/web/src/app/(vendor)/layout.tsx`               | new — auth gate                        |
| `apps/web/src/app/(vendor)/(owner)/layout.tsx`       | new — ownership gate                   |
| `apps/web/src/app/(vendor)/(owner)/store/page.tsx`   | moved from `app/store` — guard removed |
| `apps/web/src/app/(vendor)/vendor-portal/page.tsx`   | moved from `(customer)`                |
| `apps/web/src/hooks/useVendorStore.ts`               | new — shared ownership hook            |
| `apps/web/src/components/layout/DashboardLayout.tsx` | dead href fixed                        |
| `apps/web/next.config.js`                            | legacy redirect added                  |
| `apps/mobile/src/app/(tabs)/profile/index.tsx`       | dead href fixed                        |
| `apps/web/e2e/store-dashboard.spec.ts`               | redirect target updated                |
| `apps/web/e2e/vendor-portal.spec.ts`                 | new — portal access matrix             |
