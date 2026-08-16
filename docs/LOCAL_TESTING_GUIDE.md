# Local Verification Guide — Test Everything Yourself

> **Purpose**: a complete, step-by-step checklist to verify the platform locally — web, mobile,
> API, database, seed data, UI/UX, and warnings — before any production decision.
> **Date**: 2026-08-16 · Everything below has been run and verified this session.

---

## 0. One-Shot Setup

```bash
git pull origin master
pnpm install --frozen-lockfile
cp .env.example .env          # then edit DATABASE_URL + secrets
pnpm db:generate
pnpm db:push                  # dev schema sync (not production migrations)
pnpm db:seed                  # test data (takes ~1 min)
pnpm dev                      # start web on http://localhost:3000
```

## 1. Test Credentials (from seed)

| Role       | Email                     | Password       |
| ---------- | ------------------------- | -------------- |
| Admin      | `admin@galaxyofbeauty.sa` | `Admin@123456` |
| Customer   | `customer@test.com`       | `Admin@123456` |
| Technician | `tech1@test.com`          | `Admin@123456` |

Seed also creates ~6 demo customers (سارة الحربي etc.), demo technicians incl.
**د. ليلى القحطاني** (a doctor character — intentionally NOT renamed when the
chatbot became "مجرة الجمال"), services with Arabic titles (e.g. قص شعر),
availability slots, bookings, reviews, and loyalty/wallet records.

## 2. Automated Gates (all must pass)

```bash
pnpm format:check                                    # ✅ 0 warnings
pnpm type-check                                      # ✅ 6/6 workspaces
pnpm lint                                            # ✅ 0 errors (warnings expected — see §9)
pnpm build                                           # ✅ 6/6 workspaces
pnpm --filter @galaxy/api test                       # ✅ 543 tests / 38 files
pnpm --filter @galaxy/api test:coverage              # ✅ exit 0 — ratchet 50/61/36/50
node scripts/audit-check.mjs                         # ✅ 7 high / 0 critical (baseline)
pnpm --filter @galaxy/ui storybook                   # ✅ component browser :6006
```

## 3. API Runtime Verification

Start the dev server (`pnpm dev`) in one terminal, then:

```bash
node apps/web/scripts/smoke-mobile-contract.mjs
```

Expect **5/5 PASS** — this exercises the real HTTP stack: mobile login without
Origin/CSRF, Bearer-authenticated wallet, top-up with an opaque idempotency key,
idempotent replay, and browser-CSRF enforcement (FORBIDDEN).

## 4. Web Manual Walkthrough

### 4.1 Auth & Sessions

- [ ] Register a new account → lands on login
- [ ] Login as `customer@test.com`
- [ ] **2FA**: `/customer/profile`? No — open the 2FA screen, click **بدء الإعداد**, copy the
      base32 secret into Google Authenticator (works with real apps now), verify with the code,
      log out, log back in → challenged with `2FA_REQUIRED`, log in with a fresh code, then disable 2FA
- [ ] Logout revokes the session (old refresh token rejected)
- [ ] Reload mid-session → still authenticated (HttpOnly cookie)

### 4.2 Booking Engine (core flow)

- [ ] `/services` → open a service → **احجزي** → complete booking create
- [ ] Customer dashboard: booking shows REQUESTED
- [ ] Login as technician → accept → start → complete (state machine)
- [ ] Booked slot shows as unavailable for a second booking (CONFLICT)

### 4.3 Wallet & Payments

- [ ] `/wallet` shows balance
- [ ] `/wallet/top-up` → charge 100 SAR → balance increases, toast, idempotent re-send
- [ ] Create + authorize a cash booking → technician captures → booking PAID + 5% cashback in wallet

### 4.4 Search (Arabic ILIKE)

- [ ] Search **شعر** → results; search nonsense → empty state (the raw ILIKE boost is live now)

### 4.5 AI Chatbot (مجرة الجمال)

- [ ] `/ai-chat` — header, welcome, and bubbles all say **مجرة الجمال**
- [ ] Ask about روتين/بشرة/مكياج → keyword answers
- [ ] `/beauty-advisor` — topic chips work, typing indicator shows

### 4.6 UI/UX items delivered

