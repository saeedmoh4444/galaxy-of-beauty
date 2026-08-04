# Galaxy of Beauty — Phase 0: Deep Audit & Plan

> **Date:** 2026-08-04
> **Status:** Audit complete — assessing current state vs target architecture
> **Project:** جالكسي بيوتي — Saudi beauty & grooming marketplace

---

## 1. Current State Summary

### 1.1 What Exists (Already Well Beyond Scaffold)

The monorepo is **fully scaffolded and heavily built out** — this is not a greenfield project. The structure matches the target architecture exactly:

```
galaxy-of-beauty/
├── apps/
│   ├── web/           # Next.js 14 App Router — ~84 routes, 5 route groups
│   └── mobile/        # Expo SDK 54 + Expo Router — ~47 screens, 5 tabs
├── packages/
│   ├── api/           # tRPC v11 — 163 routers, 400+ procedures
│   ├── db/            # Prisma — 87+ models, 15 enums, 8 migrations
│   ├── shared/        # UI kit (11 components), hooks (3), i18n, theme, types
│   └── config/        # TSConfig (4 variants), ESLint (3), Prettier, Tailwind
├── docs/              # ADRs, architecture, deployment, security docs
├── _legacy/           # Archived v1.0 Express + Vite codebase
├── docker-compose.yml # 5 services with healthchecks
├── turbo.json         # Build/lint/type-check/test pipelines
└── pnpm-workspace.yaml
```

### 1.2 Pipeline Health (from last known state)

| Pipeline | Result | Notes |
|----------|--------|-------|
| Type Check | 10/10 workspaces ✅ | `pnpm type-check` passes |
| Lint | 7/7 workspaces ✅ | `pnpm lint` passes |
| Build | 5/5 workspaces ✅ | 84+ Next.js routes built |
| API Tests | 243 passing (10 suites) ✅ | Vitest — tRPC integration + unit |
| E2E Tests | 38/38 chromium ✅ | Playwright — auth, booking, security flows |
| Docker | 5 services 🟢 | postgres, redis, web, socket, mobile |

### 1.3 Git Status (Uncommitted Changes)

```
225 files deleted (60,662 deletions) — STAGED but NOT committed:
├── _legacy/          (entire archived v1.0 — backend, frontend, mobileapp)
├── CHANGELOG.md
├── CONTRIBUTING.md
├── DELIVERY_REPORT.md
├── PLAN.md           (previous version)
└── SENIOR_EVALUATION.md
```

---

## 2. Feature Map — Web + Mobile

### 2.1 Route Groups Coverage

| Route Group | Web Routes | Mobile Screens | State Pattern | Notes |
|-------------|-----------|----------------|---------------|-------|
| `(public)` | 35+ pages | 35+ screens | ⚠️ Partial | Landing, services, technicians, blog, marketplace, etc. |
| `(auth)` | 6 pages | 6 screens | ✅ Good | Login, register, 2FA, forgot/reset password, verify email |
| `(customer)` | 70+ pages | 70+ screens | ⚠️ Mixed | Dashboard, bookings, wallet, profile, AI, social, commerce |
| `admin` | 25+ pages | 25+ screens | ⚠️ Mixed | Dashboard, users, bookings, finance, analytics, settings |
| `tech` | 8 pages | 6 screens | ⚠️ Mixed | Dashboard, bookings, calendar, earnings, profile, slots |

### 2.2 Feature Categories (from plan_to_add_value.md analysis)

#### ✅ Complete / Production-Ready

| Category | Features |
|----------|----------|
| Auth | JWT (15m access + 7d refresh), 2FA TOTP, email verification, password reset, role-based access |
| Core Booking | Request, accept, pay, complete, cancel, no-show, reschedule, waitlist, emergency |
| Catalog | Categories (nested), services, variants, add-ons, search, filter, sort |
| Payments | Wallet, top-up, transactions, cashback, PayFort/APS integration |
| Admin | User management, booking oversight, finance, KYC verification, dispute resolution |
| ZATCA | E-invoicing with SHA-256 hash, QR codes, compliance reporting |
| AI | Chatbot "Layla" (GPT-4o-mini), skin analysis, AI routine, AI feed |

#### ⚠️ Built but Uses Mock/Hardcoded Data

