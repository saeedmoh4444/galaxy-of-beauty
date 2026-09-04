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
| `expiryTracker.categories/myItems` 401 loop | expiry-tracker page fires protected queries unauthenticated — same gating class, loops on focus refetch (found via monitor)                                     |
| `vipMembership.tiers/myTier` 401 loop       | vip-membership page fires protected queries unauthenticated — same gating class (found via monitor)                                                             |
| `bridalConcierge.get` 401                   | bridal-concierge page fires a protected query unauthenticated — same gating class (found via monitor)                                                           |

## 2d. i18n catalog duplicate-key conflicts (systemic, found 2026-09-03)

The shared catalog merge (`i18n/index.ts`) spreads web files first, then
mobile — **mobile values silently override web values on every duplicate
key**. Scan results: **49 AR-value conflicts** + **~13 English-in-Arabic
labels**. Findings:

- **English AR values (visible to Arabic users)**: `nav.beauty-bingo`,
  `nav.pen-pal`, `nav.style-match`, `mobile.customerA Clinic Connect`,
  `mobile.public Service Matchmaker`, `marketing Gallery image / nail art`,
  campaign names (Summer 2026 / Eid Elegance / Wedding Season / Ramadan),
  `mobile.admin Feature Flags / Monitoring`.
- **Param-name mismatches (broken interpolation)**: `beautyBingo.completed`
  web passes `{completed}/{total}`, mobile value uses `{done}/{total}` (web
  renders raw placeholders — fixed partially `39f6793e`, param reconcile
  still open); also `beautyCourses.lessons` ({count} vs {lessons}),
  `beautyGoals.progress` ({done}/{total} vs {target}).
