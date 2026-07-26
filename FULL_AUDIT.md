# 🔍 Galaxy of Beauty — Full System Audit Report

> **Date:** 2026-07-26  
> **Auditor:** Automated Systematic Analysis  
> **Scope:** Entire repository — all workspaces, legacy code, infrastructure, tests, and documentation  
> **Methodology:** Phase 0→5 structured deep-dive per audit plan

---

## Executive Summary

**Galaxy of Beauty (جالكسي بيوتي)** is a Saudi-focused beauty & grooming marketplace connecting female customers with vetted female technicians. The platform supports booking management, payments (PayFort/APS), wallet/cashback, AI chatbot ("Layla"), gamification (streaks, achievements, referrals), ZATCA e-invoicing, product marketplace, subscription boxes, and video consultations.

### Overall Health: ⚠️ GOOD — With Technical Debt Concerns

The project has been through a **greenfield rebuild** from an Express + React/Vite + npm stack into a modern **Next.js 14 + tRPC + Turborepo + pnpm monorepo** stack. The rebuild delivered 41 features across web and mobile, with all 8 workspaces passing type-check, lint, and build.

**However**, the repository currently contains **BOTH the legacy stack AND the new monorepo stack side-by-side**, creating significant confusion, duplication, and maintenance risk.

### Critical Risks

| # | Risk | Severity | Status |
|---|------|----------|--------|
| 1 | **Dual codebases** — legacy (`backend/`, `frontend/`, `mobileapp/`) and modern (`apps/`, `packages/`) exist together with overlapping functionality | 🔴 Critical | Needs resolution |
| 2 | **81 `as never`/`as any` casts** across 37 web pages — widespread type-safety erosion | 🔴 Critical | Needs fixing |
| 3 | **Two separate Prisma schemas** — `backend/prisma/` (909 lines) and `packages/db/prisma/` (1313 lines) with divergent models | 🟠 High | Must consolidate |
| 4 | **No integration/E2E tests for tRPC procedures** — 7 test files are pure unit tests with replicated logic, never hitting the actual database | 🟠 High | Gap in test coverage |
| 5 | **All web pages are `'use client'`** — no SSR/Server Components for SEO-critical marketplace pages | 🟡 Medium | Performance debt |
| 6 | **31 `eslint-disable` comments** sprinkled across 13 files | 🟡 Medium | Code quality erosion |

---

## Tech Stack Overview

| Layer | Legacy Stack | Modern Stack (Monorepo) |
|-------|-------------|------------------------|
| **Monorepo** | None (separate npm projects) | Turborepo 2.x + pnpm 9.15.4 workspaces |
| **Web Frontend** | React 18 + Vite + React Router v6 | Next.js 14 App Router + React 18 |
| **Mobile** | Expo SDK 54 + React Navigation | Expo SDK 54 + Expo Router + React 19 |
| **API Layer** | Express.js REST (27 route modules) | tRPC v11 (46 routers, 170+ procedures) |
| **Database** | PostgreSQL 15 + Prisma (25+ models) | PostgreSQL 15 + Prisma (42 models) |
| **Cache/Queue** | Redis 7 + BullMQ | Redis 7 (ioredis) |
| **Auth** | JWT (access 15m + refresh 7d) in Express | JWT (access 15m + refresh 7d) in tRPC context |
| **Validation** | Zod (dedicated validators) | Zod (dedicated validators — reused) |
| **Real-time** | Socket.IO | Socket.IO (standalone server on port 4001) |
| **State Mgmt** | Zustand + React Query + Axios | tRPC + React Query (no Zustand) |
| **UI** | Tailwind CSS + Headless UI + Heroicons | Tailwind CSS + shared UI kit (`@galaxy/shared`) |
| **i18n** | i18next (ar/en) | i18next (ar/en) in shared package |
| **Payments** | PayFort/APS | PayFort/APS |
| **AI** | OpenAI GPT-4o-mini | OpenAI GPT-4o-mini |
| **Testing** | Jest + Supertest (backend), Vitest + Playwright (frontend) | Vitest (API unit), Playwright (Web E2E) |
| **CI/CD** | GitHub Actions | GitHub Actions |
| **Container** | Docker Compose (4 services) | Docker Compose (4 services) |
| **Deploy** | PM2 + Nginx | PM2 + Nginx (same deploy/ configs) |

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENTS                                       │
│  ┌──────────────────────┐    ┌──────────────────────────┐           │
│  │  apps/web            │    │  apps/mobile             │           │
│  │  Next.js 14          │    │  Expo SDK 54             │           │
│  │  App Router (37 pg)  │    │  Expo Router (46 scr)    │           │
│  │  tRPC Client         │    │  tRPC Client             │           │
│  │  React Query          │    │  React Query              │           │
│  └───────┬──────────────┘    └────────┬─────────────────┘           │
│          │ tRPC over HTTP             │ tRPC over HTTP              │
│          │ + Socket.IO                │ + Socket.IO                 │
└──────────┼────────────────────────────┼────────────────────────────┘
           │                            │
