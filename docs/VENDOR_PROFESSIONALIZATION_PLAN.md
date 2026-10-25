# Vendor Professionalization Plan — Galaxy of Beauty (v3)

> Companion to `VENDOR_DASHBOARD_ENHANCEMENT_PLAN.md` (Waves 0–6, DELIVERED
> 2026-10-25, master `b614aa07`). That program built the vendor OS; this plan
> makes it _professional_ — trust, growth, catalog depth, and platform
> resilience for a marketplace that vendors actually run businesses on.
>
> Status: **PROPOSED** — nothing here is implemented. Work starts only on
> the user's explicit "start working" instruction.

---

## 0. Non-goals audit (asked 2026-10-25)

| Non-goal                    | Verdict             | Note                                                                          |
| --------------------------- | ------------------- | ----------------------------------------------------------------------------- |
| No VENDOR role              | ✅ KEEP (invariant) | Ownership checks beat role checks; H1 is the sanctioned staff path (A1 below) |
| No mobile vendor dashboards | ✅ KEEP (web-first) | Store plan §3; revisit only on vendor demand                                  |
| No delivery integration     | ⏸️ DEFERRED         | H3 — needs a carrier partner (user-gated, D5)                                 |
| No mock revival             | ✅ DONE permanently | Real system replaced `salonManagement`/`franchisePortal` mocks                |
| H2 hybrid store-services    | 🔓 GATE OPEN        | Waves 0–6 done — schedulable (C5)                                             |

---

## 1. Wave A — Trust & Operations (the professional backbone)

**A1 — Store staff accounts (H1).**
Multiple humans per store (owner + staff with scoped permissions).
`VendorStaff` table (NOT a UserRole — the role-less invariant governs),
invitation flow, permission sets (orders/products/payouts view/edit),
staff activity audit feed, owner can revoke. The single biggest
professionalization gap: today every store is one person.
Acceptance: staff login → scoped portal; ownership checks extended to
`VendorStaff`; audit rows. **Effort: M–L. ~4 PRs.**
_(Plan §9 item 4 defaulted to "defer" — this re-opens it as the top
recommendation.)_

**A2 — Payout automation + tax records.**
Scheduled payouts (weekly/monthly per vendor) with an auto-run job on a
new `gob-payouts` queue; per-payout invoice export (AR/EN, RFC 4180 like
D4; ZATCA e-invoice fields ready but activation stays gated on
`FATOORAH_API_TOKEN` — B6 pattern). Vendors see their payout schedule +
next-run date in the Earnings tab (B4 exists).
Acceptance: scheduler job tests; invoice export E2E. **Effort: M. ~3 PRs.**

**A3 — Fulfillment SLA tracking.**
Per-order SLA clock (order_placed → fulfilled vs. the store's promised
window), late-fulfillment metric on the dashboard, SLA breach
notifications (reuses F1 inbox events). Feeds A5.
Acceptance: SLA state machine tests; dashboard KPI. **Effort: S–M. ~2 PRs.**

**A4 — Dispute SLA + escalation.**
B5 disputes exist but have no clocks: vendor response deadline (48h),
auto-escalation to admin on breach, escalation state in the dispute
lifecycle. Reduces admin babysitting.
Acceptance: deadline/auto-escalate tests. **Effort: S. ~2 PRs.**

**A5 — Quality score v2.**
Fold fulfillment speed (A3), cancellation rate, dispute outcomes (A4)
into the D2 health score; surface the components so vendors know how to
improve. Optional: quality-based commission tiering (needs the pricing
decision from the user).
Acceptance: score-composition tests (T1 pattern). **Effort: S–M. ~2 PRs.**

## 2. Wave B — Growth & Engagement

**B1 — WhatsApp order updates (F3).**
Order placed/fulfilled/delayed via WhatsApp Business API — the channel
Saudi customers actually read. BLOCKED-ON-USER (WhatsApp Business API
credentials). Facade in `lib/` (fail-closed like fatoorah/sentry),
template registry, vendor opt-in per notification type.
**Effort: M. ~3 PRs.**

**B2 — Vendor tiers & trust badges.**
Computed tiers ("Top Rated", "Fast Fulfillment", "Responsive Seller")
from A5 metrics + review volume; badges on storefront, product cards,
search results. `TrustBadges` items exist — extend with vendor-level
computed badges.
Acceptance: tier computation tests; storefront visibility. **Effort: M. ~3 PRs.**

**B3 — Reviews showcase + response nudges.**
E4 (reply) + F5 (request) exist. Add: storefront review widget with
owner replies visible, "unanswered review" nudge in the inbox (F1
events already emit `store_review_left`), review carousel on vendor
detail. Closes the loop customers see.
**Effort: S–M. ~2 PRs.**

