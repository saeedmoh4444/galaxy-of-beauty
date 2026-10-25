# Vendor Dashboard Enhancement Program — Galaxy of Beauty (v2)

> Companion to `VENDOR_AREA_PLAN.md` (route separation, #429). That plan gave the
> vendor area a professional shell; this program professionalizes everything
> _inside_ it — turning the portal into a **vendor operating system** where a
> Saudi store / clinic / gym / nail-bar / at-home salon runs its business on
> Galaxy of Beauty.
>
> Status: **WAVES 0–6 DELIVERED** (2026-10-25, master `df4a5976`) — the vendor
> dashboard enhancement program is COMPLETE. Delivery record: §7.1.

---

## 0. Executive summary

The vendor foundation (TOP10 Phase 1 S1–S5) is functional but MVP-grade: one
1,770-line component, untyped rows, unpaginated queries, an order model with no
line items, and a live money-integrity race in `fulfillOrder`. This program
rebuilds the portal as a layered, typed, event-driven vendor OS across **8
phases / ~28 features / ~26–30 PRs**, in 6 waves:

| Wave | Phase                                       | Scope                                                                                         | PRs |
| ---- | ------------------------------------------- | --------------------------------------------------------------------------------------------- | --- |
| 0    | Hotfix                                      | `fulfillOrder` idempotency (double-payout race)                                               | 1   |
| 1    | A — Foundations                             | decomposition, shared types, tabbed IA, E2E, query hygiene                                    | 5   |
| 2    | B — Orders & Money                          | order line items, lifecycle, inventory, settlements, disputes, ZATCA                          | 6   |
| 3    | C — Catalog                                 | editor pro, approval pipeline, deals, coupons, CSV import, storefront                         | 6   |
| 4    | D — Analytics & AI                          | read-model analytics, health score, AI advisor, exports, KSA calendar                         | 5   |
| 5    | E — Verticals & reputation                  | gym/clinic/nail-bar/at-home consoles, reputation hub, CRM-lite                                | 5   |
| 6    | F — Communication & growth · G — Onboarding | inbox, digests, WhatsApp, SEO, review requests · wizard persistence, resubmission, KYC expiry | 8   |

Every feature follows the platform's own playbook: bounded-context boundaries
(brain_code), test tiers (risk-matrix), expand-contract migrations
(migration-standards), money-integrity transactions, bilingual-first UI,
web-first dashboards.

---

## 1. Mandate & context

- **Foundation done** (#389–#391 + wave): `/store` shell, public storefronts,
  commission settlements with admin rate editor, per-type provider
  registration with KSA KYC, trust flags, order-based analytics snapshot.
- **Platform direction** demands more: TOP10 Phase 4 ("store/marketplace
  analytics views"), ENHANCEMENT_PLAN Phase 4 (vendor BI, MRR/ARPU/RFM), the
  store plan's Phase 3–4 (statements, refunds, ratings, promotions polish),
  and the platform moat — **trust** (verified providers) and **AI**
  (advisor-class features).
- **The honest gap** (§2) is the starting point; §3 fixes the _how_ before the
  _what_.

## 2. Current-state audit

| Area          | Today                                                                                                                                                   | Verdict   |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| Route shell   | `(vendor)` auth + `(vendor)/(owner)` ownership by placement, legacy redirect                                                                            | SOLID     |
| Portal UI     | 1 monolith file (`components/vendor/VendorPortal.tsx`, 1,770 lines), 6 dashboards inline, all code ships on every vendor route                          | WEAK      |
| Types         | `Record<string, unknown>` casts throughout (web + mobile)                                                                                               | WEAK      |
| Orders        | List + fulfill. **No line items** (`itemCount` only), no detail view, no cancel, no stock decrement, **no idempotency on fulfill (double-payout race)** | DEFECT    |
| Money         | `earnings` = raw Payout rows. No statement aggregation, no CSV, no store ZATCA invoices (booking-scoped only), no dispute surface for vendors           | PARTIAL   |
| Catalog       | Add/delete product, single image. No edit, gallery, stock mgmt, listing approval (store plan §1 wanted it), coupons, bulk import                        | PARTIAL   |
| Deals         | Propose + list. No lifecycle, early end, or per-deal performance                                                                                        | PARTIAL   |
| Analytics     | Static snapshot only. No time series, cohorts, utilization, or exports                                                                                  | WEAK      |
| Verticals     | Clinic slots/consultations, gym classes, nail-bar slots, at-home requests — basic ops only                                                              | PARTIAL   |
| Reputation    | `ratingAvg` displayed. No review list, merchant reply, or alerts                                                                                        | MISSING   |
| Communication | Approval notifications only. No inbox, digests, or review requests                                                                                      | PARTIAL   |
| Onboarding    | One-shot wizard. No persistence/resume, resubmission, or KYC-expiry handling                                                                            | PARTIAL   |
| Query hygiene | `orders`/`myProducts` unpaginated (`findMany` no `take`)                                                                                                | WEAK      |
| Mobile        | Browse-only storefronts — by design (store plan §3)                                                                                                     | BY DESIGN |
| E2E           | Routing/auth assertions only                                                                                                                            | WEAK      |

### Live defects found during audit (fix first)

1. **D1 — `fulfillOrder` double-payout race** (`vendorPortal.ts:240-283`): the
   `FULFILLED` guard reads _before_ the `$transaction`; two concurrent
   fulfillments both accrue a Payout. 🔴 money-integrity.
2. **D2 — Unbounded vendor queries**: `orders`, `myProducts` return full
   tables with no pagination. 🟠 completeness.
3. **D3 — Stock is display-only**: fulfillment never decrements stock;
   storefront never hides stock-0 products. 🟡 functional.
4. **D4 — Listing approval gap**: store plan §1 mandates admin approval for
   product listings; products publish instantly. 🟠 completeness (regulatory).

## 3. Target architecture & engineering standards

### 3.1 Layered architecture (per brain_code — feature-driven, domain-modular)

```
UI (per-type dashboard modules, lazy)          apps/web/src/components/vendor/{type}/
   ↓ typed contracts (A2)
Hooks / query layer                             apps/web/src/hooks/vendor/
   ↓ tRPC (one router: vendorPortal; extend, don't add routers)
Domain services (when a router exceeds ~150 lines → extract)
   packages/api/src/services/{vendor,storeAnalytics,...}
   ↓ Prisma ($transaction for every money mutation)
PostgreSQL + BullMQ (materialization, digests, notifications)
```

Rules:

- **Bounded contexts**: vendor-facing features touch `vendor`, `marketplace`,
  `payments`, `analytics`, `notifications` contexts. A feature lives in ONE
  context; cross-context work happens via existing routers (reuse
  `payouts.*`, `providerReview.*`, `uploads.*` — never fork them).
- **Router growth**: extend `vendorPortal` with procedures. New routers only
  when a clean domain boundary demands it (router-inventory gate = 266 —
  bump only then).
- **Service extraction threshold**: when a router file passes ~150 lines of
  domain logic, extract `packages/api/src/services/<domain>.ts` (pure,
  unit-testable, no tRPC imports).

### 3.2 Patterns catalogue (the "how" of every feature)

| Pattern                                                                                                                                                                                                                                    | Where applied                                     |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------- |
| **Idempotency keys + conditional updates** — money mutations take an idempotency key and use `updateMany({ where: { id, status: FROM } })` inside the `$transaction`; `count === 0` → already done                                         | B-fulfill, B-cancel, C-coupon redemption, payouts |
| **CQRS-lite read models** — time-series analytics are materialized into a `VendorDailyStat` table by a nightly BullMQ job; the dashboard never scans raw orders                                                                            | D1                                                |
| **Event taxonomy** — one `notifications` event per business moment (`order_placed`, `order_fulfilled`, `payout_processed`, `low_stock`, `review_left`, `submission_decided`); inbox (F1), digests (F2), review requests (F5) all subscribe | B–F                                               |
| **Expand–contract migrations** — additive first (`StoreOrderItem`, `ProductReview.replyJson`, `ZatcaInvoice.storeOrderId`, `PromoCode.vendorId`), backfill via migration/worker, drop old shapes in a later PR (migration-standards.md)    | B, E, C                                           |
| **Feature flags** — `VENDOR_FEATURES` map in `packages/api/src/config` gates approval-strictness (C2), advisor (D3), inbox (F1) so features ship dark and flip per-store                                                                   | C2, D3, F1                                        |
| **Cursor pagination** — `take + cursor` on every vendor list (`orders`, `myProducts`, reviews, payouts)                                                                                                                                    | A5                                                |
| **Ownership-guard helper** — `requireVendor(ctx)` returns the caller's Vendor or throws `NOT_FOUND`; every vendor procedure starts with it (today guards are copy-pasted)                                                                  | A2                                                |
| **TRPCError taxonomy** — `NOT_FOUND` (no store), `FORBIDDEN` (not owner), `BAD_REQUEST` (state machine violated), `PRECONDITION_FAILED` (needs approval), `TOO_MANY_REQUESTS` (rate limit)                                                 | A2, all                                           |

### 3.3 API conventions

- zod schemas on every input; no `any`; shared input types in
  `packages/api/src/types/vendor.ts`.
- Money as `Decimal` in the DB, `number` (SAR, 2dp) at the edge; locale
  formatting (`ar-SA` / `en-GB`) in the UI only.
- Dates: noon-UTC discipline for day bucketing (existing gotcha).
- Every list: `limit ≤ 100`, cursor, total count, `orderBy` fixed.
- Mutations return the changed entity (or `{ success, id }`) — never rely on
  a refetch-only contract.

### 3.4 UX & design standards (Rose Blush system, RTL-first)

- **RTL-first**: every new screen verified in `ar` first — tab order, drawer
  slide direction, numeric formatting (`ar-SA` numerals where the platform
  already uses them).
- States: skeleton → data → empty (with next action) → error (ErrorAlert) —
  on every tab (the platform's polish standard).
- Design tokens only (`rose`/`violet` palette already in use); no new hex
  values; dark-mode classes from the start (regex guard `(?!dark:)`).
- a11y: axe gate on new components; focus traps in drawers/modals; 44px
  touch targets; `role="tablist"` semantics for A3.
- Bundle: per-type `next/dynamic` (A1); FE-007 budget (100–150 KB/route
  target) tracked in `size-baseline.json`.

### 3.5 Security & money-integrity rules (audit taxonomy 🔴 bucket)

1. Every money mutation: idempotency key + conditional update + single
   `$transaction`. No exceptions.
2. Ownership is server-side, always (`vendorId` in the `where` clause) —
   never trust a client-sent id.
3. KYC documents: presigned, expiring URLs only (existing `uploads` pattern);
   never readable cross-user.
4. Vendor rate limits: `TOO_MANY_REQUESTS` on product/deal/fulfill mutations
   (abuse protection for the marketplace).
5. Admin approval remains the regulatory backstop (C2 restores it for
   listings; never bypassable from the portal).

## 4. Data model evolution (expand–contract)

| Model                | Change                                                                                                    | Phase |
| -------------------- | --------------------------------------------------------------------------------------------------------- | ----- |
| `StoreOrderItem`     | **new** — orderId, productId, nameSnapshot Json, priceSnapshot, quantity                                  | B1    |
| `StoreOrder`         | + `statusHistory Json?` (or `StoreOrderEvent` table if >3 events)                                         | B2    |
| `Product`            | + `lowStockThreshold Int @default(5)`                                                                     | B3    |
| `ProductReview`      | + `replyJson Json?`, `repliedAt DateTime?`                                                                | E4    |
| `ZatcaInvoice`       | + `storeOrderId Int? @unique` (booking path unchanged)                                                    | B6    |
| `PromoCode`          | + `vendorId Int?` + index; ownership rules in `payments`                                                  | C4    |
| `VendorDailyStat`    | **new** — vendorId, date, revenue, orders, aov, newCustomers, returns, per-product Json (CQRS read model) | D1    |
| `VendorHealth`       | **new (or computed)** — composite score snapshot + factors Json                                           | D2    |
| `Dispute`            | reuse as-is (`storeOrderId` exists) — add vendor response fields `vendorResponse Json?`, `respondedAt`    | B5    |
| `HomeServiceRequest` | + `declinedAt`/`declineReason` (accept/decline flow)                                                      | E3    |

Migrations: `pnpm db:migrate:dev` + `pnpm db:generate` per project rules;
additive-only per PR; backfill jobs where history matters (D1 seeds from
existing orders).

## 5. The program — phases & features

Each feature card: **Why** (platform tie) → **Design** (UI + API) → **Schema**
→ **Acceptance** → **Tests** → **Effort**.

---

### Phase 0 — Hotfix (1 PR) — fix the live defect first

**H0 — `fulfillOrder` idempotency + atomic transition.**
Why: live double-payout race (§2 D1) — the platform's money-integrity rule #1.
Design: move the status check into the transaction as a conditional
`updateMany({ where: { id, vendorId, status: 'PENDING_FULFILLMENT' } })`;
`count === 0` → throw `BAD_REQUEST` "already fulfilled"; payout accrual only
when the update won. Add `idempotencyKey String?` input, ignored if the
order is already FULFILLED (return current state).
Tests: `store-settlement.test.ts` — two concurrent fulfills → exactly one
Payout row. **Effort: S.**

---

### Phase A — Foundations (5 PRs, S–M)

**A1 — Portal decomposition + lazy loading.**
Split `VendorPortal.tsx` → `components/vendor/{store,clinic,gym,nail-bar,athome,shared}/`;
each type dashboard is `next/dynamic`. Shared kit: `KpiCard`,
`PendingReviewBanner`, `DocUploadInput`, `VenueProfileCard`, `DealModal`,
`StatusChip`. Pure refactor — zero behavior change.
Acceptance: existing E2E green; `/store` chunk size before/after recorded.
**Effort: M.**

**A2 — Shared typed contracts + ownership helper.**
`packages/api/src/types/vendor.ts` (`VendorDashboard`, `PortalProduct`,
`StoreOrderRow`, `DealRow`, `PayoutRow`, `AnalyticsPoint`, …) exported from
the api package; mobile's local `VendorDashboard` interface merges in.
`requireVendor(ctx)` helper replaces copy-pasted guards across `vendorPortal`.
Acceptance: `rg "Record<string, unknown>"` empty in vendor surfaces; 3×
type-check green. **Effort: S–M.**

**A3 — Portal IA: tabbed workspace.**
`/store` tabs: Overview / Orders / Products / Deals / Earnings / Analytics /
Reviews / Inbox. A3 wires Overview + Orders + Products + Deals; later phases
mount the rest. Full state coverage + RTL verification per tab.
Acceptance: store-dashboard E2E extended for tab navigation; axe green.
**Effort: M.**

**A4 — E2E contracts for real flows.**
Add product → appears; fulfill order → payout row in Earnings; propose deal →
pending chip; trust toggles; pending-review banner for unverified store.
Acceptance: CI E2E green (CI is the authority — no local E2E debugging).
**Effort: S.**

**A5 — Query hygiene: pagination + rate limits.**
Cursor pagination (`take ≤ 100`) on `orders`, `myProducts`; totals returned.
Rate limits on product/deal/fulfill mutations (Redis counter via ioredis 6).
Acceptance: API tests for cursor stability + limit enforcement.
**Effort: S.**

---

### Phase B — Orders & Money (6 PRs, M–L) — money-integrity tier

**B1 — Order line items (schema).**
Why: no items = no detail, no stock integrity, no ZATCA line items.
Design: `StoreOrderItem` model; `placeStoreOrders`
(`packages/api/src/lib/storeCheckout.ts`) snapshots name/price/quantity per
item at checkout. Backfill existing orders from cart history where possible.
Acceptance: store-checkout tests extended; settlement math unchanged.
**Effort: M.**

**B2 — Order lifecycle.**
Design: order drawer — line items (B1), totals incl. VAT label, customer
name + phone with `wa.me/966…` deep link, status timeline
(PLACED → PENDING_FULFILLMENT → FULFILLED / CANCELLED), cancel-before-
fulfillment (no payout accrued yet → no reversal). Cancellation restores
stock + sales in the same transaction (reversing the checkout-time
decrement in `placeStoreOrders`). Status transitions via the H0
conditional-update pattern.
Acceptance: state-machine tests for every legal/illegal transition.
**Effort: M.**

**B3 — Inventory integrity.**
Design (corrected at B0 implementation — stock decrements at CHECKOUT,
not at fulfillment): `placeStoreOrders` already decrements stock and
rejects insufficient stock. B3 closes the visibility gaps: stock-0
auto-hides from storefront queries; low-stock threshold per product →
Overview alert + `low_stock` event (F1).
Acceptance: storefront hides stock-0 (storefront test); low-stock
threshold tests.
**Effort: M.**

**B4 — Earnings & settlement center.**
Design: statement view — payout rows with gross/net/fee (commissionRate
visible), status timeline (PENDING → PROCESSED), period summary cards, CSV
export. Extends `vendorPortal.earnings`, reuses `payouts.listStorePayouts`.
Acceptance: aggregation + export tests (AR/EN headers).
**Effort: M.**

**B5 — Disputes & refunds (vendor side).**
Why: `Dispute.storeOrderId` already exists — vendors have no surface for it.
Design: Orders tab shows open disputes on the order; vendor responds
(`vendorResponse` + evidence via `uploads.uploadMedia`); admin resolves as
today. Post-fulfillment refunds: payout reversal + MyFatoorah refund call —
⛔ gated on `FATOORAH_API_TOKEN`; design recorded, implementation queued.
Acceptance: dispute lifecycle tests (vendor response → admin resolve).
**Effort: M (view+response) / L with refunds.**

**B6 — Store ZATCA invoices.**
Why: compliance — store sales must be invoiceable like technician bookings.
Design: `ZatcaInvoice.storeOrderId` nullable; Invoices tab: list, QR, status,
download. ⛔ **BLOCKED-ON-USER (FATOORAH_API_TOKEN)** — schema + UI ship
inert behind the flag; invoice generation activates with the token.
**Effort: M (schema/UI), gated.**

---

### Phase C — Catalog & Merchandising (6 PRs, M)

**C1 — Product editor pro.**
Edit (name/price/stock/emoji/category), multi-image gallery
(`Product.images[]` + `uploads.uploadMedia`), bilingual completeness meter
(ar/en name + description), draft/archive toggle, duplication ("create
similar").
Acceptance: ownership-guarded update tests; E2E edit + gallery flow.
**Effort: M.**

**C2 — Listing approval pipeline (regulatory).**
Why: store plan §1 mandates admin approval for listings; currently instant
publish (§2 D4).
Design: new products → `ProviderSubmission` kind `'product'` (kind exists in
`providerReview`) → admin approve/reject → live. Portal shows per-product
status chip (under review / live / rejected + note). Feature flag:
strict (every listing gated) vs relaxed (verified stores publish instantly) —
**user decision at kickoff** (flags make either cheap).
Acceptance: approval-suite tests mirroring clinic/gym suites.
**Effort: M.**

**C3 — Deals studio.**
Lifecycle status (pending/active/ended/expired) + window dates, end-deal-
early, per-deal sales during window, edit-while-pending, deal templates for
Ramadan/Eid (feeds D5).
Acceptance: store-deals tests extended for lifecycle transitions.
**Effort: M.**

**C4 — Store coupon codes.**
Why: `PromoCode` exists, admin-global only — per-store coupons are the
standard marketplace merchandising loop.
Design: `PromoCode.vendorId` nullable; vendor creates percent/fixed codes
scoped to their store (min order, max uses, validity); redemption validates
store scope in `payments`; admin can pause any code. Approval: reuse the
submission queue (kind `'promotion'` exists) — same decision as C2.
Acceptance: redemption tests incl. cross-store rejection; usage counts.
**Effort: M.**

**C5 — Bulk product import (CSV).**
Why: real merchants onboard catalogs of dozens of products — manual add
doesn't scale.
Design: CSV template download → upload → BullMQ import job (validate rows →
create draft products → report per-row errors) → import report in portal.
Uses the worker queue (`maxRetriesPerRequest: null` config).
Acceptance: import job tests (valid/invalid rows, duplicates, error report).
**Effort: M.**

**C6 — Storefront profile, featured & store QR.**
Design: About editor (`descriptionJson`), featured picker (`isFeatured`
order), store QR code (physical-store discovery — mirrors the
service-menu QR concept) rendered client-side, downloadable.
Acceptance: storefront test asserts About + featured order on `/stores/[slug]`.
**Effort: S.**

---

### Phase D — Analytics & AI (5 PRs, M) — the platform's AI moat

**D1 — Vendor analytics center (read-model).**
Why: TOP10 Phase 4 explicitly asks for store analytics; static snapshot
doesn't answer business questions.
Design: `VendorDailyStat` materialized nightly by BullMQ (revenue, orders,
AOV, new vs returning customers, per-product sales, per-day bucket —
noon-UTC discipline); dashboard reads only the read model. Series: 7/30/90d
revenue + orders, top products with trend, status funnel, AOV trend;
verticals: slot fill (clinic/nail-bar), class occupancy (gym).
Acceptance: materialization-job tests (idempotent re-runs, backfill from
orders); series shape tests. **Effort: L.**

**D2 — Store health score.**
Why: trust is the platform moat — give vendors a measurable, honest mirror
of it (and later surface it to shoppers).
Design: composite score (0–100) from fulfillment speed, cancel rate, review
trend, stock health, response rate (post-F1); factors + improvement hints
shown on Overview; admin sees the same score in `/admin/vendors`.
Acceptance: score-composition unit tests (thresholds, decay).
**Effort: M.**

**D3 — AI store advisor.**
Why: the platform's AI moat applied to the seller side (VISIONARY Phase 3
"AI ops").
Design: rule-based v1 ships immediately (no LLM): restock suggestions (stock
vs sales velocity), expired-deal nudges, weekend-peak hints, AOV-drop flags;
weekly digest via BullMQ job + advisor card on Overview. LLM layer
(plain-language explanations, Arabic copy suggestions) ⛔ gated on the
OpenAI key.
Acceptance: rule-trigger unit tests; digest job tested.
**Effort: M (v1) / L (LLM layer, gated).**

**D4 — CSV exports.**
Orders / earnings / products / (analytics series) one-click export, AR/EN
headers, decimal locale correctness.
**Effort: S.**

**D5 — KSA calendar & seasonality.**
Why: Saudi consumer calendar drives beauty commerce (ENHANCEMENT_PLAN
Phase 6).
Design: Hijri date overlay on analytics (Umm al-Qura), Ramadan/Eid/National
Day markers on series; seasonal deal templates (feeds C3); at-home request
heat by prayer-time blocks.
Acceptance: calendar-helper tests (Hijri conversion, marker windows).
**Effort: S–M.**

---

### Phase E — Verticals & Reputation (5 PRs, M)

**E1 — Gym membership console.**
Plans list (`SubscriptionPlan.gymId`), enrolled members, day-pass sales,
class occupancy per class; plan editing stays admin (regulatory).
**Effort: M.**

**E2 — Clinic console deepening.**
Package list + proposal via `ProviderSubmission` kind `'clinic_package'`,
no-show / cancel-reason tracking on consultations, slot utilization series
(feeds D1). **Effort: M.**

**E3 — Nail-bar & at-home ops.**
At-home: request queue accept/decline (`HomeServiceRequest` PENDING,
`declinedAt`/`declineReason`), completion confirmation; nail-bar: capacity
analytics (slots filled % per day, feeds D1).
**Effort: M.**

**E4 — Reputation hub.**
Reviews tab: `ProductReview` list + merchant reply (`replyJson` +
`repliedAt`), rating trend sparkline, 1-star alert (feeds F1 inbox),
reply-rate shown in the health score (D2).
Acceptance: reply ownership tests; vendor-rating suite extended.
**Effort: M.**

**E5 — CRM-lite: repeat customers.**
Why: ENHANCEMENT_PLAN 4.1 RFM — know your best buyers.
Design: customers tab — top spenders, repeat rate, last-order date, orders
count (aggregate only — no raw PII beyond name/phone already on orders);
"send review request" action (feeds F5).
Acceptance: aggregate-shape tests; no-PII-leak test.
**Effort: S–M.**

---

### Phase F — Communication & Growth (5 PRs, S–M)

**F1 — Vendor inbox.**
Notification-center tab: approval decisions, new orders, payouts processed,
low-stock, review alerts, dispute updates — reusing the notifications
domain; unread badge in portal nav + sidebar. Depends on event emissions
from B3/B4/E4/B5.
**Effort: M.**

**F2 — Weekly email digest.**
Vendor receives a weekly performance email (revenue, top product, stock
alerts, advisor picks) via the notifications domain — verify email-provider
wiring at implementation (SES/SendGrid — user-gated if not configured).
**Effort: S–M.**

**F3 — WhatsApp touchpoints.**
Order confirmation / fulfillment notices to vendor + customer via WhatsApp
Business API. ⛔ **BLOCKED-ON-USER (WhatsApp Business API).**
**Effort: M (gated).**

**F4 — Storefront SEO & metadata.**
Per-store `generateMetadata` (name/description — server wrapper per the Q6
SEO pattern), breadcrumbs, canonical, `og:image` = banner; verified badge +
trust flags already surface.
Acceptance: metadata tests mirror the existing per-page suite.
**Effort: S.**

**F5 — Post-fulfillment review requests.**
On fulfill → notification to customer ("rate your purchase") with a deep
link to the product review form (reuses notifications domain); cooldown per
customer-product pair. **Effort: S.**

---

### Phase G — Onboarding Excellence (3 PRs, M)

**G1 — Wizard persistence & resume.**
Why: a dropped KYC wizard loses everything today (trust-first onboarding is
the first vendor experience).
Design: draft persisted per step (localStorage first; server draft if
cheap); resume banner on `/vendor-portal`; step completeness checklist.
**Effort: M.**

**G2 — Submission status & resubmission.**
Why: PENDING_REVIEW is a black box; rejects currently dead-end.
Design: status page — timeline (submitted → under review → approved /
rejected), admin review note shown, resubmit flow (edit payload → new
submission), expected-SLA hint. Backend: extend `providerReview.list` with
caller-scoped view or a `vendorPortal.mySubmissions` procedure.
Acceptance: resubmission lifecycle tests.
**Effort: M.**

**G3 — KYC document expiry reminders.**
CR/license expiry date captured at onboarding → 60/30/7-day reminders
(notification + inbox) → re-upload flow (existing `uploadKycDocument`).
Acceptance: reminder-job tests. **Effort: S–M.**

---

### Phase H — Decision-gated extensions (documented, not scheduled)

- **H1 — Store staff accounts**: multiple humans per store (owner + staff
  with scoped permissions). Requires a deliberate extension of the
  role-less ownership model (`VendorStaff` table, not a UserRole) — the
  architecture doc's invariant governs. **User decision required.**
- **H2 — Hybrid salons**: stores that also offer bookable services (the
  store plan §5 deliberately kept this door open). Big scope — service
  catalog ownership moves partially to vendors. **Not before Waves 0–6.**
- **H3 — Delivery integration**: carrier handoff for store fulfillment
  (store plan §5 risk). **Requires a delivery partner (user-gated).**

---

## 6. Quality program

### 6.1 Per-PR gate checklist

- [ ] type-check ×3 apps (real turbo type-check, not `rtk tsc`)
- [ ] per-app lint + prettier · husky batch limits respected
- [ ] unit tests: new feature test file FIRST (TDD); router tests for every
      procedure; service tests for extracted logic
- [ ] E2E where the phase defines it (CI is the authority)
- [ ] axe gate for new components · static-Arabic gate · i18n key
      completeness (AR/EN in canonical files)
- [ ] orphaned-routes (M7) if routes move · router-inventory if a router is
      added · size-baseline recorded (A1, each wave)
- [ ] `pnpm db:generate` after schema changes · migrations expand-contract
- [ ] docs: `store-provider-system.md` + `brain_code.md` refreshed on every
      architecture-touching PR (A1/A2/B1/B6/D1/H*)

### 6.2 Test tiers (per docs/testing/risk-matrix.md)

| Tier                      | Features                                                                                 |
| ------------------------- | ---------------------------------------------------------------------------------------- |
| T1 — pure unit            | calendar helpers (D5), score composition (D2), advisor rules (D3), import validator (C5) |
| T2 — router/service (API) | every new procedure: happy path + ownership + state machine + idempotency + rate limit   |
| T3 — integration          | money paths: H0, B3 stock boundaries, B4 statements, C4 redemption, B5 disputes          |
| T4 — E2E smoke            | A4 flows, B2 drawer, C1 editor, F1 inbox badge                                           |

### 6.3 Observability

- Sentry spans on every vendor mutation (op names `vendor.*`) — the platform
  already runs Sentry 11; extend `captureException` at router boundaries.
- BullMQ: one queue per job family (import, digest, materialization) with
  failure counts in Sentry; `maxRetriesPerRequest: null` config everywhere
  (existing gotcha).
- SLIs per vendor flow (p95 fulfill latency, fulfillment error rate,
  materialization lag < 24h) — the admin ops view can consume them later.

### 6.4 Security checklist (per PR)

Ownership in `where` clauses · idempotency on money mutations · zod on all
inputs · presigned KYC URLs only · rate limits on public-touching mutations
· no client-trusted ids · approval pipeline never bypassable (C2) · dispute
evidence visibility scoped to order parties + admin.

## 7. Execution roadmap

1. **Wave 0** — H0 hotfix (ships immediately on "start work" — it's a live
   money defect).
2. **Wave 1** — A1 → A2 → A3 → A5 → A4 (foundations; every later feature
   builds on types + tabs + pagination).
3. **Wave 2** — B1 → B3 → B2 → B4 → B5 (B6 gated). Money tier: strictest
   review.
4. **Wave 3** — C1 → C3 → C6 → C4 → C5 → C2 (C2/C4 need the approval
   decision; flags default to relaxed).
5. **Wave 4** — D1 → D2 → D4 → D5 → D3 (D1's read model unblocks D2/D3).
6. **Wave 5** — E4 → E5 → E1 → E2 → E3 (E4/E5 first: they feed inbox +
   health score).
7. **Wave 6** — F1 → F5 → F2 → F4 → G1 → G2 → G3 (F3 gated).

≈ 26–30 PRs, 7 waves, ~6–9 working sessions. Each wave closes with all
gates green + docs refreshed, merging via the established CI-green
convention.

### 7.1 Delivery record (waves 0–6 complete)

| Wave | PRs                                                                             | Notes                                                                                                                      |
| ---- | ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| 0    | H0 #430                                                                         | double-payout race killed                                                                                                  |
| 1    | A1 #431 · A2 #433 · A3 #434 · A5 #438 · A4 #437 · B0 #432 · B3a #435 · B2a #436 | foundations + order items + stock hiding + cancelOrder                                                                     |
| 2    | B1 #447 · B3b #448 · B4 #449 · B5 #450                                          | line items UI, low-stock alerts, earnings center, disputes                                                                 |
| 2    | B6 — **SKIPPED by user** (2026-10-13: no FATOORAH_API_TOKEN)                    | schema/UI ship inert when the token lands                                                                                  |
| 3    | C1 #452 · C2 #454 · C3 #465 · C4 #471 · C5 #472 · C6 #470                       | editor pro, approval pipeline, deals studio, coupons, CSV, QR                                                              |
| 4    | D1 #473 · D1b #474 · D2 #475 · D3 #476 · D4 #477 · D5 #478                      | read-model analytics, health score, advisor, exports, KSA calendar                                                         |
| 5    | E4 #480 · E5 #481 · E1 #482 · E2 #483 · E3 #485                                 | reviews hub, CRM-lite, gym console, clinic deepening, at-home queue + nail-bar capacity                                    |
| 6    | F1 #487 · F5 #492 · F2 #488 · F4 #489 · G1 #490 · G2 #491 · G3 #493             | inbox + events, review requests, digest email, storefront SEO, wizard persistence, submissions/resubmit, license reminders |
| —    | #469 dependabot · #484 ci-fix                                                   | housekeeping · image-URL gate picsum resilience                                                                            |

Wave 6 is delivered — the vendor dashboard enhancement program is
COMPLETE (Waves 0–6, 2026-10-25). Open decisions §9 items 3–5 remain
default-resolved as recorded (vendor-only health score, autonomous
coupons + admin pause, H1 deferred). F3 stays BLOCKED-ON-USER
(WhatsApp Business API); F2's email channel degrades to log-only
until the SMTP provider is wired (§8).

## 8. User-gated dependencies (queue — not blockers)

| Gate                  | Unblocks                                                            | Where  |
| --------------------- | ------------------------------------------------------------------- | ------ |
| FATOORAH_API_TOKEN    | B5 refunds, B6 store ZATCA invoices                                 | Wave 2 |
| OpenAI key            | D3 LLM advisor layer (rule v1 ships without it)                     | Wave 4 |
| WhatsApp Business API | F3                                                                  | Wave 6 |
| Email provider config | F2 (ships log-only; wiring the SMTP provider re-enables real sends) | Wave 6 |

## 9. Open decisions (answered at kickoff — flags make them cheap to flip)

1. **C2 listing approval strictness**: strict (every product gated) vs
   relaxed (verified stores publish instantly) — default: relaxed + flag.
2. **C4 coupon approval**: admin-reviewed like deals, or vendor-autonomous
   with platform limits — default: autonomous with limits + admin pause.
3. **D2 health score visibility**: vendor-only vs also surfaced on
   storefronts — default: vendor-only first.
4. **H1 store staff accounts**: schedule now (Wave 7+) or defer — default:
   defer.
5. **F2 email provider**: SHIPPED log-only (2026-10-25) — `sendEmail`
   degrades to a console log when SMTP is unconfigured, so the digest
   job runs without the provider. Wiring real credentials (SES/SendGrid)
   upgrades it to actual sends with no code change.

## 10. Non-goals (scope discipline)

- No VENDOR user role (architectural invariant — H1 is the sanctioned path
  if staff accounts are ever wanted).
- No mobile vendor dashboards — web-first (store plan §3).
- No delivery/logistics integration (H3, partner-gated).
- No revival of the `salonManagement` / `franchisePortal` in-memory mocks.
- Hybrid store-services (H2) — the Waves 0–6 gate is now open; schedule
  deliberately.
- Admin-side vendor pages touched only where C2/D2 require.
