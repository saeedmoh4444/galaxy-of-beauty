# 1.2 Service Bundles — Implementation Brief

> Prepared 2026-09-26 from live code (ENHANCEMENT_PLAN §1.2 + our_galaxy_of_beauty §3.1).
> Backend core already on master; this brief covers the remaining slices (UI + booking + custom builder).

## Goal (from the plan)

**Service Packages & Bundles: pre-built multi-service packages with bundle
discounts, custom bundles (3+ services → progressive discount), and bundle
booking (single slot, sequential execution).**

## Current state (verified in code, 2026-09-26)

Already on master:

- `BeautyBundle` model (schema.prisma:3147): `titleJson`, `descriptionJson`,
  `serviceIds Int[]`, `discountPct`, `totalPrice`, `originalPrice`,
  `imageUrl`, `isSeasonal`, `season`, `validFrom/validUntil`, `sortOrder`.
- `beautyBundles` router: public `list` (optional `season` filter, raw
  serviceIds only) + admin `create` + `adminList`. **No detail/get, no
  update/delete, no custom-bundle quote.**
- 1.3 add-ons already integrated with `booking.create` (addonIds + pricing) —
  bundle discount must compose with the existing 1.1 pricing engine breakdown.

Missing (this work):

- Hydrated bundle detail (service objects, not raw ids).
- Admin update/delete.
- Custom bundle quote (progressive tiers).
- `Booking` → bundle link (schema change + migration).
- Bundle booking flow (single slot, sequential execution).
- ALL web + mobile UI (zero bundle screens exist).
- Seeds for the pre-built packages.

## Slices (stacked PRs, each CI-green before the next)

### Slice 1 — API hardening (TDD)

- `beautyBundles.get`: hydrated — `serviceIds` resolved to services
  (id, titleJson, basePrice, durationMin, slug, imageUrl).
- `beautyBundles.update` + `delete` (adminProcedure, mirror create's zod).
- `beautyBundles.quote` (public): input `serviceIds (3+)` →
  `{ services, originalPrice, discountPct, totalPrice, savings }`.
  Progressive tiers in a pure shared lib (`bundlePricing.ts` in
  `@galaxy/shared`, api-tested): 3 svc = 10%, 4 = 12%, 5+ = 15%
  (v1; tune later). Rejects < 3 with a clear error.
- Tests first: bundle router tests (get hydration, admin CRUD auth) +
  `bundlePricing` tier matrix + quote round-trip. Update
  router-inventory snapshot only if procedure counts change.

### Slice 2 — Bundle booking (TDD)

- Schema: `beautyBundleId Int?` + relation on `Booking`; hand-written
  migration (migrate dev is flaky on this box — SQL + `db execute` +
  resolve --applied, then `pnpm db:generate`).
- `booking.create` accepts optional `bundleId`: validates bundle active +
  in validity window, overrides the service list, stores execution order
  (the bundle's `serviceIds`) on the booking, and folds the bundle
  discount into `pricingBreakdown` alongside existing addon/pricing lines.
- Sequential execution v1: one Booking row per bundle (bundleId link);
  the vendor works the ordered serviceIds within the slot (post-care
  checklist already supports multi-service sequencing — reuse it).
- Tests: booking-with-bundle e2e (quote → create → breakdown lines
  correct), expiry/reject paths, addons + bundle composition unit test.

### Slice 3 — Web UI

- New routes: `(customer)/bundles` (catalog) + `bundles/[id]` (detail).
- Catalog: card grid (image, title, services count, savings badge
  `وفري X SAR`), season filter chips when 1.4 season is active
  (`seasonalServices`/`lib/season.ts` from #262), inactive/expired hidden.
- Detail: services list (per-service price vs included), original→total
  strikethrough, validity window, Book CTA → existing booking wizard with
  bundle preselected (step 3 payment clarity pattern from Phase 3 sprint 2).
- Entry points: marketplace, beauty-discovery, seasonal-calendar, and a
  home quick-link tile.
- i18n ar/en (`bundles.*` keys), Rose Blush tokens, Lighthouse no regression.

### Slice 4 — Mobile mirrors (after web, per plan pattern)

- RN `BundlesListScreen` + `BundlesDetailScreen` (testIDs, TrustChips
  where applicable), bundle selection in the existing booking flow,
  `mobile.bundles.*` keys in customerB.ts.

### Slice 5 — Seeds

- Pre-built packages from our_galaxy_of_beauty §3.1 (Arabic-first,
  mapped to real seeded service ids, upsert-by-slug so re-seeds are
  idempotent):
  1. الباقة الذهبية Golden — مانيكير + بديكير + تنظيف بشرة (~19%)
  2. باقة العروس Bridal — مكياج + تسريحة + حناء + تنظيف بشرة (~17%)
  3. باقة السهرة Evening — مكياج + تسريحة + مانيكير (~15%)
  4. باقة الاسترخاء Spa — مساج + تنظيف بشرة + بديكير (~15%)
  5. باقة العناية Care — قص شعر + صبغ + بروتين (~17%)
- Plus one seasonal bundle (`season: EID` or `WEDDING`) to exercise the
  #262 season filter end-to-end.

## Out of scope (parked)

- Customer-saved custom bundles (v1 quote is booking-time only).
- True multi-technician scheduling across a bundle's services.
- Subscription/plan interaction with bundles (2.2 shipped; leave untouched).
- Group packages (§3.3) — separate feature.

## Acceptance

- [ ] `get`/`update`/`delete`/`quote` live + tested; quote tiers matrix green
- [ ] Bundle booking: one slot, sequential services, breakdown shows bundle
      savings; addons still compose
- [ ] Web catalog + detail with savings badges, ar/en, entry points wired
- [ ] Mobile list + detail + booking bundle select
- [ ] Seeds idempotent, 5+1 packages visible in the catalog
- [ ] CI 9/9 across the chain; router/procedure expectations updated
