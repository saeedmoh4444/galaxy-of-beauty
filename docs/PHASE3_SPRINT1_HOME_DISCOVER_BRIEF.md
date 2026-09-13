# Phase 3 · Sprint 1 Brief — Home / Discover Redesign

> Prepared 2026-09-10 from live code (UI_DESIGN_SYSTEM_PLAN §3, Phase 3 sprint 1).
> Blocked on: Figma writable seat (capture loop). The code work CAN proceed
> seat-free — this brief is concrete enough to implement from, and the
> Figma baseline capture can be backfilled when the seat lands.

## Sprint goals (from the plan)

1. **Real media (E7)** — the storefront should sell with visuals: reels,
   before/after, product shots. Today the home hero has one photo and
   Discover is an emoji grid.
2. **Trust badges front and center** — trust is the moat. Today trust is
   inline spans in the hero only, and the stat row is hardcoded.
3. **Stage-aware greeting (E6a)** — the home page doesn't consume the
   `lifeStage.home` procedure that E6a shipped; the greeting is static.

## Current state (verified in code, 2026-09-10)

**Home** — `apps/web/src/app/(public)/HomeClient.tsx` (369 lines, client;
`page.tsx` server wrapper fetches categories/services):

- **Hero** (lines 68–179): K-beauty flat design — 3 `FloatingBlob`s +
  `Sparkles`, safe-space badge, static `marketing.home.hero-title`,
  book-now/surprise-me CTAs, inline trust row (🌸 women-only, 🔒 private,
  ★ 4.8), blob-framed `ServiceImage` + 2 floating cards, category
  `Marquee`.
- **Categories** (181–204): 3/6-col grid of `ServiceImage` cards.
- **Popular services** (206–240): 3-col cards (image/title/duration/price).
- **Trust stats** (242–260): hardcoded `+500`, `+25`, `+24` (only the
  first is live: `categories.length`).
- **Testimonials** (262–303): 3 hardcoded entries.
- **Discover-more** (305–366): feature tiles.

**Discover** — `apps/web/src/app/(public)/discover/page.tsx` (258 lines):
`HeroSection` + 8 hardcoded `FEATURES` tiles using emoji icons on
gradient chips (no imagery), links to services/technicians/shop-the-look/
lookbook/beauty-fortune/beauty-quiz/bundles/beauty-packages.

**Infra that already exists** (no new backend needed for sprint 1):

- `Short` model (`packages/db/prisma/schema.prisma:1982`) — videoUrl,
  thumbnailUrl, duration, views, category, technicianId + `ShortLike`.
- `lifeStage` router (`packages/api/src/routers/lifeStage.ts`) — `get`,
  `choose`, `home` (stage-aware sections per E6a) + `isPamperWindow`
  (`packages/shared/src/lifeStage.ts:95`).
- `ServiceImage` (real imagery with graceful fallback) + Rose Blush tokens
  - K-beauty motion kit (`Reveal`, `FloatingBlob`, `Sparkles`, `Marquee`).

## Sprint scope

### 1. Stage-aware hero greeting (E6a wiring)

- Public home consumes `lifeStage.home` (guest-safe — defaults to
  `back_to_me`; no auth required for the greeting, authed users get their
  derived/overridden stage).
- Greeting copy per stage (`bride | trying | pregnant | new_mom |
back_to_me`) via new `marketing.home.greeting.<stage>` i18n keys
  (ar+en), with the hero subtitle switching to a stage line.
- **Pamper window**: when `isPamperWindow` is active, render the pamper
  card/banner (cramps-relief offers: active FlashDeals + self-care kits +
  spa services per E6a spec) between hero and categories.
- TDD: unit tests for the stage→copy mapping + pamper-window edges; e2e
  smoke that the greeting renders for a guest (back_to_me fallback).

### 2. Trust layer

- New `@galaxy/ui` `TrustBadges` component: `womenOnly`, `private`,
  `verified`, `rating`, `safeSpace` variants with Rose Blush tokens —
  replaces the inline hero spans and becomes reusable for Phase 3
  sprints 2–4 (service detail, technician cards).
- De-hardcode the stat row: categories (live), services (services.list
  total), technicians (technicians router count), cities (distinct area
  count) — server-side in `page.tsx`, fallback values only while loading.
- Place `TrustBadges` on service/technician cards only where the data
  supports it this sprint (verified status exists? — confirm; otherwise
  defer the per-card badges to sprint 2, hero + stats are sprint 1).

### 3. Real media section (E7 home)

- New "شاهدينا" / "Reels" section on home: persisted `Short` rows (top by
  views, women-only feed) rendered as a horizontal row of `ReelCard`s —
  thumbnail + duration + views, hover-play on web (muted), click → full
  short / beauty-shorts feed.
- Graceful: loading skeletons, empty state when no published shorts
  (hide section), fallback to before/after gallery images when shorts
  are sparse.
- New `@galaxy/ui` `ReelCard` component. Moderation queue + upload flow
  are OUT of sprint 1 scope (E7 follow-up; existing shorts are seeded).

### 4. Discover tile refresh

- Replace emoji/gradient tiles with real imagery (dedicated tile art via
  `ServiceImage` category mapping, same source as the home categories).
- Keep the 8 destinations; add stage-aware ordering (e.g., pregnant →
  mommy-friendly / pregnancy-safe services first) reusing `lifeStage.home`
  quick-links.
- Add hover states (motion kit `Reveal`).

## Method (per UI_DESIGN_SYSTEM_PLAN §3 Phase 3)

With the Figma seat: capture home + discover (baseline) → redesign in
Figma → screenshot diff → implement → re-capture. Without the seat:
implement from this brief; backfill the baseline capture when the seat
lands (flag for the Phase-2 kickoff). Phase 2 (component library) is NOT
a prerequisite — sprint 1 uses existing tokens/components + the two new
ui components above.

## Acceptance

- [ ] Hero greeting switches per lifeStage (5 stages) + pamper-window
      banner appears inside the window only
- [ ] Trust stats are API-derived (no hardcoded counts)
- [ ] Home shows the real-media section fed by `Short` rows with
      graceful loading/empty states
- [ ] Discover tiles use real imagery (no emoji-only tiles) with
      stage-aware ordering
- [ ] RTL-identical, a11y check (contrast, touch targets), zero console
      errors, Lighthouse no regression
- [ ] Tests: greeting/pamper unit tests, home e2e smoke (guest + seeded
      shorts), discover e2e smoke

## Open questions (parked, not blockers)

1. Per-card verified badges need a data check (`isVerified` on Technician?
   `verified` status?) — sprint 2 scope if missing.
2. E7 moderation queue + consent/face-blur defaults — separate E7
   follow-up PR, not sprint 1.
