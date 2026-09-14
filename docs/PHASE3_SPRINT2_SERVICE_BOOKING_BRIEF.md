# Phase 3 · Sprint 2 Brief — Service Detail + Booking Flow

> Prepared 2026-09-11 from live code (UI_DESIGN_SYSTEM_PLAN §3, Phase 3 sprint 2).
> Figma writable seat: still pending — implement from this brief; backfill the
> baseline capture when the seat lands (same method as sprint 1).

## Sprint goals (from the plan)

Phase 3 item 2 — **the conversion path**: trust badges on service detail,
before/after gallery (E6e), clear pay-at-venue vs online. Plus the sprint-1
parked item: per-card verified badges (data check now done — see below).

## Current state (verified in code, 2026-09-11)

**Service detail** — `apps/web/src/app/(public)/services/[id]/ServiceDetailClient.tsx`
(229 lines, client; `page.tsx` server wrapper fetches `services.getById` +
`getRelated`):

- **Hero** (line 71–73): gradient box with an **empty emoji** — no imagery at all.
- Tags, title, desc, share/copy-link buttons, price + duration, variants,
  CTA → `/bookings/create?serviceId=`, technician cards (name/city/rating/bio,
  **no verified badges**), related-services cards with **empty emoji tiles**
  (line 214), `EmptyState` when no technicians.

**Booking flow** — `(customer)/bookings/create/page.tsx` (3-step: service →
date/time → address/notes/promo) + `(customer)/bookings/confirm/page.tsx`.
**Neither page mentions payment at all.** The backend already supports the
choice: `payments.authorize` takes `method: z.enum(['online', 'cash'])`
(payments.ts:23 — gateway vs cash-on-arrival) but no UI surfaces it, and
payment only becomes possible after the technician **ACCEPTs** the booking
(authorize guards `status === 'ACCEPTED'`).

**Infra that already exists (no new backend except one select field):**

- `Service` model (schema.prisma:407): `imageUrl`, **E6d trust fields**
  `isWomenOnlyStaff`, `isPrivateSuite` (Tier-2 purchase drivers per the
  schema comment), `isPregnancySafe`, `isMommyFriendly`.
- `KYCStatus` enum: PENDING/SUBMITTED/VERIFIED/REJECTED. Public technician
  lists already filter `kycStatus: 'VERIFIED'` (technicians.ts:27,73,79,101, 128) — the badge is trust reinforcement on public cards, and the raw value
  exists so cards sourced from mixed queries can stay honest.
- `TrustBadges` in `@galaxy/ui` (sprint 1): `items: Array<{ variant, label,
value? }>` with `womenOnly | private | verified | rating | safeSpace`
  variants + `data-testid="trust-badges"`.
- `beautyShorts.gallery` (E6e) — public, by technician **userId**, approved
  before_after shorts (take 12). Public page exists at
  `(public)/gallery/[technicianId]`.
- E7 upload/moderation are **complete** (verified this sprint): tech-side
  form with consent + face-blur toggles (tech/dashboard), admin moderation
  page (admin/shorts → `adminPending`/`adminDecide`), public feed
  (beauty-shorts). No E7 follow-up work remains — the sprint-1 parked item
  is closed out as done.
- `ServiceImage` (real imagery, graceful fallback) + Rose Blush tokens +
  motion kit from Phase 1.

## Sprint scope

### 1. API — expose kycStatus on service technicians (small)

- `services.getById` (services.ts:391–409) technician select lacks
  `kycStatus` — add it. Nothing else needed (`getById` returns all Service
  scalars including the E6d fields + `imageUrl` already).
- TDD: router test asserting the new field is present in the response shape.

### 2. Service detail redesign

- **Hero**: real imagery — `Service.imageUrl` when set, else category-mapped
  `ServiceImage` (same mapping the home categories use). No more empty emoji.
- **Trust layer**: `TrustBadges` row driven by data — `womenOnly`
  (isWomenOnlyStaff), `private` (isPrivateSuite), `verified` (when ≥1
  mapped technician is kycStatus VERIFIED), `rating` (best technician
  ratingAvg + totalReviews count). Stage-aware chips (`isPregnancySafe`,
  `isMommyFriendly`) as a secondary chip row with i18n copy.
- **Per-card verified badges**: `verified` badge on each technician card
  whose `kycStatus === 'VERIFIED'` (badge renders only when true — honest
  on any future mixed source).
- **Before/after gallery (E6e)**: fetch `beautyShorts.gallery` for the
  first 1–2 technicians on the service; render an "قبل وبعد" strip
  (beforeImageUrl + thumbnail, hover-reveal style via existing ReelCard-like
  patterns or a light inline component) + link to the full
  `/gallery/[technicianUserId]` page. Hide section gracefully when empty.
- **Related cards**: real imagery (`imageUrl` → category mapping), same as
  discover tiles from sprint 1.
- Loading skeletons + empty states, RTL-identical, reduced-motion respect.

### 3. Booking flow — pay-at-venue vs online clarity

- New payment-clarity section on `bookings/create` (step indicator or
  summary card): two explicit options with copy — **pay online** (wallet,
  after the technician accepts) vs **pay at venue** (cash on arrival) —
  explaining when each happens. No backend change this sprint: the choice is
  exercised post-ACCEPT via `payments.authorize` (existing); the create-page
  section is copy clarity + i18n, and `confirm` gets the same explainer line
  under the total.
- i18n keys under `booking.payment.*` (ar + en, both `packages/shared`
  catalog and mobile key set follow the existing pattern if touched — web
  only this sprint).

### 4. Tests (TDD — test files before implementation)

- Router test: `kycStatus` in `services.getById` output.
- Component tests: TrustBadges row renders per E6d flags; verified badge
  only when VERIFIED; gallery section hidden when empty.
- E2E smoke: service detail renders (hero image, trust badges, related
  imagery) for a seeded service; booking create shows the payment-clarity
  section. (Watch the known flakes: bcrypt-under-load, reels-click settle,
  duplicate-booking capacity guard — see LOCAL_TESTING_GUIDE.)

## Out of scope (parked)

1. Post-ACCEPT payment UI on `bookings/[id]` (surface `payments.authorize`
   method choice as a real control) — needs design for the online/cash
   handoff; separate follow-up PR.
2. Mobile (RN) mirrors of these screens — after web, per plan pattern.
3. Wellness hub (Phase 3 item 3) and dashboard shell (item 4) — next sprints.

## Acceptance

- [ ] Service detail shows a real hero image (no empty-emoji box), E6d
      trust badges, per-card verified badges, and the E6e before/after strip
      when data exists — all hidden gracefully when absent
- [ ] Related services cards show real imagery
- [ ] Booking create + confirm explain pay-at-venue vs online with ar+en copy
- [ ] `services.getById` returns `kycStatus` on mapped technicians
- [ ] RTL-identical, a11y check (contrast, touch targets), zero console
      errors, Lighthouse no regression
- [ ] Tests: router shape, badge/gallery component tests, e2e smokes for
      service detail + booking create