┌──────────┼────────────────────────────┼────────────────────────────┐
│          ▼                            ▼                             │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  packages/api (tRPC v11)                                     │  │
│  │  ┌─────────┐ ┌──────────┐ ┌─────────┐ ┌──────────────────┐  │  │
│  │  │ 46      │ │ 7-layer  │ │ Zod     │ │ Socket.IO        │  │  │
│  │  │ Routers │ │ Auth     │ │ Schemas │ │ Real-time Events │  │  │
│  │  └────┬────┘ └────┬─────┘ └────┬────┘ └────────┬─────────┘  │  │
│  └───────┼───────────┼────────────┼───────────────┼────────────┘  │
│          │           │            │               │                │
│  ┌───────┼───────────┼────────────┼───────────────┼────────────┐  │
│  │       ▼           ▼            ▼               ▼             │  │
│  │  packages/db (Prisma)    packages/shared                     │  │
│  │  42 Models, 15 Enums     UI Kit, Hooks, i18n, Theme, Types   │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                           MONOREPO (pnpm + Turborepo)              │
└─────────────────────────────────────────────────────────────────────┘
           │                            │
┌──────────┼────────────────────────────┼────────────────────────────┐
│          ▼                            ▼                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │ PostgreSQL 15│  │  Redis 7     │  │  External APIs           │  │
│  │ (gob-postgres)│  │ (gob-redis)  │  │  PayFort · OpenAI ·     │  │
│  │              │  │              │  │  Google Calendar · ZATCA │  │
│  └──────────────┘  └──────────────┘  └──────────────────────────┘  │
│                         INFRASTRUCTURE                              │
└─────────────────────────────────────────────────────────────────────┘

                    ┌──────────────────────────┐
                    │  LEGACY (STILL IN REPO)   │
                    │  backend/   Express REST  │
                    │  frontend/  Vite + React  │
                    │  mobileapp/ Expo standalone│
                    │  ⚠️ NOT IN PNPM WORKSPACE │
                    └──────────────────────────┘
