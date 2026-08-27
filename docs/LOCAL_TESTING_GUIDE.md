# Local Verification Guide — Test Everything Yourself

> **Purpose**: a complete, step-by-step checklist to verify the platform locally — web, mobile,
> API, database, seed data, UI/UX, warnings — before any production decision.
> **Date**: 2026-08-19 · Everything below reflects the current state: 823 API tests, coverage
> ratchet 62/74/69/62, 192/192 e2e, Expo SDK 57, warning-free idempotent seed.
>
> ⚠️ **Branch protection is ON**: you can still `git pull origin master`, but all future
> changes go through branches → PRs → green CI → merge (§11.8).

---

## 0. One-Shot Setup

```bash
git pull origin master
pnpm install --frozen-lockfile
cp .env.example .env            # then edit DATABASE_URL + secrets if your local differs
pnpm db:generate
pnpm db:migrate:deploy          # applies the full migration chain (schema source of truth)
pnpm db:seed                    # test data — idempotent, warning-free (~1 min)
```

> **Postgres**: the dev DB runs on `localhost:5433`, database `Galaxy_of_Beauty_db`
> (see `DATABASE_URL` in `.env`). Redis is optional — the app logs a warn and degrades
> gracefully when it's down.
> **The API is served through the web app** (`/api/trpc/[trpc]`), so one dev server
> covers web + API: `pnpm dev` → http://localhost:3000.
> **The socket server runs SEPARATELY** (real-time notifications / booking events):
>
> ```bash
> pnpm --filter @galaxy/api socket    # terminal 2 — ws://localhost:4001
> ```
>
> Without it, the browser console fills with `[Socket] Connection error` retries.

## 1. Test Credentials (from seed)

| Role       | Email                               | Password       |
| ---------- | ----------------------------------- | -------------- |
| Admin      | `admin@galaxyofbeauty.sa`           | `Admin@123456` |
| Customer   | `customer@test.com`                 | `Admin@123456` |
| Technician | `tech1@test.com` … `tech9@test.com` | `Admin@123456` |

The seed also creates ~6 demo customers (سارة الحربي etc.), demo technicians incl.
**د. ليلى القحطاني** (a doctor character — intentionally kept even though the chatbot
is "مجرة الجمال"), services, slots, bookings, reviews, wallet/loyalty records,
3 AI plans (Basic 100 CHATBOT / Pro 500 RECOMMENDATIONS / Analytics 1000 CHATBOT),
5 geo promotions, 7 beauty bundles, 13 feature flags — **and no subscription rows**
(see §4.5 for how to test the AI chat gate).

Re-seeding is safe to repeat: the seed is idempotent — run `pnpm db:seed` twice and
both runs complete with zero warnings.

## 2. Automated Gates (all must pass)

```bash
pnpm format:check                                    # ✅ repo-wide prettier (LF)
pnpm type-check                                      # ✅ 6 workspaces (mobile on TS 6.0)
pnpm lint                                            # ✅ 0 errors (warnings expected — see §9)
pnpm --filter @galaxy/api test                       # ✅ 823 tests / 65 files
pnpm --filter @galaxy/api test:coverage              # ✅ exit 0 — ratchet 62/74/69/62
node scripts/audit-check.mjs                         # ✅ 0 critical (highs are baseline — see §9)
pnpm --filter @galaxy/web build                      # ✅ ESLint runs during the build now
cd apps/mobile && npx expo export --platform android # ✅ 6.1 MB Hermes bundle
```

> API test files run **serially by design** (`fileParallelism: false`) — 65 files share
> one dev DB; the full run takes a few minutes. Don't "fix" the parallelism.

## 3. API Runtime Verification

Start the dev server (`pnpm dev`) in one terminal, then:

```bash
node apps/web/scripts/smoke-mobile-contract.mjs
```

Expect **5/5 PASS** — exercises the real HTTP stack: mobile login without Origin/CSRF,
Bearer-authenticated wallet, top-up with an opaque idempotency key, idempotent replay,
and browser-CSRF enforcement (FORBIDDEN).

## 4. Web Manual Walkthrough

### 4.1 Auth & Sessions

- [ ] Register a new account → lands on login
- [ ] Login as `customer@test.com`
- [ ] **2FA**: profile → 2FA screen → **بدء الإعداد** → copy the base32 secret into
      Google Authenticator (works with real apps) → verify → logout → login → challenged
      with `2FA_REQUIRED` → fresh code → disable 2FA
- [ ] Logout revokes the session; reload mid-session stays authenticated (HttpOnly cookie)

### 4.2 i18n — English / Arabic everywhere

