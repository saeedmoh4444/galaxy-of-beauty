# ✨ Galaxy of Beauty | جالكسي بيوتي

**Secure marketplace for beauty & grooming services in Saudi Arabia.**

Galaxy of Beauty connects female customers with vetted female technicians for 45 beauty services across 12 categories — hair, nails, skin care, makeup, massage, henna, waxing, lashes, body treatments, bridal, men's grooming, and spa. Arabic-first, Saudi-compliant (ZATCA, PDPL), women-only platform built on a modern monorepo stack.

[![Type Check](https://img.shields.io/badge/type--check-10%2F10-brightgreen)](#)
[![Lint](https://img.shields.io/badge/lint-7%2F7-brightgreen)](#)
[![Build](https://img.shields.io/badge/build-5%2F5-brightgreen)](#)
[![Docker](https://img.shields.io/badge/docker-5%2F5-brightgreen)](#)

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

| Service               | Container      | Port | Status |
| --------------------- | -------------- | ---- | ------ |
| Web (Next.js)         | `gob-web`      | 3000 | 🟢     |
| Socket.IO (Real-time) | `gob-socket`   | 4001 | 🟢     |
| Mobile (Expo)         | `gob-mobile`   | 8081 | 🟢     |
| PostgreSQL 15         | `gob-postgres` | 5432 | 🟢     |
| Redis 7               | `gob-redis`    | 6379 | 🟢     |

---

## 🏗️ Architecture

```
galaxy-of-beauty/
├── apps/
│   ├── web/                    # Next.js 14 App Router (254 routes, 10 SSR pages)
│   └── mobile/                 # Expo SDK 54 + Expo Router (47 screens)
├── packages/
│   ├── api/                    # tRPC v11 — 177 routers in 14 domain modules
│   ├── db/                     # Prisma — 140+ models, 9 migrations
│   ├── shared/                 # Constants, types, i18n, theme (pure, no JSX)
│   ├── ui/                     # 18 UI components, 3 hooks (JSX, for web + mobile)
│   └── config/                 # TSConfig, ESLint, Prettier, Tailwind
├── docs/                       # ADRs, architecture docs, planning
├── docker-compose.yml          # 5-service Docker stack with health checks
├── turbo.json                  # Turborepo build pipeline
└── pnpm-workspace.yaml
```

### Tech Stack

| Layer         | Technology                                    |
| ------------- | --------------------------------------------- |
| **Monorepo**  | Turborepo + pnpm workspaces                   |
| **Web**       | Next.js 14 App Router, Tailwind CSS, React 18 |
| **Mobile**    | Expo SDK 54, Expo Router, React Native 0.81   |
| **API**       | tRPC v11 with Zod validation                  |
| **Database**  | PostgreSQL 15 via Prisma ORM                  |
| **Cache**     | Redis 7                                       |
| **Auth**      | JWT access (15m) + refresh (7d) with rotation |
| **Container** | Docker Compose (5 services)                   |

---

## ✨ Features (50+ Total)

### 🔐 Auth & Identity

- Register (Customer/Technician), Login with JWT
- Email verification, Forgot/Reset password
- 2FA with authenticator app (TOTP)
- Role-based access (Customer / Technician / Admin)

### 🏠 Public

- Landing page with 12 categories
- 45 services with search, filter, sort, variants
- Service detail with pricing, duration, technicians
- Surprise Me — AI-powered random recommendations
- Technician search & profiles (9 verified technicians)
- Beauty bundles (4 curated packages)
- Dynamic pricing (weekend/peak multipliers)
- Seasonal offers (Eid, Ramadan, Wedding, Graduation)

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
pnpm type-check     # 10/10 workspaces
pnpm lint           # 7/7 tasks
pnpm build          # 5/5 tasks — 254 Next.js routes
pnpm test           # 318 tests (16 suites) — 100% pass
pnpm test:e2e       # 38/38 chromium (100%)
pnpm db:seed:enrich # 500+ bookings, 30+ customers, 100+ reviews
```

### API Health

```bash
curl http://localhost:3000/api/trpc/health
# → {"status":"ok","version":"2.0.0"}
```

### Pipeline Status

```bash
pnpm type-check   # 10/10 workspaces ✅
pnpm lint         # 7/7 ✅
pnpm build        # 5/5 — 254 Next.js routes ✅
pnpm test         # 307 tests (15 suites) ✅
```

### New Features (Post-MVP)

| Category       | Features                                                                                              |
| -------------- | ----------------------------------------------------------------------------------------------------- |
| New Categories | Waxing ✨ · Lash Extensions 👁️ · Body Treatments 🧖‍♀️ · Bridal 👰 · Men's Grooming 💇‍♂️ · Spa 🧘          |
| Social         | Group Bookings 👯‍♀️ · Community Feed 💬 · Inspiration Board 📌 · Mood Board 🎨                          |
| Wedding        | Bridal Concierge 👰 · Gift Registry 🎁                                                                |
| Content        | Beauty Blog 📝 · Seasonal Lookbook 📸 · Seasonal Campaigns 📢 · Beauty Tutorials 📹                   |
| Wellness       | Self-Care Tracker 🌸 · Beauty Budget 💰 · Beauty Profile 💄 · Wellness Tracker 🧘                     |
| Convenience    | Recurring Bookings 🔄 · Emergency Booking 🚨 · Favorites ⭐ · Home Service 🏠                         |
| Marketing      | Mommy & Me 👩‍👧 · Beauty Quiz ✨ · Rewards Catalog 🏆 · Birthday Rewards 🎂                             |
| Trust          | Technician Badges 🏅 · Loyalty Tiers 👑                                                               |
| Infrastructure | Domain Modules (14) · Job Queues (BullMQ ×4) · Real Monitoring · Rate Limiting · CSRF · Session Mgmt  |
| Platform       | Language Toggle 🌐 · Social Sharing 🔗 · Add to Calendar 📅 · Salon Map 🗺️ · Web Vitals · JSON-LD SEO |
| Innovation     | Virtual Try-On AR 🤳 · AI Skin Analysis 🔬 · Beauty Analytics 📊 · Post-Service Care 💆‍♀️               |
| Family         | Family Account 👨‍👩‍👧 · Challenges 🏆                                                                     |
| Engagement     | Referral Leaderboard 🎫 · Technician Q&A 💬 · Event Ticketing 🎟️ · Beauty Events 📅                   |

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

| Command                              | Description               |
| ------------------------------------ | ------------------------- |
| `pnpm dev`                           | Start all dev servers     |
| `pnpm build`                         | Build all workspaces      |
| `pnpm type-check`                    | TypeScript check all      |
| `pnpm lint`                          | Lint all workspaces       |
| `pnpm test`                          | Run API tests (189 tests) |
| `pnpm --filter @galaxy/web test:e2e` | Playwright E2E tests      |
| `pnpm db:generate`                   | Regenerate Prisma client  |
| `pnpm db:push`                       | Push schema to database   |
| `pnpm db:seed`                       | Seed the database         |
| `pnpm clean`                         | Clean all build outputs   |

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
