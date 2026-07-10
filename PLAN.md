# PLAN.md — Galaxy of Beauty: Greenfield Rebuild

> **Strategy:** Full greenfield rebuild into the target Next.js 14 + tRPC + Turborepo + pnpm monorepo stack, carrying forward all 27 features from the existing Express + React/Vite + Expo codebase.

---

## 1. Feature Map (Web + Mobile)

### Auth & Identity
| # | Feature | Web | Mobile | Existing Code |
|---|---------|-----|--------|--------------|
| F1 | Register (email, phone, name, role) | ✅ | ✅ | `auth.js` service, `RegisterPage.jsx` |
| F2 | Login with JWT (access 15m + refresh 7d) | ✅ | ✅ | `auth.js`, `LoginPage.jsx` |
| F3 | Email verification | ✅ | ✅ | `auth.js` email verify flow |
| F4 | Forgot / Reset password | ✅ | ✅ | `auth.js` |
| F5 | Change password | ✅ | ✅ | `auth.js` |
| F6 | Two-factor auth (setup + enforce at login) | ✅ | ✅ | `twoFactor.js` — **GAP: not enforced at login** |
| F7 | JWT refresh with rotation + reuse detection | ✅ | ✅ | `auth.js`, `api.js` interceptor |
| F8 | Role-based access (CUSTOMER / TECHNICIAN / ADMIN) | ✅ | ✅ | Middleware, `ProtectedRoute` |

### Profiles & KYC
| # | Feature | Web | Mobile | Existing Code |
|---|---------|-----|--------|--------------|
| F9 | User profile (view/edit name, phone, avatar, language) | ✅ | ✅ | `ProfilePage.jsx`, `users.js` routes |
| F10 | Technician extended profile (city, area, bio, KYC) | ✅ | ✅ | `technician.js` service |
| F11 | KYC submission & verification (admin review) | ✅ | ✅ | `technician.js`, `admin.js` |
| F12 | Address management (CRUD, default, geolocation) | ✅ | ✅ | `address.js`, `Address` model |

### Service Catalog
| # | Feature | Web | Mobile | Existing Code |
|---|---------|-----|--------|--------------|
| F13 | Category tree (nested, bilingual JSONB) | ✅ | ✅ | `catalog.js`, `categories.js` routes |
| F14 | Service listing with search, filter, sort | ✅ | ✅ | `ServicesPage.jsx`, `catalog.js` |
| F15 | Service detail (variants, add-ons, tags) | ✅ | ✅ | `ServiceDetailPage.jsx` |
| F16 | Technician-service mapping with custom pricing | ✅ | ✅ | `TechnicianService` model |
| F17 | Service tags (Bridal, Organic, etc.) | ✅ | ✅ | `ServiceTag` model |
| F18 | Saudi cities reference data | ✅ | ✅ | `SaudiCity` model |

### Availability & Booking
| # | Feature | Web | Mobile | Existing Code |
|---|---------|-----|--------|--------------|
| F19 | Technician availability slots (CRUD) | ✅ | ✅ | `slots.js`, `AvailabilitySlot` |
| F20 | Booking creation with slot reservation | ✅ | ✅ | `booking.js` service, state machine |
| F21 | Booking lifecycle state machine (10 states) | ✅ | ✅ | `booking.js` |
| F22 | Real-time updates via WebSocket | ✅ | ✅ | `socket/`, Socket.IO |
| F23 | Booking code generation (GOB-XXXXXX) | ✅ | ✅ | `booking.js` |
| F24 | Waitlist for busy technicians | ✅ | ✅ | `waitlist.js` |

### Payments & Wallet
| # | Feature | Web | Mobile | Existing Code |
|---|---------|-----|--------|--------------|
| F25 | PayFort/APS payment (authorize → capture) | ✅ | ✅ | `payment.js`, `Payment` model |
| F26 | Wallet balance + bonus (non-withdrawable) | ✅ | ✅ | `wallet.js`, `Wallet` model |
| F27 | Cashback (first booking 40%, subsequent 5%) | ✅ | ✅ | `wallet.js` |
| F28 | Platform fee split (technician earnings) | ✅ | ✅ | `wallet.js` |
| F29 | Payouts / withdrawals (min balance, fees) | ✅ | ✅ | `payouts.js` routes |
| F30 | Refunds | ✅ | ✅ | `payment.js` |
| F31 | Idempotency keys (Redis-backed) | ✅ | ✅ | `wallet.js`, `payment.js` |

