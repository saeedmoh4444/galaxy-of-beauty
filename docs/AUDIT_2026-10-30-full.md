# Full-Platform Deep Audit — 2026-10-30

> Six parallel deep audits (API/DB, web, mobile/Expo, infra/ops/security, tests/gates, docs-vs-reality + catalog) at master `a752dfbd`. Honest status: features ✅, gaps ⚠️, errors ❌, and what is missing altogether.
>
> **Verdict: the platform is materially built — 267 tRPC routers / 1,211 procedures, 251 DB models, 320 web routes, 334 mobile screens, ~1,900 API tests, 33 E2E specs, green CI — but it is not launchable as-is. The breakage is concentrated in money-flow logic (paid bookings get stuck), the Docker deploy path (could not start — fixed in #566), and the customer-facing "last mile" on mobile (session death, no address/cancel/review/dispute writes).**

## 1. What is real and working (verified, not claimed)

- **API surface**: 266 routers / 1,211 procedures with a SHA-256-pinned contract gate; tiers on every procedure.
- **Auth**: 15-min lockout, TOTP 2FA, refresh rotation with reuse detection, HttpOnly cookies.
- **Payments core**: MyFatoorah v2 fail-closed, circuit breakers, idempotency keys, wallet checkout in one `$transaction`.
- **Reels end-to-end**: upload gate → ffprobe/ffmpeg worker → moderation queue → surface; anonymous face-blur.
- **Vendor/store**: 4.4k-line portal with staff capability guards, atomic claim transitions, signed webhooks.
- **Notifications**: real Twilio SMS, Meta WhatsApp Cloud, Expo push, nodemailer; preference-aware.
- **ZATCA Phase 1**: TLV QR + ECDSA signing, hash-chained audit, VAT report/CSV.
- **Web flagship flows**: home (stage greeting, pamper, trust stats, reels), booking funnel with pricing preview, shoppable reels feed, vendor dashboard, wellness hub; dark mode, RTL i18n, skeletons/empty states, 33 E2E specs incl. axe.
- **Mobile core**: booking create, checkout→MyFatoorah, vendor portal, WebRTC video calls, shorts feed, AR try-on, subscriptions, offline queue; 334 screens typed, tsc clean.
- **Infra**: 9 CI gates, PM2 worker complete, backup script + runbook, metrics/alerting code, JWT/CSRF/rate-limit primitives, **no secrets leaked in tracked files**.

## 2. Errors (❌ real defects, launch-blocking first)

### Money integrity — the platform's worst defects

| #   | Where                                              | Defect                                                                                                                                                                                                                                                                  |
| --- | -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| M1  | `bookings.ts:30-34,745`                            | `VALID_TRANSITIONS` has no entries for `PAID`, `PAYMENT_AUTHORIZED`, `CONFIRMED_OFFLINE`, `COMPLETED`, `NO_SHOW`. **The moment money is taken the booking is stuck** — can never start/complete/cancel. Only unpaid bookings complete; payouts then reward unpaid work. |
| M2  | `vendorPortal.ts:1845-1903`                        | `fulfillOrder` accrues payouts without checking `StoreCheckout.status` — unpaid orders are fulfillable and billable.                                                                                                                                                    |
| M3  | `marketplace.ts:232-236`                           | `buyCart` is a live endpoint placing `PENDING_FULFILLMENT` orders with **no payment at all**.                                                                                                                                                                           |
| M4  | `vendorPortal.ts:1986-2015`, `disputes.ts:178-215` | `checkoutId === null` is treated as "wallet-paid" → vendor cancel or admin dispute **mints spendable balance from orders that never collected money**.                                                                                                                  |
| M5  | `payments.ts:716-795`                              | Online checkout decrements stock, creates orders, clears cart **before** payment; failure leaves inventory stranded, no expiry sweep.                                                                                                                                   |
| M6  | `payments.ts:649-661`                              | Wallet checkout checks balance then decrements non-conditionally — concurrent checkouts can overdraw.                                                                                                                                                                   |
| M7  | `payouts.ts:245-304`, `wallet.ts:104-177`          | Payouts stop at PROCESSING (no completion path); withdrawal is three non-transactional writes (retry after duplicate key loses funds); technician wallets are never credited with earnings.                                                                             |
| M8  | `payments.ts:344-407` etc.                         | Refunds never reach the gateway — admin "refund" is a status flip; no MyFatoorah refund call anywhere.                                                                                                                                                                  |
| M9  | `payments.ts:452-541`                              | Public `statusCallback` has no gateway signature and never compares `invoiceValue` to `payment.amount`.                                                                                                                                                                 |
| M10 | `bookings.ts:497` vs `payments.ts:277`             | Cashback credited twice (booking + capture) under different refs, never reversed on cancel.                                                                                                                                                                             |
| M11 | `payments.ts:148-164`                              | Concurrent `authorize` → P2002 wrapped as generic 500.                                                                                                                                                                                                                  |
| M12 | `vendorPortal.ts:1967-1976`                        | `cancelOrder` restores base stock, ignores `item.variantId`.                                                                                                                                                                                                            |
| M13 | `payouts.ts:99-158`                                | `deleteMany` on PENDING payouts unscoped by technician/vendor — a recalculation deletes other rows.                                                                                                                                                                     |

### Infra (all found by `docker compose config` verification)

| #   | Where                                 | Defect                                                                                                    |
| --- | ------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| I1  | compose prod                          | Invalid (container_name + replicas); host-port collisions — **fixed in #566**                             |
| I2  | compose                               | No worker service — **fixed in #566**                                                                     |
| I3  | compose                               | No env injection — **fixed in #566**                                                                      |
| I4  | nginx                                 | Asset 404s + no /socket.io — **fixed in #566**                                                            |
| I5  | backup                                | Wrong network — **fixed in #566**                                                                         |
| I6  | monitoring                            | Wrong scrape path/metric names, no receivers — **fixed in #566**                                          |
| I7  | staging                               | Invalid file — **fixed in #566**                                                                          |
| I8  | `storage.ts:56-117`                   | **KYC identity documents in the same public bucket as avatars** — permanent unsigned URLs. PDPL exposure. |
| I9  | `trpc.ts:119-198`                     | CSRF guard on ~37 of ~435 mutations (`SECURITY_HARDENING.md` claims all).                                 |
| I10 | `route.ts:43-46`                      | Rate-limit IP from first `X-Forwarded-For` entry — spoofable.                                             |
| I11 | `next.config.js:54-65`                | `Cache-Control: immutable` on HTML; no-store list misses authenticated areas.                             |
| I12 | `proxy.ts:210` vs `next.config.js:51` | **Permissions-Policy contradiction: camera/mic blocked in prod** — AR try-on and WebRTC dead.             |
| I13 | `proxy.ts:194`                        | CSRF cookie loses `Secure` in production.                                                                 |
| I14 | `uploads.ts`                          | No body cap; uploads silently degrade to container disk in prod.                                          |
| I15 | terraform                             | Would not apply: RDS in public subnet, no SG ingress, insecure uploads bucket.                            |
| I16 | `deploy-production.yml`               | Migrates before build, no rollback.                                                                       |

### Web

| #   | Where                 | Defect                                                                                                                                                                                |
| --- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| W1  | 9 routes              | Placeholder surfaces reachable as product: kids-services (NOT_CREATED), smart-pricing, shop-the-look (hardcoded prices), community/events/mentor (**fabricated names/social proof**). |
| W2  | `layout.tsx:14`       | Global `force-dynamic` — all 320 routes per-request; every `revalidate` dead.                                                                                                         |
| W3  | `CookieConsent.tsx`   | Built but never mounted — PDPL exposure.                                                                                                                                              |
| W4  | 121 `.nameAr` renders | English mode leaks Arabic; `ErrorAlert` retry button hardcoded English.                                                                                                               |
| W5  | SEO                   | 33/320 pages have metadata; sitemap ~31 static URLs; robots misses private areas.                                                                                                     |
| W6  | Sentry                | No `withSentryConfig` — minified stack traces in prod.                                                                                                                                |
| W7  | Components            | `AddonSuggestions`, `WebVitals`, `WhatsAppShare` dead; customer add-on UI missing.                                                                                                    |

### Mobile

| #   | Where                   | Defect                                                                                    |
| --- | ----------------------- | ----------------------------------------------------------------------------------------- |
| P1  | `trpc-react.tsx`        | **15-minute session death** — `auth.refresh` never called.                                |
| P2  | `customer/addresses`    | Read-only — new users cannot create an address → cannot book.                             |
| P3  | `bookings/[id]`         | No cancel (API supports it); blank stars bug `''.repeat(rating)`; 16 dead CTAs.           |
| P4  | `useNotifications.ts`   | Wrong Expo projectId; `registerPushToken` never called; switches dead.                    |
| P5  | `login/index.tsx:37-44` | **Fake biometric login**; token in plaintext AsyncStorage (SecureStore comment is false). |
| P6  | `wallet/top-up`         | Dead-ends in PENDING review; no mint.                                                     |
| P7  | `_layout.tsx`           | No role guards; admin/tech shells reachable.                                              |
| P8  | `bookings/create`       | Auto-assigns first technician, free-form times (B.4/B.5 never built).                     |
| P9  | eas.json                | No channel/runtimeVersion; placeholder submit fields.                                     |
| P10 | 115 fields              | Arabic-only renders; hardcoded Arabic in `.ts` hooks bypasses the gate.                   |

### Tests & gates

| #   | Where                               | Defect                                                                                                                                          |
| --- | ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| T1  | `vitest.config.ts`                  | Coverage ratchet dead — CI never runs `--coverage`.                                                                                             |
| T2  | 144/267 routers                     | Never named in any test (slots, notifications, emergencyBooking, recurringBookings, reschedule, groupBookings, savedCards, technicianRatings…). |
| T3  | `wallet.test.ts`, `scoring.test.ts` | Fake coverage — assert local variables / re-implemented copies.                                                                                 |
| T4  | E2E                                 | **No money movement ever tested**; 27 body-only assertions; 36 hardcoded sleeps; axe on 14/320 pages.                                           |
| T5  | Detox                               | 38 spec files unrunnable — no dependency, no config, stale brand.                                                                               |
| T6  | Gates                               | Static-Arabic + orphan-routes gates mobile-only (web: 156 findings; ui: 4,959).                                                                 |

## 3. Gaps & missing (⚠️ planned or expected but absent)

### Categories & services catalog (women's services completeness)

**Exists**: 18 root categories, 63 bookable services (hair, nails, skin, makeup, massage, henna, waxing 6, lashes/brows, body, bridal, spa 8, fitness, barberette, postpartum, hijab, kids, babysitting).

**Missing**: pedicure (subcategory has 0 services), evening/event makeup (0), keratin/protein, hair extensions/braiding, anti-aging/hydrafacial/chemical peel, brow shaping/lamination, laser hair removal, sugaring, lash refill/removal, meditation/breathwork, nutrition consultations. **0/63 services have `imageUrl`** — marketplace renders stock photos. Subcategories carry zero linked services; `/services?categoryId=` ignored by the client. A "Men's Grooming" category (4 services) contradicts the women-only positioning. The 289-item `womensServices` catalog is a static facade whose booking always returns NOT_CREATED.

### Payment methods & monetization (user-gated token where noted)

- **MyFatoorah live token (user)** — the only blocker to real money; simulate otherwise.
- BNPL (Tabby/Tamara) — `eligible:false, PROVIDER_NOT_CONFIGURED`; advertised but non-functional.
- Mada / STC Pay / Apple Pay / SADAD — labels only.
- **Subscription renewals always expire** (`subscriptionRenewal.ts` hardcodes `renewed = 0`).
- Wallet top-up, payout completion, gateway refunds — all inert (see M7/M8).

### Unbuilt plan items (from reconciliation)

- ENHANCEMENT: Beauty Wallet 2.0 (crypto), dropshipping, local payment methods, real AR (saveSession returns false), perf targets (221/213/298/226 KB vs 100-150 target), Urdu/Tagalog, ZATCA Phase 2 UBL/XAdES (custom JSON today).
- VISIONARY: beauty tourism, iOS widgets/Live Activities/Apple Watch, TrueDepth AR, visual regression, read replica, CDN, auto-scaling, blur-technician-faces wiring, delight rewards.
- TOP10: P1 token (user), P6 Sentry DSN prod (user), P7 app store (Apple account), Q2 1K k6 evidence, Q5 pentest, Q6 CWV measurement, Q7 mobile polish sweep.
- Mobile B-items not built: B.4 technician selection, B.5 slot availability, B.12 product scanner, B.14 birthday rewards, B.20/B.21 unified AI assistant + quota, B.25 beauty profile; PARTIAL: B.6/B.7/B.9/B.10/B.11/B.13/B.15/B.16/B.19/B.22/B.24/B.26.

## 4. What the docs get wrong (stale/overclaiming)

`TECHNICAL_DEBT.md` lists 7 already-fixed P0/P1s as active. `KNOWN_ISSUES.md` says staging/backups/FE-007 are missing (all shipped). `PLATFORM_TEST_PLAN_STATUS.md` is two months stale (297 vs ~1,900 tests). `comprehensive_details_of_beautyofgalaxy.md` contradicts itself (Next 14 vs 16, SDK 54 vs 58, 87 vs 251 models). `LAUNCH_READINESS.md` marks payments/BNPL/AI/ZATCA green while they are stubs/simulated. `API_REFERENCE`/`ARCHITECTURE` counts drifted. `DELIVERY_REPORT.md` is a historical snapshot marked "Known Issues NONE".

## 5. Build plan (the fix order)

| Wave                    | Scope                                                                           | First slices                                                                                                                                                         |
| ----------------------- | ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A — money integrity** | M1–M13 (API + tests)                                                            | A1 booking transitions; A2 store payment verification; A3 checkout compensation; A4 payout/wallet atomicity; A5 callback integrity                                   |
| **B — infra code**      | I8–I16                                                                          | B1 KYC private bucket; B2 CSRF all mutations; B3 header/cache fixes; B4 env/terraform/deploy workflow                                                                |
| **C — web**             | W1–W7                                                                           | C1 hide/finish placeholder routes; C2 consent + force-dynamic + headers; C3 SEO + Sentry                                                                             |
| **D — mobile**          | P1–P10                                                                          | D1 session refresh + SecureStore + biometric; D2 address/cancel/review/dispute writes; D3 push registration; D4 role guards; D5 technician selection/slots (B.4/B.5) |
| **E — catalog**         | missing categories, subcategory linkage, service images, womensServices mapping | E1 seed missing services + fix category browsing; E2 images pipeline; E3 mens-grooming decision                                                                      |
| **F — tests/gates**     | T1–T6                                                                           | F1 wire coverage ratchet; F2 router coverage for slots/notifications/money paths; F3 money E2E; F4 web static-Arabic + orphan gates                                  |
| **G — docs**            | stale doc refresh                                                               | G1 TECHNICAL_DEBT + KNOWN_ISSUES + readiness docs                                                                                                                    |

User-gated (cannot be done from code): Fatoorah token, Apple Developer account, service photography assets, AWS console actions (CDN, S3 lifecycle, private bucket policies), pentest.
