# ✨ Galaxy of Beauty | جالكسي بيوتي

**Secure marketplace for beauty & grooming services in Saudi Arabia.**

Galaxy of Beauty connects female customers with vetted female technicians across 12 beauty categories. Arabic-first, Saudi-compliant (ZATCA, PDPL), women-only platform built on a modern monorepo stack.

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** v22+
- **pnpm** 9.15.4 (`corepack enable`)
- **PostgreSQL** 15+
- **Redis** 7+ (optional — rate limiting and queues degrade gracefully without it)

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

# 4. Seed the database
pnpm db:seed

# 5. Start the dev server
pnpm dev
```

**Open**: http://localhost:3000

### Verification

```bash
pnpm format:check   # Prettier validation (0 warnings)
pnpm type-check     # TypeScript across all workspaces (6/6)
pnpm lint           # ESLint across all workspaces (0 errors)
pnpm build          # Full Turborepo build
pnpm test           # Run all tests
pnpm verify         # All checks in sequence
```

---

## 🏗️ Architecture

```
galaxy-of-beauty/
├── apps/
│   ├── web/          Next.js 16 App Router (300+ routes)
│   └── mobile/       Expo SDK 57 + Expo Router
├── packages/
│   ├── api/          tRPC v11 — 266 routers, Zod validation
│   ├── db/           Prisma — 234 models, 10 migrations
│   ├── shared/       Constants, types, i18n, theme (no JSX)
│   ├── ui/           Components, hooks, Storybook (JSX, web + mobile)
│   └── config/       TSConfig, ESLint, Prettier, Tailwind preset
├── docs/             ADRs, architecture, testing, operations
├── docker-compose.yml
├── turbo.json
└── pnpm-workspace.yaml
```

### Tech Stack

| Layer     | Technology                                                               |
| --------- | ------------------------------------------------------------------------ |
| Monorepo  | Turborepo + pnpm workspaces                                              |
| Web       | Next.js 16 App Router, Tailwind CSS 4, React 19                          |
| Mobile    | Expo SDK 57, Expo Router, React Native 0.87                              |
| API       | tRPC v11 with Zod validation + superjson transformer                     |
| Database  | PostgreSQL 15 via Prisma ORM                                             |
| Cache     | Redis 7 (rate limiting, queues, Socket.IO adapter)                       |
| Auth      | JWT (HS256) — HttpOnly cookies (web) + Bearer token (mobile), 2FA (TOTP) |
| Real-time | Socket.IO with Redis adapter, Zod-validated events                       |
| Docs      | Storybook 10 for the UI component library                                |
| Container | Docker Compose (5 services)                                              |

---

## ✨ Feature Overview

**Marketplace core** — service catalog across 12 beauty categories, technician profiles & KYC, bookings with a full lifecycle state machine, slots, dynamic pricing (tier × peak × surge), service bundles, add-ons, subscriptions, and a vendor marketplace with unified provider model.

**Commerce & loyalty** — wallets with top-up and cashback, gift cards, BNPL, promo codes, loyalty points with boosts and expiry sweeps, referral program 2.0 (tiered rewards 50/200/500, monthly prize leaderboard, UTM attribution), influencer program with booking commissions.

**Growth & marketing** — automated outreach: welcome series (day 0/1/3/7), 30-day re-engagement, abandoned-cart nudges, post-booking review requests, birthday rewards, season-start announcements (Hijri/Gregorian calendar).

**Experiences** — beauty events platform (capacity + auto-promoting waitlists, FREE/PAID/VIP tiers, gated meeting/recording links, certificates of completion), women's lifestyle expansion (clinics, fitness), kids plan, social commerce and shoppable content.

**Compliance & trust** — ZATCA e-invoicing (hash-chained invoices, TLV QR, tamper-evident audit trail, VAT reports with CSV export, clearance flow), PDPL pages, ZATCA-ready VAT handling (15%).

**Platform** — AI beauty advisor & Beauty DNA, WhatsApp integration, A/B testing, analytics dashboard, observability 2.0 (OTel tracing, SLO counters, incident playbooks), dark mode, full Arabic/English with RTL, web + mobile parity.

## 🔌 Integrations & external dependencies

| Integration  | Status                                                                                                                                                                                                                                                               |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ZATCA        | Reporting API call + full invoice lifecycle implemented. **Real-portal onboarding (CSID certs, certified crypto stamp) pending** — dev runs in sim mode (`ZATCA_SIMULATE=true`); needs `ZATCA_API_KEY`/`ZATCA_API_SECRET`. Auto-report via `ZATCA_AUTO_REPORT=true`. |
| MyFatoorah   | Payment gateway (replaced PayFort): card payments, saved cards, checkout session flow, sandbox tested end-to-end. **Live token pending** (`FATOORAH_API_TOKEN`, gitignored).                                                                                         |
| Zoom / GMeet | Meeting + recording links stored and gated to registered attendees; **no live provider API** (no auto-created meetings).                                                                                                                                             |
| OpenAI       | Beauty DNA / AI advisor / content features require an OpenAI key (features ship dormant without it).                                                                                                                                                                 |
| EAS / OTA    | Expo pipeline configured (`development` profile in `eas.json`); publishing requires `EXPO_TOKEN` (not stored in the repo).                                                                                                                                           |
| WhatsApp     | Template-driven notifications implemented (network-gated in tests).                                                                                                                                                                                                  |
| Sentry       | Error monitoring + session replay wired across web/api/mobile; browser DSN via Docker build arg `NEXT_PUBLIC_SENTRY_DSN` — dormant without it.                                                                                                                       |

---

## ✅ Current Status

| Check             | Status                                                                                                                              |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| TypeScript        | 6/6 workspaces passing                                                                                                              |
| ESLint            | 0 errors in all workspaces (real ESLint, not tsc aliasing)                                                                          |
| Format (Prettier) | 0 warnings (repo-wide pass, `.prettierignore` added)                                                                                |
| Build             | 6/6 workspaces passing (Next.js 16: 300+ routes)                                                                                    |
| API tests         | 150+ files, **1,360+ tests** passing                                                                                                |
| Coverage          | Enforced per-workspace ratchet thresholds, exit 0                                                                                   |
| E2E (Playwright)  | 25 specs — full suite passing on every PR (chromium + firefox + mobile Chrome)                                                      |
| Runtime smoke     | Mobile HTTP contract script (auth, top-up, idempotency, CSRF) — 5/5                                                                 |
| Component docs    | Storybook 10 for `@galaxy/ui` (`pnpm --filter @galaxy/ui storybook`)                                                                |
| CI                | Frozen install, format, lint, type-check, test, build, architecture gates, size budgets, E2E (3 browsers), dependency audit, Docker |
| Prod audit        | 8 accepted high findings, 0 critical (documented in SECURITY.md)                                                                    |

**Readiness**: verifiably correct baseline with active coverage ratchet — not yet production-hardened (see [DELIVERY_REPORT.md](DELIVERY_REPORT.md) addendum for the full program status).

---

## 📋 Commands

| Command                                           | Description                                              |
| ------------------------------------------------- | -------------------------------------------------------- |
| `pnpm dev`                                        | Start all dev servers                                    |
| `pnpm build`                                      | Build all workspaces                                     |
| `pnpm type-check`                                 | TypeScript check all workspaces                          |
| `pnpm lint`                                       | ESLint all workspaces                                    |
| `pnpm format:check`                               | Check formatting                                         |
| `pnpm test`                                       | Run all tests                                            |
| `pnpm --filter @galaxy/api test`                  | Run API tests (1,360+ tests)                             |
| `pnpm --filter @galaxy/api test:coverage`         | Coverage with enforced ratchet thresholds                |
| `pnpm --filter @galaxy/web exec playwright test`  | E2E in all 3 browser projects                            |
| `pnpm --filter @galaxy/ui storybook`              | Component library on :6006                               |
| `node apps/web/scripts/smoke-mobile-contract.mjs` | Runtime mobile-auth contract check (dev server required) |
| `pnpm verify`                                     | Format → lint → type-check → build                       |
| `pnpm db:generate`                                | Regenerate Prisma client                                 |
| `pnpm db:push`                                    | Push schema to dev database                              |
| `pnpm db:migrate:dev`                             | Create migration from schema                             |
| `pnpm db:migrate:deploy`                          | Apply pending migrations                                 |
| `pnpm db:seed`                                    | Seed database                                            |
| `pnpm audit:prod`                                 | Production dependency audit                              |

---

## 📚 Documentation

| Document                                                           | Description                                |
| ------------------------------------------------------------------ | ------------------------------------------ |
| [Delivery Report](DELIVERY_REPORT.md)                              | Full program status + follow-up addendum   |
| [Local Testing Guide](docs/LOCAL_TESTING_GUIDE.md)                 | Test everything yourself — full checklist  |
| [ADR-006: Web Session Model](docs/adr/006-web-session-model.md)    | Auth architecture decision                 |
| [Model Ownership Map](docs/architecture/model-ownership.md)        | 202 models → 12 bounded contexts           |
| [Architecture Context Map](docs/architecture/context-map.md)       | Domain classification + debt audit         |
| [Migration Standards](docs/architecture/migration-standards.md)    | Conventions, redundant index audit         |
| [API Risk Matrix](docs/testing/risk-matrix.md)                     | Tiered test coverage strategy              |
| [Audit Plan](docs/AUDIT_PLAN.md)                                   | End-to-end bug-audit methodology (A–E)     |
| [Audit Report](docs/AUDIT_REPORT.md)                               | Findings, fixes, and recommendations       |
| [UI/UX Backlog](docs/UI_UX_BACKLOG.md)                             | Accessibility/delight backlog — 17/17 done |
| [Performance Budgets](docs/frontend/performance-budgets.md)        | Web vitals targets                         |
| [Incident Runbooks](docs/operations/runbooks.md)                   | 7 emergency scenarios                      |
| [SECURITY.md](SECURITY.md)                                         | Vulnerability disclosure + audit           |
| [Platform Rulebook](Rules_to_make_well_archtichtrue-platform.md)   | Golden rules, commands, gates, gotchas     |
| [Project Brain](brain_code.md)                                     | Living architecture knowledge base         |
| [i18n Catalog Split](docs/architecture/i18n-catalog-split.md)      | Per-platform catalogs + CI leak guard      |
| [Technical Debt](docs/TECHNICAL_DEBT.md)                           | Debt register with priorities              |
| [Roadmap Recommendations](docs/ROADMAP_RECOMMENDATIONS_2026-10.md) | Phased roadmap A–D with effort estimates   |

---

## 🔒 Security

- **Session model**: Server-owned HttpOnly cookies for web (no localStorage tokens); mobile uses a Bearer access token in a persisted token store. See [ADR-006](docs/adr/006-web-session-model.md).
- **2FA**: TOTP with RFC 4648 base32 secrets — standard authenticator apps work; full flow tested.
- **CSRF**: Double-submit cookie pattern with constant-time comparison; non-browser clients (no `Origin` header) are exempt by design — the browser path is tested end-to-end.
- **JWT**: HS256, separate access/refresh secrets, issuer/audience/type claims, token-family rotation with reuse detection.
- **CORS**: Strict allowlist (not origin reflection).
- **Rate limiting**: Per-client-IP for anonymous, per-user for authenticated.
- **Secrets**: Production startup validates against known weak/default secrets.
- **Audit**: Structured security events for login, password change, token reuse.
- **Dependencies**: 8 accepted high findings, 0 critical — documented in [SECURITY.md](SECURITY.md).

### Reporting Vulnerabilities

Email security concerns to the maintainers. Do not open a public issue.