**B4 — Customer re-engagement toolkit.**
Vendor-triggered win-back notifications to their past customers
(repeat purchasers from E5's customer list): "we restocked {{product}}",
"your favorites are on offer" — rate-limited, opt-out honored,
pre-approved templates only (no free-text spam channel).
Acceptance: rate-limit + template tests. **Effort: M. ~3 PRs.**

**B5 — Vendor marketing analytics.**
Per-product funnel (views → orders → repeat) on the Analytics tab
(D1 exists — extend the read-model with view events), so vendors know
what to promote. Depends on storefront product-view events existing.
**Effort: M. ~3 PRs.**

## 3. Wave C — Catalog & Commerce Depth

**C1 — Product variants.**
Size/shade/pack variants per product: `ProductVariant` (+SKU, stock,
price delta), editor support in C1's product form, storefront variant
picker, variant-level low-stock (B3b logic reuse).
Acceptance: variant state tests; checkout totals with variants.
**Effort: L. ~4 PRs.**

**C2 — Inventory v2.**
Bulk stock editor (spreadsheet-style grid), stock-forecast hints
("~N days of stock at current velocity" from VendorDailyStat + order
history), barcode/QR stock-in scanner for the web dashboard.
**Effort: M. ~3 PRs.**

**C3 — Vendor pricing rules.**
The dynamic-pricing engine (admin, shipped) gets a vendor scope:
vendor sets rules (weekend uplift, low-stock floor) on their own
products; admin overrides win. Guardrails: no below-cost on platform
fees, change-log per product.
Acceptance: rule-evaluation tests; precedence tests. **Effort: M. ~3 PRs.**

**C4 — Rich product media + product-level SEO.**
Multi-image galleries + video per product, per-product meta title/
description with character guidance (F4 covers store-level), alt-text
ladder for images. Optional AR try-on links (3.2 exists for some
categories — vendor opt-in).
**Effort: M. ~3 PRs.**

**C5 — Hybrid store-services (H2).**
Stores that also sell bookable services (the gate just opened).
Big scope — service catalog ownership partially moves to vendors:
vendor-owned service definitions, per-vendor calendars/reuse of the
booking engine, technician mapping. Deserves its own mini-plan before
any work; flag here as the flagship Wave C item.
**Effort: XL. ~8–10 PRs + mini-plan.**

## 4. Wave D — Platform & Resilience

**D1 — Vendor API + webhooks.**
Public API keys per vendor (`VendorApiKey`), REST/tRPC surface for
orders/stock/products, webhooks for `order.placed` / `order.fulfilled`
/ `stock.low`. Unlocks ERP/inventory-system integrations — the
enterprise-grade differentiator.
Acceptance: API key auth tests; webhook signature + retry tests.
**Effort: L. ~5 PRs.**

**D2 — Queue alerting + ops visibility.**
The brain_code P0: nobody is paged when queues stall. Per-queue depth/
failure monitors → Sentry + Slack/webhook alert; a small vendor-ops
admin view (queue lag, fulfillment backlog, SLA breaches). Platform
scope, vendor-adjacent.
**Effort: M. ~3 PRs.**

**D3 — Staging environment.**
brain_code P0, platform-wide (not vendor-specific): clone of prod
(DB + services) so risky changes stop riding the shared dev DB.
**User decision required (infra cost). Not a PR — an ops project.**

**D4 — Vendor UX polish.**
Dark-mode coverage on all vendor dashboards (platform dark mode
shipped — verify/complete vendor pages), onboarding tour for new
vendors, empty-state video walkthroughs, Arabic-first microcopy sweep
on vendor copy (the platform invariant: zero static Arabic — verify
vendor components comply).
**Effort: S–M. ~2 PRs.**

**D5 — Delivery integration (H3).**
Carrier handoff for store fulfillment (shipment labels, tracking
numbers on the order drawer, carrier status webhooks).
BLOCKED-ON-USER (delivery partner contract/API). Facade + handoff
design ready in the plan when the partner lands.
**Effort: L. ~4 PRs.**

---

## 5. Execution roadmap & gates

Recommended order (each wave independent; start on "start working"):

1. **Wave A first** — it is the professional backbone; A1 unblocks the
   multi-human stores and everything else builds on A2–A5 metrics.
2. **Wave B** — growth layer, mostly unblocked except B1.
3. **Wave C** — C1→C2→C3→C4 in any order; **C5 last** (its own
   mini-plan; biggest scope).
4. **Wave D** — D1 after A2 (payout/webhook models stabilize); D2/D4
   anytime; D3/D5 user-gated.

| Gate                      | Unblocks            | Type          |
| ------------------------- | ------------------- | ------------- |
| WhatsApp Business API     | B1                  | user key      |
| Delivery partner          | D5 (H3)             | user contract |
| `FATOORAH_API_TOKEN`      | A2 ZATCA activation | user key      |
| Staging infra budget      | D3                  | user decision |
| Quality-based commissions | A5 optional tier    | user decision |

Totals: ~17 features, ~45–50 PRs, 4 waves. Each PR follows the §6.1
gate checklist of the delivered program (type-checks ×3, per-app lint,
TDD test-first, router-inventory/trpc gates, i18n drift guard, docs
refresh on architecture-touching PRs).
