# Store Marketplace Plan — Multi-Vendor Stores

> Status: **v1 — 2026-09-03**. User idea: allow stores (merchants) to register
> on the platform, upload their products, and manage them from their own
> dashboard. Extends the platform into a full multi-vendor beauty
> marketplace.

## 1. Architecture — one provider system, three types

Today technicians sell services and the vendor portal (in-memory mock) sells
products. Rather than a parallel "store" system, generalize to **one Provider
model with types**:

| Type               | Sells    | Today                           |
| ------------------ | -------- | ------------------------------- |
| `SERVICE_PROVIDER` | services | technicians (live)              |
| `STORE`            | products | NEW — this plan                 |
| `VENDOR`           | products | vendor portal (mock → absorbed) |

One registration + KYC + approval pipeline (the B.7 shared provider-submission
queue), one dashboard shell, one payout system — extended per type. This
avoids three separate half-features.

### Decisions (user-confirmed 2026-09-03)

- **Unified provider model** (not a separate store system)
- **Store-managed fulfillment in v1** (statuses: pending → fulfilled; no
  delivery integrations)
- **Admin approval for store registration AND product listings** (regulatory
  first line — beauty products may need approvals in KSA)

## 2. Phases

### Phase 1 — Store foundation (the door)

- `MERCHANT/STORE` provider type + registration wizard: business name,
  license/CR number, bank details (payouts), logo, bio
- Admin approval via the shared submission queue + KYC review screen
- Store dashboard v1 (web): product CRUD with image upload, price, stock;
  orders list; basic revenue
- Acceptance: a store registers → admin approves → store uploads a product →
  product visible in admin

### Phase 2 — Commerce (the storefront)

- Public store pages: logo, bio, rating, product grid (mirrors the
  `gallery/[technicianId]` pattern)
- Products flow through the existing marketplace cart/checkout (Payfort +
  cash already work)
- Multi-vendor orders: one cart, split per store, per-store order records,
  stock decrement on payment
- Acceptance: two stores' products in one cart → single checkout → two store
  order records, both stocks decremented

### Phase 3 — Finance (the money)

- Commission config per store/category (admin)
- Extend the payouts router to stores (technician-scoped today — the
  calculate/payout machinery is reusable)
- Store statements + refunds through the existing disputes flow
- Acceptance: a fulfilled store order accrues revenue minus commission → a
  payout row is generated

### Phase 4 — Trust & growth

- Store ratings/reviews, badges
- Store promotions through B.7 (the shared provider-submission system)
- Store analytics dashboard
- Mobile: store browsing in the customer app (store dashboards stay
  web-first)

## 3. Reuse map (what already exists)

| Need                       | Existing infra                                           |
| -------------------------- | -------------------------------------------------------- |
| Registration + approval    | technician KYC pipeline + B.7 submission queue           |
| Product catalog            | `VendorProduct` (planned in B.3 — widen to StoreProduct) |
| Cart / checkout / payments | marketplace + Payfort + cash (live)                      |
| Payouts / statements       | payouts router (technician-scoped, reusable machinery)   |
| Disputes / refunds         | disputes router                                          |
| i18n / themes / components | shared catalog + @galaxy/ui                              |
| Notifications              | notification infra (approval/rejection notices)          |

## 4. Sequencing relative to the current backlog

Build on top of, not before:

1. **B.3** vendor-portal DB persistence (product model + buy flow)
2. **B.6/B.7** provider-submission queue (the approval system this plan reuses)
3. Then Phase 1 → 2 → 3 → 4 of this plan

## 5. Open questions & risks

- **Regulatory**: which product categories need Saudi approvals? Admin
  moderation is the first line; legal review for cosmetics categories later.
- **Delivery**: store-managed v1; delivery-provider integration is
  partnership-gated (same class as ride-hailing — see MOBILE_FIX_PLAN §8).
- **Mobile store dashboards**: web-first; mobile later (customer app gets
  store browsing first).
- **Salon stores**: should a store later also offer services (becoming a
  hybrid salon)? The provider model allows it — keep the door open.