- **Benign wording variants** (both Arabic, mobile voice differs) — leave.
- **Architectural fix (recommended)**: per-platform catalogs (common base +
  web/mobile overlays) so each platform resolves its own wording; then
  reconcile the 3 param mismatches and translate the ~13 English labels.
  Decisions needed: which value wins for each of the 49 collisions.

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
9. **Certification system upgrade** (user request, 2026-09-03 — "more
   advanced"; today = 2 hardcoded quizzes, 5 questions, MCQ-only):
   - **Attempt lifecycle + question banks**: quizzes/questions → DB models
     - seed (20–30 questions each), randomized subsets per attempt, attempts
       limit, best-score tracking, retake policy; admin quiz-management page.
   - **Learning value**: per-question explanations on results (education,
     not just testing).
   - **Verifiable certificates**: public shareable certificate page with
     unique number + QR verification; expiry/renewal (annual
     re-certification).
   - **Provider integration (headline)**: earned certifications show as
     verified badges on the service-provider public profile + in the admin
     KYC review screen (real credentials during approval). Ties into B.6/B.7
     trust layer and the store plan's Phase 4.
   - **Later**: question types (true/false, ordering, image-based, case
     scenarios); gamification (streaks/leaderboards — loyalty infra exists).
   - Sequencing: 1 → 3 → 4 (foundation → explanations → verifiable certs →
     provider badges).
10. **Pen-pal completion** (user finding, 2026-09-03 — English labels + the
    feature is a shell):
    - **i18n**: `penPal.interests` returns `nameAr` only (no EN labels —
      API data shape needs bilingual); `nav.pen-pal` AR value is English
      (in §2d list).
    - **P1 — correctness**: real display names (matches show hardcoded
      `مستخدمة #{id}`), Jaccard similarity instead of raw overlap count,
      activity + language filters.
    - **P2 — the actual pen-pal part**: connect lifecycle
      (request → accept/decline) + 1:1 messaging reusing the `liveChat`
      infra.
    - **P3 — safety**: report/block + admin moderation queue (social
      matching needs this before launch).
11. **Style-match completion** (user finding, 2026-09-03 — English labels +
    logic gaps):
    - **i18n**: `nav.style-match` AR value is English (in §2d list); the
      `LOOKS` content has mixed single-language fields (`titleAr/titleEn`
      exist, but `category` is English-only and `style` Arabic-only — page
      renders non-localized values; verify each rendered field).
    - **Logic**: `LOOKS` is a hardcoded static array (no DB, no admin CRUD);
      `imageUrl: null` on every look (no images — the platform has an image
      pipeline already); matching is naive color-based.
    - **Improvements**: move looks to DB + admin management; real look
      images; photo-based matching (color extraction from the customer's
      uploaded photo — virtual-try-on/hair-color infra exists); user
      ratings/favorites on looks; link tutorials properly.
12. **Product-scanner camera scanning** (user request, 2026-09-03 — today =
    manual barcode typing against 8 hardcoded products):
    - **Camera barcode scanning (core)**:
      - Mobile: `expo-camera` barcode scanning (`onBarcodeScanned`) — the
        dependency is already installed, near-free.
      - Web: native `BarcodeDetector` API (Chrome/Safari) + `getUserMedia`;
        zxing-js fallback for Firefox.
    - **Data layer**: products → DB (`Product`/`ProductIngredient` models +
      seed from the curated set, admin CRUD) — same hardcoded-content class
      as B.9/B.11; real catalog growth needs a data source (open beauty
      ingredient DB or partnership — TBD).
    - **Visual product recognition (later)**: photo → product match needs
      an ML service (Google Vision product search class) — partnership-gated
      like ride-hailing; keep the API seam ready.
    - **Store tie-in**: scanned product → "buy from our stores" handshake
      (STORE_MARKETPLANE_PLAN Phase 2 — same pattern as restock-reminder).
13. **Home-service fulfillment** (user finding, 2026-09-03 — the request is
    a dead end today):
    - Today: `estimate` is solid (shared fee constants), but `request`
      creates a PENDING row and returns hardcoded `estimatedArrival` +
      `confirmationSms: true` with NO actual SMS and NO provider matching —
      nobody ever fulfills it.
    - **P1 — matching + lifecycle**: match nearby available providers via
      technician `latitude/longitude` (geofence infra exists —
      `geofenceOffers`); status lifecycle PENDING → ASSIGNED → EN_ROUTE →
      ARRIVED → IN_PROGRESS → COMPLETED/CANCELLED; provider accept/decline;
      real ETA; SMS/notifications wiring (sms module + notification infra
      exist).
    - **P2 — pricing & payments**: distance-based travel fee (not city-only),
      service-dependent service fee, payment link (wallet/Payfort exist),
      customer tracking view (map tracking later — ride-hailing class).
14. **"Pamper Yourself" rewards hub** (user idea, 2026-09-03 — reframe
    birthday-rewards as a self-reward hub "تدليل نفسك"):
    - Today: one `birthdayReward` row per user-year, one claim → `BDAY…`
      promo code. One occasion, once a year, one reward type.
    - **Occasion model** `RewardOccasion`: date-based personal (birthday
      [DOB-verified, exists], graduation, promotion, anniversary, new job —
      user-declared, admin-set limits 1/occasion/year) + platform seasonal
      (Eid, Ramadan, National Day — ride on the campaigns infra).
    - **Reward types beyond promo codes**: category discounts, free add-ons
      (e.g., free mask with a facial), gift-box integration (box-builder
      exists).
    - **Naming** (labels-only): birthday-rewards → "تدليل نفسك" / "Pamper
      Yourself"; birthday becomes one tab inside the hub.
    - **Guardrail**: per-user/per-year claim limits + admin visibility to
      stop farming self-declared occasions.
    - Phasing: P1 rename + occasion model + limits → P2 seasonal occasions
      - gift/experience rewards.
15. **Post-care logic** (user finding, 2026-09-03):
    - **LIVE BUG — myPlan is dead**: `orderBy: { completedAt: 'desc' }` on
      a field that does NOT exist on Booking (schema has startAt/endAt/
      cancelledAt only) → Prisma throws → `.catch(() => [])` silently
      returns [] → the personalized plan is ALWAYS empty. Same class as the
      search ILIKE silent-fallback bug. Fix: order by a real field
      (startAt/endAt) — completion time ≈ endAt.
    - **Day-aware personalization**: `TIMEFRAMES` exists but is unused —
      tips should progress by days-since-completion (day 1 vs day 7 tips).
    - **Reminders**: schedule push notifications per tip timeframe
      (notification + reminder infra exist).
    - **Progress checklist**: mark tips done (bingo-mark pattern).
    - **i18n**: `myPlan` reads `.ar` only for service/category names — EN
      mode broken; consider making `byCategory` public (guest content).
16. **Mood-board logic** (user finding, 2026-09-03 — has drag-drop reorder
    with persistence already):
    - **P1 — board lifecycle**: edit/rename/delete boards, choose the cover
      (today coverUrl = last added pin only), edit pins after creation
      (addPin only — no editPin), tag filtering (tags stored but unused).
    - **P2 — sharing & collaboration**: public share link + export
      (image/PDF) to show the service provider during consultation;
      collaborative boards (bride + planner).
    - **P3 — commerce & AI links**: "book this look" (pins carry serviceId
      — no booking flow), "buy the products in this look" (store plan
      handshake), Beauty AI board generation (generate from preferences).
17. **Family-account booking flow** (user finding, 2026-09-03 — "after
    adding a member, how to book a service?" — correct, the flow is
    missing):
    - Today: family members are standalone CRUD (list/add/update/remove);
      `createBookingSchema` has NO member concept — bookings are always for
      the account owner.
    - **Fix**: `familyMemberId` (optional, ownership-validated) on booking
      create; booking-create UI gets a "booking for" step (me / family
      member); booking details + history show which member it was for;
      member preferences/notes prefill the booking form.
    - **Later**: member self-booking via linked accounts (teens) — needs
      age/consent rules; member-specific reminders.

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