- [ ] Toggle **Switch to English** in the header → the ENTIRE page flips: nav, headers,
      buttons, forms, toasts (catalog: 5,891 keys). Toggle back → Arabic restored
- [ ] The `gob_lang` cookie is set; a hard reload keeps the chosen language
- [ ] `/discover`, `/wallet`, `/profile`, `/admin` all translate (spot-check 10+ pages)
- [ ] Arabic **content data** (tips/guides/catalogs) stays Arabic by design — not a bug

### 4.3 Booking Engine (core flow)

- [ ] `/services` → open a service → **احجزي** → booking created
- [ ] Customer dashboard: booking shows REQUESTED
- [ ] Login as a technician → accept → start → complete (state machine)
- [ ] The booked slot is unavailable for a second booking (CONFLICT)

### 4.4 Wallet & Payments

- [ ] `/wallet` shows balance
- [ ] Top-up 100 SAR → balance increases, toast, re-sending the same idempotency key does NOT double-charge
- [ ] Create + authorize a cash booking → technician captures → PAID + 5% cashback in wallet

### 4.5 AI Chatbot (مجرة الجمال) — subscription-gated now

- [ ] `/ai-chat` as a seeded customer with **no subscription** → a clean message
      «يلزمك اشتراك في باقة الذكاء الاصطناعي…» (this is the fixed quota gate, not an error)
- [ ] Subscribe for testing (Studio or psql — seed has plans, not subscriptions):

```sql
INSERT INTO customer_ai_subscriptions ("userId", "planId", status, "expiresAt")
SELECT u.id, 1, 'ACTIVE', NOW() + INTERVAL '1 month'
FROM users u WHERE u.email = 'customer@test.com';
```

- [ ] Chat now works: header/welcome/bubbles say **مجرة الجمال**; ask about روتين/بشرة/مكياج
- [ ] A plan with `"monthlyLimit" = 0` is **unlimited**; a RECOMMENDATIONS-plan user gets
      «باقتك لا تشمل هذه الميزة» — both were broken before this week
- [ ] `/beauty-advisor` — topic chips work, typing indicator shows

### 4.6 Referrals — the fixed flow (was dead end-to-end)

- [ ] `/referrals` as `customer@test.com` → copy your code
- [ ] Log in as a different customer (register a fresh one) → apply that code → **success**
      (previously every fresh code returned "Invalid referral code")
- [ ] Applying your own code → «You cannot use your own referral code»
- [ ] Applying a second code after being referred → CONFLICT
- [ ] A **third** user can apply the SAME code again (the unique-constraint 500 is gone)

### 4.7 Waitlist — the fixed flow (web join/leave was broken)

- [ ] `/waitlist` → the technician dropdown shows **names** and works (was: empty names + profile-id mismatch → join/leave failed for every real technician)
- [ ] Join a technician → entry appears with your position
- [ ] Leave → entry removed, remaining positions re-numbered 1..n
- [ ] As a technician: notify next → customer receives an in-app notification whose link
      opens the technician's real profile (`/technicians/[userId]` — no more 404)

### 4.8 Discovery & personalization

- [ ] `/discover` renders popular/new services, events, flash deals (this page **crashed**
      with a Prisma error before the fix — a successful render is the check)

### 4.9 Technician earnings — the fixed math

- [ ] Login as `tech1@test.com` → earnings/pro-tools show **real numbers** for completed
      payouts (was: always zero because payouts were filtered by the profile id)

### 4.10 UI/UX items delivered

- [ ] **Sized skeletons**: throttle to slow 3G → loading states match content shape
- [ ] **Page transitions**: 180ms fade; enable OS "reduce motion" → no animation
- [ ] **Inline editing**: `/profile` → click name/phone → edit → Enter saves, Esc cancels
- [ ] **Drag-and-drop**: `/mood-board` + `/inspiration` reorder → reload → order persists
- [ ] **RTL**: `dir="rtl"` on every Arabic page
- [ ] **Dark mode**: toggle theme → semantic tokens switch (all components, incl. 4 fixed overlays)
- [ ] **A11y**: Tab through login; toast/live regions announced

### 4.11 Admin

- [ ] `/admin` — dashboard, users, bookings, categories CRUD
- [ ] Monitoring: `/admin` health/quick-status/errors feed render (cosmetic quirk: some
      status strings are empty — see §9)
- [ ] Category create/update/delete → cache invalidation (Redis down logs a warn, never crashes)

### 4.12 Search (Arabic ILIKE)

- [ ] Search **شعر** → results; search nonsense → empty state (the raw-SQL boost is live)

## 5. Mobile Manual Walkthrough (Expo SDK 57)

```bash
cd apps/mobile
npx expo start                 # ✅ works on Windows now (SDK 57 fixed the undici bug)
# scan the QR with Expo Go, or press 'a' for the Android emulator
```

