# Galaxy of Beauty — Prioritised UI/UX Upgrade Backlog

> Produced from direct codebase audit of 11 shared components, 254 Next.js routes, Tailwind config, theme tokens, i18n, and 50+ customer-facing pages.
> **Date:** 2026-08-03
>
> ✅ **Status (2026-08-16): complete — 17/17 items delivered.**
> P0 quick wins, P1 structural (incl. sized skeleton rollout across 179 pages),
> P2 delight (page transitions, inline editing, drag-and-drop reorder persistence),
> and P3 foundation (Storybook 8). See [DELIVERY_REPORT.md](../DELIVERY_REPORT.md) addendum.

---

## 1. Quick Wins (P0 — Immediate Impact, Low Effort)

### 1.1 Touch targets below WCAG minimum everywhere

**Issue:** Pagination buttons are `min-w-[2.25rem]` (36px). The close button in Modal is `p-1.5` (28px). WCAG 2.2 requires 44px minimum.
**Evidence:** `Pagination.tsx:38`, `Modal.tsx:86`
**Affected:** Pagination, Modal close, Toast dismiss button, all inline icon buttons across 254 pages.
**Suggested fix:** Add `min-h-[44px] min-w-[44px]` to all tappable elements. Bump Pagination button padding to `px-4 py-3`.
**Human-feel impact:** No more fat-finger misses on mobile. Instantly feels like a real app, not a desktop website squeezed down.

### 1.2 ErrorAlert default title is English in an Arabic-first product

**Issue:** `ErrorAlert.tsx:17` — `title = 'Something went wrong'` hardcoded in English.
**Evidence:** Every error state across 50+ pages shows English title.
**Affected:** ErrorAlert component.
**Suggested fix:** Change default to `'حدث خطأ ما'`, read from i18n `sharedMessages['state.error']`.
**Human-feel impact:** Users stop seeing a jarring language switch when things go wrong.

### 1.3 Toast emojis read aloud by screen readers

**Issue:** `Toast.tsx:72` — `✅ ❌ ⚠️ ℹ️` rendered as raw text in `<span>`. Screen readers will say "check mark button" for every toast.
**Evidence:** `Toast.tsx:71-72`
**Affected:** Every toast notification.
**Suggested fix:** Wrap emoji in `<span aria-hidden="true">` and add a visually-hidden `<span>` with the semantic label.
**Human-feel impact:** Screen reader users get clean notifications instead of nonsense.

### 1.4 No `prefers-reduced-motion` support

**Issue:** `animate-spin`, `animate-pulse`, `animate-in fade-in`, `zoom-in-95` run unconditionally.
**Evidence:** `Spinner.tsx:23`, `Skeleton.tsx:12`, `Modal.tsx:69,78`, `Toast.tsx:59`
**Affected:** Every skeleton, spinner, modal, toast, and animated transition.
**Suggested fix:** Add to `globals.css`:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Human-feel impact:** Motion-sensitive users can use the app without discomfort. Also makes the app feel professionally built.

### 1.5 Stat cards on dashboard lack visual differentiation

**Issue:** Four stat cards in a row with identical styling — `Card className="text-center"` repeated 4 times. Only the number color changes.
**Evidence:** `dashboard/page.tsx:39-43`
**Affected:** Customer dashboard, admin dashboard, tech dashboard.
**Suggested fix:** Add a subtle top-border accent (`border-t-2 border-t-brand-500`) or a small icon above each stat. Create a `<StatCard icon={...} label={...} value={...} />` component.
**Human-feel impact:** Dashboard stops looking like a generic admin panel and starts feeling like a beauty platform.

### 1.6 No shared page container — every page hardcodes `mx-auto max-w-3xl space-y-6`

**Issue:** Every page repeats the same container classes. Some use `max-w-3xl`, others `max-w-4xl`, `max-w-5xl`, `max-w-6xl` inconsistently.
**Evidence:** `dashboard/page.tsx:27`, plus 80+ other pages.
**Affected:** Every page in the app.
**Suggested fix:** Create a `<PageContainer width="narrow" | "default" | "wide" | "full">` component that standardises max-width, padding, and vertical rhythm.
**Human-feel impact:** Every page instantly feels like part of the same product. No more visual whiplash navigating between sections.

### 1.7 Emoji-only icons used as visual meaning — no fallback

**Issue:** Dashboard quick-action buttons use `✨`, `🎁`, `📌`, `🎲` as the only visual indicator. If emoji rendering fails or the user has a custom font, meaning is lost.
**Evidence:** `dashboard/page.tsx:49-53`, plus 30+ pages.
**Affected:** Every page with emoji-prefixed buttons or headings.
**Suggested fix:** Pair emojis with proper SVG icons from a consistent icon set. Keep emojis as decorative only (wrap in `aria-hidden`).
**Human-feel impact:** Icons render consistently across all devices and OS versions. No more missing-glyph squares.

---

## 2. Structural Improvements (P1 — High Effort, High Reward)

### 2.1 Build a semantic colour token system

**Goal:** Replace every hardcoded colour class (`text-green-600`, `text-red-600`, `bg-purple-50`) with semantic tokens (`text-success`, `text-danger`, `bg-info-subtle`) that map to the brand palette and work in dark mode automatically.
**Scope:** All 254 pages, 11 shared components, and the Tailwind config.
**Implementation steps:**

