# Mobile Platform Fix Plan

> Status: **v1 — 2026-08-28**. Written after the user's visual testing round
> (web + phone). Covers the mobile quality gap, the shared web/mobile bug
> classes found, and the ride-hailing integration question.

## 1. Executive summary

The user's testing round surfaced two distinct problems:

1. **Concrete bugs** (fixed in the same round — see §2).
2. **A quality gap on mobile** — screens feel incomplete next to web. Root
   causes: protected queries firing for guests (401 storms), missing flow
   logic (booking date/time, vendor portal), and content that was never
   given a design pass.

The plan below fixes the gap in four phases, each with a measurable
acceptance criterion. Phase A (auth gating sweep) removes the largest class
of mobile defects immediately.

## 2. Already fixed this round (2026-08-28)

| Fix                                                               | Files                                                                                                  | Platform     |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ------------ |
| Decimal → Client Component errors (`services.list` RSC boundary)  | 7 public pages via `serializeForClient()`                                                              | web          |
| Nested `<a>` hydration error on /services                         | `ServicesClient.tsx` (div + role="link")                                                               | web          |
| `marketplace.cart` 401 bounce for guests                          | query gated on `useAuth`                                                                               | web          |
| Middleware `/tech` prefix gating 6 public routes                  | segment-aware match                                                                                    | web          |
| `gift-card-market` `[object Date]` crash                          | date formatted via `toLocaleDateString`                                                                | web          |
| `services.list` limit 100 > schema max 50 (booking-create broken) | schema cap raised to 100 (= `MAX_LIST_SIZE`)                                                           | web + mobile |
| `beauty-bingo` English heading in Arabic                          | `beautyBingo.title` catalog key                                                                        | web          |
| Mobile tab 401 storms (bookings/wallet/profile)                   | `useAuthState()` + `enabled:` gating                                                                   | mobile       |
| Mobile booking-create `addresses.list` 401                        | gated on `useAuthState`                                                                                | mobile       |
| Mobile dna-beauty analyze 401                                     | guest tap → login redirect                                                                             | mobile       |
| `certification-quiz` `myCertificates` 401 bounce                  | query gated on auth                                                                                    | web          |
| Web bookings/create missing date/time ("books tomorrow")          | date + time pickers (08:00–20:30, 30-min steps), confirm step shows the slot; dead promo field removed | web          |
| Vendor portal revenue always `—`                                  | real `Σ price × sales` formula + rendered                                                              | web          |

## 2b. Already fixed this round (2026-09-03)

| Fix                                                            | Detail                                                                                                       | Platform     |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ------------ |
| Admin users list `.map` crash                                  | `listCustomers` returns `{items}` — page consumed `.items`                                                   | web          |
| Customer dashboard 401 storm (logged-out)                      | 8 protected queries gated on `isAuthenticated` (incl. `RebookReminder`)                                      | web          |
| `beautyPackages.listAll` 401 loop (stale logged-out tab)       | gated on `isAuthenticated`                                                                                   | web          |
| `zatca.listInvoices` 401 (stale logged-out tab)                | gated on `isAuthenticated`                                                                                   | web          |
| `performance.myDashboard` 401 (stale logged-out tab)           | gated on `isAuthenticated`                                                                                   | web          |
| Tech slots: overlap rejection failed silently                  | mutation errors surfaced above the form                                                                      | web          |
| Tech bookings: raw English statuses + missing PAID/CANCELLED   | `booking.status.*` catalog keys + 2 new filter tabs                                                          | web          |
| Terminology: Technician/الفنية → Service Provider/مقدمة الخدمة | catalog values only (12 files) — keys, routes, DB enum deferred                                              | web + mobile |
| Customer bookings: raw English statuses + missing PAID         | shared `bookingStatusLabelKey` helper; tabs + badges localized on bookings, reschedule, video, tech bookings | web          |
| AI assistant naming → "Beauty AI" / "بيوتي AI"                 | unified web "AI Assistant" + mobile "Beauty Advisor" under one name (titles + nav, labels only)              | web + mobile |

## 2c. Pending findings (observed, not yet fixed — user deferred)

