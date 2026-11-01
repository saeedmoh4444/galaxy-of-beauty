# ✨ Galaxy of Beauty | جالكسي بيوتي

[![CI](https://github.com/saeedmoh4444/galaxy-of-beauty/actions/workflows/ci.yml/badge.svg)](https://github.com/saeedmoh4444/galaxy-of-beauty/actions/workflows/ci.yml)

**The women-first beauty & wellness marketplace for Saudi Arabia.**

Galaxy of Beauty connects customers with vetted, KYC-verified female technicians across **18 beauty categories** — from hair, nails, and makeup to spa, bridal, postpartum care, kids services, and a women's lifestyle hub with **94 curated life-stage and occupation categories (289 services)**. Arabic-first and RTL-native, Saudi-compliant (ZATCA e-invoicing, PDPL consent), with a full store & provider marketplace (stores, clinics, gyms, nail bars, at-home salons), a wallet-based commerce loop, shoppable reels, and web + mobile parity — all on a modern TypeScript monorepo.

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** v22+
- **pnpm** 9.15.4 (`corepack enable`)
- **PostgreSQL** 15+ (host or Docker)
- **Redis** 7+ (optional — rate limiting, queues and the Socket.IO adapter degrade gracefully without it)

### Local Development

```bash
# 1. Install dependencies (frozen lockfile)
pnpm install --frozen-lockfile

# 2. Set up environment
cp .env.example .env
# Edit .env with your DATABASE_URL and secrets

# 3. Generate Prisma client & apply migrations
pnpm db:generate
pnpm db:migrate:deploy
# (dev shortcut: `pnpm db:push` skips migration tracking)

# 4. Seed the database (demo users, technicians, store, wallet, content)
pnpm db:seed
# Seeded test accounts — all with password `Admin@123456`:
#   customer@test.com · admin@galaxyofbeauty.sa · tech1@test.com … tech9@test.com
#   demo-store@galaxyofbeauty.sa (store owner)

# 5. Start the dev stack
pnpm dev
```

**Open**: http://localhost:3000 · Storybook: http://localhost:6006

### Verification

```bash
pnpm format:check   # Prettier validation (0 warnings)
pnpm type-check     # TypeScript across all 6 workspaces
pnpm lint           # ESLint across all workspaces (0 errors)
pnpm build          # Full Turborepo build (Next.js 16 + Expo + API + DB + Shared + UI)
pnpm test           # Run all tests
pnpm verify         # All checks in sequence
```

---

## 🏗️ Architecture

```
galaxy-of-beauty/
├── apps/
│   ├── web/          Next.js 16 App Router — 319 routes, RTL-first
│   └── mobile/       Expo SDK 58 + Expo Router — 314 screens (EAS dev-build aligned)
├── packages/
│   ├── api/          tRPC v11 — 266 top-level routers / 1,204 procedures, Zod validation
│   ├── db/           Prisma 7 — 251 models, hand-reviewed squashed migrations
│   ├── shared/       Constants, types, i18n (5,687 keys), theme (no JSX)
│   ├── ui/           Components, hooks, Storybook (web + mobile)
│   └── config/       TSConfig, ESLint, Prettier, Tailwind preset
├── docs/             ADRs, architecture, testing, operations, audits
├── scripts/          Gates: cycles, static-Arabic, orphan routes, size budgets…
├── docker-compose.yml
├── turbo.json
└── pnpm-workspace.yaml
```

### Tech Stack

| Layer     | Technology                                                                             |
| --------- | -------------------------------------------------------------------------------------- |
| Monorepo  | Turborepo + pnpm workspaces (strict env mode: runtime vars via `globalPassThroughEnv`) |
| Web       | Next.js 16 App Router, Tailwind CSS 4, React 19                                        |
| Mobile    | Expo SDK 58, Expo Router, React Native 0.88                                            |
| API       | tRPC v11 with Zod validation + superjson transformer                                   |
| Database  | PostgreSQL 15 via Prisma 7 (driver adapter, hand-reviewed migrations)                  |
| Cache     | Redis 7 (rate limiting, BullMQ queues, Socket.IO adapter)                              |
| Auth      | JWT (HS256) — HttpOnly cookies (web) + Bearer token (mobile), 2FA (TOTP)               |
| Real-time | Socket.IO with Redis adapter, Zod-validated events                                     |
| Payments  | MyFatoorah gateway (dev stubs until the live token; wallet payments are real)          |
| Docs      | Storybook 10 for the UI component library                                              |
| Container | Docker Compose (5 services)                                                            |

---

## ✨ Feature Overview

### Marketplace core

18 root service categories (~91 bookable services) with subcategory browsing, technician profiles & KYC verification, a full booking lifecycle state machine, availability slots with **Friday (Jummah) prayer-window blocking**, dynamic pricing (tier × peak × surge), bundles, add-ons, subscriptions, and rich technician profiles (certifications, languages, social links).

### Women's services hub

A curated **94-category, 289-service catalog** — pregnancy-safe, postpartum, bridal, hijab-care, mature-skin, and 40+ life-stage/occupation categories. Every item maps deterministically onto the real booking pipeline (seeded service resolution, idempotency keys, technician auto-assign) — nothing is a dead-end placeholder.

### Kids services

Four age tiers (baby 0-2, toddler 3-6, girls 7-12, teens 13-17) with real bookings — child name/age travel in the notes, and the same Jummah/technician/idempotency guarantees as the main flow.

### Store & provider marketplace

A unified provider model — stores, clinics, gyms, nail bars, and at-home salons behind one KSA registration wizard with admin approval. Dedicated `/store` dashboards, product variants, staff roles with ownership scoping, commission settlements with an admin rate editor, and product reviews.

### Money & loyalty (integrity-first)

Wallets with **atomic, idempotent debits and withdrawals** (no lost funds on retry, no overdraw races), wallet-based store checkout, fulfill/refund gates that only move money for **paid** orders, dispute resolution with wallet refunds, cashback, gift cards, promo codes, loyalty points with expiry sweeps, and a tiered referral program. Every money path is covered by tests, including a **full wallet-purchase E2E** that asserts the exact balance delta.

### Growth & marketing

Automated outreach (welcome series, re-engagement, abandoned-cart, review requests, birthday rewards, Hijri/Gregorian season announcements) with circuit-breakered external sends.

### Reels commerce (shoppable)

Virtualized snap feeds on web + mobile (autoplay-muted, ≤3 live videos), watch analytics, moderation reports, shoppable tag overlays with a tap ledger, 7-day conversion attribution into vendor read-models, and portal reel analytics (views, watch time, clicks, attributed orders/revenue).

### Experiences & community

Beauty events (capacity, auto-promoting waitlists, FREE/PAID/VIP tiers, gated meeting links, certificates), AI beauty advisor & Beauty DNA, AR try-on, WebRTC video rooms with TURN relay, WhatsApp integration, A/B testing, and an analytics dashboard.

### Compliance, trust & operations

- **ZATCA e-invoicing**: hash-chained invoices, TLV QR, tamper-evident audit trail, VAT reports (15%) — sim mode until portal onboarding.
- **PDPL**: consent banner, consent records, GDPR-style export/delete.
- **Ops hardening shipped**: circuit breakers on external gateways, scheduled DB backups (+ restore drill), queue/disk/payment alerting, staging environment with TLS, Prometheus metrics, Sentry (dormant until the prod DSN).
- **Security**: CSRF double-submit on **every** mutation, KYC identity documents in a private bucket with signed reads, 2FA, token-family rotation with reuse detection, structured audit events.
- **i18n**: full Arabic/English with RTL, 5,687 keys, per-platform catalogs with a CI leak guard, and a static-Arabic gate on both web and mobile.

---

## 🔌 Integrations & external dependencies

| Integration  | Status                                                                                                                                                                                                                                                               |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ZATCA        | Reporting API call + full invoice lifecycle implemented. **Real-portal onboarding (CSID certs, certified crypto stamp) pending** — dev runs in sim mode (`ZATCA_SIMULATE=true`); needs `ZATCA_API_KEY`/`ZATCA_API_SECRET`. Auto-report via `ZATCA_AUTO_REPORT=true`. |
| MyFatoorah   | Payment gateway (replaced PayFort): card payments, saved cards, checkout session flow. **Live token pending** (`FATOORAH_API_TOKEN`, gitignored) — wallet payments and the money E2E run for real; online invoices run on dev stubs until the token lands.           |
| Zoom / GMeet | Meeting + recording links stored and gated to registered attendees; **no live provider API** (no auto-created meetings).                                                                                                                                             |
| OpenAI       | Beauty DNA / AI advisor / content features require an OpenAI key (features ship dormant without it).                                                                                                                                                                 |
| EAS / OTA    | Expo pipeline configured (`development` profile in `eas.json`); publishing requires `EXPO_TOKEN` (not stored in the repo).                                                                                                                                           |
| WhatsApp     | Template-driven notifications implemented (network-gated in tests).                                                                                                                                                                                                  |
| Sentry       | Error monitoring + session replay wired across web/api/mobile; browser DSN via Docker build arg `NEXT_PUBLIC_SENTRY_DSN` — dormant without it.                                                                                                                       |

> **BNPL (Tabby/Tamara)** is advertised in the checkout UI but non-functional (`PROVIDER_NOT_CONFIGURED`) until provider keys land — user-gated.

---

## ✅ Current Status

| Check             | Status                                                                                                                                                  |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TypeScript        | 6/6 workspaces passing                                                                                                                                  |
| ESLint            | 0 errors repo-wide (27 mobile / 3 web pre-existing warnings ride under per-package budgets; documented disables are gate-guarded)                       |
| Format (Prettier) | 0 warnings (repo-wide pass, `.prettierignore` added)                                                                                                    |
| Build             | 6/6 workspaces passing (Next.js 16: 319 routes; Turbo strict env mode with `globalPassThroughEnv`)                                                      |
| Web bundle size   | 221/213/298/226 KB gz per route class (FE-007 size gate against `size-baseline.json`; targets 100–150 KB remain the open debt)                          |
| API tests         | **~1,905 test cases** across api/web/shared/ui/db suites, green on CI's isolated DB                                                                     |
| Coverage          | **Ratchet enforced in CI** — floors 63/55/53/65 (measured 64.35/56.45/54.25/66.01 on 2026-10-31)                                                        |
| E2E (Playwright)  | **356 tests × 3 browser projects** (chromium + firefox + mobile Chrome) incl. the axe a11y gate and a real money-movement E2E                           |
| Contract gates    | Router inventory (266 routers / 1,204 procedures, counts + detail + sha256), money-integrity, i18n leak, cycles, static-Arabic (web + mobile)           |
| Runtime smoke     | Mobile HTTP contract script (auth, top-up, idempotency, CSRF) — 5/5                                                                                     |
| Component docs    | Storybook 10 for `@galaxy/ui` (`pnpm --filter @galaxy/ui storybook`)                                                                                    |
| CI                | Frozen install, format, lint, type-check, coverage-ratcheted tests, build, architecture gates, size budgets, E2E (3 browsers), dependency audit, Docker |
| Prod audit        | 0 critical / 3 accepted high / 2 moderate (documented in SECURITY.md)                                                                                   |

**Readiness**: verifiably correct baseline with an enforced coverage ratchet. Ops hardening is shipped (staging, backups, alerting, breakers, metrics); launch is gated on user credentials — the MyFatoorah live token, production server/domains, Sentry DSN, S3 keys, and the Apple Developer account. See [AUDIT_2026-10-30.md](docs/AUDIT_2026-10-30.md) for the full gap analysis and [LAUNCH_READINESS.md](docs/LAUNCH_READINESS.md) for the live checklist.

---

## 📋 Commands

| Command                                           | Description                                                      |
| ------------------------------------------------- | ---------------------------------------------------------------- |
| `pnpm dev`                                        | Start all dev servers                                            |
| `pnpm build`                                      | Build all workspaces                                             |
| `pnpm type-check`                                 | TypeScript check all workspaces                                  |
| `pnpm lint`                                       | ESLint all workspaces                                            |
| `pnpm format:check`                               | Check formatting                                                 |
| `pnpm test`                                       | Run all tests                                                    |
| `pnpm --filter @galaxy/api test`                  | Run API tests                                                    |
| `pnpm --filter @galaxy/api test:coverage`         | Coverage with the enforced ratchet thresholds                    |
| `pnpm --filter @galaxy/web exec playwright test`  | E2E in all 3 browser projects                                    |
| `pnpm --filter @galaxy/ui storybook`              | Component library on :6006                                       |
| `node scripts/find-static-arabic.mjs --check`     | Static-Arabic gate (mobile default, `--web` for the web ratchet) |
| `node apps/web/scripts/smoke-mobile-contract.mjs` | Runtime mobile-auth contract check (dev server required)         |
| `pnpm verify`                                     | Format → lint → type-check → build                               |
| `pnpm db:generate`                                | Regenerate Prisma client                                         |
| `pnpm db:push`                                    | Push schema to dev database                                      |
| `pnpm db:migrate:deploy`                          | Apply pending migrations                                         |
| `pnpm db:seed`                                    | Seed database                                                    |
| `pnpm audit:prod`                                 | Production dependency audit                                      |

---

## 📚 Documentation

| Document                                                              | Description                                                   |
| --------------------------------------------------------------------- | ------------------------------------------------------------- |
| [Launch Readiness](docs/LAUNCH_READINESS.md)                          | Current health, feature inventory, and the honest launch gate |
| [Known Issues](docs/KNOWN_ISSUES.md)                                  | Live issue register (refreshed 2026-10-31)                    |
| [Delivery Report](DELIVERY_REPORT.md)                                 | Historical — the original 2026-08 remediation (PR #44)        |
| [Local Testing Guide](docs/LOCAL_TESTING_GUIDE.md)                    | Test everything yourself — full checklist                     |
| [ADR-006: Web Session Model](docs/adr/006-web-session-model.md)       | Auth architecture decision                                    |
| [Model Ownership Map](docs/architecture/model-ownership.md)           | 251 models → 12 bounded contexts                              |
| [Architecture Context Map](docs/architecture/context-map.md)          | Domain classification + debt audit                            |
| [Migration Standards](docs/architecture/migration-standards.md)       | Conventions, redundant index audit                            |
| [API Risk Matrix](docs/testing/risk-matrix.md)                        | Tiered test coverage strategy                                 |
| [Deep Audit (2026-10-30)](docs/AUDIT_2026-10-30.md)                   | Full-platform audit: features, gaps, build plan               |
| [Deep Audit (2026-10-10)](docs/AUDIT_2026-10-10.md)                   | 20-item platform audit + resolution log                       |
| [Audit Report](docs/AUDIT_REPORT.md)                                  | Findings, fixes, and recommendations                          |
| [Reels Shoppable Plan](docs/REELS_SHOPPABLE_PLAN.md)                  | Phases 1–3 DELIVERED — delivery records                       |
| [UI/UX Backlog](docs/UI_UX_BACKLOG.md)                                | Accessibility/delight backlog                                 |
| [Performance Budgets](docs/frontend/performance-budgets.md)           | Web vitals targets                                            |
| [Incident Runbooks](docs/operations/runbooks.md)                      | Emergency scenarios                                           |
| [SECURITY.md](SECURITY.md)                                            | Vulnerability disclosure + audit                              |
| [Platform Rulebook](Rules_to_make_well_archtichtrue-platform.md)      | Golden rules, commands, gates, gotchas                        |
| [Project Brain](brain_code.md)                                        | Living architecture knowledge base                            |
| [Technical Debt](docs/TECHNICAL_DEBT.md)                              | Debt register with priorities                                 |
| [Store & Provider System](docs/architecture/store-provider-system.md) | Unified provider model reference                              |
| [Roadmap Recommendations](docs/ROADMAP_RECOMMENDATIONS_2026-10.md)    | Phased roadmap A–D with effort estimates                      |
| [Top-10 Platform Plan](docs/TOP10_PLATFORM_PLAN_2026-10.md)           | Fixes → store systems → launch → quality                      |

---

## 🔒 Security

- **Session model**: Server-owned HttpOnly cookies for web (no localStorage tokens); mobile uses a Bearer access token in a persisted token store. See [ADR-006](docs/adr/006-web-session-model.md).
- **2FA**: TOTP with RFC 4648 base32 secrets — standard authenticator apps work; full flow tested.
- **CSRF**: Double-submit cookie pattern with constant-time comparison, enforced on **every** mutation (not just opt-in wrappers); the document-provisioned cookie carries `Secure` in production.
- **JWT**: HS256, separate access/refresh secrets, issuer/audience/type claims, token-family rotation with reuse detection.
- **KYC privacy**: identity documents (national IDs, licenses) live in a private bucket with signed, expiring read URLs.
- **CORS**: Strict allowlist (not origin reflection).
- **Rate limiting**: Per-client-IP for anonymous, per-user for authenticated.
- **Secrets**: Production startup validates against known weak/default secrets.
- **Money integrity**: amount-checked gateway callbacks, typed authorize races, atomic + idempotent wallet debits/withdrawals, paid-only fulfill/refund gates, and post-commit notifications that can never read as payment failures.
- **Audit**: Structured security events for login, password change, token reuse.
- **Dependencies**: 3 accepted high / 2 moderate findings, 0 critical — documented in [SECURITY.md](SECURITY.md) with compensating controls and re-check cadences.

### Reporting Vulnerabilities

Email security concerns to the maintainers. Do not open a public issue.