1. Define semantic tokens in `tailwind.config.ts`: `success`, `warning`, `danger`, `info`, `surface`, `surface-muted`, `text-primary`, `text-secondary`, `text-tertiary`, `border-default`, `border-muted`.
2. Create a one-time codemod script that replaces the 12 most common hardcoded colour patterns across all source files.
3. Update the 11 shared components to use only semantic tokens.
4. Remove raw `text-brand-600`, `text-green-600`, `bg-red-50` etc. from all pages over time.
   **Acceptance criteria:** Grepping for `text-green-`, `text-red-`, `bg-red-`, `bg-green-` returns zero results outside of the semantic token definitions. Dark mode works on every page without additional `dark:` classes.

### 2.2 Replace ad-hoc loading patterns with sized skeleton screens

**Goal:** Every data-fetching view uses a skeleton that matches the exact shape and size of the content it replaces, preventing Cumulative Layout Shift (CLS).
**Scope:** 50+ customer-facing pages that use `<CardSkeleton />` or `<SkeletonList />`.
**Implementation steps:**

1. Audit the 5 most common content layouts (dashboard stats grid, list of cards, detail view, table, KPI row).
2. Create 5 corresponding skeleton templates: `DashboardSkeleton`, `CardListSkeleton`, `DetailSkeleton`, `TableSkeleton`, `KPIRowSkeleton`.
3. Replace generic `<CardSkeleton />` and `<SkeletonList />` with context-appropriate skeletons page by page.
4. Ensure skeletons use the same padding, border-radius, and dimensions as their live counterparts.
   **Acceptance criteria:** Zero CLS warnings in Lighthouse for any page with skeleton loading. No visible jump when data loads.

### 2.3 Implement focus trapping in Modal and focus restoration

**Goal:** When a modal opens, focus moves inside and stays trapped. When it closes, focus returns to the button that opened it.
**Scope:** Modal component used across all admin CRUD operations and customer flows.
**Implementation steps:**

1. Add a `useRef` to store the `document.activeElement` before opening.
2. On open, find the first focusable element inside the modal and focus it.
3. Add a focus trap: on Tab at the last focusable element, wrap to the first. On Shift+Tab at the first, wrap to the last.
4. Add `aria-hidden="true"` to the main app root when modal is open.
5. On close, restore focus to the stored trigger element.
   **Acceptance criteria:** Tab through all modal content without escaping to the background page. Closing the modal returns focus to the trigger. VoiceOver/NVDA stays inside the modal.

---

## 3. Experience Enhancements (P2 — Delight & Polish)

### 3.1 Page-level transition animations

**Feature:** Subtle cross-fade and slide transitions when navigating between pages.
**User benefit:** The app feels cohesive and premium instead of "click → white flash → new page." Reduces cognitive load by maintaining spatial context.
**Technical considerations:** Use Next.js App Router's `template.tsx` with Framer Motion or CSS View Transitions API. Keep duration under 200ms. Add `prefers-reduced-motion` gate. Use a shared `<PageTransition>` wrapper.

### 3.2 Inline editing for profile and settings fields

**Feature:** Click on a name, email, or bio field to edit it inline without opening a modal. Press Enter or click away to save.
**User benefit:** Reduces friction for common micro-tasks. Users fix typos instantly instead of "click edit → wait for modal → type → save → wait for modal to close."
**Technical considerations:** Build an `<InlineEdit>` component with edit/view mode toggle, optimistic update via tRPC mutation, keyboard support (Enter to save, Escape to cancel), and a subtle border animation on focus. Start with the Profile page fields only.

### 3.3 Drag-and-drop for inspiration/mood boards

**Feature:** Drag images to reorder them on the mood board and inspiration board with ghost preview and spring physics.
**User benefit:** The mood board is a core creative feature. Drag-and-drop makes it feel like a real design tool instead of a static grid.
**Technical considerations:** Use `@dnd-kit/core` (already popular in React). Add `transform` animations with CSS transitions on drop. Persist order optimistically via tRPC. Fall back to click-to-move for keyboard users.

### 3.4 Toast enter animation

**Feature:** Toasts currently only animate on exit (`translate-y-2 opacity-0`). They appear instantly.
**User benefit:** Smooth slide-up entrance makes notifications feel polished rather than jarring.
**Technical considerations:** Add `translate-y-4 opacity-0` as the initial state and transition to `translate-y-0 opacity-100` on mount using CSS `@starting-style` or a simple `useEffect` + `requestAnimationFrame`. Keep duration at 200ms.

---

## 4. Design System & Operations (P3 — Foundation for Future Iteration)

### 4.1 Set up Storybook for all shared components

**Initiative:** Add Storybook 8 to the monorepo, targeting `packages/shared`.
**Effort:** Medium (1–2 days). 11 components to document.
**Long-term value:** Every developer can browse components visually without running the full app. Prevents duplicate components. Enables visual regression testing via Chromatic. Stories serve as living documentation for props, variants, and states.

### 4.2 Enforce accessibility linting in CI

**Initiative:** Add `eslint-plugin-jsx-a11y` to both web and mobile ESLint configs with strict rules.
**Effort:** Low (1–2 hours). Add plugin, fix existing violations, add to CI pipeline.
**Long-term value:** Catches missing `alt` text, missing labels, incorrect ARIA roles, and keyboard trap issues before they reach production. The existing code already has good a11y foundations — this prevents regression.

### 4.3 Create an icon library from SVGs (retire emoji-as-icons)

**Initiative:** Build a `<Icon>` component with the 30 most-used icons from a consistent icon set (Lucide or Phosphor).
**Effort:** Medium (1 day). Create `packages/shared/src/ui/Icon.tsx`, import SVG assets, replace emoji-only usage on the 12 most-visited pages.
**Long-term value:** Consistent visual language. Icons render identically on all platforms. Supports `size`, `color`, `aria-label` props. Enables icon-only buttons with proper accessible names.
