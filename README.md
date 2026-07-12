# ✨ Galaxy of Beauty | جالكسي بيوتي

**Secure marketplace for beauty & grooming services in Saudi Arabia.**

Galaxy of Beauty connects female customers with vetted female technicians for beauty services including hair, nails, skin care, makeup, massage, and henna. Built with security, privacy, and Saudi compliance (ZATCA, PDPL) at its core.

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** v20 LTS
- **PostgreSQL** 15+ (already running as `Galaxy_of_Beauty_db`)
- **Redis** 7+ (for caching, queues, Socket.IO)
- **npm** 9+

### Local Development (Recommended)

#### 1. Clone and install

```bash
cd "beauty project/beauty_project"

# Backend
cd backend
npm install
npx prisma generate
npx prisma db push     # Push schema to Galaxy_of_Beauty_db
cp .env.example .env   # Edit .env with your values

# Frontend
cd ../frontend
npm install
cp .env.example .env
```

#### 2. Configure environment

Edit `backend/.env`:

```env
# The database Galaxy_of_Beauty_db already exists in your local PostgreSQL
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/Galaxy_of_Beauty_db?schema=public"
JWT_ACCESS_SECRET=your-secret-at-least-32-characters-long
JWT_REFRESH_SECRET=another-secret-also-32-characters-minimum
```

#### 3. Start development servers

```bash
# Terminal 1 - Backend (port 4000)
cd backend
npm run dev

# Terminal 2 - Frontend (port 5173)
cd frontend
npm run dev
```