```

### Data Flow

1. **Client → tRPC → Prisma → PostgreSQL**: All queries and mutations go through type-safe tRPC procedures with Zod validation → Prisma ORM → PostgreSQL
2. **Client → Socket.IO**: Real-time events (booking updates, payment status, notifications) flow via authenticated WebSocket connections
3. **Auth**: JWT access tokens (15min) stored in cookies/localStorage → verified in tRPC context middleware → refresh tokens (7d) stored in DB with rotation
4. **Payments**: Client → tRPC mutation → PayFort/APS API → webhook → update booking/payment status → emit Socket.IO events
5. **AI**: Client → tRPC `ai.chat` mutation → OpenAI API (GPT-4o-mini, Arabic system prompt) → stream response

---

## Module Deep-Dives

### 1. `apps/web` — Next.js 14 Web Application

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Main customer/technician/admin web portal |
| **Framework** | Next.js 14 App Router |
| **Pages** | 37 page.tsx files across 5 route groups |
| **State** | tRPC + TanStack React Query v5 |
| **Styling** | Tailwind CSS (extends `@galaxy/config` preset) |
| **Key Deps** | `@galaxy/api`, `@galaxy/db`, `@galaxy/shared`, `socket.io-client`, `@sentry/nextjs` |

**Route Groups:**
- `(public)` — Landing, services catalog, technicians, marketplace, subscription boxes, gallery, surprise-me
- `(auth)` — Login, register, forgot-password, 2FA
- `(customer)` — Dashboard, bookings, wallet, wishlist, notifications, profile, addresses, referrals, streaks, disputes, AI chat, subscriptions, loyalty, promo, saved-cards, video sessions, skin analysis, waitlist
- `admin` — Dashboard, users, technicians, categories, services, areas, bookings, finance, disputes, analytics, ZATCA, settings, payouts, feature-flags
- `tech` — Dashboard, slots, bookings, earnings, calendar, profile

**Observations:**
- All pages use `'use client'` — no Server Components for data fetching
- CSRF double-submit cookie pattern for tRPC mutations
- JWT stored in `localStorage['gob_access']`, sent via `Authorization: Bearer` header
- 81 `as never`/`as any` type casts indicating type misalignment between tRPC types and page usage
- 31 `eslint-disable` comments across 13 files
- Socket.IO client with reconnection and exponential backoff
- Sentry integration for error tracking (client, server, edge)

### 2. `apps/mobile` — Expo Mobile Application (Modern)

| Attribute | Detail |
|-----------|--------|
| **Purpose** | iOS + Android mobile app |
| **Framework** | Expo SDK 54 + Expo Router v6 (file-based routing) |
| **Language** | TypeScript |
| **Screens** | ~50 routes across 5 tabs + auth + admin + tech + customer feature groups |
| **State** | tRPC + TanStack React Query v5 (no Zustand) |
| **Auth** | JWT via tRPC context, biometric login (`expo-local-authentication`), 2FA TOTP |
| **Key Deps** | `@galaxy/api`, `@galaxy/shared`, `expo-camera`, `expo-haptics`, `expo-local-authentication` |
| **Special Features** | Deep linking, haptic feedback, camera access |

**Screen Inventory:**
- **Tabs (5):** Home, Services, Bookings, Wallet, Profile
- **Auth (6):** Login, Register, Forgot Password, Reset Password, Verify Email, 2FA
- **Customer (16):** Dashboard, Bookings, Wallet, Wishlist, Notifications, Profile, Addresses, Referrals, Streaks, Disputes, AI Chat, Subscriptions, Loyalty, Promo, Saved Cards, Skin Analysis, Video Sessions, Waitlist
- **Technician (6):** Dashboard, Slots, Bookings, Earnings, Calendar, Profile
- **Admin (12):** Dashboard, Users, Technicians, Categories, Services, Areas, Bookings, Finance, Disputes, Analytics, ZATCA, Settings
- **Public:** Services/[id], Technicians/[id], Marketplace, Subscription Boxes, Compare, Gallery/[technicianId], Surprise Me

### 2b. `mobileapp/` — Legacy Expo Application

| Attribute | Detail |
|-----------|--------|
| **Purpose** | Original standalone mobile app (deprecated) |
| **Framework** | Expo SDK 54 + React Navigation v6 (code-based routing) |
| **Language** | JavaScript |
| **Screens** | ~12 basic screens (Login, Register, Home, Services, ServiceDetail, Technicians, Bookings, Wallet, Profile, Wishlist, Notifications, SurpriseMe) |
| **State** | Zustand store (`authStore`) + React Query |
| **HTTP** | Axios with JWT interceptor |
| **i18n** | i18next with Arabic hardcoded translations |
| **Special Features** | Offline action queue with idempotency keys, Expo Notifications integration |

**Key differences:** The modern `apps/mobile/` is a complete TypeScript rewrite using Expo Router instead of React Navigation, tRPC instead of Axios, and with ~4x the screen count (50 vs 12). The legacy app has a few unique features not yet in modern: offline action queue, dedicated i18next setup, and Expo Notifications integration.

### 3. `packages/api` — tRPC API Layer (Core Backend)

| Attribute | Detail |
|-----------|--------|
| **Purpose** | All business logic, auth, validation |
| **Framework** | tRPC v11 |
| **Routers** | 46 routers (1 health + 45 feature routers) |
| **Procedures** | 170+ queries/mutations |
| **Auth** | 7-layer middleware (public → CSRF → auth → role-based) |
| **Validation** | Zod schemas in dedicated `validators/` directory |
| **Key Libs** | `jsonwebtoken`, `bcryptjs`, `ioredis`, `nodemailer`, `socket.io` |

**Auth Middleware Hierarchy:**
```
publicProcedure (no auth, no CSRF)
  └── publicMutation (+ CSRF guard)
        └── protectedProcedure (+ JWT auth)
              ├── customerProcedure (+ CUSTOMER role)
              ├── technicianProcedure (+ TECHNICIAN role)
              ├── adminProcedure (+ ADMIN role)
              └── staffProcedure (+ TECHNICIAN or ADMIN)
                    └── customerMutation / technicianMutation / adminMutation (+ CSRF)
