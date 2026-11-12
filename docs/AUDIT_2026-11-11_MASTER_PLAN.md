# Galaxy of Beauty — Deep Platform Audit 2026-11-11 + Build-Out Master Plan

Six-agent deep audit of the whole monorepo (web Next.js 16 · mobile Expo SDK 58 · API tRPC · DB Prisma 7 · workers/socket/infra/CI · women's services catalog). Area reports: `docs/audit-2026-11-11/01-web.md` … `06-womens-services.md`. This file is the master plan: what we HAVE, what's BROKEN, what's MISSING, and the build waves to close it.

**Scale snapshot:** 269 tRPC routers · 1,220 procedures · 272 DB models · 49 migrations · 321 web pages · 337 mobile screens · 2,029+ unit tests · 39 web E2E specs + 3 mobile · 16 BullMQ queues · 11 CI gates. CI green, board zero — this audit found the _unknowns_, not the reds.

---

## Part A — The full feature inventory (verified shipped ✓)

| #   | Feature area                                                                                                      | Web | Mobile     | API | DB  | Notes                                                                            |
| --- | ----------------------------------------------------------------------------------------------------------------- | --- | ---------- | --- | --- | -------------------------------------------------------------------------------- |
| 1   | Booking core (create/confirm/detail/reschedule/recurring/group/emergency/advanced)                                | ✓   | ✓          | ✓   | ✓   | idempotency, jummah windows, bundle/addon/subscription math, slot re-check in tx |
| 2   | Booking verticals: services, gyms, nail-bars, clinics, trainers, kids, women's                                    | ✓   | ✓          | ✓   | ✓   | E2/E3/E5/K-series shipped                                                        |
| 3   | Video bookings (WebRTC rooms, customer + tech)                                                                    | ✓   | ✓          | ✓   | ✓   | relay signaling works in-process                                                 |
| 4   | Marketplace + cart + checkout + shipping                                                                          | ✓   | ✓          | ✓   | ✓   | MyFatoorah simulate; store stock decrement in tx                                 |
| 5   | Vendor portal + wizard (provider submission, drafts)                                                              | ✓   | ✓          | ✓   | ✓   | ownership gates on web                                                           |
| 6   | SELLER first-class role (registration, routing, gates)                                                            | ✓   | ✓          | ✓   | ✓   | R1-R4 + D1-D4 all merged 2026-11-11                                              |
| 7   | Seller dashboard: analytics, payouts, low-stock, reviews, health-score                                            | ✓   | ✓          | ✓   | ✓   | D1-D4, capability-filtered tabs, CSV exports                                     |
| 8   | Admin: 50+ pages incl. payout queue, moderation queue, BullMQ queues, ZATCA, pricing, campaigns                   | ✓   | 35 screens | ✓   | ✓   | —                                                                                |
| 9   | Moderation (A2): blocklist creation guards + admin queue + reports/takedown                                       | ✓   | ✓          | ✓   | ✓   | #602/#604/#608 — full pipeline shipped                                           |
| 10  | Wallet: balance, transactions, withdraw (atomic), top-up (see gap W2-4), cashback, BNPL, beauty-budget            | ✓   | ✓          | ✓   | ✓   | withdraw atomicity + idempotency tested                                          |
| 11  | Subscriptions: plans, purchase, pause/resume/cancel, autoRenew (see gap W1-7), box-builder, AI plans              | ✓   | ✓          | ✓   | ✓   | plan discounts wired into booking totals                                         |
| 12  | Flash deals: admin CRUD, claims (atomic), public list                                                             | ✓   | ✓          | ✓   | ✓   | price never applied to bookings (gap W2-6)                                       |
| 13  | Gift cards, promo codes, loyalty, kindness points, referrals (see gap W5-4)                                       | ✓   | ✓          | ✓   | ✓   | —                                                                                |
| 14  | Community: circles, posts, beauty-community, pen-pal, mood boards, social                                         | ✓   | ✓          | ✓   | ✓   | —                                                                                |
| 15  | Reels: shorts feed, shoppable tags, watch analytics, reports                                                      | ✓   | ✓          | ✓   | ✓   | media pipeline job (ffmpeg optional)                                             |
| 16  | AI: ai-chat, assistant, feed, routine, skin-analysis, content-gen, DNA                                            | ✓   | ✓          | ✓   | ✓   | skinAnalysis stub fallback documented                                            |
| 17  | Wellness: hub, tracker, cycle, pregnancy, menopause, sleep, measurements                                          | ✓   | ✓          | ✓   | ✓   | —                                                                                |
| 18  | Kids K1-K4: family members, kids-care, bundles, babysitting (hourly)                                              | ✓   | ✓          | ✓   | ✓   | no babysitter technician seeded (gap W2-1)                                       |
| 19  | Women-only privacy: womens-services, night-mode, hijab-care, badges                                               | ✓   | ✓          | ✓   | ✓   | marketing posture, not enforcement (gap W3-5)                                    |
| 20  | Payouts: technician lifecycle + seller requests → admin approve/reject                                            | ✓   | ✓          | ✓   | ✓   | simulate-safe by design; approve race (gap W1-3)                                 |
| 21  | Payments: authorize/capture/refund, ZATCA invoicing (simulate), disputes                                          | ✓   | ✓          | ✓   | ✓   | refund doesn't return money (gap W1-2)                                           |
| 22  | Realtime: socket events for bookings/payments/notifications/chat/video                                            | ✓   | ✓          | ✓   | ✓   | 🔴 dead in prod (gap W3-1); video signaling works                                |
| 23  | Offline/PWA (web) + offline queue + persisted cache (mobile)                                                      | ✓   | ✓          | —   | —   | genuine implementation both platforms                                            |
| 24  | i18n ar/en: typed keys, dynamic catalogs, RTL, CI static-Arabic gate                                              | ✓   | ✓          | —   | ✓   | passes 0/0 on both apps; packages/ui escapes (gap W6-3)                          |
| 25  | Workers: 16 BullMQ queues + 11 interval sweeps + schedulers                                                       | —   | —          | ✓   | —   | reconciliation blind spots (gap W1-8)                                            |
| 26  | Infra: compose dev/staging/prod, nginx TLS, backup sidecar, PM2, EAS pipeline                                     | —   | —          | —   | —   | prod not user-gated-verified; staging lacks TLS (gap W5-9)                       |
| 27  | Observability: Sentry (DSN-gated), prom metrics, Grafana, k6, alerting                                            | ✓   | ✓          | ✓   | —   | alertmanager placeholder (gap W5-10)                                             |
| 28  | CI: 11 gates — format, audit, cycles, type, lint, coverage-ratchet, build+size, E2E+axe, mobile-smoke, k6, docker | —   | —          | —   | —   | unusually thorough; docker gate builds dev images only (gap W5-8)                |
| 29  | Dynamic pricing engine (opt-in tiers/peak/surge + preview + admin UI)                                             | ✓   | ✓          | ✓   | ✓   | dormant — nothing opted in (gap W2-8)                                            |
| 30  | Trust/safety: badges, escorts, panic alerts, location share, KYC, webhooks                                        | ✓   | ✓          | ✓   | ✓   | safety router has ZERO tests (gap W6-5)                                          |

## Part B — Consolidated gap list (ranked)

### P0 — money integrity & core business (build first)

| ID    | Gap                                                                                                                                                         | Layer      | Effort            |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ----------------- |
| W1-1  | `bookings.transition complete` race: double-click double-pays technician counter, referral rewards, influencer commissions                                  | API        | S                 |
| W1-2  | `payments.refund` never returns money (no wallet credit/gateway call) + non-transactional                                                                   | API        | M                 |
| W1-3  | `payouts.approveRequest` can approve under-covered requests under concurrency (no `remaining===0` assert in tx)                                             | API        | S                 |
| W1-4  | Cashback job non-idempotent on retry → double credit                                                                                                        | Worker     | S                 |
| W1-5  | `flashDeals.claim` catch-all rollback corrupts the redemption counter                                                                                       | API        | S                 |
| W1-6  | `subscriptions.purchase` unguarded debit → negative balance under concurrency; capture-cashback check-then-create on non-unique referenceId                 | API        | S                 |
| W1-7  | Subscription autoRenew is dead — `renewed = 0`, autoRenew plans silently EXPIRE                                                                             | Worker     | M (gateway-gated) |
| W1-8  | Reconciliation mismatches never alert; worker missing from shutdown/registry; 4 queues invisible to health monitor                                          | Worker     | S                 |
| W1-9  | Seed not idempotent — re-seed FK-fails on store_checkouts (blocks local dev + any re-seed)                                                                  | DB         | S                 |
| W1-10 | `wallet.topUp` dead end — creates PENDING txn, nothing ever completes it, UI shows success                                                                  | API        | M                 |
| W1-11 | `wallet.withdraw` idempotency replay leaks other users' transaction data                                                                                    | API        | S                 |
| W1-12 | Duplicate dispute → raw 500 instead of 409                                                                                                                  | API        | S                 |
| W1-13 | 33 raw `throw new Error` surface as 500s instead of 4xx                                                                                                     | API        | S                 |
| W2-1  | ~90% of the 393-service catalog unbookable: no technician mapping for E1/D2/kids/babysitting/fitness/barberette/postpartum/hijab rows; no babysitter seeded | DB seed    | M                 |
| W2-2  | Booking picker truncated to 100 newest rows → the 75 technician-bearing core services unreachable (D2 facade floods it)                                     | Web+Mobile | S                 |
| W2-3  | No booking→payment call site anywhere (payments.authorize unused); web cancel button is `onClick={() => {}}`                                                | Web+Mobile | M                 |
| W2-4  | Confirm screens show placeholder `———` code/date (params never passed)                                                                                      | Web+Mobile | S                 |
| W2-5  | `bookings.create` doesn't validate technician↔service mapping nor address ownership (other user's address readable by technician)                           | API        | S                 |
| W2-6  | Flash-deal price never applied to booking totals                                                                                                            | API        | M                 |
| W2-7  | `womensServices.book`/`kidsServices.book`: first-technician-by-id, no slot, no mapping check, no dynamic pricing, no familyMemberId                         | API        | M                 |
| W2-8  | Dynamic pricing dormant (nothing opted in)                                                                                                                  | Seed       | S                 |
| W2-9  | Mobile catalog broken ×3: blank cards (wrong field names), empty category sections (serviceCount-only payload), no navigation                               | Mobile     | M                 |
| W2-10 | Cache invalidation dead code (after `return`) — admin edits leave browse stale                                                                              | API        | S                 |
| W2-11 | womensServicesMap fallbacks resolve to wrong/no service (kids service; keyword mismatches)                                                                  | API        | S                 |

