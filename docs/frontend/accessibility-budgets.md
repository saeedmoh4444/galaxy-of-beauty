# Accessibility Budgets — FE-009

**Adopted**: 2026-09-20
**Applies to**: `apps/web` (Next.js)
**Enforced by**: `apps/web/e2e/axe-a11y.spec.ts` (CI E2E job) + `eslint-plugin-jsx-a11y` (web, warn-level)

## Gate policy

The axe-core CI gate scans five representative routes — `/`, `/services`
(public), `/login`, `/dashboard` (customer), `/admin/dashboard` (admin) —
with the WCAG 2.1 A/AA rule set:

| Severity               | Policy                                                                                                                                                                                                          |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Critical / Serious** | **Block.** Must be fixed; never allowlisted. Includes `color-contrast` — contrast debt is real debt.                                                                                                            |
| **Moderate**           | Allowlist-only, per page, with a TODO referencing the owning backlog item. Entries only shrink; a new moderate rule id fails the gate. (Measured 2026-09-20: zero moderate violations — the list starts empty.) |
| **Minor**              | Not asserted.                                                                                                                                                                                                   |

The gate runs chromium-only in CI (opt into firefox locally with
`AXE_ALL_BROWSERS=1`); animation/transition freezing is injected before
each scan to avoid transient-state flakes. Local run: `pnpm test:a11y`.

## The token rules that keep the gate green

These were fixed when the gate landed (2026-09-20) and must not regress:

- Light-mode text tokens meet **≥4.5:1** on `surface` / `surface-muted` /
  `surface-elevated`: `--color-text-secondary` and `--color-text-tertiary`
  are both `#84646f`; hierarchy is carried by size/weight, not lightness.
- Semantic status tokens are 700-weight shades so they pass **as text** on
  their `*-subtle` backgrounds: success `#047857`, warning `#b45309`,
  danger `#b91c1c`.
- Tailwind palette text on `surface-muted` must use 700+/800+ shades
  (e.g. `text-lime-800`, `text-pink-700` — the 600 shades fail).

## Alt-text standard

- Every `next/Image` and raw `<img>` carries a meaningful Arabic-default
  `alt`; decorative images use `alt=""` (empty, never absent).
- User-uploaded blob:/data: images (camera previews) keep `no-img-element`
  eslint exceptions — they cannot go through the optimizer — but still
  carry `alt`.

## Mobile (deferred)

`eslint-plugin-jsx-a11y` is deliberately **not** enabled for React Native:
its DOM-oriented rules false-positive on RN's `accessibilityRole` /
`accessibilityLabel` / `onPress` and miss RN-specific accessibility
entirely. The correct tool is `eslint-plugin-react-native-a11y` — track in
UI_UX_BACKLOG §4.2.
