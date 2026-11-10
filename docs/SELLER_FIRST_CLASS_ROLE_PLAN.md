# SELLER First-Class Role — Plan (2026-11-10)

**Decision (boss):** the Seller (store owner) becomes a first-class account role with its own registration option and a dedicated, more advanced dashboard — not just a customer-account upgrade.

**Current state:** 4 dashboards exist (admin `/admin/dashboard`, customer `/dashboard`, service provider `/tech/dashboard`, seller `/store`), but the seller is a `CUSTOMER`-role user with a `Vendor` record (`Vendor.userId @unique`), onboarded post-signup through the `/vendor-portal` application wizard. Registration offers only Customer + Service Provider.

**Why a role (not just UX):** role-gated access is the platform's existing authz vocabulary (`hasRole` middleware, rate-limit tiers, JWT claims, login routing). Keeping "seller" as a data flag forces every seller check through a DB lookup on the `Vendor` table; a role makes seller-ness a first-class claim like ADMIN/TECHNICIAN.

---

## 1. Architecture

- `UserRole` enum gains `SELLER`. The `Vendor` model and all store data stay untouched — the role is a claim, the `Vendor` row remains the store identity.
- **Sellers are also customers:** `customerProcedure` becomes `hasRole('CUSTOMER', 'SELLER')` — a seller can shop, book, and hold a wallet like anyone else. No fork of the customer area.
- **Seller-only gates:** new `sellerProcedure` / `sellerMutation` (`hasRole('SELLER')`) for store-management endpoints; existing ownership checks (`ensureVendor(userId)`, order/dispute owner checks) stay in place as defense-in-depth.
- **Backfill migration:** every existing user who owns a `Vendor` row gets `role = SELLER`. Existing sellers keep working identically after migration.
- **Transition safety:** `auth.login` keeps returning `hasVendor`; the web client routes `role === 'SELLER'` → `/store`, with the old `hasVendor` branch retained as fallback until the mobile wave catches up. Legacy `CUSTOMER`+`Vendor` accounts are fully honored by ownership checks (unchanged code path).
- **JWT:** role is a plain string claim — adding `SELLER` to the payload union is backward-compatible; old tokens decode fine.
- **Rate-limit tier:** sellers ride the `authenticated` tier (no new tier) — the tier table in `trpc.ts` keys off `ctx.user.role === 'ADMIN'` → admin, else authenticated. No change needed, but a test asserts it.

## 2. Phases

### Phase R — role plumbing (the enum everywhere it lives)

| Slice                                      | Content                                                                                                                                                                                                                                                                                                                                                                           |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **R1 schema + migration**                  | `UserRole` + `SELLER` in `schema.prisma`; hand-written migration: `ALTER TYPE "UserRole" ADD VALUE 'SELLER'` + `UPDATE users SET role='SELLER' WHERE id IN (SELECT "userId" FROM vendors)`; regenerate Prisma client; seed.ts creates the demo store owner with role `SELLER`. Tests: seed contract test, migration idempotency.                                                  |
| **R2 API gates**                           | `jwt.ts` payload union + `SELLER`; `trpc.ts`: `customerProcedure` accepts `CUSTOMER, SELLER`, new `sellerProcedure`/`sellerMutation` (csrf-guarded, tier authenticated); register schema accepts `SELLER`; `auth.login` returns `role` + keeps `hasVendor`. Tests: gate matrix (seller passes customer+staff-adjacent paths, fails admin), login routing payload, rate-tier test. |
| **R3 web + mobile registration & routing** | register form gains the Seller option (web `(auth)/register`, mobile `(auth)/register`); choosing Seller registers with `SELLER` and lands in the `/vendor-portal` wizard (store identity + KYC still required before trading); login routes `SELLER` → `/store`; `useAuth` role union; i18n `auth.role-seller` (ar/en, web + mobile catalogs).                                   |
| **R4 E2E + gates**                         | E2E: register-as-seller → wizard → dashboard journey; existing vendor specs re-run against a SELLER-role owner; `trpc-procedures.test.ts` router count only if new routers land (see Phase D); full ratchet (type-check, lint, size, axe, router-inventory).                                                                                                                      |

### Phase D — the advanced seller dashboard

The store shell (`(vendor)/(owner)/store`) gains a proper seller command center. Each slice = new router(s) → bump the "exactly 268 routers" gate per branch.

| Slice                              | Content                                                                                                                                                                                                         |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **D1 Analytics overview**          | `seller.analytics` router: revenue/orders over time, top products, order-status funnel, visits; KPI cards + charts in the store dashboard; seed-derived fixtures for tests; k6 smoke hits the summary endpoint. |
| **D2 Payouts & earnings**          | `seller.payouts` router: earnings summary (settled/pending), payout-request lifecycle; simulate-safe (no live Fatoorah); mirrors the admin payouts view with seller-scoped rows.                                |
| **D3 Inventory alerts**            | low-stock threshold per product, restock suggestions (best-sellers first), dismiss/snooze; badge on the Products tab.                                                                                           |
| **D4 Reviews inbox & store score** | seller-scoped reviews list with reply + report, store performance score (rating, response time, completion), and the completeness checklist (logo/bio/hours/KYC).                                               |

### Phase G — gates + docs

- Full seller-journey E2E (register → wizard → dashboard → first product → order → payout summary).
- i18n sweep for new keys; mobile mirror of D1 (the mobile vendor-portal already has orders/earnings/inbox/socials tabs — D1 lands as a new tab).
- Tracker + this plan merged; `PLATFORM_IMPROVEMENT_PLAN_2026.md` row for the seller role.

## 3. Risks & notes

- **Router-count gate:** every Phase-D router bumps `trpc-procedures.test.ts` ("exactly 268 routers") — bump in the same branch that adds the router (established recipe).
- **Mobile parity:** mobile register/login must ship in R3 with web, or the mobile app can't log in a SELLER (the login routing union gates on role).
- **Legacy owners:** the backfill makes every current store owner a SELLER; staff accounts (`VendorStaff`) are unchanged — they remain CUSTOMER-role users linked to the store.
- **KYC/approval flow untouched:** role ≠ approval. A SELLER without an approved `Vendor` stays in the wizard until KYC passes (same gates as today).

## 4. Execution order

Cascade (#605/#624) → board zero → **R1 → R2 → R3 → R4** (role fully live, one PR per slice, TDD) → **D1 → D2 → D3 → D4** → G → final tracker.