### P1 — realtime, seller tier, privacy

| ID   | Gap                                                                                                                                         | Layer      | Effort |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------ |
| W3-1 | **All realtime socket emits are silent no-ops in production** (web process has no socket connection; only video signaling works)            | Infra/API  | M      |
| W3-2 | sellerProcedure/sellerMutation/staffProcedure defined but 0/269 routers use them; `ensureVendor` auto-creates vendors with no approval gate | API        | M      |
| W3-3 | Mobile vendor-portal has NO role guard (deep-linkable by anyone)                                                                            | Mobile     | S      |
| W3-4 | Biometric login is cosmetic (authenticate → toast, never signs in)                                                                          | Mobile     | M      |
| W3-5 | Women-only = marketing posture: no gender gate, no verified-female step, mobile browse leaks mens-grooming chip                             | API+Mobile | M      |
| W3-6 | Orphan socket events (waitlist_update listener has no producer; new_message/video_call_started have no listener)                            | Socket     | S-M    |
| W3-7 | Socket URL fallback trap (hostname:4001 unpublished in prod compose)                                                                        | Infra      | S      |

### P2 — web/mobile correctness & UX

| ID    | Gap                                                                                                                                                                                 | Layer  | Effort |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ------ |
| W4-1  | pro-tools page renders **fabricated financials** to real technicians (nonexistent procedures + hardcoded numbers)                                                                   | Web    | M      |
| W4-2  | Mobile stub screens ship "coming soon" (audio-rooms join, whatsapp-bot connect)                                                                                                     | Mobile | S-M    |
| W4-3  | Detox e2e suites unrunnable (no detox dep/config/script) — migrate to Playwright or wire detox                                                                                      | Mobile | M      |
| W4-4  | Sentry: mobile release wiring aspirational; beforeSend PII scrub not implemented; DSN not in EAS env                                                                                | Mobile | S      |
| W4-5  | OTA `fallbackToCacheTimeout: 0` makes updates build-only                                                                                                                            | Mobile | S      |
| W4-6  | Playwright mobile e2e has no webServer/CI wiring                                                                                                                                    | Mobile | S      |
| W4-7  | Dead `deepLinks.ts` (wrong scheme, wrong routes, never imported)                                                                                                                    | Mobile | S      |
| W4-8  | Hardcoded Arabic in useBiometric/useCamera hooks (i18n gate passes only because it skips hooks)                                                                                     | Mobile | S      |
| W4-9  | 3 screens hardcode DEFAULT_SAUDI_CITY with TODO (expo-location installed but unused)                                                                                                | Mobile | S      |
| W4-10 | admin/payouts: hardcoded ar-SA date + English `adminNote: 'Rejected'`                                                                                                               | Web    | S      |
| W4-11 | Single root error boundary (no group-level boundaries)                                                                                                                              | Web    | S      |
| W4-12 | Dark-mode stragglers (tech/gallery, NpsCard)                                                                                                                                        | Web    | S      |
| W4-13 | Housekeeping: empty `customer/vendor-portal` dir, duplicate wallet screens, duplicate admin analytics, react 19.3.1 drift, eslint max-warnings 200, ErrorBoundary raw error.message | Mobile | S      |

