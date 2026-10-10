# Technical Debt Register — DOC-009

**Updated**: 2026-10-09
**Review cadence**: Every sprint planning

## Severity Legend

| Level  | Definition                                           | SLA                |
| ------ | ---------------------------------------------------- | ------------------ |
| **P0** | Blocking — revenue/safety/security directly impacted | Fix this sprint    |
| **P1** | High — significant maintenance cost or risk          | Fix within 30 days |
| **P2** | Medium — slows development, manageable               | Fix within 90 days |
| **P3** | Low — cosmetic, nice-to-have                         | Backlog            |

---

## Active Debt Items (2026-10-04)

### P0 — Critical

| ID   | Item                                  | Why                                                                                                      | Notes                                                                |
| ---- | ------------------------------------- | -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| P0-A | MyFatoorah live token                 | Payment gateway runs on dev stubs — no real charges possible until the token lands.                      | USER-GATED — token from MyFatoorah dashboard; then real sandbox E2E. |
| P0-B | Circuit breaker for external gateways | MyFatoorah/OpenAI/ZATCA/SMS/WhatsApp have only BullMQ's 3 retries; a down gateway degrades booking flow. | brain_code.md Part 2 has the full pattern list.                      |
| P0-C | Staging environment                   | Risky changes ride against the shared dev DB; no prod-clone safety net.                                  |                                                                      |

### P1 — High