### Reviews, Disputes & Notifications
| # | Feature | Web | Mobile | Existing Code |
|---|---------|-----|--------|--------------|
| F32 | Customer reviews (1-5 stars, comment) | ✅ | ✅ | `review.js` |
| F33 | Dispute lifecycle (open → review → resolve) | ✅ | ✅ | `dispute.js` |
| F34 | Multi-channel notifications (email/SMS/push/in-app) | ✅ | ✅ | `notification.js` |
| F35 | Push notification tokens (Expo) | ✅ | ✅ | Mobile `App.js` |

### Compliance
| # | Feature | Web | Mobile | Existing Code |
|---|---------|-----|--------|--------------|
| F36 | Terms acceptance with IP audit | ✅ | ✅ | `TermsAcceptance` model |
| F37 | ZATCA e-invoicing (hash, QR, reporting) | ✅ | ✅ | `zatca.js` |
| F38 | Audit logging (admin actions) | ✅ | ✅ | `AuditLog` model |
| F39 | Maintenance mode | ✅ | ✅ | Middleware |

### AI ("Layla")
| # | Feature | Web | Mobile | Existing Code |
|---|---------|-----|--------|--------------|
| F40 | AI chatbot (OpenAI-backed) | ✅ | ✅ | `ai.js`, `ChatMessage` |
| F41 | AI recommendations | ✅ | ✅ | `ai.js` |
| F42 | Onboarding quiz | ✅ | ✅ | `CustomerQuizResponse` |
| F43 | AI subscription plans + usage tracking | ✅ | ✅ | `AiSubscriptionPlan`, `AiUsage` |

### Gamification & Growth
| # | Feature | Web | Mobile | Existing Code |
|---|---------|-----|--------|--------------|
| F44 | Wishlist (services + technicians) | ✅ | ✅ | `wishlist.js`, `WishlistPage.jsx` |
| F45 | Beauty streaks (current + longest) | ✅ | ✅ | `streaks.js` |
| F46 | Achievements (first booking, weekly streak, etc.) | ✅ | ✅ | `Achievement` model |
| F47 | Referral program (codes, rewards) | ✅ | ✅ | `referral.js` |
| F48 | "Surprise Me" recommendations | ✅ | ✅ | `SurpriseMePage.jsx` |

### Admin
| # | Feature | Web | Mobile | Existing Code |
|---|---------|-----|--------|--------------|
| F49 | Admin dashboard (bookings, customers, techs, finance) | ✅ | ❌ | `AdminDashboard.jsx` |
| F50 | User/technician management (suspend, verify KYC) | ✅ | ❌ | `admin.js` |
| F51 | Category & service CRUD | ✅ | ❌ | `admin.js`, `catalog.js` |
| F52 | Analytics & reports | ✅ | ❌ | `analytics.js` |
| F53 | Platform configuration | ✅ | ❌ | `platform.js`, `PlatformConfig` |

### Localization
| # | Feature | Web | Mobile | Existing Code |
|---|---------|-----|--------|--------------|
| F54 | Arabic (ar) — default, RTL | ✅ | ✅ | `i18n/` dirs, i18next |
| F55 | English (en) — LTR | ✅ | ✅ | `i18n/` dirs |
| F56 | Bilingual content (JSONB `{ ar, en }`) | ✅ | ✅ | All models |

---

## 2. Entity-Relationship Diagram (Text)