### P3 — DB & infra hardening

| ID    | Gap                                                                                                                                                          | Layer  | Effort |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ | ------ |
| W5-1  | FK migration batch: money-adjacent tables (gift cards, flashDealClaim) + ~19 owner-id columns indexed-but-unconstrained                                      | DB     | M      |
| W5-2  | Referral double-claim (no compound unique + no existence check)                                                                                              | DB+API | S      |
| W5-3  | AvailabilitySlot no DB overlap guard (exclusion constraint)                                                                                                  | DB     | M      |
| W5-4  | Dispute dual-target CHECK; PromoUsage NULL-unique hole; WishlistItem NULL-unique hole                                                                        | DB     | S      |
| W5-5  | StoreCheckout webhook/expiry unindexed; payout settlement partial index; product.sales sort unindexed                                                        | DB     | S      |
| W5-6  | Duplicate model families (ServicePricing/PricingRule, ServiceBundle/BeautyBundle, PromoCode/BeautyCoupon, Review/TechnicianRating) — deprecate legacy copies | DB     | L      |
| W5-7  | StoreOrder lacks an order code; status String-vs-enum drift                                                                                                  | DB     | S-M    |
| W5-8  | CI docker gate builds dev images only; no path filters on ci.yml                                                                                             | CI     | S      |
| W5-9  | Staging has no nginx/TLS despite docs; DEPLOYMENT.md drifts (metrics path, backup sidecar)                                                                   | Infra  | S      |
| W5-10 | Alertmanager webhook placeholder — #562 paging is theoretical                                                                                                | Infra  | S      |
| W5-11 | Seed hygiene: moderation fixture dead inside catch; vertical seed coverage gap; stale seed-demo-full/seed-enrich/generated-client                            | DB     | S      |
| W5-12 | Redundant duplicate indexes (schema + hand-written backfill) — write amplification                                                                           | DB     | S      |

