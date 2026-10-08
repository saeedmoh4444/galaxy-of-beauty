# Galaxy of Beauty — Top-10 Platform Plan (2026-10)

> Goal: fix everything found in user testing (2026-10-08), complete the
> missing systems (store/provider dashboards, mobile parity), launch to
> production, and build toward top-10-class quality.
>
> Builds on: `ROADMAP_RECOMMENDATIONS_2026-10.md` (ops phases A–D),
> `STORE_MARKETPLACE_PLAN.md` (store phases 1–4), `WOMEN_LIFESTYLE_EXPANSION_PLAN.md`.
> Status: **awaiting GO** — user triggers with "start working and implementing".

---

## Phase 0 — Fixes from user testing (start immediately on GO)

| #   | Item                                   | What / why                                                                                                                                                                         | Effort |
| --- | -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| F1  | **Mobile brand logo on home/header**   | Logo file is already identical to web (md5-verified); `BRAND_LOGO` only renders on login+onboarding. Add it to the mobile home/header (same logo as web)                           | 1–2 h  |
| F2  | **Duplicate admin nav entry**          | `apps/web/src/app/admin/layout.tsx:30-31` lists `/admin/content-gen` twice — remove one line                                                                                       | 15 min |
| F3  | **Reactivate `customer@test.com`**     | `isActive=false` in DB (seed creates it active; no auto-lockout exists; login throws "Account is deactivated"). One UPDATE + trace what flipped it (admin audit-log / user-toggle) | 30 min |
| F4  | **Tech gallery video upload**          | `GalleryImage` is `imageUrl`-only. Add `videoUrl` + migration + upload UI + player (reuse Short/video-upload patterns)                                                             | ~1 day |
| F5  | **Tech profile richer fields**         | Form has ~15 fields; model supports more: bio AR/EN (`bioJson`), social links, languages, certifications, `isEcoFriendly`, `bufferMinutes`, tier. Extend form + i18n (ar/en)       | ~1 day |
| F6  | **Fix stale root `.env` DATABASE_URL** | Root .env points to 5432/`gob_secure_pass` (stale); working = 5433/`gob_secure_pass_2024`                                                                                          | 15 min |

Verification per item: type-checks (3 apps) + per-app lint + targeted tests; F1/F4/F5 get mobile/web smoke tests.

---

## Phase 1 — Store & provider systems (platform completeness)

> Context: `STORE_MARKETPLACE_PLAN` Phase 1 is DONE (registration wizard, admin
> approvals, order split/fulfill) but lives inside the **(customer)** route group —
> no dedicated store experience, no VENDOR role in the `UserRole` enum
> (CUSTOMER|TECHNICIAN|ADMIN). Gym/clinic/nail-bar/trainer storefronts exist as
> public pages + admin screens on the shared `Vendor` model — no per-type
> registration or dashboards.

| #   | Item                                   | What / why                                                                                                                                                                                                                     | Effort   |
| --- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- |
| S1  | **Dedicated store dashboard**          | New `(store)` route group (or ownership-based layout): store home, products, orders, settings. Store owners land there after login (guard: user owns a `Vendor`); customer area keeps vendor-portal for the registration entry | 2–3 days |
| S2  | **Store Phase 2 — public storefronts** | Per-store public pages (logo, bio, rating, product grid), product image upload (remaining from Phase 1), mobile store browsing                                                                                                 | 2–3 days |
| S3  | **Store Phase 3 — finance**            | Commission config per store/category (admin), store payouts + statements (reuse technician payout machinery), refunds via disputes flow                                                                                        | 2 days   |
| S4  | **Provider-type registration**         | Extend the registration wizard to gym / clinic / nail-bar types with per-type fields (facility license, staff list, etc.) + per-type dashboard sections. Reuses `ProviderSubmission` queue + KYC pipeline                      | 3–4 days |
| S5  | **Store Phase 4 — trust & growth**     | Store ratings/reviews, badges, store analytics, promotions through the submission system                                                                                                                                       | 2 days   |

Gates: regulatory decisions on product categories (user), delivery-partner choice (partnership-gated — same class as ride-hailing).

---

## Phase 2 — Payments & production launch

