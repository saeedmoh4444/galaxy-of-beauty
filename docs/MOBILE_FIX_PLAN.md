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

✅ **SWEPT (2026-09-06)** — one-pass web gating sweep, 51 files, all queries
gated with `useAuth().isAuthenticated` (pattern of admin/packages):
28 admin files (41 queries), 7 tech files (12 queries), 16 customer/public
files (calendarSync, expiryTracker, vipMembership, bridalConcierge,
getMySubscription, ~9 `bookings.list` callers + co-located protected
queries). Public queries left ungated on customer pages (`getPlans`,
`services.list`). Per-agent tsc + eslint green.

| Finding                                         | Note                                                                                                                              |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| ~~Web gating sweep (admin + tech)~~             | ✅ DONE (2026-09-06): 34-file class swept in one pass (see above).                                                                |
| ~~`calendarSync.status/upcoming/connect` 401s~~ | ✅ DONE (2026-09-06): queries gated (connect/disconnect are mutations).                                                           |
| ~~Customer pages `bookings.list` callers~~      | ✅ DONE (2026-09-06): reviews, invoices, streak-calendar, my-journey, safety, video, reschedule, bookings, service-history gated. |
| ~~`expiryTracker.categories/myItems` 401 loop~~ | ✅ DONE (2026-09-06): gated — the focus-refetch loop is gone.                                                                     |
| ~~`vipMembership.tiers/myTier` 401 loop~~       | ✅ DONE (2026-09-06): gated.                                                                                                      |
| ~~`bridalConcierge.get` 401~~                   | ✅ DONE (2026-09-06): gated in BridalDashboard.                                                                                   |
| ~~`subscriptions.getMySubscription` 403 loop~~  | ✅ DONE (2026-09-06): gated on both customer subscription pages.                                                                  |

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
2. ✅ **Promo codes on booking** — DONE (2026-09-06): validate at confirm
   (shows discount + final total) → create booking → redeem (bookingId).
   Wired on web + mobile booking-create (shared tRPC; `promo.validate.fetch`
   pattern). Backend hardened: `redeemOnBooking` now enforces the same
   expiry / maxUses / min-order guards as `validate` (was trusting the UI)
   and rejects double redemption with a clean error instead of an opaque
   P2002. Test: `promo-booking.test.ts` (7 tests).
3. ✅ **Vendor portal → real persistence** — DONE (2026-09-06):
   - In-memory array replaced: `vendorPortal` router reads/writes the
     existing `Product`/`Vendor` models (no new model needed — schema
     gained `Product.sales` + `Product.emoji`, migration
     `20260906000001`). `addProduct` auto-creates a minimal Vendor row on
     first use; default category = seeded 'general' product category
     (4 more marketplace categories seeded too).
   - Buy flow: new `marketplace.buyCart` — transactional stock check +
     decrement, `sales` increment, vendor `totalSales` credit, cart clear;
     insufficient stock rejects the whole purchase and keeps the cart. The
     web checkout pay button (previously fake `setPlaced(true)`) now calls
     it.
   - Dashboard: real aggregates — totalProducts/totalSales (Σ sales)/
     revenue (Σ price × sales) + REAL rating (avg of product reviews);
     `pendingOrders` dropped (no orders model — UI never used it).
   - Tests: `vendor-portal.test.ts` (8). Wallet/payfort payment processing
     on checkout remains separate (no wallet debit mutation yet).
4. **Technician choice on booking-create** — today it silently takes the
   first technician. Show a list (name/rating/price) in step 2.
5. **Slot awareness** — `createBookingSchema` accepts `slotId`; surface the
   technician's available slots for the chosen date instead of free-form
   times (longer item; time-box separately).
