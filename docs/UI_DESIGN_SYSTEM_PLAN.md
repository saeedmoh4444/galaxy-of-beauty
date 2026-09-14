# UI/UX Design System Plan

> Status: **v2 — 2026-09-09 (afternoon)**. Phase 1 DELIVERED
> (branch design/phase1-rose-blush): Rose Blush token palette (rose
> primary #c2255c, champagne gold accent #d98e4a, warm cream surfaces,
> deep plum darks), gray→semantic sweep (1,025 replacements), purple→brand
> sweep (1,068), RTL logical-properties sweep (zero physical-direction
> leftovers), Arabic typography pass (1.7 leading, zero letter-spacing,
> Tajawal verified loading). K-beauty motion kit + hero rollout DELIVERED
> (branch design/hero-motion): Reveal/FloatingBlob/Sparkles/Marquee/
> HeroSection in @galaxy/ui; heroes live on Home, Discover, Services,
> Wellness hub, clinics, gyms, nail-bars, stores, trainers, technicians,
> events. §3.6 onboarding queued next.

## 1. Baseline — what already exists

- **Tailwind CSS is already the styling system** — every web screen ships
  Tailwind utility classes; adopting it is a non-decision, systematizing it
  is the work.
- **@galaxy/ui** — shared primitives (Card, Button, Input, Modal, StatCard,
  skeletons, toasts) with variants (primary/outline/ghost, sizes, padding).
- **Design tokens** — `packages/shared/src/theme.ts` (colors, typography,
  spacing, radius, shadows, breakpoints) + dark mode + full ar/RTL and
  en/LTR bilingual support (5,891-key i18n catalog).
- **Real media now exists** — E7 media layer (shorts, before/after, product
  shots) replaces the emoji-placeholder era.
- **Figma MCP is connected** — current seat is **VIEW-only** (Phases 2–4
  need a writable seat; confirm before starting them).

## 2. The gaps (observed in the code, not guessed)

1. **Token discipline is inconsistent** — some screens use semantic tokens
   (`text-text-primary`), others hardcode (`text-gray-900 dark:text-gray-100`).
   Same colors, two vocabularies.
2. **Emoji-as-visuals everywhere** (💄 ✨ 🏠 as image placeholders) —
   functional, reads prototype. E7 gives us real images to upgrade with.
3. **Wellness hub is a wall of cards** — 6+ sections stacked (stage, pamper,
   postpartum, menopause, breathing, nutrition) since the E-phase sprint.
   Needs information architecture, not just styling.
4. **RTL polish** — Arabic typography quality, logical properties
   (`ms-`/`me-` instead of `ml-`/`mr-`), line heights. The #1 visual
   differentiator for this audience; only partially done.
5. **No visual spec for @galaxy/ui** — the components have code but no
   design source of truth.

## 3. The plan (4 phases)

### Phase 1 — Design-token unification (foundation, no Figma needed)

- One source of truth: `theme.ts` → Tailwind config → (later) Figma
  variables.
- Replace hardcoded `text-gray-*`/`dark:` pairs with semantic tokens
  (`text-text-primary`, `bg-surface-muted`, …) across web screens.
- Add RTL-aware logical utilities (`ms-`/`me-`/`ps-`/`pe-`) sweep.
- Arabic typography pass: font stack, line-height, letter-spacing.
- Acceptance: grep finds zero `text-gray-900 dark:` hardcodes; web + mobile
  typecheck/lint green; visual spot-check of 5 key screens.

### Phase 2 — Component library in Figma (needs writable seat)

- Rebuild the 15–20 real components as Figma components with variants,
  bound to the Phase-1 tokens (figma-generate-library):
  Card (md/lg/none + hover), Button (primary/outline/ghost × sm/md/lg +
  loading), Input (+ label/error), badges (trust/status/verified), chips,
  stat tiles, skeleton loaders, empty states, modals.
- Publish as a design-system library project in Figma.
- Acceptance: every @galaxy/ui component has a Figma counterpart + variant
  parity.