| ID   | Item                     | Why                                                                                                                                                                                                                                                | Notes                                                                   |
| ---- | ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| P1-A | FE-007 bundle gap        | Routes run ~560–650 KB gzipped vs 100–150 KB targets. Catalog split (#368) reclaimed ~91 KB; `sideEffects: false` on shared+ui (#395) unlocked tree-shaking — **the new numbers are unmeasured**; the shared tRPC/API chunk set is still the bulk. | Next step: rebuild + run the size gate, then slim the shared chunk set. |
| P1-B | DB backups in production | `scripts/backup-db.sh` exists in compose but nothing schedules it.                                                                                                                                                                                 | Cron it or use managed snapshots at deploy time.                        |
| P1-C | Alerting                 | Sentry catches errors; no paging on queue stalls, disk, payment failures.                                                                                                                                                                          |                                                                         |
| P1-E | Read replica / CQRS-lite | Analytics + list queries will hammer the primary at scale.                                                                                                                                                                                         | Defer until 10K+ users, but plan the split point now.                   |

### P2 — Medium

| ID   | Item                                | Why                                                                                                                             | Notes                                                                            |
| ---- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| P2-B | Feature-toggles admin UI            | FeatureFlag table + middleware exist; no admin UI or gradual rollout.                                                           |                                                                                  |
| P2-C | Lint warnings tolerated             | ~27–174 pre-existing warnings ride under `--max-warnings` per package.                                                          | Triage quarterly; convert to errors incrementally.                               |
| P2-D | Legacy `as any` in web/mobile pages | Budget improved massively (943→3 mobile, 286→1 web); seed casts are GONE (#394); a few page-level casts remain.                 | Seed part resolved 2026-10-08.                                                   |
| P2-F | Local suite runs env=test on dev DB | The local API suite + dev servers share one DB — contention and seed pollution (flaky advisor test, Playwright login failures). | CI's isolated DB is the authority; optionally point local tests at a scratch DB. |

### P3 — Low

| ID   | Item                                    | Why                                                                                                             | Notes                                                                                                        |
| ---- | --------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| P3-A | Mobile TranslationKey import (cosmetic) | Mobile files import the global `TranslationKey` from the root barrel; `i18n-mobile` exports the identical type. | Pure cosmetics — skip unless touching those files anyway.                                                    |
| P3-B | Expo SDK 58 canary                      | SDK 57 is current; 58 canary upgrade was queued in September.                                                   | Do as a dedicated majors-PR when ready.                                                                      |
| P3-C | Dangling `./ui` export in shared        | Audit item S1 — `./ui` in the shared exports map is unused/dangling.                                            | Remove when verifying no consumers.                                                                          |
| P3-D | Role-less store owners                  | `UserRole` has no VENDOR — store owners are CUSTOMER-role users with a Vendor row, gated by ownership checks.   | Works today; a real role would mean migrating every ownership check — decide deliberately before adding one. |

---

## Resolved Since Last Register Pass (Sept–Oct 2026)

| Item                                            | Resolution                                                                                                                            |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| PayFort gateway replaced                        | ✅ MyFatoorah full integration (#353): 7 endpoints, shipping UI, StoreCheckout.                                                       |
| Sentry dormant                                  | ✅ Activated (#352): DSN wired, @sentry/node declared, E2E-verified.                                                                  |
| Static Arabic across mobile (68-file allowlist) | ✅ 16 sweep slices (#350-#367): zero static Arabic; allowlist empty.                                                                  |
| Web bundle shipping mobile catalog keys         | ✅ Per-platform i18n split (#368): ~91 KB gzipped off every route; CI leak guard.                                                     |
| Seed drift (reviews + cleanup ordering)         | ✅ Fixed (#369): 4 reviews seed cleanly; seed idempotent (double-run verified).                                                       |
| Info badge WCAG contrast (3.35:1)               | ✅ Fixed (#369): `--color-info` → blue-700 (6.11:1); E2E axe gate green.                                                              |
| Global i18n union accepted by web t()           | ✅ Fixed (#370): strict `WebTranslationKey`; mobile.* keys are compile errors on web.                                                 |
| Seed `(prisma as any)` sections (P1-D)          | ✅ Fixed 2026-10-08 (#394): all 14 casts + the `db` alias removed; seed type-checks clean against the real client.                    |
| Queue monitoring dashboard (P2-A)               | ✅ Shipped: `admin/queues` dashboard exists (BullMQ visibility).                                                                      |
| Tree-shaking blocked on shared/ui               | ✅ Fixed 2026-10-09 (#395): `sideEffects: false` on `@galaxy/shared` + `@galaxy/ui` (verified pure); real numbers pending re-measure. |

---

## Resolved Items (2026-08-16)

| ID    | Item                                                  | Resolution                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ----- | ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P0-01 | Next.js 15 migration (8 high vulns, 14.2.35 EOL)      | ✅ Next 15.5.23; `await params` on dynamic pages; web build + 168/168 e2e green                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| P0-02 | womensServices.ts router split (3,626 lines)          | ✅ Router split to 153 lines in `f9d78d81` (Aug 12, pre-register); remaining 3,359-line static catalog split into 4 contiguous chunk files (2026-08-17) with order-pinning tests — merge preserves the categories endpoint order exactly                                                                                                                                                                                                                                                                                                                                    |
| P1-01 | Real ESLint setup across all workspaces               | ✅ 0 errors in all 6 code-bearing packages; web `.eslintrc.json` shadow duplicate removed                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| P1-02 | Socket.IO parser upgrade (high vuln)                  | ✅ socket.io-parser 4.2.6 → 4.2.7 via pnpm override (GHSA-2m8v-j782-fhvr memory-exhaustion DoS). Was never major-blocked — socket.io@4.8.3 allows ~4.2.4; 24 socket integration tests + full suite green                                                                                                                                                                                                                                                                                                                                                                    |
| P1-03 | Test coverage: Tier 1 endpoints (was 9.5%)            | ✅ 580 tests; auth 2FA, booking state machine (72% of bookings.ts), payments, wallet, token cleanup, socket server (94%), worker handlers + wiring (81%), payfort gateway, womensServices, token reuse/family; ratchet 53/68/49/53 enforced                                                                                                                                                                                                                                                                                                                                 |
| —     | Broken check-constraints migration (found 2026-08-17) | ✅ `20260811_add_check_constraints` referenced unquoted camelCase columns (`total_amount`/`platform_fee`/`preferred_language`) and a non-existent `loyalty_tiers` table — would have failed `migrate deploy` on any fresh DB. Fixed in place (never applied anywhere); dev DB now carries all 6 constraints                                                                                                                                                                                                                                                                 |
| P1-04 | Mobile app `any` budget (943 usages)                  | ✅ 3 remaining                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| P2-01 | 12 experimental features need feature flags           | ✅ All 13 gated routers now fully behind requireFeatureFlag (3 gaps closed: beautyTrends.record, predictiveDemand.forecast, bridalConcierge — had no flag); feature_flags table was EMPTY (every gated procedure silently returned NOT_FOUND), now seeded enabled in db/seed.ts; feature-flags.test.ts (6 tests) pins the contract (2026-08-17)                                                                                                                                                                                                                             |
| P2-03 | Prettier not enforced in pre-commit hook              | ✅ husky + lint-staged: `git commit` runs prettier --write on staged ts/tsx/js/jsx/mjs/cjs/json/md and re-stages; verified end-to-end (2026-08-17)                                                                                                                                                                                                                                                                                                                                                                                                                          |
| P2-02 | No database backup restore drill performed            | ✅ Real drill on dev DB (2026-08-17): 220 tables dumped (-Fc) → restored into scratch DB → exact count(*) identical across every table. Runbook updated with full procedure + verification query + pg_dump version-mismatch gotcha                                                                                                                                                                                                                                                                                                                                          |
| P2-04 | `any` budget in web (286 usages)                      | ✅ 286 → 1 raw `any` (2026-08-17): 4 parallel agents + main-session sweep across all web routes. The 1 survivor is a documented latent gap (geofence optIn — no customer-facing procedure exists in the API). ~20 pages wired to REAL procedures (loyalty.myAccount, referrals.getStats/getMyCode, skinAnalysis.history, socialImpact.stats, weatherBeauty.getAdvice, visionBoard.myGoals, familyAccount.list, beautyCourses.list, challenges hooks migration); dead broken hooks deleted (community hero/referrals, extras leaderboard) with behavior-preserving fallbacks |
| P2-05 | 206 ESLint-disable directives to review               | ✅ Reviewed 2026-08-17: 63 remain repo-wide (web 23, api 28, mobile 12) vs ~226 before. Every remaining disable carries a `-- reason` (ARCH-007). 9 API files keep reasoned `prisma as any` — they query fields that don't exist in the schema (latent runtime bugs, documented per file)                                                                                                                                                                                                                                                                                   |
| P1-05 | Refresh token family not enforced pre-Phase 3 data    | ✅ Migration `20260817000000_refresh_token_family_backfill`: legacy rows (familyId='') each get their own family; column default now `gen_random_uuid()`. Reuse-detection revocation scoped to userId; rotation mints a fresh family on empty legacy familyId. Real integration tests replace the literal-only token-reuse file (2026-08-17)                                                                                                                                                                                                                                |
| P3-01 | 3 models flagged for archival (duplicates)            | ✅ BeautySanta + BeautyQuest were already gone. Affirmation/AffirmationFavorite archived 2026-08-17: affirmations router removed (zero web/mobile consumers, zero tests, zero rows — tables verified empty), models dropped via migration `20260817010000_archive_affirmations`; sisterhoodCompliments is the live replacement. Router count 243 → 242 (contract test + docs updated)                                                                                                                                                                                       |
| P3-03 | Turbo cache warnings (shared/ui no output)            | ✅ Fixed 2026-08-17: package-level turbo.json with outputs:[] (turbo v2 dropped the package.json `turbo` field) — warning gone                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| P3-02 | JSON localization lacks DB-level shape validation     | ✅ 45 CHECK constraints across 27 tables (migration `20260817020000_i18n_json_shape_constraints`): every {ar,en} JSON field must contain both keys, nullable columns allow NULL. Legacy ar-only rows (32) backfilled en:=ar first; enforcement verified with a negative INSERT test. A token-cleanup test fixture was caught and fixed (2026-08-17)                                                                                                                                                                                                                         |

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