```
User 1──1 Wallet
User 1──0..1 Technician
User 1──0..1 Streak
User 1──* Address
User 1──* Booking (as Customer)
User 1──* Booking (as Technician)
User 1──* Notification
User 1──* Review
User 1──* RefreshToken
User 1──* TermsAcceptance
User 1──* Dispute (raised)
User 1──* WaitlistEntry
User 1──* ChatMessage
User 1──* WishlistItem
User 1──* UserAchievement
User 1──* Referral (made)
User 1──* Referral (received)
User 1──* AuditLog
User 1──* Payout

Technician 1──* AvailabilitySlot
Technician 1──* TechnicianService
Technician 1──* WaitlistEntry
Technician 1──* WishlistItem

Category 1──0..1 Category (parent)
Category 1──* Category (children)
Category 1──* Service

Service 1──* ServiceVariant
Service *──* Service (addons via ServiceAddon)
Service 1──* TechnicianService
Service 1──* Booking
Service 1──* WishlistItem
Service *──* ServiceTag (via ServiceTagAssignment)

TechnicianService *──1 Technician
TechnicianService *──1 Service

AvailabilitySlot 1──1 Booking (optional)

Booking 1──1 Payment (optional)
Booking 1──1 Review (optional)
Booking 1──1 Dispute (optional)
Booking 1──1 ZatcaInvoice (optional)
Booking *──1 Address

AiSubscriptionPlan 1──* CustomerAiSubscription
CustomerAiSubscription 1──* AiUsage

Achievement 1──* UserAchievement

Wallet 1──* WalletTransaction
```

---

## 3. Route Table

### tRPC Router Structure (replaces REST API)

```typescript
// packages/api/src/routers/
auth        // register, login, logout, refreshToken, verifyEmail,
            //   forgotPassword, resetPassword, changePassword,
            //   2fa.setup, 2fa.verify, 2fa.disable, 2fa.enforceLogin
users       // me, updateProfile, uploadAvatar, getById
technicians // list, getById, getSlots, getServices,
            //   submitKyc, updateKycStatus (admin)
addresses   // list, create, update, delete, setDefault
categories  // list, tree, getBySlug, create (admin), update (admin), delete (admin)
services    // list, search, getById, getVariants, getAddons,
            //   create (admin), update (admin), delete (admin)
slots       // create, update, delete, getAvailability, getByTechnician
bookings    // create, accept, reject, start, complete, cancel,
            //   noShow, getById, list (customer/tech), timeline
payments    // authorize, capture, refund, status, webhook
wallet      // getBalance, transactions, cashbackHistory
payouts     // request, list, process (admin)
reviews     // create, update, list (by tech/booking), hide (admin)
disputes    // create, update, resolve (admin), list
notifications // list, markRead, markAllRead, send (admin), registerPushToken
waitlist    // join, leave, status, notify (admin)
wishlist    // add, remove, list
analytics   // dashboard (admin), technicianStats, bookingReports, revenueCharts
zatca       // generateInvoice, report, status, clearance
ai          // chat, recommendations, quiz.submit, quiz.get
calendar    // connectGoogle, sync, disconnect
subscriptions // plans.list, subscribe, cancel, usage
platform    // getConfig, setConfig (admin), maintenance.toggle, terms.get, terms.accept
streaks     // get, history
referrals   // getCode, apply, status, rewards
admin       // users.list, users.suspend, technicians.verifyKyc, dashboard.stats
uploads     // avatar, kycDocument, categoryImage, serviceImage
```

### Web Route Table (Next.js App Router)

```
apps/web/app/
├── (auth)/
│   ├── login/page.tsx
│   ├── register/page.tsx
│   ├── forgot-password/page.tsx
│   ├── reset-password/page.tsx
│   └── verify-email/page.tsx
├── (public)/
│   ├── page.tsx                    // Landing / Home
│   ├── services/page.tsx           // Service catalog
│   ├── services/[slug]/page.tsx    // Service detail
│   ├── technicians/page.tsx        // Technician search
│   └── technicians/[id]/page.tsx   // Technician profile
├── (customer)/
│   ├── dashboard/page.tsx          // Customer dashboard
│   ├── bookings/page.tsx           // Booking history
│   ├── bookings/[id]/page.tsx      // Booking detail
│   ├── wallet/page.tsx             // Wallet
│   ├── wishlist/page.tsx           // Wishlist
│   ├── notifications/page.tsx      // Notifications
│   ├── profile/page.tsx            // Profile settings
│   ├── addresses/page.tsx          // Address management
│   ├── referrals/page.tsx          // Referral program
│   ├── streaks/page.tsx            // Beauty streaks
│   └── surprise-me/page.tsx        // AI recommendations
├── (technician)/
│   ├── dashboard/page.tsx          // Technician dashboard
│   ├── slots/page.tsx              // Availability management
│   ├── bookings/page.tsx           // Booking management
│   ├── earnings/page.tsx           // Earnings & payouts
│   └── profile/page.tsx            // KYC & profile
├── (admin)/
│   ├── dashboard/page.tsx          // Admin overview
│   ├── users/page.tsx              // User management
│   ├── technicians/page.tsx        // KYC verification
│   ├── categories/page.tsx         // Category management
│   ├── services/page.tsx           // Service management
│   ├── bookings/page.tsx           // All bookings
│   ├── disputes/page.tsx           // Dispute resolution
│   ├── analytics/page.tsx          // Reports & charts
│   ├── finance/page.tsx            // Payouts & transactions
│   ├── platform/page.tsx           // Platform config
│   └── zatca/page.tsx              // ZATCA invoices
└── layout.tsx                      // Root layout (providers, i18n)
```

