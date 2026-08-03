# Galaxy of Beauty — Platform-Wide Testing Plan

> **Goal:** End-to-end validation of web app, mobile app, API server, and database with realistic seed data — no errors, no gaps, no mismatches, no missing features or logic.

> **Estimated duration:** 3-5 working days (25-40 hours)

> **Date:** 2026-08-03

--

## Current State

| Metric | Status |
|--------|--------|
| TypeScript errors | **0** across 6 packages |
| ESLint errors | **0** |
| ESLint warnings | **0** |
| Existing unit tests | **243** (10 test files in API package) |
| Existing E2E tests | **7** Playwright specs (auth, booking, marketplace, skin-analysis, AI chat, authenticated, security) |
| CI pipeline | Type-check, lint, unit tests, build, E2E, Docker |
| Prisma models | **87** |
| Next.js routes | **254** |
| Shared UI components | **15** |

---

## Phase 1: Seed Data (2-3 hours)

### 1.1 Create realistic seed script
**File:** `packages/db/prisma/seed.ts` (extend existing)

**Data to generate:**

| Entity | Count | Notes |
|--------|-------|-------|
| Users (CUSTOMER) | 15 | Arabic names, varied emails, 3 with 2FA enabled |
| Users (TECHNICIAN) | 8 | With KYC profiles, service portfolios, availability slots |
| Users (ADMIN) | 2 | Platform admins |
| Categories | 6 | Hair, Nails, Skincare, Makeup, Massage, Henna — with Arabic/English names |
| Services | 30 | 5 per category, with variants, pricing tiers, images |
| Technicians | 8 | Linked to users, with ratings, cities, service assignments |
| Availability Slots | 200+ | Next 14 days, 8am-9pm, varied availability |
| Bookings | 50 | Mix of REQUESTED, ACCEPTED, COMPLETED, CANCELLED — across 30 days |
| Reviews | 30 | Arabic comments, ratings 3-5 stars |
| Wallet Transactions | 40 | Credits, debits, cashback, withdrawals |
| Loyalty Accounts | 12 | Points at different tier thresholds |
| Promo Codes | 5 | Active + expired |
| Gift Cards | 8 | Purchased + redeemed |
| Wishlist Items | 20 | Services + products |
| Notifications | 30 | Various types per user |
| Flash Deals | 4 | Active + upcoming |
| Campaigns | 3 | Active |
| Beauty Events | 3 | Upcoming |

**Acceptance criteria:**
- `pnpm db:seed` runs successfully
- All 87 models have at least 1 row (where applicable)
- Foreign key relationships are all satisfied
- Data is in Arabic where user-facing (names, descriptions, reviews)
- A known test user exists: `customer@test.com` / `Test1234!`

---

## Phase 2: API Integration Tests (4-6 hours)

### 2.1 Critical business flows

Each flow is a test file that hits the real database with seed data:

#### 2.1.1 Auth flow (`auth.integration.test.ts`)
- [ ] Register new customer
- [ ] Login with email + password → receive JWT
- [ ] Login with wrong password → 401
- [ ] Login with 2FA enabled → PRECONDITION_FAILED → submit TOTP → success
- [ ] Refresh token rotation
- [ ] Verify email with token
- [ ] Forgot password → reset password flow
- [ ] Rate limiting: 5 failed attempts → lockout

#### 2.1.2 Booking flow (`booking.integration.test.ts`)
- [ ] Browse services by category
- [ ] Search services (Arabic query)
- [ ] View service detail with variants
- [ ] Select technician + time slot
- [ ] Create booking (REQUESTED status)
- [ ] Technician accepts booking (ACCEPTED)
- [ ] Technician starts service (IN_PROGRESS)
- [ ] Technician completes service (COMPLETED)
- [ ] Customer cancels (CANCELLED)
- [ ] Create recurring booking
- [ ] Create emergency booking (surcharge applied)
- [ ] Group booking with multiple services

#### 2.1.3 Wallet flow (`wallet.integration.test.ts`)
- [ ] View wallet balance
- [ ] Top-up wallet
- [ ] Cashback credited after booking completion (5%)
- [ ] First booking bonus (50 SAR)
- [ ] Withdraw funds (minimum 200 SAR, 5% fee)
- [ ] Transaction history pagination

#### 2.1.4 Loyalty flow (`loyalty.integration.test.ts`)
- [ ] Points earned per booking (10 points per 1 SAR)
- [ ] Tier progression: SILVER → GOLD (500) → PLATINUM (2000)
- [ ] Point multiplier per tier (1x/1.5x/2x)
- [ ] Redeem reward
- [ ] Admin credit/debit points

#### 2.1.5 Referral flow (`referral.integration.test.ts`)
- [ ] Generate referral code
- [ ] Register with referral code → referrer gets credit
- [ ] Referral race leaderboard
- [ ] Share link generates correct URL

#### 2.1.6 Admin flows (`admin.integration.test.ts`)
- [ ] List/suspend users
- [ ] CRUD categories
- [ ] CRUD services with variants
- [ ] Verify technician KYC
- [ ] View analytics dashboard
- [ ] Export data (users, bookings, payments)