6. **Beauty packages — technician-proposed with admin approval** (user idea,
   2026-09-03; recommended: additive flow, NOT a replacement for admin
   creation):
   - ✅ **DONE (2026-09-06) — core flow**: `BeautyPackage` gained
     `status/createdByUserId/reviewNotes/reviewedBy/reviewedAt` (admin
     packages default APPROVED); new generic `ProviderSubmission` queue
     model (kind/status/payload/reviewNotes — B.7 rides the same queue).
   - `beautyPackages.propose` (technician): own-services rule enforced
     (bundled services must be in the tech's own mappings), creates the
     package in PENDING_REVIEW + a submission row. `myPackages` for the
     tech portal. Public `list` filters `status: APPROVED`.
   - `providerReview.list/decide` (admin): FIFO queue, approve → package
     APPROVED + `submission_approved` notification (B.26 templates),
     reject with notes → REJECTED + `submission_rejected`. Wired into
     `/admin/packages` (review section with notes input) + tech dashboard
     (My Packages: propose form + status list).
   - Tests: `package-approvals.test.ts` (7). NOTE: stacked on B.26 branch
     (needs notifyUser + templates); GitHub re-bases the PR when #74
     merges. GOTCHA: new routers must be re-exported from
     `src/domains/<domain>/index.ts` — routers/index.ts imports domain
     barrels, and a missing re-export silently yields undefined (empty
     record → "No procedure found").
   - Remaining: live-package edits → back to PENDING; booking snapshot of
     packages; mobile My Packages; auto-promote approved packages on home
     (open question).
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
   - ✅ **Fix the stub save** — DONE (2026-09-06): added
     `technicians.updateProfile` (partial updates; bioAr/bioEn merge into
     bioJson per-language) and wired the web form (name + tech fields save
     together). Web hydration also fixed: it read `bioAr`/`bioEn` but the
     model stores `bioJson`. Test: `technician-profile.test.ts` (5 tests).
   - ✅ **Stats row** — DONE (2026-09-06): web profile shows ratingAvg /
     totalReviews / completedBookings + phone (user record). Mobile shows
     the same + city/area/bio/buffer (was reading fields off the wrong
     object — `data.city` on User).
   - ✅ **Custom price editing** — DONE (2026-09-06): backend existed
     (`addService` customPrice + `updateService`); wired web UI — price
     input on add, inline per-service price editor with save.
   - Remaining: lat/lng location editing (later); mobile edit form exists
     now (city/area/bio/buffer/eco) but not service/price management.
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
    - ✅ **LIVE BUG — myPlan is dead** — FIXED (2026-09-06): `orderBy:
{ completedAt: 'desc' }` threw (no such column) and `.catch(() => [])`
      silently returned [] → the personalized plan was ALWAYS empty. Now
      orders by `endAt` desc, returns `completedAt: endAt` (ISO), no silent
      catch. Regression test: `post-care.test.ts` (5 tests). Also fixed in
      the same pass: category mapping fed the ARABIC category name into an
      English-only map (always fell back to skincare) — now matches by
      category `slug` patterns; myPlan returns bilingual
      `serviceNameAr/En` + `categoryAr/En` and web/mobile render by locale
      (EN mode was broken — `.ar`-only reads).
    - **Day-aware personalization**: `TIMEFRAMES` exists but is unused —
      tips should progress by days-since-completion (day 1 vs day 7 tips).
    - **Reminders**: schedule push notifications per tip timeframe
      (notification + reminder infra exist).
    - **Progress checklist**: mark tips done (bingo-mark pattern).
    - ✅ **i18n** — FIXED (2026-09-06): myPlan now returns bilingual names
      and web/mobile render by locale. Remaining consideration: making
      `byCategory` public (guest content).
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
18. **Virtual try-on expansion** (user request, 2026-09-03 — "more things
    women can try on"; today = color pickers for lips/eyes/blush/nails +
    product matching):
    - **P1 — more categories**: hair colors (merge the separate
      hair-color-sim), foundation shade matching (skin-tone → shade →
      product), full look presets (reuse the style-match LOOKS data),
      eyeliner/lash styles; save results to the mood board (B.16) + share.
    - **P2 — realism**: MediaPipe Face Mesh (web) / face-detection (mobile)
      for landmark-warped overlays instead of flat color washes — the big
      quality jump, on-device and free.
    - **P3 — commerce & AI**: "buy the products in this look" (store plan
      handshake), Beauty AI look generation for skin tone/preferences.
19. **Group bookings — sharing + join flow + discount wiring** (user idea,
    2026-09-03 — today: members typed manually by name, no invites, and
    `discountPercent` is stored but never applied):
    - **P1 — sharing & joining**: `wa.me` share links (no API needed) with
      group code + time + discount prefilled; public join links (users or
      guests); size limits + deadline ("need N by date or group cancels");
      social share (X/Instagram/Telegram).
    - **P2 — money & members**: apply `discountPercent` at checkout
      (build with B.2 promo chain — same mechanism); per-member bookings
      within the group (same member concept as B.17 family accounts).
    - **P3 — automation**: WhatsApp Business API invites/reminders via the
      existing `whatsappBot` router — partnership-gated (Meta).
20. **AI chat consolidation** (user finding, 2026-09-03 — `/ai-chat` is a
    true duplicate of Beauty AI):
    - Two web pages, two backends: `/ai-assistant` → `aiAssistant.ask`
      (quota-managed) vs `/ai-chat` → `ai.chat` (separate endpoint WITH
      `conversationId` history support that Beauty AI lacks).
    - **Fix**: one canonical surface (Beauty AI, `/ai-assistant`) with a
      merged backend — add conversation history to `aiAssistant.ask` (or
      add quota checks to `ai.chat` — pick ONE, delete the other's usage);
      `/ai-chat` redirects; `aiChat.*` catalog keys absorbed; nav
      deduplicated; mobile beauty-advisor already single — ensure it hits
      the same merged procedure.
21. **Beauty AI productization — "تدليلك الذكي"** (user vision, 2026-09-03:
    specialized women's-beauty AI on the home, freemium tokens, paid plans
    for more):
    - **Positioning**: the ONE specialized beauty advisor — advice,
      consulting, helping, and everything beauty/women's services. The moat
      vs generic chatbots: domain expertise + a warm Saudi-voice persona.
    - **Home presence**: chat widget on the main home (all users, logged-in
      or guest teaser with login nudge) — growth engine, not a buried page.
    - **Freemium token model**: quota infra ALREADY exists (per-feature
      `monthlyLimit` tied to plans, 2026-08-19 round) + vip-membership +
      subscription products + Payfort/wallet — this is wiring, not new
      billing. "Beauty AI Plus" tier folded into existing plan products.
    - **Fair accounting**: count TOKENS (input+output), not requests — a
      long consultation ≠ a one-liner; usage dashboard with
      "باقي ١٢٤٠ توكن" remaining display + low-balance nudges.
    - **Guardrails**: beauty-domain only (refuse off-domain), medical
      disclaimers, escalation CTAs — every answer ends in the marketplace
      funnel ("احجزي استشارة" / "اشتري المنتج") — the funnel is the real
      revenue, token plans monetize the heavy users.
    - **Phasing**: P1 merged backend (B.20) + home widget + guardrails →
      P2 token accounting + plan tiers + dashboard → P3 funnel CTAs into
      bookings/store.
22. **Community social platform** (user finding, 2026-09-03 — the feed has
    posts/likes/comments but is text-only, one-directional):
    - **P1 — media + engagement**: image/video uploads on posts (image
      pipeline exists); shares/reposts + WhatsApp share (B.19 `wa.me`
      pattern); engagement notifications (notification infra exists).
    - **P2 — social graph**: follow users + public profiles (the following
      router exists for providers — extend to members); hashtags +
      trending; suggested feed (follow-based ranking, not pure recency).
    - **P3 — trust & money**: report/block + admin moderation (same safety
      class as pen-pal B.10 P3 — must land before scale); gamification
      (likes → beauty points, loyalty infra exists); commerce tie-in
      (posts tag looks/products → marketplace links).
23. **Video consultation — complete the call** (user finding, 2026-09-03 —
    the session shell exists, the actual video call is missing):
    - Today: `startSession`/`getByBooking`/`endSession` + socket
      `video_call_started` emit + waiting UI, but the room page has ZERO
      media code (no getUserMedia, no RTCPeerConnection) — the call itself
      doesn't exist.
    - **P1 — the call**: WebRTC signaling over the existing socket
      (offer/answer/ICE), camera/mic permission handling, call UI
      (local/remote video, mute/camera toggles, connection states), status
      lifecycle WAITING → CONNECTED → ENDED/MISSED.
    - **P2 — workflow + instructions**: eligible booking statuses
      (PAID/IN_PROGRESS — matches the video link), call duration limits,
      missed-call + retry; in-app instructions (pre-call checklist —
      lighting, permissions, privacy; how-to steps for the customer).
    - **P3 — later**: recording with consent, screen-share for
      consultations, Beauty AI side-panel during the call.
24. **Smart schedule — ranking + booking wiring** (user finding,
    2026-09-03 — today: real unbooked slots for the next 7 days, but
    "smart" is just proximity):
    - **P1 — real-context ranking**: provider rating, price, distance from
      the customer's saved address (lat/lng exists both sides), past
      bookings with the provider, buffer-minutes compliance, preferred
      times from routine data.
    - **P2 — explainability + one-tap booking**: show WHY a slot is
      recommended ("تقييم ٤٫٩ · الأقرب لكِ · موعدكِ المعتاد"); render the
      provider NAME (today shows `مقدمة خدمة #{id}` — the ID); wire Book →
      real booking with `slotId` (builds on B.5); real date picker (the
      bookings/create picker exists).
    - **P3 — learning**: weigh favorites (favorites router), mood-board
      look → matching provider, past no-shows/cancellations, seasonal
      patterns from booking history.
25. **Beauty identity profile — "أنتِ" hub** (user finding, 2026-09-03 —
    /profile is name/phone + addresses only; beauty data is scattered
    across beauty-profile, closet, diary, habits, preferences):
    - **P1 — merge into one hub**: /profile absorbs /beauty-profile
      (upsert exists) with sections: account + addresses (existing),
      beauty identity (skin/hair/concerns), stats row (bookings, favorite
      services, loyalty tier/points); **profile completeness meter**
      ("ملفك مكتمل ٧٠٪") with small rewards per milestone (B.14 tie);
      per-field privacy visibility controls.
    - **P2 — the details**: skin tone/shade (feeds B.18 foundation
      matching), hair porosity, allergies/sensitivities (connect the
      allergen-checker router), preferred fragrance notes, sizes/
      measurements (feeds subscription-boxes + box-builder), birth +
      celebration dates (feeds B.14).
    - **P3 — the payoff**: Beauty AI reads the profile to personalize
      every answer (B.21 synergy), auto-configures try-on, providers see
      relevant preferences at booking.
26. **Notification & reminder framework** (user blueprint, 2026-09-03 —
    the engine behind every "and then notify them" in B.1–B.25):
    - Existing: notifications router + sentVia, SMS (Twilio), push (Expo),
      BullMQ workers, whatsappBot (gated). Missing: the framework layer.
    - ✅ **P1 core — DONE (2026-09-06)**:
      - `NotificationTemplate` model + migration + 6 seeded templates
        (booking_created, booking_request_tech, booking_accepted,
        booking_reminder, booking_followup, loyalty_nudge) — bilingual
        with `{{placeholders}}`, category → preference toggle mapping.
      - `lib/notify.ts`: `renderTemplate` + `notifyUser` (prefs-respecting,
        channel filtering via smsAlerts/emailDigest, in-app row synchronous,
        external channels via gob-notifications queue with skipInApp flag).
      - Worker dispatch wired to REAL senders (sendEmail/sendSms/
        sendPushToUser) — the TODO stubs are gone; job-name dispatcher
        (`notification.send` / `booking.reminder`).
      - Triggers: booking create → customer + technician notifications;
        transition accept → booking_accepted; 48h/24h pre-appointment
        reminder jobs (BullMQ delay, status re-checked at fire time,
        cancelled bookings never get one).
      - Tests: `notify.test.ts` (7) + `booking-reminder.test.ts` (5).
    - **P1 remaining**: preferences UI per-type per-channel (the
      notification-settings pages exist but map only the flat booleans —
      align + extend), registration-started and approval-decided triggers,
      condition-based sweep jobs.
    - **P2 — the blueprints**: customers (booking reminders 24–48h with
      prep instructions, post-service follow-up + rebook, loyalty nudges
      "باقي ٥٠ نقطة على خدمة مجانية!", "we miss you" 2-month re-engagement
      with offers); providers (daily schedule digest, new-booking instant
      alerts, follow-up prompts); vendors/stores ("finish your
      registration" onboarding nudges — store plan Phase 1, inactivity
      nudges).
    - **P3 — campaigns + analytics**: admin segment console (one-off
      marketing sends, offer codes), WhatsApp channel when the partnership
      lands, delivery/open analytics dashboard.

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