```

**Router Inventory:**
| Router | Purpose | Router | Purpose |
|--------|---------|--------|---------|
| `auth` | Registration, login, 2FA, password reset | `health` | Health check |
| `users` | Profile CRUD, export data, delete | `technicians` | Tech profiles, KYC |
| `categories` | Service categories (nested) | `services` | Service catalog with variants |
| `slots` | Availability management | `bookings` | Booking lifecycle (10 states) |
| `payments` | PayFort authorize/capture/refund | `wallet` | Balance, transactions |
| `payouts` | Technician earnings payouts | `addresses` | Customer address CRUD |
| `reviews` | Star ratings + comments | `disputes` | Dispute lifecycle |
| `notifications` | Multi-channel (push/email/SMS) | `waitlist` | Waitlist management |
| `wishlist` | Saved services/technicians | `admin` | Admin dashboard, user mgmt |
| `analytics` | Reports, charts, KPIs | `ai` | Layla chatbot (OpenAI) |
| `zatca` | E-invoicing compliance | `calendar` | Google Calendar sync |
| `subscriptions` | AI subscription plans | `platform` | Platform config |
| `streaks` | Beauty streaks tracking | `referrals` | Referral program |
| `uploads` | File uploads (S3/local) | `search` | Global search |
| `loyalty` | Points, tiers, rewards | `reschedule` | Booking rescheduling |
| `savedCards` | Saved payment methods | `gallery` | Technician portfolios |
| `promo` | Promo codes | `subscriptionBoxes` | Monthly beauty boxes |
| `featureFlags` | Gradual rollout toggles | `chat` | Customer-technician messaging |
| `performance` | Technician metrics | `cms` | Content management |
| `video` | Video consultations | `skinAnalysis` | AI skin analysis |
| `marketplace` | Product marketplace | `advancedBooking` | Advanced booking |
| `social` | Social features | `aiFeatures` | AI-powered features |
| `adminTools` | Admin utilities | | |

### 4. `packages/db` — Database Layer

| Attribute | Detail |
|-----------|--------|
| **ORM** | Prisma 5.15 |
| **Database** | PostgreSQL 15 |
| **Models** | 42 models |
| **Enums** | 15 enums |
| **Features** | Full-text search, JSONB localization, comprehensive indexing |

**Model Domains:**
- **Auth**: User, RefreshToken, ResetToken, PushToken
- **Profiles**: Technician, Address
- **Finance**: Wallet, WalletTransaction, Payout, Payment, SavedCard
- **Catalog**: Category, Service, ServiceVariant, ServiceAddon, ServiceTag
- **Booking**: AvailabilitySlot, Booking
- **Social**: Review, Dispute, ChatMessage, VideoSession
- **Gamification**: Streak, Achievement, UserAchievement, LoyaltyAccount, LoyaltyTransaction, LoyaltyReward, Referral
- **AI**: AiSubscriptionPlan, CustomerAiSubscription, AiUsage, SkinAnalysis, CustomerQuizResponse
- **Marketplace**: Vendor, Product, ProductCategory, ProductReview, CartItem
- **Operations**: Notification, WaitlistEntry, TermsAcceptance, ZatcaInvoice, AuditLog, PlatformConfig, FeatureFlag, GalleryImage, PromoCode, PromoUsage, WishlistItem, SubscriptionPlan, CustomerSubscription
- **Reference**: SaudiCity, Area

### 5. `packages/shared` — Shared UI & Utilities

| Attribute | Detail |
|-----------|--------|
| **Components** | 11 UI components (Button, Input, Card, Modal, Toast, Skeleton, Spinner, Pagination, EmptyState, ErrorAlert, ProgressBar) |
| **Hooks** | `useAuth`, `useForm`, `useDebounce` |
| **Utils** | `cn` (classnames), `formatCurrency` (SAR) |
| **i18n** | Arabic-first (ar default), English (en), `sharedMessages` with ~60 translation keys |
| **Theme** | Design tokens: colors (brand violet + accent pink), typography (Inter + Tajawal), spacing, shadows, breakpoints |
| **Types** | `ChildrenProps`, `AsyncState`, `FeatureComponentSet<T>` |

### 6. `packages/config` — Shared Configuration

| Config | Details |
|--------|---------|
| **TypeScript** | `strict: true`, ES2022, bundler module resolution, 3 variants (base, next, react-library, expo) |
| **ESLint** | 3 configs (base, react, next), `no-explicit-any: warn`, `no-console: warn` |
| **Tailwind** | Brand/accent presets, Inter + Tajawal fonts, shared preset |
| **Prettier** | semi, trailingComma all, singleQuote, 100 printWidth |

### 7. Legacy Stack — Detailed Analysis

The `backend/`, `frontend/`, and `mobileapp/` directories at the repo root are the **original Express + React/Vite + standalone Expo** implementation. These are **NOT part of the pnpm workspace** (which only includes `apps/*` and `packages/*`). They represent a **complete, working v1.0 implementation** that the modern monorepo stack was rebuilt to replace.

#### Legacy Stack Overview

| Legacy | Modern Equivalent | Version | Language | Package Manager |
|--------|-------------------|---------|----------|-----------------|
| `backend/` (Express REST, 27 routes, 909-line Prisma) | `packages/api/` (tRPC, 46 routers) | v1.0.0 | JavaScript (ESM) | npm |
| `frontend/` (Vite + React SPA, React Router, Axios, Zustand) | `apps/web/` (Next.js 14 App Router, tRPC) | v1.0.0 | JavaScript (JSX) | npm |
| `mobileapp/` (Expo standalone, React Navigation, Axios, Zustand) | `apps/mobile/` (Expo Router, tRPC) | v1.0.0 | JavaScript | npm |

#### Architectural Comparison

| Aspect | Legacy | Modern |
|--------|--------|--------|
| **API Protocol** | Express REST (explicit HTTP methods + paths) | tRPC v11 (type-safe RPC procedures) |
| **API Type Safety** | None (REST + manual Zod validators only) | End-to-end (tRPC + Zod → TypeScript inference) |
| **Frontend Rendering** | Client-side React SPA (Vite) | Next.js 14 App Router (SSR capable, but currently all `'use client'`) |
| **Routing** | React Router v6 (code-based) | Next.js file-based routing |
| **State Management** | Zustand stores + React Query | tRPC context + React Query (no Zustand) |
| **HTTP Client** | Axios with JWT interceptor | tRPC client (`@trpc/react-query`) |
| **Backend Middleware** | 19 Express middleware files (auth, CSRF, rate limit, sanitize, error handler, maintenance, cache headers, upload, requestId, validation, degradation) | tRPC middleware layer (auth, CSRF, role-based) — fewer files, consolidated |
| **Background Jobs** | BullMQ queues + cron scheduler | Not yet ported |
| **Email** | MJML templates + rendering engine | Nodemailer inline HTML |
| **Logging** | Winston + Morgan | Sentry + console |
| **File Storage** | Multer + S3/Local via storageFactory | tRPC uploads router |
| **Tests** | Jest + Supertest (backend integration) | Vitest (API unit only) |
| **API Documentation** | OpenAPI 3.0 YAML + Postman collection | Swagger UI stub at `/api/docs` |
| **i18n** | i18next with hardcoded translations per app | i18next in `@galaxy/shared` |

#### Critical Legacy-Only Features (Not Yet Ported)

These files/features exist only in the legacy stack and have NO modern equivalent:

| Legacy File | Feature | Migration Priority |
|-------------|---------|-------------------|
| `backend/src/jobs/queue.js` + `scheduler.js` | BullMQ background job queues + cron scheduling (weekly payouts, reminders) | 🔴 High |
| `backend/src/services/twoFactor.js` | TOTP 2FA service (modern has `lib/totp.ts` but no router integration) | 🔴 High |
| `backend/src/services/icsService.js` | ICS calendar file generation for bookings | 🟡 Medium |
| `backend/src/utils/encryption.js` | Data encryption utility | 🟡 Medium |
| `backend/src/utils/hijriCalendar.js` | Hijri (Islamic) calendar conversions | 🟡 Medium |
| `backend/src/utils/saudiCities.js` | Saudi cities reference dataset | 🟢 Low (modern has SaudiCity model) |
| `backend/src/middleware/degradation.js` | Circuit breaker / graceful degradation | 🟡 Medium |
| `backend/src/middleware/maintenance.js` | Maintenance mode toggle | 🟡 Medium |
| `backend/src/middleware/cacheHeaders.js` | ETag + cache header management | 🟢 Low |
| `backend/src/middleware/sanitize.js` | XSS input sanitization | 🟡 Medium |
| `backend/src/templates/emails/` | MJML email templates (professional styling) | 🟡 Medium |
| `frontend/src/components/ai/ChatbotWidget.jsx` | Layla chatbot floating widget UI | 🟡 Medium |
| `frontend/src/components/ai/OnboardingQuiz.jsx` | Customer onboarding quiz UI | 🟡 Medium |
| `frontend/src/hooks/useSocket.js` | Socket.IO client hook with event handlers | 🟢 Low (modern has equivalent) |
| `frontend/src/store/authStore.js` | Zustand auth store with JWT persistence | 🟢 Low (modern uses tRPC context) |
| `mobileapp/src/utils/offlineQueue.js` | Offline action queue with idempotency keys | 🟡 Medium |

#### Features Unique to Modern Stack (Not in Legacy)

The modern stack adds 17+ new feature areas not present in the legacy codebase:
- Skin Analysis (AI-powered), Marketplace (products), Subscription Boxes, Video Consultations, Social Features, Feature Flags, CMS, Saved Cards, Advanced Booking, Promo Codes, Loyalty Program, Chat (C2T), Gallery, Search, Performance Monitoring, AI Features, Admin Tools

### 8. Infrastructure & DevOps

| Component | Detail |
|-----------|--------|
| **Docker** | 4 services: postgres, redis, web, mobile |
| **CI/CD** | GitHub Actions: type-check → lint → test → build → e2e → docker |
| **Deploy** | PM2 (2 instances web + 1 socket), Nginx reverse proxy with TLS |
| **Backup** | `scripts/backup-db.sh` — daily DB dump with 30-day retention |
| **Secrets** | `scripts/secrets-check.sh` — pre-commit scanner for hardcoded credentials |
| **Monitoring** | Sentry (client + server + edge), PM2 monit |
| **Load Testing** | k6 script at root (`k6-load-tests.js`) |

---

## Issues by Severity

### 🔴 Critical

| # | Issue | File(s) | Recommendation |
|---|-------|---------|----------------|
| **C1** | **Dual codebases with overlapping functionality** — `backend/`, `frontend/`, `mobileapp/` exist alongside `apps/` + `packages/` | Root directory | Decide: (a) Delete legacy dirs once migration is verified complete, OR (b) Archive them in a `_legacy/` folder with a README explaining status. Having both is confusing and risks developers working on the wrong codebase |
| **C2** | **81 instances of `as never` / `as any`** type casts — widespread type-safety erosion | 37 files in `apps/web/src/app/` | Root cause is likely mismatched tRPC types. Audit each cast — most are query/mutation inputs that should be properly typed via `RouterInput`/`RouterOutput` from `@galaxy/api/client` |
| **C3** | **Two divergent Prisma schemas** — `backend/prisma/` (909 lines, 25+ models) vs `packages/db/prisma/` (1313 lines, 42 models) | `backend/prisma/schema.prisma`, `packages/db/prisma/schema.prisma` | Consolidate to `packages/db/prisma/schema.prisma` as the single source of truth. Delete legacy schema. The monorepo schema has 17 additional models (marketplace, video sessions, skin analysis, etc.) |

### 🟠 High

| # | Issue | File(s) | Recommendation |
|---|-------|---------|----------------|
| **H1** | **No integration/E2E tests for tRPC procedures** — All 7 test files are pure unit tests with replicated business logic, never hitting a real database | `packages/api/src/__tests__/` | Add Vitest integration tests that spin up a test DB (using `prisma db push --force-reset`) and exercise the actual tRPC procedure against real data |
| **H2** | **31 `eslint-disable` comments** suppressing type/exhaustive-deps warnings | 13 files in `apps/web/src/` | Fix root causes rather than suppressing. Most are `@typescript-eslint/no-explicit-any` which can be resolved with proper tRPC types |
| **H3** | **All web pages are `'use client'`** — No Server Components for SEO-critical pages | All pages in `apps/web/src/app/` | Convert public/marketing pages (landing, services catalog, technician search) to Server Components with tRPC SSR. This improves SEO, initial load performance, and reduces JS shipped to client |
| **H4** | **`.env` file with real values committed** — Contains actual database credentials and secrets | `.env` (root) | Immediately add `.env` to `.gitignore` if not already there. Rotate any credentials that may have been exposed. Use `.env.example` only |

### 🟡 Medium

| # | Issue | File(s) | Recommendation |
|---|-------|---------|----------------|
| **M1** | **No rate limiting on tRPC mutations** — The `rateLimit.ts` lib exists but is not wired into the tRPC middleware layer | `packages/api/src/lib/rateLimit.ts`, `packages/api/src/trpc.ts` | Add rate-limit middleware to `trpc.ts` using the existing Redis-backed rate limiter |
| **M2** | **Theme token duplication** — Brand color values hardcoded in both `packages/shared/src/theme/` and `packages/config/src/tailwind/` | `packages/shared/src/theme/index.ts`, `packages/config/src/tailwind/index.js` | Make the Tailwind config read from the JS theme tokens as the single source of truth |
| **M3** | **`cn()` utility is minimal** — Simple `filter(Boolean).join(' ')` without Tailwind class conflict resolution | `packages/shared/src/utils/cn.ts` | Replace with `clsx` + `tailwind-merge` for proper Tailwind class deduplication |
| **M4** | **PM2 config has hardcoded `/app` Docker paths** — Won't work for non-containerized deployment | `deploy/ecosystem.config.cjs` | Parameterize paths with environment variables or document the container-only assumption |
| **M5** | **No shared API response/pagination types** — Each consumer defines its own | `packages/shared/src/types/index.ts` | Add shared types for `PaginatedResponse<T>`, `ApiError`, `BookingSummary`, `ServiceCard`, etc. |
| **M6** | **ErrorAlert duplicates Button component** — Inline redefinition to avoid circular dependency | `packages/shared/src/ui/ErrorAlert.tsx` | Extract a minimal button base to a separate file, or use the existing Button via dynamic import |
| **M7** | **Socket server runs on separate port (4001)** — Adds deployment complexity | `packages/api/src/socket/server.ts` | Consider upgrading to a single Next.js server with Socket.IO integrated (Next.js custom server), or migrating to Server-Sent Events for simpler real-time needs |
| **M8** | **`useAuth` defaults to synchronous localStorage** but `AuthStorage` interface supports async — mobile would need SecureStore injection | `packages/shared/src/hooks/useAuth.ts` | Mobile app must inject Expo SecureStore adapter. Document this requirement |

### 🟢 Low

| # | Issue | File(s) | Recommendation |
|---|-------|---------|----------------|
| **L1** | **`FeatureComponentSet.DataView` conflicts with native `DataView` API** | `packages/shared/src/types/index.ts` | Rename to `DataViewComponent` or `FeatureDataView` |
| **L2** | **No`.editorconfig` file** for consistent cross-IDE formatting | Root | Add `.editorconfig` matching Prettier settings |
| **L3** | **Arabic placeholder text in some UI components** — Should use i18n keys | Various `shared/src/ui/` | Ensure all text in shared components uses i18n `t()` function |
| **L4** | **Missing `CONTRIBUTING.md`** — No contributor guide | Root | Add contribution guidelines, branch strategy, PR template |
| **L5** | **No `CHANGELOG.md`** — Release history not tracked | Root | Start a changelog or use GitHub Releases |
| **L6** | **k6 load test script is untested** — References localhost:3000 without env configuration | `k6-load-tests.js` | Parameterize target URL via `__ENV.TARGET_URL` |

---

## Quick Wins

These are low-effort, high-impact improvements that can be made immediately:

1. **Delete or archive legacy directories** (`backend/`, `frontend/`, `mobileapp/`) — eliminates confusion about which codebase is canonical. If needed for reference, move to `_legacy/`.

2. **Fix the `.env` exposure** — `git rm --cached .env` (if tracked), add to `.gitignore`, rotate credentials.

3. **Add `clsx` + `tailwind-merge`** to `cn()` utility — one-line change that prevents Tailwind class conflicts everywhere.

4. **Rename `DataView` to `FeatureDataView`** in shared types — avoids native API confusion.

5. **Add `.editorconfig`** — 5-minute setup for consistent formatting across IDEs.

6. **Run `scripts/secrets-check.sh`** — already exists, just needs to be added as a pre-commit hook or CI step.

7. **Wire in existing rate limiter** to tRPC middleware — the `rateLimit.ts` lib is already built, just needs to be connected in `trpc.ts`.

---

## Long-term Suggestions

1. **Gradual migration to React Server Components**: Start with public/marketing pages (landing, services catalog) which benefit most from SEO and fast initial load. Use tRPC's `createCaller` for server-side data fetching.

2. **Add integration test suite**: Use Vitest with a test database to verify tRPC procedures end-to-end. The `prisma db push --force-reset` approach provides a clean slate for each test run.

3. **Consolidate to single Prisma schema**: The `packages/db/` schema is the canonical one with 42 models. Delete or archive `backend/prisma/`.

4. **Extract shared API types**: Move common response types (paginated lists, booking summaries, service cards) from individual page files into `@galaxy/shared/types`.

5. **Upgrade to Tailwind v4** when stable — better performance, native CSS-based config (eliminates JS config duplication).

6. **Consider tRPC v11's WebSocket support** — could replace the standalone Socket.IO server and simplify the real-time architecture.

7. **Add Storybook or similar** for the shared UI component library to serve as living documentation.

8. **Set up Renovate or Dependabot** for automated dependency updates (`.github/dependabot.yml` already exists, needs review).

9. **Add database migration strategy**: Currently using `prisma db push` (no migration files). For production, generate proper Prisma migrations with `prisma migrate dev`.

10. **Implement feature flags**: The `FeatureFlag` model and `featureFlags` router already exist. Use them for gradual rollout of new features instead of environment variables.

---

## Testing Coverage Assessment

| Test Type | Location | Count | Status |
|-----------|----------|-------|--------|
| **API Unit Tests** | `packages/api/src/__tests__/` | 7 files | ✅ Present — but all are pure logic tests, no DB integration |
| **API Integration** | None (tRPC) | 0 | ❌ Missing — no tests exercise actual tRPC procedures |
| **Backend Unit** | `backend/tests/unit/` | Unknown | ⚠️ Legacy only |
| **Backend Integration** | `backend/tests/integration/` | Unknown | ⚠️ Legacy only (Jest + Supertest) |
| **Web E2E** | `apps/web/e2e/` | Unknown | ✅ Playwright — CI pipeline runs them |
| **Frontend E2E** | `frontend/e2e/` | Unknown | ⚠️ Legacy only |
| **Mobile E2E** | `apps/mobile/e2e/` | Unknown | ✅ Detox configured |
| **Load Testing** | `k6-load-tests.js` | 1 script | ⚠️ Present but untested/not parameterized |

**Critical Testing Gaps:**
- No tRPC procedure integration tests (H1 above)
- Legacy and modern test suites are disjoint — no shared test fixtures or factories
- No contract testing between tRPC server and client

---

## Documentation & Onboarding Assessment

| Artifact | Status | Notes |
|----------|--------|-------|
| **README.md** | ✅ Good | Comprehensive quick start, architecture, features, security, scripts |
| **PLAN.md** | ✅ Good | Detailed migration plan with feature matrix and entity relationships |
| **DELIVERY_REPORT.md** | ✅ Good | 41 features verified, all verification results documented |
| **`.env.example`** | ✅ Complete | 67 variables documented with descriptions |
| **API Documentation** | ⚠️ Partial | Swagger UI at `/api/docs` but likely not complete for all 46 routers |
| **OpenAPI Spec** | ⚠️ Legacy only | `backend/openapi.yaml` — not regenerated for tRPC |
| **Postman Collection** | ⚠️ Legacy only | `backend/postman-collection.json` — not regenerated for tRPC |
| **Deployment Guide** | ✅ Good | `deploy/DEPLOYMENT.md` — complete with security, backup, rollback |
| **Contributing Guide** | ❌ Missing | No `CONTRIBUTING.md` |
| **Changelog** | ❌ Missing | No `CHANGELOG.md` |
| **Code of Conduct** | ❌ Missing | Standard for open source projects |
| **Architecture Decision Records** | ❌ Missing | No ADRs documenting key decisions (why tRPC over REST, why Socket.IO over SSE, etc.) |

---

## Security Posture Assessment

| Control | Status | Notes |
|---------|--------|-------|
| **HTTPS/TLS** | ✅ | HSTS preload (1yr), TLS 1.2/1.3 via Nginx |
| **Auth** | ✅ Strong | JWT with rotation + reuse detection, bcrypt (cost 12), 2FA TOTP |
| **CSRF** | ✅ | Double-submit cookie pattern on all tRPC mutations |
| **Input Validation** | ✅ | Zod on all tRPC procedure inputs |
| **Rate Limiting** | ⚠️ Partial | Lib exists but not wired to tRPC middleware; login lockout via Redis |
| **CORS** | ✅ | Whitelist with credentials |
| **Secrets** | ❌ Risk | `.env` file with real values in repo |
| **SQL Injection** | ✅ Safe | Prisma parameterized queries throughout |
| **XSS** | ✅ Safe | React + Helmet headers, no `dangerouslySetInnerHTML` found |
| **Dependency Scanning** | ⚠️ Partial | Dependabot configured but not verified active |

### Detailed Security Scan Results

A comprehensive security scan was performed across the entire codebase. **No critical vulnerabilities were found** — no hardcoded API keys, no `eval()` usage, no raw SQL queries, and no CORS wildcard misconfigurations.

**What was verified clean (positive findings):**
- ✅ No hardcoded API keys (`sk-`, `AIza`, `ghp_`, `AKIA*`)
- ✅ No `eval()` / `new Function()` usage anywhere
- ✅ No CORS `origin: '*'` — all CORS is environment-configured
- ✅ No raw SQL / `queryRaw` / `executeRaw` — exclusively Prisma ORM
- ✅ No `dangerouslySetInnerHTML` or `innerHTML` — safe React rendering
- ✅ No TODO / FIXME / HACK markers — codebase is clean
- ✅ Environment validated at startup via Zod schema — app refuses to start with missing vars
- ✅ JWT secrets validated for minimum 32-char length
- ✅ Password reset tokens expire after 1 hour
- ✅ Mobile apps use SecureStore (iOS Keychain / Android EncryptedSharedPreferences)

**Additional Medium-severity findings from security scan:**

| # | Issue | File(s) | Risk |
|---|-------|---------|------|
| **S1** | **Seed scripts print admin credentials to stdout** — `admin@galaxyofbeauty.sa / Admin@123456` printed to console during seeding | `packages/db/prisma/seed.ts:93,360`, `backend/prisma/seed.js:31`, `backend/prisma/seed-demo.js:482-493` | Credentials captured in CI logs or production console |
| **S2** | **Email body preview logged to console** — Password reset links/tokens included in HTML body preview | `packages/api/src/lib/email.ts:75-77` | Reset tokens leakable via logs |
| **S3** | **Push notification errors log device tokens** — Individual ticket details from Expo Push API logged | `packages/api/src/lib/push.ts:60-74` | Device tokens exposed in error logs |
| **S4** | **Silent `.catch(() => {})`** in mobile app mutations — 4 instances where errors are completely swallowed, user sees no error feedback | `apps/mobile/src/app/marketplace/index.tsx:44`, `apps/mobile/src/app/customer/waitlist/index.tsx:27`, `apps/mobile/src/app/customer/bookings/create/index.tsx:38`, `apps/mobile/src/app/(tabs)/bookings/index.tsx:14` | Poor UX, silent failures |
| **S5** | **Empty catch blocks in legacy Redis operations** — Intentional graceful degradation but zero observability | `backend/src/config/redis.js`, `backend/src/middleware/auth.js`, `backend/src/services/auth.js` | Debugging difficulty |
| **S6** | **~35 `console.log`/`console.error` calls** — Socket events, email/push fallback, startup logs — all with explicit `eslint-disable-next-line` | Various | Info leakage in production logs — should use structured logger |

**Recommendations for security scan findings:**
- S1-S3: Mask sensitive data in logs (truncate credentials, use correlation IDs instead of tokens)
- S4: Set error state and display retry UI instead of swallowing errors
- S5: Add debug-level logging or metrics counters to empty catch blocks
- S6: Wrap socket/startup logs in `__DEV__` or `NODE_ENV !== 'production'` guards

---

## Summary Statistics

| Metric | Count |
|--------|-------|
| **Total workspace packages** | 8 (web, mobile, api, db, shared, config + 2 legacy dirs not in workspace) |
| **TypeScript files** | ~300+ (estimate) |
| **tRPC routers** | 46 |
| **tRPC procedures** | 170+ |
| **Prisma models** | 42 (modern), 25+ (legacy) |
| **Prisma enums** | 15 |
| **Next.js pages** | 37 |
| **Expo Router screens** | 46 |
| **Shared UI components** | 11 |
| **i18n translation keys** | ~60 |
| **Docker services** | 4 |
| **CI jobs** | 6 (type-check, lint, test, build, e2e, docker) |
| **Test files** | 7 (API unit) + E2E suites |
| **`as never`/`as any` casts** | 81 |
| **`eslint-disable` comments** | 31 |
| **Critical issues found** | 3 |
| **High issues found** | 4 |
| **Medium issues found** | 8 |
| **Low issues found** | 6 |

---

## Conclusion

Galaxy of Beauty is a **feature-rich, well-architected platform** with a comprehensive domain model covering booking, payments, loyalty, AI, marketplace, subscriptions, and Saudi compliance. The greenfield rebuild to a modern monorepo stack (Next.js + tRPC + Turborepo + pnpm) was executed successfully with 41 features delivered.

**The primary risk is the coexistence of legacy and modern codebases.** Resolving this — by deleting or archiving the legacy directories — should be the immediate priority, followed by addressing the type-safety erosion (81 `as never`/`as any` casts) and adding integration tests for the tRPC layer.

**Overall grade: B+** — Strong architecture and feature completeness, held back by code duplication, type-safety gaps, and testing coverage debt.

---

*Report generated by automated systematic audit. For questions or to dive deeper into any section, please specify the area of interest.*
