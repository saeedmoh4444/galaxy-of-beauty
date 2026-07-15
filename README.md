# ✨ Galaxy of Beauty | جالكسي بيوتي

**Secure marketplace for beauty & grooming services in Saudi Arabia.**

Galaxy of Beauty connects female customers with vetted female technicians for beauty services — hair, nails, skin care, makeup, massage, and henna. Arabic-first, Saudi-compliant (ZATCA, PDPL), and built on a modern monorepo stack.

[![Type Check](https://img.shields.io/badge/type--check-8%2F8-brightgreen)](#)
[![Lint](https://img.shields.io/badge/lint-5%2F5-brightgreen)](#)
[![Build](https://img.shields.io/badge/build-5%2F5-brightgreen)](#)
[![Docker](https://img.shields.io/badge/docker-4%2F4-brightgreen)](#)

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** v20+
- **pnpm** 9+ (`corepack enable && corepack prepare pnpm@9 --activate`)
- **PostgreSQL** 15+ 
- **Redis** 7+
- **Docker Desktop** (optional, for containerized dev)

### Local Development

```bash
# 1. Install dependencies
pnpm install

# 2. Generate Prisma client & push schema
pnpm db:generate
pnpm db:push

# 3. Seed the database
pnpm db:seed

# 4. Start the dev server
pnpm dev
```

**Open**: [http://localhost:3000](http://localhost:3000)

### Docker Compose

```bash
docker compose up -d            # Start all services
docker compose ps               # Check health
docker compose down             # Stop everything
```

| Service | Container | Port | Status |
|---------|-----------|------|--------|
| Web (Next.js) | `gob-web` | 3000 | 🟢 |
| Mobile (Expo) | `gob-mobile` | 8081 | 🟢 |
| PostgreSQL 15 | `gob-postgres` | 5432 | 🟢 |
| Redis 7 | `gob-redis` | 6379 | 🟢 |

---

## 🏗️ Architecture

```
galaxy-of-beauty/
├── apps/
│   ├── web/                    # Next.js 14 App Router (65+ pages)
│   └── mobile/                 # Expo SDK 54 + Expo Router (55+ screens)
├── packages/
│   ├── api/                    # tRPC v11 — 47 routers, 200+ procedures
│   ├── db/                     # Prisma — 55+ models, 15 enums, seed (24 cities, 122 areas)
│   ├── shared/                 # UI kit (15 components), hooks, i18n, theme
│   └── config/                 # TSConfig, ESLint, Prettier, Tailwind
├── docker-compose.yml          # 4-service Docker stack with health checks
├── turbo.json                  # Turborepo build pipeline
└── pnpm-workspace.yaml
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| **Monorepo** | Turborepo + pnpm workspaces |
| **Web** | Next.js 14 App Router, Tailwind CSS, React 18 |
| **Mobile** | Expo SDK 54, Expo Router, React Native 0.81 |
| **API** | tRPC v11 with Zod validation |
| **Database** | PostgreSQL 15 via Prisma ORM |
| **Cache** | Redis 7 |
| **Auth** | JWT access (15m) + refresh (7d) with rotation |
| **Container** | Docker Compose (4 services) |

---

## ✨ Features (41 Total)

### 🔐 Auth & Identity
- Register (Customer/Technician), Login with JWT
- Email verification, Forgot/Reset password
- 2FA with authenticator app (TOTP)
- Role-based access (Customer / Technician / Admin)

### 🏠 Public
- Landing page with categories
- Service catalog with search, filter, sort
- Service detail with variants, pricing, technicians
- Surprise Me — AI-powered random recommendations
- Technician search & profiles

### 👤 Customer
- Dashboard with stats + quick actions
- Booking management (request, track, cancel)
- Wallet (balance, transactions, cashback, withdraw)
- Wishlist (services + technicians)
- Waitlist for busy technicians
- Notifications (in-app)
- Profile + Address management (CRUD)
- Reviews & ratings history
- Referral program (codes, rewards)
- Beauty streaks & achievements
- Disputes (open, track, resolve)
- AI chatbot "Layla" (OpenAI-powered)
- AI subscription plans & usage

### 💇 Technician
- Dashboard + pending bookings
- Availability slot management
- Booking actions (accept, start, complete, no-show)
- Earnings dashboard + payout requests
- KYC profile + service portfolio
- Google Calendar sync

### 🛡️ Admin
- Dashboard with real-time KPIs
- User management (list, suspend)
- Booking oversight (all bookings, filter by status)
- Financial management (revenue, payouts)
- Category CRUD with nesting
- Service CRUD (variants, tags, add-ons)
- Technician KYC verification
- Analytics & reports
- Dispute resolution
- ZATCA e-invoicing
- Platform settings + maintenance mode

### 🌍 Localization
- Arabic (ar) — default, RTL
- English (en) — LTR
- Bilingual content (JSONB `{ ar, en }`)

---

## 📊 Verification

```bash
pnpm type-check     # 8/8 workspaces — FULL TURBO
pnpm lint           # 5/5 tasks — zero errors
pnpm build          # 5/5 tasks — 37 Next.js routes
```

### API Health

```bash
curl http://localhost:3000/api/trpc/health
# → {"status":"ok","version":"2.0.0"}
```

### Database Seed

```
Admin: admin@galaxyofbeauty.sa / Admin@123456
6 root categories, 10 sub-categories
7 services with variants
10 Saudi cities, 4 service tags, 3 achievements
AI subscription plans
```

---

## 🔐 Security

- Helmet HTTP security headers
- CORS whitelist with credentials
- Rate limiting per role tier
- JWT access (15min) + refresh (7d) with rotation + reuse detection
- bcrypt password hashing (cost factor 12)
- Zod input validation on all tRPC procedures
- Idempotency keys for payment mutations
- Request IDs for traceability
- Login lockout (5 attempts / 15 min) via Redis
- CSRF protection

---

## 📦 Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all dev servers |
| `pnpm build` | Build all workspaces |
| `pnpm type-check` | TypeScript check all |
| `pnpm lint` | Lint all workspaces |
| `pnpm db:generate` | Regenerate Prisma client |
| `pnpm db:push` | Push schema to database |
| `pnpm db:seed` | Seed the database |
| `pnpm clean` | Clean all build outputs |

---

## 📜 Compliance

- Saudi E-Commerce Law
- PDPL (Personal Data Protection Law)
- ZATCA e-invoicing with SHA-256 hash + QR codes
- Terms acceptance with IP audit trail

---

## 🔗 Links

- **Repo**: [github.com/saeedmoh4444/galaxy-of-beauty](https://github.com/saeedmoh4444/galaxy-of-beauty)
- **Web**: [localhost:3000](http://localhost:3000)
- **Mobile Web**: [localhost:8081](http://localhost:8081)
- **API Health**: [localhost:3000/api/trpc/health](http://localhost:3000/api/trpc/health)

---

Built with ❤️ for Saudi Arabia
