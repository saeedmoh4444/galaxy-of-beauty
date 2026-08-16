# ✨ Galaxy of Beauty | جالكسي بيوتي

**Secure marketplace for beauty & grooming services in Saudi Arabia.**

Galaxy of Beauty connects female customers with vetted female technicians across 12 beauty categories. Arabic-first, Saudi-compliant (ZATCA, PDPL), women-only platform built on a modern monorepo stack.

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** v20+
- **pnpm** 9.15.4 (`corepack enable`)
- **PostgreSQL** 15+
- **Redis** 7+

### Local Development

```bash
# 1. Install dependencies (frozen lockfile)
pnpm install --frozen-lockfile

# 2. Set up environment
cp .env.example .env
# Edit .env with your DATABASE_URL and secrets

# 3. Generate Prisma client & push schema
pnpm db:generate
pnpm db:push

# 4. Seed the database
pnpm db:seed

# 5. Start the dev server
pnpm dev
```

**Open**: http://localhost:3000

### Verification

```bash
pnpm format:check   # Prettier validation
pnpm type-check     # TypeScript across all workspaces
pnpm build          # Full Turborepo build
pnpm test           # Run all tests
pnpm verify         # All checks in sequence
```

---

## 🏗️ Architecture

```
galaxy-of-beauty/
├── apps/
│   ├── web/          Next.js 14 App Router (280 routes)
│   └── mobile/       Expo SDK 57 + Expo Router
├── packages/
│   ├── api/          tRPC v11 — 245 routers, Zod validation
│   ├── db/           Prisma — 202 models, 8 migrations
│   ├── shared/       Constants, types, i18n, theme (no JSX)
│   ├── ui/           Components, hooks (JSX, web + mobile)
│   └── config/       TSConfig, ESLint, Prettier, Tailwind
├── docs/             ADRs, architecture, testing, operations
├── docker-compose.yml
├── turbo.json
└── pnpm-workspace.yaml
```

### Tech Stack

| Layer     | Technology                                                |
| --------- | --------------------------------------------------------- |
| Monorepo  | Turborepo + pnpm workspaces                               |
| Web       | Next.js 14 App Router, Tailwind CSS, React 18             |
| Mobile    | Expo SDK 57, Expo Router, React Native 0.81               |
| API       | tRPC v11 with Zod validation                              |
| Database  | PostgreSQL 15 via Prisma ORM                              |
| Cache     | Redis 7 (rate limiting, queues, Socket.IO adapter)        |
| Auth      | JWT (HS256) with HttpOnly cookies + token family rotation |
| Real-time | Socket.IO with Redis adapter, Zod-validated events        |
| Container | Docker Compose (5 services)                               |

---

## ✅ Current Status

| Check             | Status                                                       |
| ----------------- | ------------------------------------------------------------ |
| TypeScript        | 7/7 workspaces passing                                       |
| Build             | 6/6 workspaces passing (Next.js: 280 routes)                 |
| Format (Prettier) | 0 warnings                                                   |
| Tests             | 24 files, 350 tests passing                                  |
| CI                | Frozen install, format, type-check, lint, build, E2E, Docker |
| Prod audit        | 15 high findings (documented in SECURITY.md)                 |

---

## 📋 Commands

| Command                          | Description                        |
| -------------------------------- | ---------------------------------- |
| `pnpm dev`                       | Start all dev servers              |
| `pnpm build`                     | Build all workspaces               |
| `pnpm type-check`                | TypeScript check all workspaces    |
| `pnpm lint`                      | Run linter                         |
| `pnpm format:check`              | Check formatting                   |
| `pnpm test`                      | Run all tests                      |
| `pnpm --filter @galaxy/api test` | Run API tests (350 tests)          |
| `pnpm verify`                    | Format → lint → type-check → build |
| `pnpm db:generate`               | Regenerate Prisma client           |
| `pnpm db:push`                   | Push schema to dev database        |
| `pnpm db:migrate:dev`            | Create migration from schema       |
| `pnpm db:migrate:deploy`         | Apply pending migrations           |
| `pnpm db:seed`                   | Seed database                      |
| `pnpm audit:prod`                | Production dependency audit        |

---

## 📚 Documentation

| Document                                                        | Description                        |
| --------------------------------------------------------------- | ---------------------------------- |
| [ADR-006: Web Session Model](docs/adr/006-web-session-model.md) | Auth architecture decision         |
| [Model Ownership Map](docs/architecture/model-ownership.md)     | 202 models → 12 bounded contexts   |
| [Architecture Context Map](docs/architecture/context-map.md)    | Domain classification + debt audit |
| [Migration Standards](docs/architecture/migration-standards.md) | Conventions, redundant index audit |
| [API Risk Matrix](docs/testing/risk-matrix.md)                  | Tiered test coverage strategy      |
| [Performance Budgets](docs/frontend/performance-budgets.md)     | Web vitals targets                 |
| [Incident Runbooks](docs/operations/runbooks.md)                | 7 emergency scenarios              |
| [SECURITY.md](SECURITY.md)                                      | Vulnerability disclosure + audit   |

---

## 🔒 Security

- **Session model**: Server-owned HttpOnly cookies (no localStorage tokens). See [ADR-006](docs/adr/006-web-session-model.md).
- **CSRF**: Double-submit cookie pattern with constant-time comparison on all mutations.
- **JWT**: HS256, separate access/refresh secrets, issuer/audience/type claims enforced.
- **CORS**: Strict allowlist (not origin reflection).
- **Rate limiting**: Per-client-IP for anonymous, per-user for authenticated.
- **Secrets**: Production startup validates against known weak/default secrets.
- **Audit**: Structured security events for login, password change, token reuse.
- **Dependencies**: 15 accepted high findings documented in [SECURITY.md](SECURITY.md).

### Reporting Vulnerabilities

Email security concerns to the maintainers. Do not open a public issue.