### Phase 3 — Screen-level redesign sprints (highest impact first)

1. **Home/Discover** — the storefront: real media (E7), trust badges front
   and center, stage-aware greeting (E6a).
2. **Service detail + booking flow** — the conversion path: trust badges,
   before/after gallery (E6e), clear pay-at-venue vs online.
3. **Wellness hub** — restructure: stage-aware tabs (cycle / pamper /
   postpartum / menopause / mind) instead of the card wall.
4. **Dashboard shell** — nav density, empty states, skeleton consistency.

- Method per sprint: capture the live screen into Figma (baseline) →
  redesign → screenshot diff → implement → re-capture (closes the loop).
- Acceptance: before/after capture per screen + a11y (contrast, touch
  targets, RTL) check.

### Phase 4 — Ongoing sync (Code Connect)

- Map Figma components to code via Code Connect (`.figma.ts` files) so
  changes flow both ways.
- Design-review ritual per feature PR: Figma spec → implementation →
  captured comparison.

## 3.5 Real pictures & images (user request, 2026-09-09)

Kill the emoji-placeholder pattern platform-wide. Sources of truth:

- **`packages/shared/src/images`** already maps services/categories/heroes to
  image URLs — upgrade the catalog to real photography (licensed/curated
  set) instead of placeholder mappings.
- **Provider media (E7)**: technicians upload real before/after + reels;
  venues (clinics/gyms/nail bars) upload logos/banners via the KYC upload
  pipeline; stores upload product shots (E7 addProduct imageUrl already
  wired — roll out to ALL products, and render `Product.imageUrl` on
  marketplace cards).
- **Empty states & heroes**: replace emoji-only empties with illustrated
  or photographic hero treatments (web + mobile).

Rules: Next/Image optimization (lazy, sizes, blur placeholders), RTL-safe
crops, women-only privacy watermarking (E7), alt-text in both languages.

Acceptance: grep finds no remaining emoji-as-hero placeholders in the
customer-facing flows (dashboard, discover, search, venues, stores);
marketplace + venue cards render real images with graceful fallback.

## 3.6 Onboarding & product walkthrough (user request, 2026-09-09)

New users land on a 285-route feature wall — activation and trust
establishment (women-only, privacy) need a guided first run.

- **Customer first-run tour** (web-first): after first login on
  `/dashboard`, 5 stops — book a service → wallet/top-up → AI advisor →
  wellness hub → referrals. Spotlight ring + tooltip card + progress
  dots + skip/"later". Reuses the motion kit (Reveal, Rose Blush tokens).
- **Storage gate**: localStorage per user — shown once; "later" re-offers
  from the help menu.
- **A11y & RTL**: focus trap, aria-live, logical positioning,
  reduced-motion = instant panels.
- **Tooltips layer**: hover helpers on the dashboard (same component).
- **Technician side**: upgrade /tech-onboarding with the same kit
  (follow-up).
- **Mobile**: RN needs its own spotlight engine — phase after web.
- Acceptance: tour completes in <60s, 100% skippable, ar+en, zero
  console errors, dashboard smoke tests green.

## 4. Design direction (what "modern" means HERE)

The platform's moat is trust + women-first. The design must radiate:
**soft, private, premium, RTL-perfect** — warm neutrals, generous
whitespace, clear trust signals, flawless Arabic — not generic
startup-modern. "Modern" is a hygiene bar; "distinctly hers" is the goal.

## 5. Constraints & open items

- **Figma seat**: VIEW-only today — Phases 2–4 require a writable seat
  (confirm/upgrade before starting them).
- **Brand naming**: "Galaxy of Beauty" now covers lifestyle — the naming
  decision (plan doc §5) should land before any hero-branding work.
- **Scope guard**: visual work must not regress the shipped E-features;
  every phase keeps 1009/1009 tests + tsc/lint green (screens are
  smoke-covered by the E2E suite).
- **Mobile parity**: every Phase-3 redesign has a mobile twin
  (React Native screens) — RTL-first in both.
