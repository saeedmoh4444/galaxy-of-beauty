# Galaxy of Beauty — Known Issues

> **Date:** 2026-10-31 | **Severity:** Low | **Platform Status:** Verifiably-correct baseline, ops-hardened (staging/backups/alerting shipped) — launch gated on user credentials (see [AUDIT_2026-10-30.md](AUDIT_2026-10-30.md)).

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

## 3. Seed Warnings (Low) — RESOLVED 2026-08-19

**Symptom:** `Invalid createMany()` warnings for notifications, promo codes, gift cards
**Root Causes (all fixed):**

1. Notification seed wrote `title`/`body` — schema fields are `titleJson`/`bodyJson` (+ `sentVia`)
2. Promo codes & gift cards were never deleted in the seed's cleanup transaction → unique-violation on `code` on re-seed (the real source of the recurring warnings)
3. ar-only Json literals violating the P3-02 i18n CHECK constraints: giftQuizRecommendation.descJson ×4, compareProduct.nameJson ×4
   **Verified:** seed runs clean twice in a row (idempotent, zero warnings).

---

## 4. Test Coverage Gap (Medium)

**Current (2026-10-31):** ~1,905 test cases across the api/web/shared/ui/db suites; the api coverage ratchet is NOW ENFORCED IN CI (#581) — floors 63/55/53/65 vs measured 64.35 stmts / 56.45 branches / 54.25 functions / 66.01 lines (2026-10-31 run).
**Gap:** 705 of 1,204 procedures are still never named in any test (audit T2) — the F2 slice started closing this for slots/notifications; the long tail (fabricated-analytics era verticals) remains.
**Plan:** Raise the floors from each clean CI run's printed numbers; keep F-wave slices (F2/F3) feeding the ratchet.

---

## 5. Reduced Motion Support (Low) — RESOLVED 2026-08-19

**Fix:** The FE-005 global gate in `apps/web/src/app/globals.css` (a
`@media (prefers-reduced-motion: reduce)` override clamping all
animations/transitions to 0.01ms) already covers every component —
the original "2/547 components" audit predated it (landed in Phase 10).
**Verified 2026-08-19:** two e2e assertions in a11y-responsive.spec.ts —
the 0.18s page transition animates by default and is clamped to ≤0.001s
under `emulateMedia({ reducedMotion: 'reduce' })`. 11/11 a11y specs pass.

---

## 6. ESLint Build Warnings (Low) — RESOLVED 2026-08-19

**Symptom:** `react/no-unescaped-entities` during production build
**Root Cause:** historical unescaped quotes in JSX text content (fixed in earlier cleanups)
**Resolution:** web lint is now 0 errors / 7 warnings — removed the
`eslint: { ignoreDuringBuilds: true }` workaround; `next build` passes
with the ESLint gate restored.

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

---

## 9. Current Known Issues (2026-10-09 refresh)

### 9.1 iOS physical device blocked (Medium) — USER-GATED

**Symptom:** Expo Go on an iPhone red-screens ("native module doesn't exist") — the app uses webrtc + async-storage native modules that Expo Go cannot provide.
**Path:** the Android dev-client APK (EAS) is the only working phone path today. An Apple Developer account (~$99/yr) unblocks an iOS dev client + App Store submission.

### 9.2 FE-007 bundle gap (Medium) — IN PROGRESS

**Symptom:** routes ship 221/213/298/226 KB gzipped first-load per class vs 100–150 KB targets.
**State:** catalog split (#368) reclaimed ~91 KB/route; `sideEffects: false` on shared+ui (#395) unlocked tree-shaking; numbers measured 2026-10-04 and pinned in size-baseline.json with a CI gate (FE-007). The gap is now the shared tRPC/API chunk set — per-platform catalog splits are the long-term lever.

### 9.3 Staging environment (Medium — RESOLVED 2026-10-28)

**Resolution (#563):** a staging environment with TLS + monitoring was provisioned in the reels launch-gate. Residual: prod-clone drift risk stays until the first real deploy — keep the snapshot/restore script from the P2-02 drill.

### 9.4 Role-less store owners (Low, by design)

**Symptom:** `UserRole` has no VENDOR role — store/clinic/gym owners are CUSTOMER-role users with a Vendor row; access is ownership-checked (`vendorPortal.*` resolve the vendor from the user id).
**Assessment:** works correctly today (see `docs/architecture/store-provider-system.md`); adding a role would require migrating every ownership check — decide deliberately before doing it.

### 9.5 Single points of failure (Low, pre-production)

One PostgreSQL, one Redis, no failover — acceptable for dev/staging. Scheduled backups shipped (#561 backup cron, 2026-10-28); a real restore drill ran 2026-08-17 (P2-02). Failover remains mandatory to fix before launch (roadmap B1).
