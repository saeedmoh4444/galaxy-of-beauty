# C5 — Hybrid Store-Services (H2) — Mini-Plan

> Flagship item of Wave C (VENDOR_PROFESSIONALIZATION_PLAN §3). The H2
> gate is open: stores that also sell bookable services, reusing the
> existing booking engine instead of building a parallel one.
>
> Status: **DELIVERED** (2026-10-28) — all 8 slices built and merged
> (#531 C5a · #532 C5b · #534 C5c · #535 C5d · #536 C5e · #537 C5f ·
> #538 C5g · #539 C5h — master `14dfea08`). §9 open questions resolved:
> store-service reviews reuse
> `ServiceReview` (vendor-scoped, later slice); commission = the
> vendor's `commissionRate` (C5g folds completed bookings into
> `calculateVendorSettlements`, gross = totalAmount − platformFee).

## 1. Goal

A store vendor can publish **bookable services** next to products:
customers book a time slot on the store's calendar, pay through the
existing checkout, and the booking flows through the existing
booking/fulfillment machinery with the store as the provider.

## 2. Non-goals (kept explicit)

- No per-store calendar UI rewrite — reuse the booking engine's
  availability model (slots).
- No separate service catalog — services gain a vendor owner; the
  existing service detail/booking pages work unchanged.
- No technician marketplace mapping in v1 — the STORE is the provider;
  staff mapping (A1) covers who fulfills.
- No same-day scheduling guarantees beyond the engine's existing rules.

## 3. Data model changes

- `Service.vendorId Int?` (nullable FK → Vendor, onDelete SetNull) —
  null = platform-owned service (today's rows).
- `Service.isStoreService Boolean @default(false)` — store-owned
  services filter into the storefront's Services tab and out of the
  general browse (unless featured by admin).
- `ServiceSlotOverride`? — NOT in v1; the booking engine's existing
  slot generation (technician availability) is reused via a **store
  pseudo-technician**: each store-owned service gets a hidden
  `Technician` row (userId = vendor owner's user, storeLinked) so the
  engine needs zero forks.
- `Booking.vendorId Int?` — denormalized provider link for the vendor
  dashboard's bookings surface + payout attribution.

## 4. API surface

- `vendorPortal.services` CRUD (create/update/deactivate store
  services; bilingual title/description/pricing reusing the service
  domain contracts) — ownership-guarded.
- `vendorPortal.storeBookings` — the vendor's bookings (their services),
  with the existing cancel/fulfill conventions.
- Booking engine: no new procedures; the store pseudo-technician makes
  the existing availability/booking queries work.

## 5. UI

- **Storefront**: a Services tab on the store page (web + mobile
  mirrors) listing store services with book CTAs into the existing
  booking flow.
- **Portal**: Services tab (list + editor + bookings view with the
  existing status chips).

## 6. PR breakdown (target ~8)

| PR  | Scope                                                                                    |
| --- | ---------------------------------------------------------------------------------------- |
| C5a | Schema + pseudo-technician provisioning + service CRUD (API) + tests                     |
| C5b | Booking flow integration: book a store service end-to-end (engine reuse proof) + tests   |
| C5c | Portal Services tab: editor + bookings list                                              |
| C5d | Storefront Services tab (web) + book CTA                                                 |
| C5e | Mobile storefront services mirror                                                        |
| C5f | Vendor bookings surface: statuses, cancel/fulfill, notifications (reuse order templates) |
| C5g | Payout attribution for store-service bookings + dashboard metrics                        |
| C5h | Polish: cancellation windows, availability limits, empty states, Arabic copy             |

## 7. Acceptance

- E2E: a seeded store service is bookable, appears in the vendor's
  bookings, and can be cancelled — on web and mobile.
- Tests: ownership guards, pseudo-technician isolation (a store's
  services never appear in other stores' availability), payout math.

## 8. Risks & mitigations

- **Engine coupling**: the pseudo-technician is a hack that must not
  leak — covered by the isolation test; document in brain_code.
- **Payout attribution**: store bookings must land in the store's
  payout rows, not technician settlements — explicit `vendorId`
  denormalization + tests.
- **Slots concurrency**: existing booking locks apply unchanged.

## 9. Open questions (decide during C5a)

- Store-service reviews: reuse ProductReview or ServiceReview? (lean:
  ServiceReview with vendor scoping.)
- Commission: store services use the vendor's commissionRate (not the
  technician split).