### Mobile Route Table (Expo Router)

```
apps/mobile/app/
├── (auth)/
│   ├── login.tsx
│   ├── register.tsx
│   ├── forgot-password.tsx
│   └── verify-email.tsx
├── (tabs)/
│   ├── _layout.tsx
│   ├── index.tsx                   // Home
│   ├── services.tsx                // Catalog
│   ├── bookings.tsx                // My bookings
│   ├── wallet.tsx                  // Wallet
│   └── profile.tsx                 // Profile
├── services/[slug].tsx
├── technicians/[id].tsx
├── bookings/[id].tsx
├── wishlist.tsx
├── notifications.tsx
├── addresses.tsx
├── referrals.tsx
├── streaks.tsx
├── surprise-me.tsx
├── chat.tsx                        // Layla chatbot
├── (technician)/
│   ├── dashboard.tsx
│   ├── slots.tsx
│   └── earnings.tsx
├── (admin)/
│   └── dashboard.tsx
└── _layout.tsx
```

---

## 4. Issues Identified (from Existing Codebase — to be fixed in rebuild)

### 🔴 Critical
- **None.** The existing codebase builds and runs.

### 🟠 Major
1. **2FA never enforced at login** — `auth.js` `login()` doesn't check `twoFactorEnabled`. The rebuild must require a TOTP token when 2FA is enabled. (Severity: Major / Security)
2. **CSRF exemptions too broad** — Covers most state-changing routes. In the new tRPC architecture, we'll use proper CSRF protection with the tRPC + Next.js pattern. (Severity: Major / Security)

### 🟡 Minor
3. **Secrets in working tree** — `backend/.env` has real values. Provide `.env.example` only; never commit `.env`. (Severity: Minor)
4. **Placeholder comment in HomePage** — Cosmetic. (Severity: Minor)
5. **Stray mangled-path directories** — 5 junk directories. Will be eliminated in rebuild. (Severity: Minor)
6. **No git history** — The repo is uninitialized for git. Phase 0 will initialize git. (Severity: Minor)
7. **No Prisma migrations** — Uses `db push`. For the rebuild, we'll generate proper migrations. (Severity: Minor)

### 🟢 Design Gaps to Address in Rebuild
8. **No mandatory state components** — Existing frontend lacks systematic `Skeleton | Error | Empty | Data` pattern. The rebuild enforces this.
9. **No monorepo tooling** — No shared packages, no Turborepo caching, no unified type checking. Rebuild fixes this.
10. **REST over tRPC** — Current REST API lacks end-to-end type safety. tRPC + Zod provides this.
11. **No server components** — Current React SPA does all rendering client-side. Next.js App Router enables server components for improved perf.

---

## 5. Migration Strategy

### From → To Map
| Existing | Rebuild Target |
|----------|---------------|
| Express.js REST (27 route modules) | tRPC routers in `packages/api` |
| Zod validators (`backend/src/validators/`) | Zod schemas in `packages/api` (reused) |
| React 18 + Vite SPA | Next.js 14 App Router in `apps/web` |
| React Router v6 | Next.js file-based routing |
| Axios + interceptors | tRPC client (`@trpc/react-query`) |
| Zustand stores | tRPC context + React Query cache |
| Express middleware (19 files) | Next.js middleware + tRPC procedures |
| Prisma schema (`backend/prisma/`) | Migrate to `packages/db/prisma/` |
| Prisma client | `@galaxy/db` package |
| UI components (Tailwind) | `packages/shared` UI kit |
| i18n (i18next) | Same library, in `packages/shared` |
| Expo SDK 54 + React Navigation | Expo Router (file-based) in `apps/mobile` |
| Socket.IO | Server-Sent Events or tRPC subscriptions |
| BullMQ + Redis queues | Keep Redis, use `bullmq` in `packages/api` |
| Docker Compose (4 services) | Same, updated for new stack |
| npm workspaces | pnpm workspaces + Turborepo |

