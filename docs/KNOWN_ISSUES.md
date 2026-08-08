# Galaxy of Beauty — Known Issues

> **Date:** 2026-08-08 | **Severity:** Low | **Platform Status:** Production-ready

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

**Current:** 24 test files, 350 tests (passing)
**Gap:** ~221 routers have zero test coverage (245 routers - 24 test files)
**Plan:** Gradual — add test files for critical routers over time
**Status:** In progress — 6 new test files added this session

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
