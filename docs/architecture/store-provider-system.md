# Store & Provider System — Architecture Reference

> Current as of 2026-10-09 (post S1/S2/S3 wave). Supersedes the "store system
> is missing" assumptions in older plans: the unified provider system is
> largely built — this documents how it actually works.

## The unified provider model

One `Vendor` model covers every provider type (`type` column):

| Type       | Sells         | Public listing | Dashboard            |
| ---------- | ------------- | -------------- | -------------------- |
| `STORE`    | products      | `/stores`      | generic store branch |
| `VENDOR`   | products      | `/stores`      | generic store branch |
| `CLINIC`   | consultations | `/clinics`     | ClinicDashboard      |
| `GYM`      | classes       | `/gyms`        | GymDashboard         |
| `NAIL_BAR` | station slots | `/nail-bars`   | NailBarDashboard     |
| `ATHOME`   | home requests | (city-scoped)  | AthomeDashboard      |

- **Invariant**: `Vendor.userId` is `@unique` — one provider per owner.
- **Role-less ownership**: `UserRole` has NO vendor role. A store owner is a
  CUSTOMER-role user with a Vendor row; access checks are ownership-based
  (`vendorPortal.*` procedures resolve the vendor from `ctx.user.id`).
  Adding a VENDOR role would require migrating every ownership check — do
  not do it without a deliberate decision.

## Registration & approval

- Entry: `/customer/vendor-portal` — the wizard covers all six types with
  per-type KSA documents (CR, national ID, bank letter, MOH/SFDA/MISA/
  MUNICIPALITY licenses).
- Flow: `marketplace.becomeVendor` / `becomeClinic` / `becomeGym` /
  `becomeNailBar` / `becomeAthomeSalon` → unverified Vendor →
  `ProviderSubmission` queue → admin approve/reject at `/admin/vendors`
  (`providerReview.decide`) → `isVerified` flip + notification.
- Public listings only expose verified vendors.

## Dashboards

- **Customer shell** (`/customer/vendor-portal`): registration wizard when
  the user has no vendor; the portal when they do. Kept for back-compat.
- **Store shell** (`/store`, S1): same portal component
  (`components/vendor/VendorPortal.tsx`) with `shellRole="STORE"` — a
  dedicated sidebar (Store Dashboard + Vendor Portal). Storeless visitors
  are redirected back to the wizard. Guard must wait for auth hydration
  (`isAuthenticated && !isLoading && !data`).
- `DashboardLayout` is role-driven: `ADMIN` / `TECHNICIAN` / `STORE` /
  default customer links.

## Commerce & settlement (S3)

- Cart splits per store (`buyCart`) → one `StoreOrder` per vendor,
  store-managed fulfillment (`PENDING_FULFILLMENT → FULFILLED`).
- **Commission**: per-vendor `commissionRate` (default 10%) is applied in
  `payouts.calculateStore` — payout `amount` = net, `fee` = platform cut.
  Admin edits rates at `/admin/vendors` (`payouts.setVendorCommission`).
- Store payouts: `payouts.listStorePayouts` (owner), disputes refund
  FULFILLED orders on resolution, `store-settlement.test.ts` pins the math
  (sequential describe — rates are shared rows).

## Ratings & trust

- `Vendor.ratingAvg` / `totalReviews` are denormalized from product
  reviews (`marketplace.reviewProduct`). Shown on the stores list,
  storefront detail, and the mobile stores list.

## Mobile

- Customer app: store browsing at `/marketplace/stores` + `[slug]`
  (product grid). Store dashboards stay web-first (store plan decision).

## Public endpoints

- `marketplace.vendors` (paged list, `_count.products`, rating fields via
  `include`) and `marketplace.vendorDetail` (slug → store + products).
- `include` (without `select`) returns all vendor scalars — rating fields
  ride along for free.