#### 2.1.7 ZATCA e-invoicing (`zatca.integration.test.ts`)
- [ ] Generate invoice hash (SHA-256)
- [ ] QR code generation
- [ ] Simulation mode (ZATCA_SIMULATE=true)
- [ ] Production mode fails gracefully without credentials

#### 2.1.8 Error & edge cases (`errors.integration.test.ts`)
- [ ] Unauthorized access to protected endpoints → 401
- [ ] Forbidden role access (customer hitting admin endpoint) → 403
- [ ] Not found (invalid ID) → 404
- [ ] Validation errors (bad input) → 400
- [ ] Rate limit exceeded → 429
- [ ] CSRF token missing on mutation → 403
- [ ] Concurrent booking of same slot → handled gracefully
- [ ] Expired promo code → rejected
- [ ] Expired gift card → rejected

### 2.2 Run & report
```bash
pnpm test                 # Run all integration tests
pnpm test -- --coverage   # Generate coverage report
```

**Acceptance criteria:**
- All 8 integration test files pass
- Coverage ≥ 70% on critical paths
- No test uses mocks for database (real Prisma with seed data)

---

## Phase 3: Web E2E Tests (8-12 hours)

### 3.1 Extend existing Playwright specs

#### 3.1.1 Auth (`e2e/auth.spec.ts`)
- [ ] Register with valid data → redirected to dashboard
- [ ] Register with existing email → error message
- [ ] Login with valid credentials → redirected
- [ ] Login with wrong password → error displayed
- [ ] Login with 2FA → TOTP prompt → verify → redirected
- [ ] Forgot password → enter email → success message
- [ ] Logout → redirected to login

#### 3.1.2 Customer booking (`e2e/booking.spec.ts`) — EXTEND
- [ ] Browse services → filter by category
- [ ] Click service → view detail with variants
- [ ] Select variant → see price update
- [ ] Select technician → see available slots
- [ ] Choose slot → fill address → apply promo → confirm
- [ ] View booking in "My Bookings"
- [ ] Cancel booking → confirmation modal → cancelled

#### 3.1.3 Wallet (`e2e/wallet.spec.ts`) — NEW
- [ ] View wallet balance
- [ ] Top-up → enter amount → confirm → balance updated
- [ ] View transaction history → paginate
- [ ] Withdraw → enter amount → confirm → balance reduced

#### 3.1.4 Admin (`e2e/admin.spec.ts`) — NEW
- [ ] Login as admin → redirected to admin dashboard
- [ ] View users list → search user → suspend user
- [ ] Create category → it appears in list
- [ ] Create service with variants → it appears
- [ ] Verify technician KYC → status changes

#### 3.1.5 RTL & a11y (`e2e/a11y.spec.ts`) — NEW
- [ ] All pages render RTL (dir="rtl" on html)
- [ ] Arabic text renders correctly (no tofu/missing glyphs)
- [ ] Tab through login form → focus visible
- [ ] Modal traps focus → Escape closes
- [ ] Skip link works on all pages
- [ ] Toast notifications have aria-live
- [ ] Images have alt text

#### 3.1.6 Responsive (`e2e/responsive.spec.ts`) — NEW
- [ ] Mobile viewport (375px) — no horizontal scroll
- [ ] Tablet viewport (768px) — grid adjusts
- [ ] Desktop viewport (1280px) — full layout
- [ ] Dark mode toggle — all pages render correctly

#### 3.1.7 Performance (`e2e/performance.spec.ts`) — NEW
- [ ] Home page Lighthouse score ≥ 80
- [ ] Dashboard Lighthouse score ≥ 70
- [ ] No Cumulative Layout Shift on data-fetching pages
- [ ] First Contentful Paint < 2s

### 3.2 Run
```bash
cd apps/web && npx playwright test
```

**Acceptance criteria:**
- All 7 Playwright specs pass (existing + new)
- No flaky tests (3 consecutive green runs)
- HTML report generated with screenshots

---

## Phase 4: Mobile App Validation (4-6 hours)

### 4.1 Critical screen checklist

#### Auth screens
- [ ] Login screen renders RTL, Arabic text correct
- [ ] Register form validates
- [ ] Forgot password flow works
- [ ] 2FA screen (if applicable)

#### Customer screens
- [ ] Home tab: categories load, services display
- [ ] Bookings tab: list loads, filter by status
- [ ] Wallet tab: balance displays, transactions load
- [ ] Profile tab: details display, edit works
- [ ] Create booking: service select → variant → tech → slot → confirm
- [ ] Inspiration board: pins display, drag-to-reorder works (Expo)
- [ ] Notifications: list loads, badge count

#### Admin screens
- [ ] Dashboard loads with stats
- [ ] User list/search/suspend
- [ ] Service CRUD

#### Shared constants
- [ ] DEFAULT_PAGE_SIZE used for list queries
- [ ] SAUDI_CITIES used for city picker
- [ ] LOYALTY_TIERS used for tier display
- [ ] SOCKET_DEFAULT_PORT used for socket connection

### 4.2 Run
```bash
cd apps/mobile && npx expo start
```

