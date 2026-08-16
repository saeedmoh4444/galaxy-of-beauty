# Galaxy of Beauty — Known Issues

> **Date:** 2026-08-08 | **Severity:** Low | **Platform Status:** Verifiably-correct baseline (see [DELIVERY_REPORT.md](../DELIVERY_REPORT.md) — not yet production-hardened)

---

## 1. Expo Dev Server — Windows undici Bug (Medium)

**Symptom:** `expo start` fails with `TypeError: Body is unusable: Body has already been read`
**Root Cause:** Expo SDK 54 CLI reads HTTP response bodies twice, incompatible with Node 20/22 undici
**Affects:** Windows only (`expo start --android`, `expo start --ios`)
**Workaround:** `expo export --platform android` works (2021 modules, 5.72 MB bundle)
**Fix:** Upgrade to Expo SDK 55+ when available
**Status:** Open — affects dev workflow only, production build not impacted

---

## 2. 11 Utility Components Missing Dark Mode (Low)

**Components:** BookAgain, CardGrid, Celebration, EmailCapture, FloatingActionButton, HeroBanner, Icon, PageContainer, RamadanBanner, Stories, WhatsAppShare
**Impact:** Minimal — these are wrappers/utilities that inherit colors from children or use brand colors
**Fix:** Add `dark:` variants to background/text/border classes
**Status:** Deferred — non-blocking

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
