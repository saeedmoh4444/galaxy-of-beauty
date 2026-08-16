# Galaxy of Beauty — Local Development & Docker Guide

> **Complete guide for running the platform locally with troubleshooting**

---

## 1. Prerequisites

### Required Software

| Tool           | Version | Check                 | Install                                                 |
| -------------- | ------- | --------------------- | ------------------------------------------------------- |
| **Node.js**    | 20+     | `node --version`      | [nodejs.org](https://nodejs.org)                        |
| **pnpm**       | 9+      | `pnpm --version`      | `corepack enable && corepack prepare pnpm@9 --activate` |
| **PostgreSQL** | 15+     | `psql --version`      | [postgresql.org](https://postgresql.org) or Docker      |
| **Redis**      | 7+      | `redis-cli --version` | [redis.io](https://redis.io) or Docker                  |
| **Git**        | 2.40+   | `git --version`       | [git-scm.com](https://git-scm.com)                      |

### Optional (for full platform)

| Tool               | Purpose                                                        |
| ------------------ | -------------------------------------------------------------- |
| **Docker Desktop** | Containerized development (replaces manual PostgreSQL + Redis) |
| **Expo CLI**       | Mobile app development                                         |
| **Playwright**     | E2E testing (`npx playwright install`)                         |

---

## 2. Quick Start (Local)

### 2.1 Clone and Install

```bash
# Clone the repository
git clone https://github.com/saeedmoh4444/galaxy-of-beauty.git
cd galaxy-of-beauty

# Install all dependencies
pnpm install
```

### 2.2 Set Up Environment Variables

Copy the example file to create your `.env`:

```bash
cp .env.example .env
```

The root `.env` covers all workspaces (web, api, mobile). Required variables:

```bash
# Database
DATABASE_URL="postgresql://gob_admin:gob_secure_pass_2024@localhost:5433/Galaxy_of_Beauty_db?schema=public"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT (min 32 chars)
JWT_ACCESS_SECRET="dev-access-secret-at-least-32-chars-long"
JWT_REFRESH_SECRET="dev-refresh-secret-at-least-32-chars-long"

# App
NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
EXPO_PUBLIC_API_URL="http://localhost:3000/api/trpc"
```

> ⚠️ **Prisma note:** `packages/db` also needs a `.env` with `DATABASE_URL` for Prisma Client runtime. The seed/generate scripts handle this — but if you get `Environment variable not found: DATABASE_URL`, create `packages/db/.env` with just that one line.

# Optional: Email (SMTP)

# SMTP_HOST=smtp.example.com

# SMTP_PORT=587

# SMTP_USER=user

# SMTP_PASS=pass

````

### 2.3 Start Database (Choose One)

#### Option A: Local PostgreSQL + Redis

```bash
# Start PostgreSQL 15 and Redis 7 on your machine
# macOS: brew services start postgresql@15 redis
# Linux: sudo systemctl start postgresql redis
# Windows: Start from Services or use Docker
````

#### Option B: Docker (PostgreSQL + Redis only)

```bash
docker compose up -d postgres redis
```

### 2.4 Initialize Database

```bash
# Generate Prisma client from schema
pnpm db:generate

# Push schema to database (dev only)
pnpm db:push

# Seed with test data
pnpm db:seed
```

### 2.5 Start Development Server

```bash
# Start all dev servers (web + API)
pnpm dev

# Or start just the web app
pnpm --filter @galaxy/web dev
```

**Open:** [http://localhost:3000](http://localhost:3000)

### 2.6 Test Credentials

After running `pnpm db:seed`, use these credentials:

| Role           | Email                     | Password       |
| -------------- | ------------------------- | -------------- |
| **Admin**      | `admin@galaxyofbeauty.sa` | `Admin@123456` |
| **Customer**   | `customer@test.com`       | `Admin@123456` |
| **Technician** | `tech1@test.com`          | `Admin@123456` |

---

## 3. Docker Compose (Full Stack)

### 3.1 Overview

The `docker-compose.yml` provides 5 services:

| Service      | Container      | Port | Description                          |
| ------------ | -------------- | ---- | ------------------------------------ |
| **postgres** | `gob-postgres` | 5433 | PostgreSQL 15 with persistent volume |
| **redis**    | `gob-redis`    | 6379 | Redis 7 with AOF persistence         |
| **web**      | `gob-web`      | 3000 | Next.js dev server with hot reload   |
| **socket**   | `gob-socket`   | 4001 | Socket.IO real-time server           |
| **mobile**   | `gob-mobile`   | 8081 | Expo web preview                     |

### 3.2 Start Everything

```bash
# Start all services in detached mode
docker compose up -d

# View logs
docker compose logs -f

# Check health
docker compose ps

# Stop all services
docker compose down

# Stop and remove volumes (reset database)
docker compose down -v
```

### 3.3 Service URLs

| Service      | URL                                   |
| ------------ | ------------------------------------- |
| Web App      | http://localhost:3000                 |
| API Health   | http://localhost:3000/api/trpc/health |
| Socket.IO    | http://localhost:4001                 |
| Mobile (Web) | http://localhost:8081                 |
| PostgreSQL   | localhost:5433                        |
| Redis        | localhost:6379                        |

### 3.4 First-Time Docker Setup

```bash
# 1. Build images
docker compose build

# 2. Start services
docker compose up -d

# 3. Wait for healthy (check logs)
docker compose logs postgres redis

# 4. Initialize database (run inside web container)
docker compose exec web pnpm db:generate
docker compose exec web pnpm db:push
docker compose exec web pnpm db:seed

# 5. Open browser
open http://localhost:3000
```

---

## 4. Useful Commands

### 4.1 Development

```bash
pnpm dev                 # Start all dev servers (turbo)
pnpm build               # Build all packages for production
pnpm type-check          # TypeScript check all 6 packages
pnpm lint                # Lint all packages
pnpm clean               # Clean build outputs
```

### 4.2 Database

```bash
pnpm db:generate         # Regenerate Prisma client
pnpm db:push             # Push schema to DB (dev, skips migrations)
pnpm db:migrate:dev      # Create migration from schema changes
pnpm db:migrate:deploy   # Apply pending migrations (production)
pnpm db:seed             # Seed database with test data
```

### 4.3 Testing

```bash
# Run all API tests (543 tests)
cd packages/api && pnpm test

# Run specific test file
cd packages/api && npx vitest run src/__tests__/auth-flow.test.ts

# Coverage with enforced ratchet (50/61/36/50)
cd packages/api && pnpm test:coverage

# Run E2E tests (auto-starts next start after a web build)
cd apps/web && pnpm exec playwright test

# Run E2E on specific browser
cd apps/web && pnpm exec playwright test --project=chromium

# Run E2E with UI mode
cd apps/web && pnpm exec playwright test --ui
```

### 4.4 Storybook

```bash
# Start Storybook dev server
cd packages/ui && pnpm storybook

# Build Storybook for production
cd packages/ui && pnpm build-storybook
```

### 4.5 Mobile App

```bash
# Start Expo dev server
cd apps/mobile && npx expo start

# Type-check mobile app
cd apps/mobile && pnpm type-check
```

---

## 5. Project Structure

```
galaxy-of-beauty/
├── apps/
│   ├── web/                          # Next.js 14 App Router
│   │   ├── src/
│   │   │   ├── app/                  # 254 routes (pages, layouts, API)
│   │   │   │   ├── (auth)/           # Login, Register, 2FA, Forgot/Reset
│   │   │   │   ├── (customer)/       # Dashboard, Bookings, Wallet, Profile...
│   │   │   │   ├── (public)/         # Home, Services, Technicians, Blog...
│   │   │   │   ├── admin/            # Admin dashboard, users, catalog...
│   │   │   │   └── tech/             # Technician dashboard, slots, earnings
│   │   │   ├── components/           # App-specific components
│   │   │   ├── lib/                  # tRPC client, server utilities
│   │   │   └── hooks/                # useSocket, useRetry
│   │   ├── e2e/                      # Playwright E2E tests (9 specs)
│   │   ├── tailwind.config.ts        # Tailwind + semantic token config
│   │   └── playwright.config.ts      # Playwright config (3 browsers)
│   └── mobile/                       # Expo SDK 54
│       └── src/
│           ├── app/                  # Expo Router screens (47 screens)
│           ├── components/           # Mobile components
│           └── lib/                  # API client, useQuery
├── packages/
│   ├── api/                          # tRPC API (176 routers, 400+ procedures)
│   │   └── src/
│   │       ├── routers/              # All API routers
│   │       ├── lib/                  # Auth, cache, rate-limit, CSRF, JWT...
│   │       ├── validators/           # Zod schemas
│   │       └── __tests__/            # 307 tests (15 files)
│   ├── db/                           # Prisma (87 models)
│   │   └── prisma/
│   │       ├── schema.prisma         # Database schema
│   │       └── seed.ts               # Seed data
│   ├── shared/                       # Shared UI kit + constants
│   │   └── src/
│   │       ├── ui/                   # 15 components
│   │       ├── constants.ts          # 80+ shared constants
│   │       ├── theme/                # Design tokens
│   │       ├── i18n/                 # Arabic/English translations
│   │       ├── hooks/                # useAuth, useDebounce, useForm
│   │       └── .storybook/           # Storybook config
│   └── config/                       # Shared TS, ESLint, Tailwind presets
├── docs/                             # Comprehensive documentation
│   ├── PLATFORM_TEST_PLAN.md         # Test plan with honest marks
│   ├── production_plan.md            # Production deployment plan
│   ├── UI_UX_BACKLOG.md              # 17-item UI/UX backlog
│   ├── our_galaxy_of_beauty.md       # Services catalog
│   ├── comprehensive_details_of_beautyofgalaxy.md
│   ├── platform_valuation.md         # Cost analysis
│   └── run_local.md                  # This file
├── docker-compose.yml                # 5-service Docker stack
├── turbo.json                        # Turborepo pipeline
├── pnpm-workspace.yaml               # Monorepo workspace config
└── .github/workflows/                # CI/CD pipelines
```

---

## 6. Troubleshooting

### 6.1 Database Issues

#### "Can't reach database server"

```bash
# Check if PostgreSQL is running
docker compose ps postgres
# or
pg_isready -h localhost -p 5433

# If using Docker, restart
docker compose restart postgres
```

#### "Database does not exist"

```bash
# Create the database manually
psql -h localhost -p 5433 -U gob_admin -c "CREATE DATABASE \"Galaxy_of_Beauty_db\";"

# Or let Prisma push create it
pnpm db:push
```

#### "Migration failed" or schema out of sync

```bash
# Reset database (WARNING: deletes all data)
docker compose down -v postgres
docker compose up -d postgres
pnpm db:push
pnpm db:seed
```

#### "Unique constraint failed" during seed

```bash
# The seed cleans existing data first — if it fails mid-way, re-run:
pnpm db:seed
```

### 6.2 Redis Issues

#### "Stream isn't writeable" or Redis connection errors

```
Redis isn't running or the app can't connect. The app gracefully degrades
without Redis (cache operations will log warnings but won't crash).

Fix: Start Redis
docker compose up -d redis
# or
redis-server
```

#### Rate limiting not working

```
Rate limiting requires Redis. Without Redis, rate limits are disabled
(fail-open for availability). Start Redis to enable rate limiting.
```

### 6.3 Build Issues

#### TypeScript errors in packages

```bash
# Check all packages
pnpm type-check

# If shared package has stale build cache
cd packages/shared && pnpm build
cd packages/api && pnpm build

# Full clean rebuild
pnpm clean
pnpm install
pnpm build
```

#### "Module not found" or import errors

```bash
# Reinstall dependencies
rm -rf node_modules apps/*/node_modules packages/*/node_modules
pnpm install
pnpm build
```

#### Next.js build failures (a11y linting)

```
The jsx-a11y rules are set to "warn" — they shouldn't block the build.
If the build fails on lint, check apps/web/.eslintrc.json and ensure
rules are at "warn" level, not "error".
```

### 6.4 Runtime Issues

#### "Only plain objects can be passed to Client Components" (Decimal warnings)

```
This should be fixed. The serializeForClient() duck-type converter in
apps/web/src/lib/server-trpc.ts converts Prisma Decimal to Number.
If you still see this, check that the server uses the latest code.
```

#### "CSRF token missing or invalid" in API calls

```
Mutations from browsers require a CSRF cookie + header. The TRPCProvider in
the web app handles this automatically. For direct API testing, include:
- Cookie: csrf-token=<64 hex chars>
- Header: x-csrf-token=<same 64 hex chars>

Non-browser clients (mobile app, curl) don't send an Origin header and are
exempt from the CSRF guard — they authenticate via Authorization: Bearer.
If you hit this error from a script, check that your tooling isn't adding
an Origin header, or include the cookie+header pair above.
```

#### 401 "Authentication required"

```
The API endpoint requires authentication. Login first with the seeded
credentials, then include the JWT in the Authorization header.
```

#### "Login failed" or "Token refresh failed"

```
This can happen if the refresh token unique constraint triggers.
Re-seed the database: pnpm db:seed
The seed now handles this with deleteMany before create.
```

#### Slow first page load (30+ seconds)

```
Next.js compiles pages on first request in dev mode. The home page
fetches categories + services via tRPC. First load is slow due to
compilation. Subsequent loads are fast (HMR).
```

### 6.5 Docker Issues

#### "Port already in use"

```bash
# Find what's using the port
# Windows:
netstat -ano | findstr :3000
# macOS/Linux:
lsof -i :3000

# Kill the process or change the port in docker-compose.yml
# WEB_PORT=3001 docker compose up -d
```

#### Container fails health check

```bash
# Check logs
docker compose logs postgres
docker compose logs redis

# Wait longer for first startup (PostgreSQL needs time to initialize)
docker compose restart postgres
sleep 10
docker compose ps
```

#### Volume permission errors

```bash
# Reset Docker volumes
docker compose down -v
docker compose up -d
```

### 6.6 Mobile App Issues

#### Expo can't connect to API

```
The mobile app uses EXPO_PUBLIC_API_URL to connect to the tRPC API.
For local development with Expo Go on a physical device:
- Set EXPO_PUBLIC_API_URL to your machine's local IP
- Example: EXPO_PUBLIC_API_URL=http://192.168.1.100:3000/api/trpc
- Ensure your firewall allows port 3000
```

#### Metro bundler stuck

```bash
# Clear Metro cache
cd apps/mobile
npx expo start --clear
```

---

## 7. Environment Variables Reference

### Required

| Variable             | Purpose               | Default (Dev)                                                                    |
| -------------------- | --------------------- | -------------------------------------------------------------------------------- |
| `DATABASE_URL`       | PostgreSQL connection | `postgresql://gob_admin:gob_secure_pass_2024@localhost:5433/Galaxy_of_Beauty_db` |
| `JWT_ACCESS_SECRET`  | Access token signing  | None (must be set, min 32 chars)                                                 |
| `JWT_REFRESH_SECRET` | Refresh token signing | None (must be set, min 32 chars)                                                 |

### Optional (with defaults)

| Variable                 | Default                  | Purpose                         |
| ------------------------ | ------------------------ | ------------------------------- |
| `REDIS_URL`              | `redis://localhost:6379` | Redis connection                |
| `JWT_ACCESS_EXPIRY`      | `15m`                    | Access token lifetime           |
| `JWT_REFRESH_EXPIRY`     | `7d`                     | Refresh token lifetime          |
| `CORS_ORIGIN`            | `http://localhost:3000`  | Allowed CORS origin             |
| `NEXT_PUBLIC_APP_URL`    | `http://localhost:3000`  | Public app URL                  |
| `NEXT_PUBLIC_SOCKET_URL` | `http://localhost:4001`  | Socket.IO URL                   |
| `PLATFORM_FEE_SAR`       | `11`                     | Platform fee per booking        |
| `ZATCA_SIMULATE`         | unset                    | Set to `true` to simulate ZATCA |

### Optional Service Integrations

| Variable                             | Purpose                                |
| ------------------------------------ | -------------------------------------- |
| `OPENAI_API_KEY`                     | AI features (chatbot, skin analysis)   |
| `SENTRY_DSN`                         | Error tracking                         |
| `SENTRY_TRACES_SAMPLE_RATE`          | Performance tracing (default: `0.1`)   |
| `ZATCA_VAT_NUMBER`                   | Real VAT number (uses test VAT in dev) |
| `ZATCA_API_KEY` / `ZATCA_API_SECRET` | ZATCA production credentials           |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID`       | Google OAuth login                     |
| `REFERRAL_CAMPAIGN_START`            | ISO date for referral campaign         |

---

## 8. Quick Health Check

After starting the app, verify everything works:

```bash
# 1. API health endpoint
curl http://localhost:3000/api/trpc/health
# Expected: {"status":"ok","version":"2.0.0"}

# 2. Home page loads
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
# Expected: 200

# 3. Login page loads
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/login
# Expected: 200

# 4. Database has seed data
# Connect to PostgreSQL and check:
psql -h localhost -p 5433 -U gob_admin -d Galaxy_of_Beauty_db -c "SELECT count(*) FROM users;"
# Expected: 12 (1 admin + 6 customers + 3 technicians + more)

# 5. Run tests
cd packages/api && pnpm test
# Expected: 307 passed

# 6. TypeScript check
pnpm type-check
# Expected: all 6 packages pass
```

---

## 9. Common Workflows

### Reset Everything and Start Fresh

```bash
docker compose down -v          # Stop containers, remove volumes
docker compose up -d            # Start fresh
pnpm db:push                    # Create schema
pnpm db:seed                    # Seed data
pnpm dev                        # Start dev server
```

### Test a Specific Feature End-to-End

```bash
# 1. Start server
pnpm dev

# 2. Login with test credentials (customer@test.com / Admin@123456)

# 3. Browse services → book → check wallet → check loyalty

# 4. Run specific test
cd packages/api && npx vitest run src/__tests__/booking-flow.test.ts
```

### Deploy to Staging (Docker)

```bash
# Build production images
docker compose -f docker-compose.yml build

# Tag and push to registry
docker tag gob-web:latest your-registry/galaxy-web:latest
docker push your-registry/galaxy-web:latest

# Deploy (example with docker compose on server)
docker compose -f docker-compose.prod.yml up -d
```

---

## 16. Verification Commands (2026-08-16 snapshot)

All commands verified locally and in CI (all 8 GitHub Actions jobs green):

```bash
# Quality gates
pnpm format:check          # ✅ 0 warnings
pnpm type-check            # ✅ 6/6 workspaces
pnpm lint                  # ✅ 0 errors in all workspaces
pnpm build                 # ✅ 6/6 workspaces

# Tests
pnpm --filter @galaxy/api test            # ✅ 543 tests (38 files)
pnpm --filter @galaxy/api test:coverage   # ✅ exit 0 — ratchet 50/61/36/50 enforced
pnpm --filter @galaxy/web exec playwright test  # ✅ 168/168 — chromium + firefox + mobile chrome
#   (playwright install chromium firefox first; the config auto-starts `next start`
#    after `pnpm --filter @galaxy/web build`)

# Runtime smoke test (mobile HTTP contract against the dev server)
pnpm --filter @galaxy/web dev   # terminal 1
node apps/web/scripts/smoke-mobile-contract.mjs   # terminal 2 — ✅ 5/5

# Component library
pnpm --filter @galaxy/ui storybook   # http://localhost:6006

# Dependency audit (baseline-enforced — only NEW findings fail)
node scripts/audit-check.mjs
```