### Data Model: Preserved
The Prisma schema (25+ models, 12 enums) will be migrated **as-is** to `packages/db/prisma/schema.prisma`. All models, relations, indexes, and enum values are preserved. The schema is well-designed and needs no structural changes.

### API Contract: Preserved with tRPC
Each REST endpoint maps to a tRPC procedure. Zod validators are reused directly. The tRPC router structure mirrors the current `routes/index.js` organization.

---

## 6. Execution Plan (Phases)

| Phase | Description | Files | Est. Duration |
|-------|-------------|-------|---------------|
| **Phase 0** | Deep Audit & PLAN.md (this document) | 1 | ✅ Done |
| **Phase 1** | Monorepo scaffold (pnpm, turbo, config packages) | ~30 | 1 session |
| **Phase 2** | Database & API layer (Prisma, tRPC routers, Zod) | ~60 | 2 sessions |
| **Phase 3** | Shared layer (UI kit, hooks, i18n, state components) | ~40 | 1 session |
| **Phase 4** | Web app (Next.js, all features, 4-state pattern) | ~80 | 3 sessions |
| **Phase 5** | Mobile app (Expo Router, feature parity) | ~60 | 2 sessions |
| **Phase 6** | Docker integration (dev + prod) | ~10 | 1 session |
| **Phase 7** | Full automated audit & hardening | ~20 | 1 session |
| **Phase 8** | Final report & DELIVERY_REPORT.md | 1 | 1 session |

**Total estimated: 302 files, 12 sessions**

---

## 7. Non-Negotiables (from System Prompt)

1. ✅ Every data-fetching component exports `Skeleton | Error | Empty | DataView`
2. ✅ Strict TypeScript (`strict: true`) everywhere
3. ✅ Zod validation on every tRPC procedure input
4. ✅ Environment variables: `.env.example` only, never secrets
5. ✅ Phase-by-phase commits: `Phase X complete – N files changed, build passing`
6. ✅ All verification via shell commands — no imagined output
7. ✅ Arabic-first RTL + English LTR

---

## 8. Environment Variables (from `backend/src/config/env.js`)

### Required
```
DATABASE_URL           — PostgreSQL connection string
JWT_ACCESS_SECRET      — ≥32 chars
JWT_REFRESH_SECRET     — ≥32 chars
```

### Optional (with defaults)
```
NODE_ENV=development
PORT=4000
HOST=localhost
API_PREFIX=/api
CORS_ORIGIN=http://localhost:5173
REDIS_URL=redis://localhost:6379
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
PAYFORT_MERCHANT_ID=
PAYFORT_ACCESS_KEY=
PAYFORT_SHA_REQUEST_PHRASE=
PAYFORT_SHA_RESPONSE_PHRASE=
PAYFORT_SANDBOX=true
SMTP_HOST=, SMTP_PORT=, SMTP_USER=, SMTP_PASS=, EMAIL_FROM=
OPENAI_API_KEY=, OPENAI_MODEL=gpt-4o-mini
GOOGLE_CLIENT_ID=, GOOGLE_CLIENT_SECRET=
TWILIO_ACCOUNT_SID=, TWILIO_AUTH_TOKEN=, TWILIO_PHONE_NUMBER=
AWS_ACCESS_KEY_ID=, AWS_SECRET_ACCESS_KEY=, AWS_REGION=me-south-1, AWS_S3_BUCKET=
SENTRY_DSN=
ZATCA_CSID=, ZATCA_PRIVATE_KEY_PATH=
TERMS_VERSION=1.0
PLATFORM_FEE_SAR=11
CASHBACK_FIRST_BOOKING_PERCENT=40
CASHBACK_SUBSEQUENT_PERCENT=5
...
```

---

⏸ **PLAN READY.** Review and reply **"go"** to proceed with Phase 1 (Monorepo Scaffold).
