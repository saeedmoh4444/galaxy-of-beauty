# Phase 3 · Sprint 3 Brief — Wellness Hub Restructure

> Prepared 2026-09-11 from live code (UI_DESIGN_SYSTEM_PLAN §3, Phase 3 item 3).
> Figma writable seat: still pending — implement from this brief; backfill the
> baseline capture when the seat lands (same method as sprints 1–2).

## Sprint goal (from the plan)

**Wellness hub — restructure: stage-aware tabs (cycle / pamper / postpartum /
menopause / mind) instead of the card wall.**

## Current state (verified in code, 2026-09-11)

`apps/web/src/app/(customer)/wellness-hub/page.tsx` (236 lines) renders ~11
stacked sections with zero structure — the card wall:

1. Hero (`HeroSection`, 🌿 eyebrow)
2. Cycle card (phase emoji/name, day X/Y, next period) — `d.cycle`
3. Stats grid (mood/energy/sleep/water) — `d.todayMood`
4. Skin analysis + weekly summary cards — `d.skin`, `d.weekly`
5. `LifeStageCard` + `PamperCard` (E6a)
6. `PostpartumSection` (E6b — new_mom only)
7. `MenopauseCard` (E6c — enabled only)
8. `MentalWellnessSection` + `JournalPromptCard` + `NutritionSection` (E4b)
9. Journal card — `d.journalCount` / `d.recentJournals`
10. Quick-actions row (4 emoji tiles)

**Infra that already exists (no new backend expected this sprint):**

- `lifeStage.get` — resolved stage + `LIFE_STAGES` definitions with per-stage
  quick links (shared/src/lifeStage.ts:22). `choose` for override.
- `lifeStage.pamperStatus` — window-active + deals/kits/spa (PamperCard).
- `postpartum.library/services/babyFriendlySalons` (gated new_mom),
  `menopause.status/library/history/clinics/logSymptom` (enabled-only),
  `wellnessHub.dashboard` (cycle/todayMood/skin/weekly/journals).
- All section components already exist in
  `components/wellness/LifeStageSection.tsx` + `WellnessContentSections.tsx` —
  the sprint is a **restructure**, not a rebuild.
- Rose Blush tokens + motion kit; no new ui primitives required (a small
  `Tabs` component may be added to `@galaxy/ui` for reuse).

## Sprint scope

### 1. Tab model (pure, in shared)

- `wellnessTabs.ts` in `@galaxy/shared`: tab keys
  `cycle | pamper | postpartum | menopause | mind`, tab→i18n-key mapping, and
  a pure `defaultTabFor({ stage, pamperActive, menopauseEnabled, savedTab })`
  resolver: `new_mom → postpartum`; pamper window active → `pamper`;
  menopause enabled → `menopause`; explicit `?tab=` query param wins; else
  saved (localStorage) → `cycle`.
- Tested from the api suite (api imports `@galaxy/shared`; shared has no
  vitest of its own).

### 2. Tabbed hub UI (web)

- New `Tabs` component in `@galaxy/ui` (role=tablist/tab/tabpanel, arrow-key
  nav, RTL-safe, reduced-motion) — reused later by dashboard shell (item 4).
- Hub restructure:
  - **cycle** — cycle card, stats grid, skin + weekly, `LifeStageCard`
    (stage switcher), quick actions.
  - **pamper** — `PamperCard` + self-care/package quick links.
  - **postpartum** — `PostpartumSection`.
  - **menopause** — `MenopauseCard`.
  - **mind** — `MentalWellnessSection` + `JournalPromptCard` +
    `NutritionSection` + journal card.
  - Quick-actions row stays persistent under the tab panel (it is
    navigation, not content).
- Preselect per §1; remember last-picked tab in localStorage; `?tab=` deep
  link. Tab badges: pamper tab shows a dot/indicator when the window is
  active; postpartum/menopause tabs always reachable (their sections already
  handle disabled/empty states internally).
- i18n: `wellnessHub.tab.cycle/pamper/postpartum/menopause/mind` (ar+en) in
  the existing catalog file.
- Graceful: every panel keeps its existing empty states; zero new data
  requirements.

### 3. Tests (TDD — test files before implementation)

- Unit (api suite): `defaultTabFor` matrix — stage/pamper/menopause/saved/param
  precedence.
- e2e `wellness-hub-tabs.spec.ts`: hub renders 5 tabs with roles; default tab
  active for the seeded customer; clicking a tab switches panel
  (`data-testid` per panel); `?tab=pamper` deep link lands on the pamper tab.
  (Login as seeded customer; watch bcrypt-under-load flake — see
  LOCAL_TESTING_GUIDE.)

## Out of scope (parked)

1. Mobile (RN) hub tabs — after web, per plan pattern.
2. New hub content (new trackers/modules) — restructure only.
3. Dashboard shell (Phase 3 item 4) — next sprint; will reuse `Tabs` where
   it fits.

## Acceptance

- [ ] Hub renders 5 tabs with correct ARIA roles and keyboard nav (RTL-safe)
- [ ] Default tab resolves by stage → pamper window → menopause → saved →
      cycle; `?tab=` deep link works
- [ ] Each panel shows its sections with existing empty states intact
- [ ] Quick actions remain reachable from every tab
- [ ] ar+en i18n, zero console errors, Lighthouse no regression
- [ ] Tests: `defaultTabFor` matrix green + e2e tabs smoke green