| Feature | Current State | Gap |
|---------|--------------|-----|
| Monitoring Dashboard | All health data fabricated | Need Prometheus/Grafana or real `pg_stat_activity`/Redis INFO |
| Booking Heatmap | Queries real data but seed = 6 bookings | Need 500+ bookings in seed for meaningful display |
| Geofence Offers | Hardcoded 3 offers with random distance | Need DB-backed `GeoPromotion` model + admin CRUD |
| Live Streaming | Hardcoded stream list with fake viewers | Need YouTube/MUX integration + `LiveStream` DB model |
| Beauty Stats | `happyCustomers = totalBookings * 0.95` | Need real metrics from actual bookings table |
| Referral Race | Campaign end date resets on server restart | Need DB-backed campaigns with persistence |
| Feature Flags | Router exists but implementation depth unclear | Verify admin CRUD + runtime evaluation |

#### ⚠️ Code Complete but Not Verified

| Area | Status | Gap |
|------|--------|-----|
| Mobile App | 47 screens written | Zero visual verification, zero E2E tests |
| State Pattern | Shared has Skeleton/ErrorAlert/EmptyState | Not all ~200 pages consistently use the 4-state pattern |
| SSR Pages | 10 pages server-rendered | Remaining 74 pages are `'use client'` |

---

## 3. Entity-Relationship Overview

### 3.1 Core Domains

