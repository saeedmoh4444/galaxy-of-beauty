# Technical Debt Register — DOC-009

**Updated**: 2026-08-11
**Review cadence**: Every sprint planning

## Severity Legend

| Level  | Definition                                           | SLA                |
| ------ | ---------------------------------------------------- | ------------------ |
| **P0** | Blocking — revenue/safety/security directly impacted | Fix this sprint    |
| **P1** | High — significant maintenance cost or risk          | Fix within 30 days |
| **P2** | Medium — slows development, manageable               | Fix within 90 days |
| **P3** | Low — cosmetic, nice-to-have                         | Backlog            |

---

## Resolved Items (2026-08-16)

| ID    | Item                                                  | Resolution                                                                                                                                                                                                                                                                                                                                      |
| ----- | ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P0-01 | Next.js 15 migration (8 high vulns, 14.2.35 EOL)      | ✅ Next 15.5.23; `await params` on dynamic pages; web build + 168/168 e2e green                                                                                                                                                                                                                                                                 |
| P0-02 | womensServices.ts router split (3,626 lines)          | ✅ Router split to 153 lines in `f9d78d81` (Aug 12, pre-register); remaining 3,359-line static catalog split into 4 contiguous chunk files (2026-08-17) with order-pinning tests — merge preserves the categories endpoint order exactly                                                                                                        |
| P1-01 | Real ESLint setup across all workspaces               | ✅ 0 errors in all 6 code-bearing packages; web `.eslintrc.json` shadow duplicate removed                                                                                                                                                                                                                                                       |
| P1-02 | Socket.IO parser upgrade (high vuln)                  | ✅ socket.io-parser 4.2.6 → 4.2.7 via pnpm override (GHSA-2m8v-j782-fhvr memory-exhaustion DoS). Was never major-blocked — socket.io@4.8.3 allows ~4.2.4; 24 socket integration tests + full suite green                                                                                                                                        |
| P1-03 | Test coverage: Tier 1 endpoints (was 9.5%)            | ✅ 580 tests; auth 2FA, booking state machine (72% of bookings.ts), payments, wallet, token cleanup, socket server (94%), worker handlers + wiring (81%), payfort gateway, womensServices, token reuse/family; ratchet 53/68/49/53 enforced                                                                                                     |
| —     | Broken check-constraints migration (found 2026-08-17) | ✅ `20260811_add_check_constraints` referenced unquoted camelCase columns (`total_amount`/`platform_fee`/`preferred_language`) and a non-existent `loyalty_tiers` table — would have failed `migrate deploy` on any fresh DB. Fixed in place (never applied anywhere); dev DB now carries all 6 constraints                                     |
| P1-04 | Mobile app `any` budget (943 usages)                  | ✅ 3 remaining                                                                                                                                                                                                                                                                                                                                  |
| P2-01 | 12 experimental features need feature flags           | ✅ All 13 gated routers now fully behind requireFeatureFlag (3 gaps closed: beautyTrends.record, predictiveDemand.forecast, bridalConcierge — had no flag); feature_flags table was EMPTY (every gated procedure silently returned NOT_FOUND), now seeded enabled in db/seed.ts; feature-flags.test.ts (6 tests) pins the contract (2026-08-17) |
| P2-03 | Prettier not enforced in pre-commit hook              | ✅ husky + lint-staged: `git commit` runs prettier --write on staged ts/tsx/js/jsx/mjs/cjs/json/md and re-stages; verified end-to-end (2026-08-17)                                                                                                                                                                                              |
| P2-02 | No database backup restore drill performed            | ✅ Real drill on dev DB (2026-08-17): 220 tables dumped (-Fc) → restored into scratch DB → exact count(*) identical across every table. Runbook updated with full procedure + verification query + pg_dump version-mismatch gotcha                                                                                                              |
| P1-05 | Refresh token family not enforced pre-Phase 3 data    | ✅ Migration `20260817000000_refresh_token_family_backfill`: legacy rows (familyId='') each get their own family; column default now `gen_random_uuid()`. Reuse-detection revocation scoped to userId; rotation mints a fresh family on empty legacy familyId. Real integration tests replace the literal-only token-reuse file (2026-08-17)    |

## Active Debt Items

### P0 — Critical

None active — see Resolved.

### P1 — High

None active — see Resolved.

### P2 — Medium

| ID    | Item                                    | Owner | Created  | Notes                      |
| ----- | --------------------------------------- | ----- | -------- | -------------------------- |
| P2-04 | `any` budget in web (286 usages)        | —     | Aug 2026 | Target: 150 by Dec 2026    |
| P2-05 | 206 ESLint-disable directives to review | —     | Aug 2026 | Most are `no-explicit-any` |

### P3 — Low

| ID    | Item                                              | Owner | Created  | Notes                                                                                                                                                                                       |
| ----- | ------------------------------------------------- | ----- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P3-01 | 3 models flagged for archival (duplicates)        | —     | Aug 2026 | Stale: BeautySanta + BeautyQuest already removed from schema. Only Affirmation/AffirmationFavorite remain (affirmations router, ZERO web/mobile consumers) — dropping is a product decision |
| P3-02 | JSON localization lacks DB-level shape validation | —     | Aug 2026 | Currently validated only in app layer                                                                                                                                                       |
| P3-03 | Turbo cache warnings (shared/ui no output)        | —     | Aug 2026 | Fixed 2026-08-17: package-level turbo.json with outputs:[] (turbo v2 dropped the package.json `turbo` field) — warning gone                                                                 |

---

## Completed Debt Items

| ID      | Item                                          | Resolved | Phase    |
| ------- | --------------------------------------------- | -------- | -------- |
| DONE-01 | Circular dependency shared ↔ UI               | Aug 2026 | Phase 1  |
| DONE-02 | Frozen lockfile install broken                | Aug 2026 | Phase 1  |
| DONE-03 | Root build failing                            | Aug 2026 | Phase 1  |
| DONE-04 | Split auth model (localStorage vs cookie)     | Aug 2026 | Phase 3  |
| DONE-05 | Socket id/userId mismatch                     | Aug 2026 | Phase 5  |
| DONE-06 | CORS origin reflection                        | Aug 2026 | Phase 4  |
| DONE-07 | Redundant database indexes (12)               | Aug 2026 | Phase 8  |
| DONE-08 | Missing JWT claims (iss/aud/type)             | Aug 2026 | Phase 3  |
| DONE-09 | Global anonymous rate limiting                | Aug 2026 | Phase 4  |
| DONE-10 | k6 load-test TypeScript syntax in .js file    | Aug 2026 | Phase 1  |
| DONE-11 | ESLint version 10 (does not exist) in web     | Aug 2026 | Phase 1  |
| DONE-12 | CI pnpm version conflict                      | Aug 2026 | Phase 2  |
| DONE-13 | CI E2E no server start                        | Aug 2026 | Phase 2  |
| DONE-14 | Stale Playwright tests (3 failures)           | Aug 2026 | Phase 7  |
| DONE-15 | No test factories                             | Aug 2026 | Phase 7  |
| DONE-16 | No test coverage config                       | Aug 2026 | Phase 7  |
| DONE-17 | Missing database check constraints            | Aug 2026 | Phase 8  |
| DONE-18 | Language toggle uses window.location.reload() | Aug 2026 | Phase 10 |
| DONE-19 | Hardcoded `<html lang="ar" dir="rtl">`        | Aug 2026 | Phase 10 |
| DONE-20 | No reduced-motion support                     | Aug 2026 | Phase 10 |