**Open**: [http://localhost:5173](http://localhost:5173)

#### 4. Seed the database

```bash
cd backend

# Base seed — categories, services, admin user, platform config
npm run prisma:seed

# Demo seed — sample users, technicians, bookings, reviews (optional)
npm run prisma:seed-demo
```

Creates:
- **Base seed:** Admin (`admin@galaxyofbeauty.sa` / `Admin@123456`), 6 root categories with 20 subcategories, 10 services, AI subscription plans, platform config
- **Demo seed:** 2 customers, 3 verified technicians (الرياض/جدة/الدمام), 126 availability slots (7 days), 4 bookings in various states with reviews, wallet transactions, waitlist entries

---

### Docker Compose (Staging)

```bash
docker compose up -d            # Start all services
docker compose logs -f backend   # Watch backend logs
docker compose down              # Stop everything
```

Services:
| Service | Port | Description |
|---------|------|-------------|
| Backend API | 4000 | Express.js REST + WebSocket |
| Frontend | 5173 | Vite dev server with HMR |
| PostgreSQL | 5432 | Database |
| Redis | 6379 | Cache, queues, pub/sub |

---

## 📁 Project Structure

```
beauty_project/
├── backend/                    # Express.js API server
│   ├── src/
│   │   ├── config/             # env, database, redis, logger
│   │   ├── middleware/          # auth, errorHandler, rateLimiter, validate, upload, requestId
│   │   ├── routes/              # API route handlers (modular)
│   │   ├── services/            # Business logic layer
│   │   ├── jobs/                # BullMQ queue definitions
│   │   ├── utils/               # errors, jwt, idempotency, localization, helpers
│   │   ├── validators/          # Zod schemas (shared with frontend)
│   │   ├── socket/              # Socket.IO event handlers
│   │   └── app.js               # Express app entry point
│   ├── prisma/
│   │   ├── schema.prisma        # Full database schema (25+ models)
│   │   └── seed.js              # Seed data
│   ├── tests/
│   │   ├── unit/                # Jest unit tests
│   │   ├── integration/         # Supertest API tests
│   │   └── setup.js
│   ├── Dockerfile
│   └── package.json
├── frontend/                   # React + Vite SPA
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/          # Navbar, Footer, Layout
│   │   │   ├── ui/              # LanguageSwitcher, ErrorBoundary, LoadingScreen
│   │   │   └── ai/              # ChatbotWidget (Layla)
│   │   ├── pages/               # Route pages (lazy-loaded)
│   │   ├── hooks/               # Custom React hooks
│   │   ├── store/               # Zustand stores (auth, UI)
│   │   ├── lib/                 # API client (Axios), helpers
│   │   ├── i18n/                # Arabic + English translations
│   │   ├── validators/          # Zod schemas (mirrors backend)
│   │   └── App.jsx
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── README.md
```

---

## 🗄️ Database Models (Prisma)

### Core Tables (25+)

| Model | Description |
|-------|-------------|
| User | Customers, technicians, admins |
| RefreshToken | JWT refresh token rotation |
| Technician | Extended profile, KYC, ratings |
| Wallet | Balance + bonus for each user |
| WalletTransaction | Credit/debit audit trail |
| Address | Customer saved addresses |
| Category | Nested service categories (JSONB localized) |
| Service | Beauty services with variants & add-ons |
| ServiceVariant | Price/duration modifiers |
| ServiceAddon | Add-on services |
| TechnicianService | Tech-service mapping with custom pricing |
| AvailabilitySlot | Technician calendar slots |
| Booking | Full booking lifecycle with state machine |
| Payment | PayFort gateway transactions |
| Payout | Technician earning settlements |
| Review | Customer ratings & comments |
| Dispute | Booking disputes with resolution |
| Notification | Multi-channel (email/SMS/push/in-app) |
| WaitlistEntry | Waitlist per technician |
| TermsAcceptance | Legal compliance audit |
| ZatcaInvoice | E-invoicing (ZATCA Phase 2) |
| AuditLog | Admin action audit trail |
| AiSubscriptionPlan | AI feature tiers |
| CustomerAiSubscription | AI usage tracking |
| ChatMessage | Chatbot conversation history |
| CustomerQuizResponse | Onboarding quiz results |
| PlatformConfig | Admin-configurable settings |

---

## 🔐 Security

- **Helmet** for HTTP security headers
- **CORS** whitelist with credentials
- **Rate limiting** per role (general/auth/admin tiers)
- **JWT** access (15min) + refresh (7d) with rotation
- **bcrypt** password hashing (cost factor 12)
- **Zod** input validation on all endpoints
- **Idempotency keys** for mutation endpoints (Redis-backed)
- **Request IDs** for traceability

---

## 🌍 Localization

- **Primary**: Arabic (ar) — default
- **Secondary**: English (en)
- **Direction**: RTL for Arabic, LTR for English
- **Detection**: URL path, cookie, or browser preference
- **Storage**: Translatable fields as JSONB `{ ar: "...", en: "..." }`

---

## 💳 Payment Flow (PayFort / Amazon Payment Services)

```
REQUESTED → ACCEPTED → PAYMENT_AUTHORIZED → PAID → COMPLETED
                         (authorize)          (capture)
```

---

## 🧪 Testing

```bash
# Backend
cd backend
npm test                    # All tests
npm run test:unit           # Unit tests only
npm run test:integration    # API integration tests

# Frontend
cd frontend
npm test                    # Vitest unit tests
npm run test:e2e            # Playwright E2E
```

---

## 📋 Sprint Plan

| Sprint | Focus | Status |
|--------|-------|--------|
| Sprint 0 | Project foundation, Prisma schema, Docker | ✅ Complete |
| Sprint 1 | Auth, profiles, KYC, email verify, password reset | ✅ Complete |
| Sprint 2 | Service catalog, search, admin CRUD | ✅ Complete |
| Sprint 3 | Availability & booking, Socket.IO, state machine | ✅ Complete |
| Sprint 4 | Payments (PayFort), wallet, cashback, payouts, refunds | ✅ Complete |
| Sprint 5 | Reviews, admin dashboard, notifications, ZATCA, analytics | ✅ Complete |
| Sprint 6 | AI (Layla), waitlist, wishlist, recommendations | ✅ Complete |
| Sprint 7 | Polish, testing (59/19 E2E), CI/CD, caching, scheduler | ✅ Complete |
| Sprint 8 | Mobile apps (React Native/Expo) | ✅ Complete |

---

## 📜 License & Compliance

- Saudi E-Commerce Law compliant
- PDPL (Personal Data Protection Law) — encryption at rest, audit logging
- ZATCA e-invoicing with SHA-256 hash + QR codes (Phase 1)
- Terms & Conditions acceptance with IP audit trail

---

## 🔗 API Documentation

- **Health check**: `GET /api/health`
- **API root**: `GET /api/`
- **OpenAPI Spec**: `backend/openapi.yaml` — full REST API specification

---

Built with ❤️ for Saudi Arabia

  The Problem: Redis is not running

  Your .env points to redis://localhost:6379 but Redis isn't installed natively on Windows. Since you have Docker Desktop already running, the quickest fix is Docker.

  ---
  🚀 First-Run Process (3 steps)

  Step 1: Start Redis via Docker

  Since Docker Desktop is running, just pull and start Redis:

  docker run -d --name gob-redis -p 6379:6379 redis:7-alpine

  Or use the project's Docker Compose to start only Redis:

  docker compose up -d redis

  Step 2: Start the Backend

  cd backend
  npm run dev

  This starts Express on http://localhost:4000.

  Step 3: Start the Frontend (separate terminal)

  cd frontend
  npm run dev

  This starts Vite on http://localhost:5173.