```
┌─────────────────────────────────────────────────────────────┐
│                        AUTH DOMAIN                          │
│  User ──┬── Customer (profile, preferences)                │
│         ├── Technician (KYC, portfolio, availability)       │
│         └── Admin (permissions)                              │
│  Session, RefreshToken, AuditLog                            │
└─────────────────────────────────────────────────────────────┘
         │
┌────────▼────────────────────────────────────────────────────┐
│                     BOOKING DOMAIN                           │
│  Booking ──── Service (with Variants, AddOns)              │
│     │         │                                              │
│     ├── Technician (assigned)                               │
│     ├── Address (location)                                  │
│     ├── Payment (authorize → capture → refund)              │
│     └── Review (rating + comment, bilingual)                │
│  Slot, Waitlist, Reschedule, RecurringBooking,              │
│  EmergencyBooking, GroupBooking, CalendarSync               │
└─────────────────────────────────────────────────────────────┘
         │
┌────────▼────────────────────────────────────────────────────┐
│                     FINANCE DOMAIN                           │
│  Wallet ──── WalletTransaction (CREDIT/DEBIT)               │
│  Payment (PayFort/APS — AUTHORIZED → CAPTURED → REFUNDED)  │
│  Payout (to technicians), Cashback, SavedCard               │
│  GiftCard, PromoCode, PromoUsage                            │
│  ZATCAInvoice (SHA-256 hash, QR code)                       │
└─────────────────────────────────────────────────────────────┘
         │
┌────────▼────────────────────────────────────────────────────┐
│                    LOYALTY DOMAIN                            │
│  LoyaltyAccount (points, tier: BRONZE/SILVER/GOLD/PLATINUM)│
│  LoyaltyTransaction, Streak, Achievement, Referral          │
│  BirthdayReward, LoyaltyPunchCard, VIPMembership            │
└─────────────────────────────────────────────────────────────┘
         │
┌────────▼────────────────────────────────────────────────────┐
│                    SOCIAL DOMAIN                             │
│  Review, Inspiration, MoodBoard, Community, Following       │
│  Challenges, SocialChallenge, BeautyParty                   │
│  ReferralRace, TechLeaderboard, TechnicianQA                │
└─────────────────────────────────────────────────────────────┘
         │
┌────────▼────────────────────────────────────────────────────┐
│                    CONTENT DOMAIN                            │
│  Blog (bilingual), Tutorial, BeforeAfter, LookOfTheDay     │
│  BeautyStory, BeautyShorts, BeautyPodcast, AudioRoom        │
│  BehindScenes, VideoTestimonial, LiveStream                 │
│  Campaign (seasonal), BeautyEvent, EventTickets             │
└─────────────────────────────────────────────────────────────┘
         │
┌────────▼────────────────────────────────────────────────────┐
│                 AI & PERSONALIZATION DOMAIN                  │
│  AISession (chat "Layla"), SkinAnalysis, HairColorSim      │
│  VirtualTryOn, StyleMatch, ProductScanner                   │
│  ProductCompare, IngredientAnalyzer, AllergenChecker        │
│  PersonalizedFeed, Recommendations, ServiceRecommender      │
│  AIAssistant, AIRoutine, BeautyProfile                      │
└─────────────────────────────────────────────────────────────┘
         │
┌────────▼────────────────────────────────────────────────────┐
│                   COMMERCE DOMAIN                            │
│  Marketplace (products), SubscriptionBox, Subscription      │
│  BeautyPackage, Bundle/BoxBuilder, FlashDeal, GroupBuy      │
│  GiftRegistry, GiftCardMarket, BNPL                         │
└─────────────────────────────────────────────────────────────┘
         │
┌────────▼────────────────────────────────────────────────────┐
│                  WELLNESS DOMAIN                             │
│  WellnessTracker, CycleTracker, SkinDiary, ExpiryTracker   │
│  SelfCare, NightMode, BeautyBudget, BeautyExpenses         │
│  BeautyReminders, RoutineScheduler, SpaPlanner              │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Key Stats

| Metric | Count |
|--------|-------|
| Prisma Models | 87+ |
| Prisma Enums | 15 |
| tRPC Routers | 163 |
| tRPC Procedures | 400+ |
| Web Pages | ~84 |
| Mobile Screens | ~47 |
| API Tests | 243 |
| E2E Tests | 38 |
| DB Migrations | 8 |

---

## 4. Gap Analysis — What's Missing vs. Target Architecture

### 4.1 Architectural Gaps (from plan_to_add_value.md)

| # | Gap | Severity | Impact |
|---|-----|----------|--------|
| A1 | All 163 routers in flat directory — no domain separation | Medium | Harder to maintain, no clear ownership |
| A2 | No message/job queue — everything synchronous | Medium | Booking create waits for wallet+loyalty+notification+calendar |
| A3 | Shared package couples UI to API (JSX in shared forces DOM lib) | Low | API tsconfig has `jsx: preserve` unnecessarily |
| A4 | Single DB — no read replicas | Low | OK for MVP; needed for 100K+ users |

### 4.2 Feature Gaps (Mock Data / Low Depth)

| # | Gap | Severity | Plan Reference |
|---|-----|----------|---------------|
| F1 | Monitoring dashboard — all mock data | Medium | plan_to_add_value §2.1 |
| F2 | Live streaming — hardcoded stream list | Low | plan_to_add_value §2.2 |
| F3 | Booking heatmap — sparse seed data (6 bookings) | Low | plan_to_add_value §2.3 |
| F4 | Geofence offers — hardcoded | Low | plan_to_add_value §2.4 |
| F5 | Seed data volume — far below realistic levels | Medium | plan_to_add_value §2.5 |
| F6 | Referral race — campaign resets on restart | Low | plan_to_add_value §2.5 |

### 4.3 Mobile Verification Gap

| # | Gap | Severity |
|---|-----|----------|
| M1 | Zero screens visually verified | High |
| M2 | No mobile E2E tests (Detox/Maestro) | Medium |
| M3 | SafeAreaView / notch handling unknown | Medium |
| M4 | Deep link handling untested | Low |
| M5 | Push notification delivery untested | Medium |

### 4.4 State Pattern Compliance

The system prompt's mandatory 4-state pattern (Skeleton → Error → Empty → DataView) is partially implemented:
- **Shared components exist**: `Skeleton`, `ErrorAlert`, `EmptyState` are in `packages/shared/src/ui/`
- **But**: Most pages appear to have inline loading/error handling rather than using these shared components
- **No build-time lint rule** enforces the pattern

---

## 5. Immediate Action Plan

### 5.1 Uncommitted Changes (First Action)

The working tree has 225 staged deletions that need to be committed. This cleanup removes the archived `_legacy/` directory, old documentation files, and a previous PLAN.md.

### 5.2 Priority Order

Based on the gap analysis, here's the recommended execution order:

| Priority | Task | Effort | Value |
|----------|------|--------|-------|
| **P0** | Commit staged deletions (clean slate) | 5 min | Clean working tree |
| **P1** | Verify current build health (`pnpm type-check && pnpm lint && pnpm build`) | 10 min | Confirm no regressions |
| **P2** | Architectural hardening: domain separation + job queue | 80-120 hr | Scalability foundation |
| **P3** | Real monitoring + production seed data | 60 hr | Replaces mock data, enables testing |
| **P4** | Mobile verification + E2E | 40-60 hr | Mobile store-ready |
| **P5** | Production monitoring + backups | 60-80 hr | Operational safety net |
| **P6** | Feature deepening (streaming, geo, etc.) | 60 hr | Feature completeness |
| **P7** | State pattern enforcement | 20 hr | UX consistency |

### 5.3 What to Build NOW (This Session)

Since the project is already past the scaffold phase, our work should focus on:

1. **Commit the cleanup** — get the repo to a clean state
2. **Verify all pipelines still pass** — type-check, lint, build, test
3. **Address the highest-value gaps** from the plan_to_add_value.md, starting with:
   - Domain reorganization of API routers
   - Redis-based job queue (bullmq)
   - Enriched seed data (500+ bookings, 30+ customers)
   - Real monitoring dashboard metrics

---

## 6. Additional Issues Discovered

### 6.1 Empty Stub Directories
`apps/web/apps/web/src/app/` contains **empty stub route directories** (no page.tsx files):
- `(customer)/{booking-checklist, hair-color-sim, night-mode, restock-reminder, spa-planner, tech-waitlist, travel-kit}`
- `(public)/{api-docs, beauty-podcast, ingredient-analyzer, ingredient-sub, look-of-the-day, referral-race, service-trends, video-testimonials}`
- `admin/` (empty sub-directory)

These appear to be accidentally created placeholder directories — they produce no routes and add no value. Should be cleaned up.

### 6.2 Version Skew
| Package | React Version | Notes |
|---------|--------------|-------|
| `apps/web` | React 18 | Consistent with Next.js 14 |
| `apps/mobile` | React 19.1 | Expo 54 requirement |
| `packages/shared` | peer: `>=18.0.0` | Compatible with both |

Not a bug, but worth documenting — shared components must avoid React 19-only APIs.

### 6.3 Lint = Type-Check Duplication
In `apps/web` and `apps/mobile`, the `lint` script runs `tsc --noEmit` — identical to the `type-check` script. Actual ESLint runs via the Next.js plugin (web) or a separate `.eslintrc.json` (mobile). This is functional but the turbo pipeline labels are misleading.

### 6.4 Stale README References
The README references `_legacy/` and `trash_stuff/` — neither exists on disk anymore (deleted/archived). README needs updating after the cleanup commit.

### 6.5 Missing `@skills.md`
`CLAUDE.md` line 152 references `@skills.md` which does not exist in the project.

### 6.6 Historical Settings
`.claude/settings.local.json` (39KB) contains allowlist entries referencing the old `C:\Users\saeed\Desktop\beauty project\...` path — these are stale and should be cleaned.

---

## 7. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Build breakage after _legacy removal | Low | High | Verify all pipelines first |
| Domain reorg breaks imports | Medium | Medium | Incremental refactor, test after each domain |
| Seed data script times out | Low | Low | Batch inserts, progress logging |
| Mobile export fails | Medium | Medium | Test early in Phase 5 |
| Docker compose conflicts | Low | Low | Use unique port mappings |

---

## 7. Environment Variables Needed

From `.env.example` and `packages/db/.env.example`:

```
# Database
DATABASE_URL="postgresql://gob_admin:gob_secure_pass@localhost:5432/Galaxy_of_Beauty_db"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT
JWT_ACCESS_SECRET="at-least-32-characters-long-secret-key"
JWT_REFRESH_SECRET="at-least-32-characters-long-refresh-key"

# External APIs (optional for dev)
OPENAI_API_KEY="sk-..."
PAYFORT_MERCHANT_ID="..."
PAYFORT_ACCESS_CODE="..."
SENTRY_DSN="..."
```

---

## 8. Conclusion

**The project is remarkably complete** — well beyond what "Phase 0" typically discovers. The monorepo architecture, tRPC API, Prisma database, Next.js web app, and Expo mobile app are all built and passing type-check/lint/build. The primary work remaining is:

1. **Architectural hardening** (domain separation, job queues)
2. **Mock data → real data** (monitoring, seed enrichment, geo offers)
3. **Mobile verification** (visual walkthrough, E2E tests)
4. **Production operations** (monitoring, alerting, backup/DR)

The existing `docs/plan_to_add_value.md` provides an excellent detailed roadmap for these items.

---

⏸ **PLAN READY. Review and reply 'go' to proceed.**