> **Mobile networking (important)**: `localhost` on a phone/emulator is the DEVICE
> itself, not your PC. Create `apps/mobile/.env` (copy `.env.example`) with the right
> host for BOTH the API and the socket, then restart with `npx expo start -c`:
>
> ```bash
> # Android emulator:
> EXPO_PUBLIC_API_URL=http://10.0.2.2:3000/api/trpc
> EXPO_PUBLIC_SOCKET_URL=http://10.0.2.2:4001
>
> # Physical phone via Expo Go (your PC's LAN IP, same Wi-Fi):
> EXPO_PUBLIC_API_URL=http://192.168.x.x:3000/api/trpc
> EXPO_PUBLIC_SOCKET_URL=http://192.168.x.x:4001
> ```
>
> The socket server (`pnpm --filter @galaxy/api socket`) must be running for
> real-time booking/wallet/waitlist events on mobile too. There is no CSP on
> mobile — only the browser needed the `ws://localhost:*` allowance.

- [ ] Login as `customer@test.com` (Bearer token persisted; re-launch keeps the session)
- [ ] **Language switcher** (profile) → English/Arabic — EVERY screen translates
      (this was the big sweep: 300+ screens, catalog 5,891 keys)
- [ ] Tabs: home/services/bookings/wallet/profile all load
- [ ] **Wallet → top-up**: charge 50 SAR → success toast → balance updates
- [ ] **Waitlist** (customer): join → position; (tech) notify next → in-app notification
- [ ] **Earnings** (tech): non-zero numbers for completed payouts
- [ ] **AI chat**: without a subscription → the gate message; with one (see §4.5 SQL) → replies
- [ ] **Beauty advisor** — topic chips + custom questions
- [ ] Bookings → create → reschedule → cancel flows
- [ ] Profile → logout clears the token (login as another user behaves correctly)
- [ ] **Dark mode** (new): profile → theme row under the language row → cycles
      ☀️ Light → 🌙 Dark → ⚙️ System (persisted across restarts). Themed surfaces:
      tabs (home/bookings/wallet/profile), login/register forms, discover, and all
      shared components (screens, skeletons, toasts, error alerts)
- [ ] **Guest states**: open authenticated tabs while logged out → clean redirect to
      login (no error screens, no console spam) — the global UNAUTHORIZED handler
- [ ] **Wired screens (Phase 2)**: beauty quiz (real questions), daily fortune (real
      tips), tech performance / wallet / waitlist (real data), beauty budget planner,
      salon membership (subscribe/cancel + current tier), virtual consultation (book +
      my bookings), and the admin screens (audit log, events, flash deals,
      group bookings, loyalty, promo, subscriptions)

> Mobile has no automated test runner; its contract is verified by the smoke script (§3),
> the 823 API tests, and `expo export` (§2).
>
> **Known NO-API screens** (static by design — each has a `// NO API:` comment):
> bookings/confirm, post-treatment, video room, tech/gallery, admin ai-features +
> cashback, public onboarding. The content screens (guides/catalogs/legal) are
> editorial and stay static intentionally.

## 6. E2E (browser matrix)

```bash
pnpm --filter @galaxy/web build
pnpm --filter @galaxy/web exec playwright install chromium firefox
# ⚠️ Do NOT run the monolithic `playwright test` — it hangs silently on this box.
# Batch by spec (each reuses the running server):
for spec in a11y-responsive ai-chat auth authenticated booking customer-flows language marketplace security skin-analysis theme; do
  pnpm --filter @galaxy/web exec playwright test e2e/$spec.spec.ts --timeout=60000 --reporter=line
done
```

Expected: **64 tests per project × 3 projects (chromium, firefox, mobile-chrome) = 192/192**.
The language spec is viewport-aware (desktop-nav assertion skips below 768px).

## 7. Database Checks

```bash
pnpm --filter @galaxy/db exec prisma studio     # browse ~220 tables
pnpm --filter @galaxy/db exec prisma migrate status
```

- [ ] `pnpm db:seed` runs twice in a row with **zero warnings** (idempotency)
- [ ] `referrals.referralCode` is indexed but NOT unique (the second-redemption 500 is fixed)
- [ ] `service_bundles` / `bundle_services` tables are gone (archived dead routers)
- [ ] `_prisma_migrations` includes `20260819000000_archive_service_bundles` and
      `20260819010000_referral_code_non_unique`
- [ ] All {ar,en} Json columns pass their CHECK constraints (DB-enforced bilingual shape)

## 8. Storybook

```bash
pnpm --filter @galaxy/ui storybook     # http://localhost:6006
```