| #   | Item                                             | What / why                                                                                                                               | Effort          |
| --- | ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| P1  | **MyFatoorah live token** (roadmap A1)           | Sandbox E2E (countries → cities → charge → invoice link → status) → live token. Unblocks ZATCA e-invoicing activation                    | 5 min + 1 h E2E |
| P2  | **Gateway circuit breakers + retry facade** (A2) | Per-gateway breakers (MyFatoorah, OpenAI, ZATCA, SMS, WhatsApp) — checkout degrades gracefully instead of failing                        | 6–8 h           |
| P3  | **Staging environment** (A3)                     | Compose override + dev-DB snapshot/restore for prod-like testing                                                                         | 6–8 h           |
| P4  | **Production infra** (B1+B2+B3)                  | VPS + domains + SSL + Nginx + PM2; scheduled DB backups + restore drill; alerting (error rate >5%, payment failures, queue depth, disk)  | 1–2 days        |
| P5  | **S3 storage for uploads**                       | Code already S3-ready (`packages/api/src/lib/storage.ts`, `AWS_S3_BUCKET`); create bucket + keys, flip env                               | 4 h             |
| P6  | **Sentry DSN production**                        | Wire `NEXT_PUBLIC_SENTRY_DSN` (Docker build arg) — project already instrumented                                                          | 30 min          |
| P7  | **App-store submission**                         | Android Play Store (APK ready) + iOS App Store (needs Apple Developer account — user-gated); staged rollout + OTA pipeline already built | 1–2 days        |

---

## Phase 3 — Performance & quality (top-10 class)

| #   | Item                                 | What / why                                                                                                                                                                      | Effort           |
| --- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| Q1  | **Bundle slimming** (C1 / FE-007)    | Routes at 560–650 KB → target 100–150 KB. Catalog split (#368) already cut −91 KB/route; continue: tRPC client chunk, ui barrel, marketing chunk. Size gate measures every step | 2–3 days         |
| Q2  | **k6 load test @1K concurrent** (C2) | Find the real breaking point before traffic does (needs P3 staging)                                                                                                             | 4 h              |
| Q3  | **Observability dashboards** (B4)    | API latency, DB pools, queue depth (Sentry metrics or Prometheus/Grafana)                                                                                                       | 8 h              |
| Q4  | **Code-hygiene sweeps** (D4)         | Seed `(prisma as any)` → typed; lint-warning triage (~30); dangling exports                                                                                                     | 1–2 days         |
| Q5  | **Security pentest + NCA-ECC** (D3)  | External pentest + Saudi market compliance (after P4)                                                                                                                           | 1 week, external |
| Q6  | **SEO & Core Web Vitals**            | Per-page meta/OG (ar+en), sitemap polish, LCP/CLS on mobile, Arabic SEO                                                                                                         | 2–3 days         |
| Q7  | **Mobile parity polish**             | Dark mode on mobile (web dark mode shipped), animations polish, empty/skeleton states                                                                                           | 1–2 days         |

---

## Phase 4 — Growth & differentiation

- Referral system polish + reviews/trust badges (foundations exist)
- WhatsApp ordering to WhatsApp Business API (6.5 foundation exists)
- AI moat: DNA quiz, AR try-on, content-gen, proactive AI — keep improving + surface in marketing
- Content engine: beauty tips/academy/blog (exist — push SEO + social)
- Marketplace GMV features: bundles, gift cards, subscriptions (exist — promote + polish)
- Admin analytics for growth decisions (exists — add store/marketplace views)

---

## What I need from you (user-gated list)

1. **MyFatoorah API token** — unblocks P1 + ZATCA (highest priority)
2. **Apple Developer account (~$99/yr)** — iPhone dev client + App Store
3. **Sentry DSN** — from your Sentry project settings
4. **S3 bucket + keys** — AWS or S3-compatible
5. **Server + domains** — for production launch (when ready)
6. **Regulatory decisions** — product categories needing Saudi approvals (S2/S4)

---

## Execution order on "start working and implementing"

1. **Phase 0 immediately** — F2, F3, F6 same day; F1 next; F4, F5 as PRs (TDD per project rules, one PR per item, CI-green merges)
2. **Phase 1** — S1 → S2 → S3 → S4 → S5 (S1+S2 first: store owners get a real home, public gets real storefronts)
3. **Phase 2** — P1/P2/P5/P6 as soon as tokens arrive; P3/P4 when server/domains ready; P7 when Apple account ready
4. **Phase 3** — Q1 (highest leverage) + Q4 in parallel with Phase 1; Q2/Q3 after staging; Q5/Q6/Q7 after launch
5. **Phase 4** — ongoing growth sprints after launch

## Top-10 reality check

"Top ten in the world" is a multi-year journey; this plan sequences the
platform to production + measurable quality (fast, observable, secure,
compliant) — which is what top platforms are made of. Each phase above has
concrete acceptance criteria; nothing here is speculative tech.