### P4 — SEO, i18n sweep, coverage

| ID   | Gap                                                                                                                     | Layer  | Effort |
| ---- | ----------------------------------------------------------------------------------------------------------------------- | ------ | ------ |
| W6-1 | SEO: 33/321 pages emit metadata; sitemap has 32 URLs                                                                    | Web    | M      |
| W6-2 | packages/ui escapes the i18n gate (538/567 files, {ar,en} maps defaulting 'ar') — extend gate + allowlist, then migrate | Web/UI | L      |
| W6-3 | safety router: 0 tests (7 mutations incl. panic/escort/check-in)                                                        | API    | M      |
| W6-4 | content/social/realtime routers thin coverage (4/28, 10/42, 3/7)                                                        | API    | M      |
| W6-5 | k6 load at 1K concurrent unchecked; no Sentry heartbeats for schedulers; no restore script                              | Infra  | M      |

### User-gated (unchanged — needs the boss)

Fatoorah live token · Sentry DSNs · AWS console (CDN, S3 lifecycle) · Apple account · prod server · Postman key · pentest execution. Also gateway-gated: wallet top-up completion (W1-10), autoRenew capture (W1-7), payout provider integration.

## Part C — Build waves

- **W1 Money integrity** — W1-1…W1-13 (API/worker/seed; TDD per slice, one PR per 3-5 items)
- **W2 Catalog bookability** — W2-1…W2-11 (the core business: every service bookable, booking→payment→confirm complete, flash-deal pricing live)
- **W3 Realtime + seller tier + privacy** — W3-1…W3-7
- **W4 Web/mobile correctness** — W4-1…W4-13
- **W5 DB & infra hardening** — W5-1…W5-12
- **W6 SEO + i18n + coverage** — W6-1…W6-5

Each slice: test-first, PR, full CI (11 gates), merge on green. Tracker: this file's Part B table + `docs/PLATFORM_IMPROVEMENT_PLAN_2026.md` row. Board target: zero open PRs at the end of every wave.