- [ ] Browse Button, Card, Input, Skeleton variants, Feedback, Layout, InlineEdit stories

## 9. Expected Warnings & Intentional Items (not regressions)

**Warnings that are fine:**

- Web ESLint: ~7 warnings (`no-console` in a few files) — 0 errors; ESLint runs during `next build` now
- Mobile ESLint: 0 warnings; tsc on TypeScript 6.0 (the `ignoreDeprecations: "6.0"` flag is set for `baseUrl`)
- `[Redis] Connection error` logs when Redis isn't running — graceful degradation by design
- 12 `pnpm audit` advisories — all dev-tooling / transitive, non-runtime (documented in SECURITY.md)

**Intentional:**

- Arabic **content data** (tips/guides/catalogs) stays Arabic — only UI chrome is bilingual
- The seeded doctor character **د. ليلى القحطاني** (kept by design)
- `monitoring.health` / `quickStatus` show some empty status strings — cosmetic, display-level
- Deploy workflow is **manual-only** until this verification pass is approved

## 10. The "Visionary" Checklist — this week's fixes and how they should behave

Each row is a bug that was live in production code until this week. When you test,
this is what CORRECT looks like:

| #   | Area                | Broken behavior (before)                                     | Correct behavior (now)                                    |
| --- | ------------------- | ------------------------------------------------------------ | --------------------------------------------------------- |
| 1   | Discover page       | Crash: Prisma error on every call (`Service.emoji` select)   | `/discover` renders all 4 sections                        |
| 2   | Referrals           | Every fresh code → "Invalid referral code" (circular lookup) | Fresh codes redeem successfully (§4.6)                    |
| 3   | Referrals (2nd)     | Second redemption of a code → raw 500 (unique constraint)    | Multiple users share one referrer's code                  |
| 4   | Payouts             | Recalculating a period → duplicate payout rows               | Re-calc replaces PENDING rows for the period              |
| 5   | Technician earnings | Always zero (profile id vs user id)                          | Real numbers for completed payouts                        |
| 6   | Waitlist web join   | Dropdown empty names; join/leave failed                      | Names render; join/leave/position flow works              |
| 7   | Waitlist notify     | Notification link → 404 (profile id)                         | Link opens the technician's real profile                  |
| 8   | Waitlist rejoin     | Raw P2002 error                                              | Clean «already on the waitlist» message                   |
| 9   | AI quota            | 0-limit plan permanently exhausted; cross-feature dilution   | 0 = unlimited; per-feature counting; feature-gate message |
| 10  | Calendar sync       | Raw network errors leaked                                    | Google failures surface as clean TRPC errors              |
| 11  | 2FA setup           | Secrets base64 — authenticator apps rejected                 | base32 — Google Authenticator works                       |
| 12  | Search              | Arabic ILIKE silently dead (unquoted identifiers)            | Arabic search genuinely boosts                            |
| 13  | Seed                | Warnings + non-idempotent                                    | Two clean runs in a row                                   |
| 14  | Expo export         | hermesc crash (RN 0.81 vs SDK 57)                            | 6.1 MB Hermes bundle builds                               |
| 15  | Expo dev server     | Windows undici crash                                         | `expo start` reaches "Waiting on http://localhost:8081"   |
| 16  | Mobile i18n         | All screens hardcoded Arabic                                 | Every screen on the 5,891-key catalog                     |

## 11. Troubleshooting Quick Hits

| Symptom                                     | Fix                                                                                        |
| ------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `DATABASE_URL not found` in prisma commands | export `DATABASE_URL`, or use `pnpm --filter @galaxy/db exec prisma ...`                   |
| Tests fail with missing tables              | `pnpm db:migrate:deploy && pnpm db:seed`                                                   |
| `next start` says no build                  | `pnpm --filter @galaxy/web build` first                                                    |
| E2E hangs silently on the monolithic run    | use the per-spec loop from §6                                                              |
| E2E boots but auth tests fail               | don't weaken the JWT secrets in playwright.config.ts — the env validator rejects weak ones |
| Playwright browsers missing                 | `pnpm --filter @galaxy/web exec playwright install chromium firefox`                       |
| Expo dev server port conflict               | `npx expo start --port 8099`                                                               |
| Push to master rejected                     | branch protection — create a branch + PR (see below)                                       |
| Storybook errors                            | run from `packages/ui` (`pnpm --filter @galaxy/ui storybook`)                              |

### 11.8 Branch protection workflow (new)

```bash
git checkout -b my-change
git commit -m "..." && git push -u origin my-change
gh pr create --fill
# merge when all 7 checks are green (Format, Audit, Type Check, Lint, Unit Tests, Build, E2E)
```