**Acceptance criteria:**
- All screens render without JS errors
- Shared constants are in use (verify via grep)
- Navigation works between all tabs
- No hardcoded URLs remain

---

## Phase 5: UI/UX Audit (3-4 hours)

### 5.1 Component visual check

| Component | Light mode | Dark mode | RTL | Responsive |
|-----------|-----------|-----------|-----|------------|
| Button (all 5 variants) | [ ] | [ ] | [ ] | [ ] |
| Card | [ ] | [ ] | [ ] | [ ] |
| Input (normal/error/disabled) | [ ] | [ ] | [ ] | [ ] |
| Modal | [ ] | [ ] | [ ] | [ ] |
| EmptyState | [ ] | [ ] | [ ] | [ ] |
| ErrorAlert | [ ] | [ ] | [ ] | [ ] |
| Spinner/PageSpinner | [ ] | [ ] | [ ] | [ ] |
| ProgressBar | [ ] | [ ] | [ ] | [ ] |
| Pagination | [ ] | [ ] | [ ] | [ ] |
| StatCard | [ ] | [ ] | [ ] | [ ] |
| PageContainer | [ ] | [ ] | [ ] | [ ] |
| Icon (all 30) | [ ] | [ ] | [ ] | [ ] |
| InlineEdit | [ ] | [ ] | [ ] | [ ] |
| Toast | [ ] | [ ] | [ ] | [ ] |
| Skeleton (all 11 variants) | [ ] | [ ] | [ ] | [ ] |

### 5.2 Interaction audit

- [ ] Touch targets ≥ 44px on all buttons (mobile viewport)
- [ ] Focus ring visible on all interactive elements (Tab through every page)
- [ ] Hover states working on all cards and buttons
- [ ] Loading states show sized skeletons (no layout shift)
- [ ] Empty states show friendly messages with CTAs
- [ ] Error states show Arabic messages with retry buttons
- [ ] Toast notifications animate in and out smoothly
- [ ] Page transitions are subtle (no jarring flashes)
- [ ] Drag-and-drop on inspiration board works (mouse + touch)
- [ ] Modal focus trap works (Tab/Shift+Tab cycle)
- [ ] prefers-reduced-motion: reduce stops all animations

### 5.3 Semantic token audit

- [ ] Grep for `text-green-600` → should only appear in semantic token definitions
- [ ] Grep for `text-red-600` → should only appear in token definitions
- [ ] Grep for `bg-red-50` → should only appear in token definitions
- [ ] Dark mode: toggle .dark class → all colours switch via CSS custom properties

**Acceptance criteria:**
- All 15 components pass visual check in all 4 modes
- Zero layout shift on skeleton-to-content transitions
- All Arabic text renders correctly (no tofu/??? boxes)
- Touch targets pass Lighthouse audit

---

## Phase 6: Bug Fixes (4-8 hours)

### 6.1 Triage process

1. Run full test suite (`pnpm test` + `npx playwright test`)
2. Log all failures to a tracking file
3. Categorize: **blocker** (crashes/data loss), **major** (broken feature), **minor** (cosmetic)
4. Fix blockers and majors first
5. Re-run tests after each fix batch

### 6.2 Known areas likely to surface issues

- Prisma Decimal handling in edge cases (nested includes, aggregations)
- tRPC type depth errors on deeply nested queries
- RTL layout on complex forms (2FA, multi-step booking)
- Mobile app Expo-specific quirks (SafeAreaView, keyboard avoiding)
- Redis-dependent features when Redis is down
- Concurrent slot booking race conditions
- Token refresh near expiry boundary

---

## Phase 7: Final Verification (1 hour)

```bash
# TypeScript
pnpm type-check                    # All 6 packages

# ESLint
cd apps/web && npx eslint src      # 0 errors, 0 warnings

# Unit + integration tests
pnpm test                          # All tests green

# E2E tests
cd apps/web && npx playwright test # All specs green

# Build
pnpm build                         # 254 pages, clean

# Storybook
cd packages/shared && pnpm build-storybook  # Builds without errors
```

### Final checklist
- [ ] `pnpm type-check` — 0 errors
- [ ] `pnpm test` — all tests pass
- [ ] `npx playwright test` — all specs green
- [ ] `pnpm build` — 254 pages generated
- [ ] `pnpm lint` — 0 errors, 0 warnings
- [ ] Storybook builds without errors
- [ ] Mobile type-check passes
- [ ] No `console.error` in server logs (except Redis fallback)
- [ ] No Decimal warnings in server logs
- [ ] All shared constants referenced in at least 1 file

---

## Time Breakdown Summary

| Phase | Activity | Min | Max |
|-------|----------|-----|-----|
| 1 | Seed data | 2h | 3h |
| 2 | API integration tests | 4h | 6h |
| 3 | Web E2E tests | 8h | 12h |
| 4 | Mobile validation | 4h | 6h |
| 5 | UI/UX audit | 3h | 4h |
| 6 | Bug fixes | 4h | 8h |
| 7 | Final verification | 1h | 1h |
| **Total** | | **26h** | **40h** |

**Pessimistic (including context-switching, debugging, edge cases): 3-5 working days**
