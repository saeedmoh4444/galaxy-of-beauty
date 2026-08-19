# Galaxy of Beauty — Known Issues

> **Date:** 2026-08-08 | **Severity:** Low | **Platform Status:** Verifiably-correct baseline (see [DELIVERY_REPORT.md](../DELIVERY_REPORT.md) — not yet production-hardened)

---

## 1. Expo Dev Server — Windows undici Bug (Medium) — RESOLVED 2026-08-19

**Symptom:** `expo start` fails with `TypeError: Body is unusable: Body has already been read`
**Root Cause:** Expo SDK 54 CLI reads HTTP response bodies twice, incompatible with Node 20/22 undici
**Affects:** Windows only (`expo start --android`, `expo start --ios`)
**Resolution:** SDK 57 upgrade (2026-08-19) — `expo start` now reaches
"Waiting on http://localhost:8099" cleanly; `expo export --platform
android` produces a 6.1MB Hermes bundle.

---

## 2. 11 Utility Components Missing Dark Mode (Low) — RESOLVED 2026-08-17

**Components:** BookAgain, CardGrid, Celebration, EmailCapture, FloatingActionButton, HeroBanner, Icon, PageContainer, RamadanBanner, Stories, WhatsAppShare
**Resolution:** Full audit with `darkMode: 'class'` in effect — CardGrid/Celebration/Icon/PageContainer/Stories contain zero hardcoded light colors; the rest only use white on brand gradients/colored backgrounds (intentional design in both themes). 4 beauty-card hover overlays + FormField disabled select got missing `dark:` counterparts as part of the dark-mode sweep.

---

## 3. Seed Warnings (Low)

**Symptom:** `⚠️ Extra data: Invalid createMany()` for notifications, promo codes, gift cards
**Root Cause:** Field name mismatches between seed script and Prisma schema (e.g., `title` vs `titleJson`)
**Impact:** None — caught in try/catch, seed completes successfully
**Status:** Deferred — cosmetic only

---

## 4. Test Coverage Gap (Medium)

**Current (2026-08-16):** 38 test files, 543 tests (passing), coverage ratchet enforced at 50/61/36/50
**Gap:** The remaining 0%-covered surfaces are `payfort` gateway integration, the socket server, and `workers/index`; untested procedure handlers across ~150 feature routers
**Plan:** Gradual — ratchet upward toward 55% statements (see `packages/api/vitest.config.ts`)
**Status:** In progress — auth 2FA, payments, booking lifecycle, wallet, and token-cleanup suites added since the 08-08 snapshot

---

## 5. Reduced Motion Support (Low)

**Coverage:** Only 2/547 components use `prefers-reduced-motion`
**Impact:** Motion-sensitive users may experience discomfort from animations
**Fix:** Add `motion-safe:` prefixes or CSS media query to globals.css
**Status:** Deferred — non-blocking

---

## 6. ESLint Build Warnings (Low)

**Symptom:** `react/no-unescaped-entities` during production build
**Workaround:** `eslint: { ignoreDuringBuilds: true }` in next.config.js
**Fix:** Escape `"` characters in JSX text content
**Status:** Workaround in place — TypeScript and tests catch real errors

## 7. i18n English Coverage (Low) — RESOLVED 2026-08-19

**Status:** Full translation sweep delivered — the gob_lang switcher now
renders the entire shell, auth funnel, all 149 customer pages, all
public pages, tech/admin tooling, and 517 shared UI components in
English (catalog: ~4,300 keys, per-domain modules under
packages/shared/src/i18n/messages/).

**Mobile (resolved 2026-08-19):** the mobile app is now fully wired to
the same shared catalog — every screen uses `useLocale()`/`t()`
(catalog 5,891 keys; 1,580 used keys machine-verified defined).
Content-data arrays (tips/guides/catalogs) intentionally remain Arabic;
proper nouns and sample data stay Arabic in a handful of pages; SEO
metadata kept bilingual by design.

---

## 8. Expo Export Broken — react-native Version Pin Drift (Medium) — RESOLVED 2026-08-19

**Symptom:** `expo export --platform android` crashed in hermesc
("private properties" error).
**Root Cause:** apps/mobile pinned react-native 0.81.5 / react 19.1.0
while Expo SDK 57 expects react-native 0.86.2 / react 19.2.3 (plus 16
other drifted packages).
**Resolution:** `npx expo install --fix` aligned all 18 packages
(RN 0.86.2, react 19.2.3, TS 6.0.3, expo ~57.0.14, screens 4.26, ...).
TS 6.0 deprecates `baseUrl` — silenced with `"ignoreDeprecations":
"6.0"` in apps/mobile/tsconfig.json (revisit before TS 7).
**Verified:** export produces a 6.1MB Hermes bytecode bundle; mobile
tsc/lint, web, shared, and ui type-checks all green.