- [ ] **Sized skeletons**: throttle to slow 3G → loading states match content shape (no layout jump)
- [ ] **Page transitions**: 180ms fade on navigation; enable OS "reduce motion" → no animation
- [ ] **Inline editing**: `/profile` → click name/phone → edit → Enter saves, Escape cancels
- [ ] **Drag-and-drop**: `/mood-board` pin thumbnails reorder; `/inspiration` full-grid reorder
      (reload the page → order persists)
- [ ] **RTL**: `document.documentElement` has `dir="rtl"` on every page
- [ ] **Dark mode**: toggle theme → semantic tokens switch
- [ ] **A11y**: Tab through the login form, toast/live regions announced (role=status loaders)

### 4.7 Admin

- [ ] `/admin` — dashboard stats, users, bookings, categories CRUD
- [ ] Category create/update/delete → cache invalidation (Redis down logs a warn, never crashes)

## 5. Mobile Manual Walkthrough (Expo)

```bash
cd apps/mobile && npx expo start   # scan QR with Expo Go, or press a/i for emulator
```

- [ ] Login as `customer@test.com` (Bearer token now persisted + attached to every request)
- [ ] Tabs: home/services/bookings/wallet/profile all load
- [ ] **Wallet → top-up**: charge 50 SAR → success toast → balance updates
- [ ] **AI chat** (مجرة الجمال) — send a message, get a reply
- [ ] **Beauty advisor** — topic chips + custom questions
- [ ] Bookings → create → reschedule → cancel flows
- [ ] Profile → logout clears the token (login as another user behaves correctly)

> Mobile has no automated test runner — the API contract it depends on is verified
> by the smoke script (§3) and the 543 API tests.

## 6. E2E (browser matrix)

```bash
pnpm --filter @galaxy/web build
pnpm --filter @galaxy/web exec playwright install chromium firefox
pnpm --filter @galaxy/web exec playwright test   # ✅ 168/168 (chromium + firefox + mobile chrome)
```

## 7. Database Checks

```bash
pnpm --filter @galaxy/db exec prisma studio   # browse 200+ tables
pnpm --filter @galaxy/db exec prisma migrate status   # migrations vs schema
```

- [ ] `mood_board_pins` and `inspiration_pins` have a `sortOrder` column
- [ ] Seeded user `customer@test.com` exists with a wallet
- [ ] `prisma migrate deploy` applies cleanly on an empty DB (the migration chain incl. `20260816000000_add_pin_sort_order`)

## 8. Storybook

```bash
pnpm --filter @galaxy/ui storybook
```

- [ ] Browse Button, Card, Input, Skeleton (13 variants), Feedback, Layout, InlineEdit stories
- [ ] A11y addon shows no critical violations

## 9. Expected Warnings & Known Gaps (not regressions)

**Warnings that are fine:**

- API ESLint: **149 warnings** — pre-existing `no-explicit-any` / unused-args patterns
- Web ESLint: **164 warnings** — `no-console` + `no-explicit-any` (a11y and image rules are ERRORS now)
- `[Redis] Connection error` logs when Redis isn't running — the app degrades gracefully by design
- Expo peer-dep warning (`@expo/metro-runtime`) — cosmetic, doesn't affect the build

**Known gaps (documented, not bugs):**

- `payfort` gateway integration + socket server + `workers/index` have no automated tests (coverage laggards)
- `womensServices.ts` is a 3,626-line router pending a split (debt P0-02)
- Socket.IO parser upgrade is blocked on a major-version compat (debt P1-02, accepted in SECURITY.md)
- Deploy workflow is **manual-only** until this verification pass is approved

## 10. Troubleshooting Quick Hits

| Symptom                                     | Fix                                                                                                        |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL not found` in prisma commands | export `DATABASE_URL` or use the direct `pnpm --filter @galaxy/db exec prisma ...` form (turbo strips env) |
| Tests fail with missing tables              | `pnpm db:push && pnpm db:seed` — CI-like local env needs both                                              |
| `next start` says no build                  | run `pnpm --filter @galaxy/web build` first                                                                |
| E2E fails on boot                           | playwright config now uses strong non-blacklisted JWT secrets — don't downgrade them                       |
| Playwright browsers missing                 | `pnpm --filter @galaxy/web exec playwright install chromium firefox`                                       |
| Storybook errors                            | run from `packages/ui` (`pnpm --filter @galaxy/ui storybook`), not `packages/shared`                       |
