# Phase 3 · Sprint 4 Brief — Dashboard Shell

> Prepared 2026-09-11 from live code (UI_DESIGN_SYSTEM_PLAN §3, Phase 3 item 4).
> Figma writable seat: still pending — implement from this brief; backfill the
> baseline capture when the seat lands (same method as sprints 1–3).

## Sprint goal (from the plan)

**Dashboard shell — nav density, empty states, skeleton consistency.**

## Current state (verified in code, 2026-09-11)

**Nav density** — `components/layout/DashboardLayout.tsx` (227 lines):

- Customer sidebar renders **70 flat links** (lines 18–87) with no grouping —
  the "feature wall" the design plan calls out. Most `icon` fields are empty
  strings (invisible glyphs).
- Admin (18) and technician (10) links are manageable — this sprint focuses
  on the customer list.
- Mobile bottom nav = `links.slice(0, 5)` — untouched this sprint.
- Active-state highlighting is `pathname.startsWith(link.href)` — keep.

**Empty states** — 157 customer route dirs; `EmptyState` (exists in
`@galaxy/ui`) is imported in only **40**; the rest use ad-hoc "لا يوجد" text
blocks or nothing at all.

**Skeletons** — `DashboardSkeleton` (+ `CardSkeleton`/`CardListSkeleton`/
`StatCard`) exists in `@galaxy/ui` but is used by only **9** customer pages;
others fall back to spinners, static text, or blank frames.

## Sprint scope

### 1. Grouped customer navigation (nav density)

- Group the 70 customer links into collapsible sections rendered as native
  `<button>` group headers (aria-expanded, keyboard accessible) with the
  links indented beneath:
  - **الأساسيات / Core** — dashboard, bookings, bookings/create, wallet,
    profile, addresses, notifications, smart-schedule, calendar-sync
  - **الحجز والدفع / Book & pay** — saved-cards, bnpl, cashback,
    group-bookings, service-warranty, promo
  - **الجمال والعافية / Beauty & wellness** — wellness-hub, wellness-tracker,
    skin-analysis, skin-diary, ai-assistant, ai-chat, ai-routine, dna-beauty,
    virtual-try-on, hair-color-sim, style-match, mood-board, beauty-analytics,
    post-care, routine-scheduler, spa-planner, travel-kit, expiry-tracker,
    restock-reminder, night-mode
  - **التسوق / Shopping** — marketplace, cart, subscription-boxes,
    subscriptions, wishlist, service-wishlist, gift-card-market, sale-alerts,
    price-drop-alerts, product-scanner, box-builder
  - **المجتمع والمكافآت / Community & rewards** — referrals, loyalty,
    loyalty-punch-card, challenges, beauty-bingo, birthday-rewards,
    vip-membership, social, video, pen-pal, live-chat, family-account
  - **المزيد / More** — the remaining misc links (womens-services,
    ride-hailing, last-mile, home-service, vendor-portal, tech-onboarding,
    tech-waitlist, certification-quiz, …)
- The group the active route belongs to renders **expanded by default**;
  collapse state persists per user in localStorage; expanded group scrolls
  the active link into view on mount.
- Group config lives in a web-local module
  (`components/layout/nav-groups.ts` — typed `Array<{ key, icon, links }>`),
  reusing the existing `NavLink` entries; layout consumes it.
- i18n: `nav.group.core|bookPay|beauty|shopping|community|more` (ar+en).
- Icon strings are out of scope (icon-system decision — parked).

### 2. Empty-state sweep (top-8 customer pages)

- Audit and standardize the highest-traffic dashboards on `@galaxy/ui`
  `EmptyState` with the existing i18n keys where present (add missing keys
  only when a page has none): `/dashboard`, `/bookings`, `/wallet`,
  `/wishlist`, `/cart`, `/marketplace`, `/notifications`, `/referrals`.
- Rule: any zero-data branch renders `EmptyState` with title + CTA link where
  the page has a natural next action; no raw "لا يوجد" paragraphs.

### 3. Skeleton consistency (same 8 pages)

- Every loading branch on those pages renders `DashboardSkeleton` (list
  pages: `CardListSkeleton`) instead of spinners/blank frames.
- No new skeleton components — reuse the kit.

### 4. Public header IA (user request, 2026-09-11)

The public header (`MainLayout.tsx`) renders **18 flat links** with no
hierarchy, hides entirely below `md` (public pages have no mobile nav), and
omits core destinations (`/services`, `/technicians`, `/beauty-shorts`,
`/skin-analysis`, `/womens-services`, `/gift-cards` — several are footer-only).

- **Primary row (7):** Home · Services · Book now · Discover · Marketplace ·
  Wellness · More ▾
- **More dropdown:** Reels شاهدينا · Technicians · Skin analysis · Gift cards ·
  Venues (Stores / Clinics / Gyms / Trainers / Nail bars / Barberettes) ·
  Bundles · Lookbook · Quiz · Packages · Bridal · Campaigns · Events · Blog
- **Mobile:** hamburger drawer (new) with the same IA — replaces the current
  "nothing below md".
- Dropdown is keyboard/RTL-accessible (button + menu pattern, Escape closes,
  click-outside closes); active state = `pathname.startsWith` as today.
- i18n: reuse existing nav keys; add only the missing labels
  (e.g. `nav.bookNow` exists as `button.bookNow`).

### 5. Tests (TDD — test files before implementation)

- e2e `dashboard-shell.spec.ts`: sidebar shows the 6 group headers; active
  group is expanded with the active link highlighted; clicking a collapsed
  group header expands it (aria-expanded toggles); navigation to `/wallet`
  still works; mobile viewport keeps the 5-item bottom nav.
- e2e `public-header.spec.ts`: 7 primary items render; More opens the
  dropdown with the venues group; `/services` is reachable from the primary
  row; mobile drawer opens and navigates.
- Existing e2e suites (auth/customer-flows) must stay green — the layout
  changes touch every route.

## Out of scope (parked)

1. Nav icon system / replacing empty emoji glyphs.
2. Nav search box.
3. Mobile (RN) shell.
4. Admin/tech nav grouping (already small; do it if trivial).
5. Onboarding tour (§3.6) — still parked from the design day.

## Acceptance

- [ ] Customer sidebar renders 6 collapsible groups; active group auto-expands
- [ ] Group state persists across visits; aria-expanded + keyboard nav work
- [ ] 8 target pages use EmptyState for zero-data branches (no raw text)
- [ ] 8 target pages use DashboardSkeleton/CardListSkeleton while loading
- [ ] Public header shows 7 primary items + More dropdown (missing routes now
      reachable); mobile drawer works; Escape/click-outside/RTL keyboard OK
- [ ] ar+en i18n for group headers; zero console errors; Lighthouse no regression
- [ ] Tests: dashboard-shell + public-header e2e green + existing suites green