| Finding                                     | Note                                                                                                                                                            |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Web gating sweep (admin + tech)             | **34 files** fire protected queries with no `enabled` gate (31 admin / 5 tech) — 401 noise from stale logged-out tabs. One-pass sweep proposed, user undecided. |
| `calendarSync.status/upcoming/connect` 401s | customer calendar-sync page fires protected queries unauthenticated — part of the same sweep class                                                              |
| Customer pages `bookings.list` callers      | ~9 pages (reviews, invoices, streak-calendar, my-journey, safety, …) — same gating class, ties into the PROTECTED_PATHS decision                                |

## 3. Root causes

1. **Auth gating missing (401 class)** — `(tabs)/bookings`, `wallet`,
   `profile` and several customer screens fired protected queries with no
   `enabled` gate. Fixed for the tabs; the sweep below extends it to all
   remaining screens.
2. **Incomplete flow logic** — booking-create booked "tomorrow" with no
   date/time input on BOTH platforms; vendor portal is an in-memory array
   (products vanish on server restart, no orders, no persistence).
3. **No mobile design pass** — web had rounds of skeleton/theme/transition
   work (UI/UX backlog); mobile got functionality wired but no equivalent
   visual QA pass.

## 4. Phase A — Auth-gating sweep (mobile, ~1 session)

✅ **DONE (2026-08-28)** — `useAuthState()` (reactive token subscription in
`lib/authToken.ts` + `hooks/useAuthState.ts`) gates **132 protected queries
across 113 screens** (4 parallel agents, mechanical `enabled: isAuthed`
merge). Three public-content procedures flipped to `publicProcedure` so
guests see real content: `community.feed`, `loyalty.rewards` (null-user
guard added), `techWaitlist.popular`. Verified: scanner re-run shows 0
remaining ungated, mobile tsc + lint clean, API suite 823/823.

- **Remaining sub-item**: guest mutation taps (add-to-cart etc.) still
  surface 401 error states — route them to login (dna-beauty pattern) in a
  follow-up pass.
- **Acceptance check pending**: a full logged-out phone tour must produce
  zero `UNAUTHORIZED` lines in the web dev log.

## 5. Phase B — Complete the missing logic

1. ✅ **Mobile booking-create date/time** — DONE (2026-08-28): 14-day date
   chips + 30-min time grid (08:00–20:30), local `startAt`/`endAt` composed,
   slot shown on confirm; dead promo field removed (matches web).
2. **Promo codes on booking** — the API already has `promo.validate` and
   `promo.redeemOnBooking`. Wire: validate at confirm (show discount) →
   create booking → redeem. Web + mobile together (shared tRPC).
3. **Vendor portal → real persistence**:
   - Prisma model `VendorProduct` (+ migration), router rewired from the
     in-memory array to `prisma.vendorProduct`.
   - Buy flow: vendors' products listed on the marketplace → `buyProduct`
     decrements stock, increments `sales`, credits revenue.
   - Dashboard: revenue from DB aggregates; `pendingOrders` real value or
     removed from the card.
4. **Technician choice on booking-create** — today it silently takes the
   first technician. Show a list (name/rating/price) in step 2.
5. **Slot awareness** — `createBookingSchema` accepts `slotId`; surface the
   technician's available slots for the chosen date instead of free-form
   times (longer item; time-box separately).
6. **Beauty packages — technician-proposed with admin approval** (user idea,
   2026-09-03; recommended: additive flow, NOT a replacement for admin
   creation):
   - Keep admin-created packages (platform-curated promotions) AND add
     technician-proposed ones behind an approval gate — consistent with the
     existing technician KYC review model.
   - Schema: `status` enum `DRAFT → PENDING_REVIEW → APPROVED |
REJECTED(reason)` + `createdByUserId` + `reviewedBy/reviewedAt`. Only
     `APPROVED` packages appear in the public `beautyPackages.list`.
   - **Own-services rule**: a technician may bundle only their own services
     (ownership/commission accounting breaks otherwise).
   - **Live-package edits → back to PENDING**; bookings snapshot the package
     at purchase time so past bookings survive edits (same snapshot concern
     as services).
   - Admin review queue: approve/reject with reason in `/admin/packages`;
     tech gets a notification either way (notification infra exists).
   - Tech UI: "My Packages" section in the tech portal — web + mobile
     (largest chunk of the work).
   - **Sequencing**: build AFTER B.3 (vendor-portal DB persistence) — both
     share the provider-portal shell, admin approval list, and notification
     wiring (one pattern, both domains).
   - Open questions: providers = technicians only, or vendor-portal vendors
     too? Approved packages auto-promoted on home, or manual?
