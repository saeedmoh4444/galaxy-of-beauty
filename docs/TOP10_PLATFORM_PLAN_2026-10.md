# Galaxy of Beauty — Top-10 Platform Plan (2026-10)

> Goal: fix everything found in user testing (2026-10-08), complete the
> missing systems (store/provider dashboards, mobile parity), launch to
> production, and build toward top-10-class quality.
>
> Builds on: `ROADMAP_RECOMMENDATIONS_2026-10.md` (ops phases A–D),
> `STORE_MARKETPLACE_PLAN.md` (store phases 1–4), `WOMEN_LIFESTYLE_EXPANSION_PLAN.md`.
> Status: **EXECUTED 2026-10-08/09/10** — Phase 0 complete, S1–S5 done, Q1/Q4
> done, Q6/Q7 partially done. Remaining work listed per phase below.
> Provider-system reality check: `docs/architecture/store-provider-system.md`.

---

## Phase 0 — Fixes from user testing (start immediately on GO)

| #   | Item                                   | What / why                                                                                                         | Effort |
| --- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ------ |
| F1  | **Mobile brand logo on home/header**   | ✅ DONE (#385) — logo + name in the mobile home header (web parity, md5-identical asset)                           | 1–2 h  |
| F2  | **Duplicate admin nav entry**          | ✅ DONE (#384) — duplicate removed + viewport-aware E2E regression spec                                            | 15 min |
| F3  | **Reactivate `customer@test.com`**     | ✅ DONE — reactivated; root cause: untracked direct DB write (no app code sets isActive=false without anonymizing) | 30 min |
| F4  | **Tech gallery video upload**          | ✅ DONE (#387) — `GalleryImage.videoUrl` + upload toggle + inline players + My Items grid                          | ~1 day |
| F5  | **Tech profile richer fields**         | ✅ DONE (#388) — social links, languages, certifications, years of experience, tier badge                          | ~1 day |
| F6  | **Fix stale root `.env` DATABASE_URL** | ✅ DONE — root .env now 5433/`gob_secure_pass_2024` (matches compose)                                              | 15 min |

Verification per item: type-checks (3 apps) + per-app lint + targeted tests; F1/F4/F5 get mobile/web smoke tests.

---

## Phase 1 — Store & provider systems (platform completeness)

> Context: `STORE_MARKETPLACE_PLAN` Phase 1 is DONE (registration wizard, admin
> approvals, order split/fulfill) but lives inside the **(customer)** route group —
> no dedicated store experience, no VENDOR role in the `UserRole` enum
> (CUSTOMER|TECHNICIAN|ADMIN). Gym/clinic/nail-bar/trainer storefronts exist as
> public pages + admin screens on the shared `Vendor` model — no per-type
> registration or dashboards.

| #   | Item                                   | What / why                                                                                                                                                                                                                             | Effort   |
| --- | -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| S1  | **Dedicated store dashboard**          | ✅ DONE (#389) — literal `/store` segment (NOT a route group — group roots collide with `(public)`), STORE shell + sidebar, auth-hydration-safe guard, store name header                                                               | 2–3 days |
| S2  | **Store Phase 2 — public storefronts** | ✅ DONE (pre-existing web + #390 mobile) — `/stores` + `[slug]` already existed with product grids; mobile store browsing added                                                                                                        | 2–3 days |
| S3  | **Store Phase 3 — finance**            | ✅ DONE (#391) — per-vendor commissionRate actually applied in `calculateStore` (was gross/fee 0), admin rate editor at `/admin/vendors`; payouts/disputes machinery pre-existed                                                       | 2 days   |
| S4  | **Provider-type registration**         | ✅ DONE (pre-existing) — the portal wizard already covers store/clinic/gym/nail-bar/at-home with per-type KSA documents and per-type dashboards (see `docs/architecture/store-provider-system.md`)                                     | 3–4 days |
| S5  | **Store Phase 4 — trust & growth**     | ✅ DONE — ratings displayed (#393) + order-based analytics (#404: revenue-30d, orders/AOV, customers, status breakdown) + promotions polish (#408: discount %, validity dates, rejection reason, floor-rule hint, per-product revenue) | 2 days   |

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

| #   | Item                                 | What / why                                                                                                                                                                                                                                                                                                                           | Effort           |
| --- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------- |
| Q1  | **Bundle slimming** (C1 / FE-007)    | ✅ DONE — #395 `sideEffects: false` + #402 turbopack hygiene + #403 **locale split** (per-locale generated catalogs, `getWebCatalog` lazy loading). Measured: 565/559/646/575 → **221/213/298/226 KB gz**; baseline ratcheted (#401) + locale-split/leak/drift gates                                                                 | 2–3 days         |
| Q2  | **k6 load test @1K concurrent** (C2) | Find the real breaking point before traffic does (needs P3 staging)                                                                                                                                                                                                                                                                  | 4 h              |
| Q3  | **Observability dashboards** (B4)    | API latency, DB pools, queue depth (Sentry metrics or Prometheus/Grafana)                                                                                                                                                                                                                                                            | 8 h              |
| Q4  | **Code-hygiene sweeps** (D4)         | ✅ DONE — seed part (#394: all 14 `(prisma as any)` casts) + lint triage (#405: api 174→0, web 29→0 warnings; `coverage/` ignored; documented disables only)                                                                                                                                                                         | 1–2 days         |
| Q5  | **Security pentest + NCA-ECC** (D3)  | External pentest + Saudi market compliance (after P4)                                                                                                                                                                                                                                                                                | 1 week, external |
| Q6  | **SEO & Core Web Vitals**            | 🔶 PARTIAL — #406: `lib/seo.ts` `pageMeta()` + `generateMetadata` on 16 public pages (ar/en, OG, canonical), sitemap −11 auth-gated entries + CI gate. **Remaining:** CWV measurement pass (needs a production build — dev-mode Lighthouse is noise), per-page metadata for the long tail, Arabic hreflang (needs URL-based locales) | 2–3 days         |
| Q7  | **Mobile parity polish**             | 🔶 PARTIAL — #407: skeleton loading states on the 7 screens that flashed empty states during load (194 already had them; 272 use queries). **Remaining:** screen-entrance animation sweep (SkeletonCard pulse exists; needs design direction)                                                                                        | 1–2 days         |

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