7. **Tech promotions via a shared provider-submission system** (user idea,
   2026-09-03; campaigns themselves stay ADMIN-ONLY — they are
   platform-wide marketing with no service/tech ownership):
   - Providers propose time-limited discounts on their own services —
     modeled on the existing `flashDeals` shape (`serviceId`,
     `originalPrice` → `dealPrice`, `startsAt/endsAt`, `isActive`).
   - One generic **provider submission review queue** in admin
     (approve/reject with reason + notification — the KYC-review pattern)
     consumed by: B.3 vendor products, B.6 packages, B.7 tech promotions.
     Build the queue ONCE, not per feature.
   - Guardrails: own-services-only rule; discount floor to stop predatory
     undercutting (max % off / cost floor — value TBD).
   - Open question: tech promotions in the public "active campaigns" feed,
     or a separate "salon offers" rail? (Recommended: separate — platform
     sales vs salon deals have different trust signals.)
8. **Tech profile page upgrade** (user finding, 2026-09-03 — the page looks
   complete but half of it doesn't work):
   - **Fix the stub save**: `handleProfileSave` only saves the name —
     city/area/bio/bufferMinutes/isEcoFriendly are decorative (no backend
     endpoint). Add `technicians.updateProfile` and wire the form.
   - **Stats row**: ratingAvg / totalReviews / completedBookings (in the
     model, never shown).
   - **Contact + location**: phone from the user record; lat/lng later.
   - **Custom price editing** per service (currently display-only;
     `addService` takes no price).

## 6. Phase C — Mobile visual/UX parity

- **Theme audit**: compare every tab + top-20 customer screens against the
  web design tokens (ThemeProvider palette exists — check contrast/spacing
  per screen).
- **Skeleton parity**: replace generic `SkeletonList` with layout-matched
  skeletons where web has them (Dashboard/CardList/Detail/Form).
- **Guest states**: every gated screen gets a designed empty/login state
  (not an error banner).
- **Pull-to-refresh + empty + error states**: enforce the `ScreenState`
  contract on all 300+ screens via a checklist sweep (batched agents).

## 7. Phase D — QA + gates

- Logged-out phone tour (acceptance criterion from Phase A).
- Logged-in flow: login → book → wallet → loyalty → logout.
- API suite + web/mobile type-check + lint green; commit + PR (branch
  protection).

## 8. Ride-hailing integration — feasibility

The platform already has `ride-hailing` and `last-mile` customer screens
(stubs). Two realistic options:

### Option 1 — Deep-link integration (recommended first step, days not weeks)

No API keys, no contracts. "Book a ride" buttons on ride-hailing/last-mile
screens deep-link to the user's installed ride apps with pickup/dropoff
prefilled:

- Careem: `https://www.careem.com/ride?pickup=…&dropoff=…`
- Uber: `uber://?action=setPickup&pickup[latitude]=…&dropoff[latitude]=…`
- Jeenny / local KSA apps if the business prefers.

Works on day one, keeps the flow inside the ecosystem while the real
integration matures.

### Option 2 — Full API integration (Uber Direct / Careem for Business)

- Requires business partnership contracts (KSA), API keys, webhooks for
  ride status, fare estimation endpoints, and ops support — realistically a
  post-launch/Phase 11 item.
- Recommended path: **ship Option 1 now; start partnership paperwork in
  parallel; replace with Option 2 when contracts land.**

**Decision (2026-08-28):** wait for the full API — skip the deep-link step.
Ride-hailing stays a stub until a business partnership (Careem/Uber)
provides credentials; then implement Option 2 end-to-end.

## 9. Open items / decisions

1. ~~Ride-hailing approach~~ → decided: full API only (see §8).
2. The `~140 customer routes not in PROTECTED_PATHS` design question — per-page
   query gating (current approach) vs middleware-protecting all customer
   routes. Recommendation: keep pages browsable; gate queries (matches the
   marketplace/certification-quiz fixes).
3. ~~Seeded test account login~~ → **FIXED (2026-08-28)**: the seed's hardcoded
   bcrypt hash never matched the documented `Admin@123456` — every seeded
   account was unloggable. Regenerated + verified the hash in `seed.ts` /
   `seed-enrich.ts`, re-seeded the dev DB, confirmed the row in Postgres.
   Test credentials now work: `customer@test.com` / `Admin@123456`.
