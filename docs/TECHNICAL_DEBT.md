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

| ID    | Item                                             | Resolution                                                                                                                        |
| ----- | ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| P0-01 | Next.js 15 migration (8 high vulns, 14.2.35 EOL) | ✅ Next 15.5.23; `await params` on dynamic pages; web build + 168/168 e2e green                                                   |
| P1-01 | Real ESLint setup across all workspaces          | ✅ 0 errors in all 6 code-bearing packages; web `.eslintrc.json` shadow duplicate removed                                         |
| P1-03 | Test coverage: Tier 1 endpoints (was 9.5%)       | ✅ 546 tests; auth 2FA, booking state machine (72% of bookings.ts), payments, wallet, token cleanup, socket server (94%); ratchet 52/65/42/52 enforced |
| P1-04 | Mobile app `any` budget (943 usages)             | ✅ 3 remaining                                                                                                                    |

## Active Debt Items

### P0 — Critical

| ID    | Item                                         | Owner | Created  | Notes                                                    |
| ----- | -------------------------------------------- | ----- | -------- | -------------------------------------------------------- |
| P0-02 | womensServices.ts router split (3,626 lines) | —     | Aug 2026 | Emergency split: core / packages / specialists / privacy |

### P1 — High

| ID    | Item                                               | Owner | Created  | Notes                                     |
| ----- | -------------------------------------------------- | ----- | -------- | ----------------------------------------- |
| P1-02 | Socket.IO parser upgrade (high vuln)               | —     | Aug 2026 | Blocked by Socket.IO major version compat |
| P1-05 | Refresh token family not enforced pre-Phase 3 data | —     | Aug 2026 | Old tokens lack familyId                  |

### P2 — Medium

| ID    | Item                                        | Owner | Created  | Notes                                     |
| ----- | ------------------------------------------- | ----- | -------- | ----------------------------------------- |
| P2-01 | 12 experimental features need feature flags | —     | Aug 2026 | See context-map.md archive candidates     |
| P2-02 | No database backup restore drill performed  | —     | Aug 2026 | Runbook exists, no drill evidence         |
| P2-03 | Prettier not enforced in pre-commit hook    | —     | Aug 2026 | CI catches it, but local DX would improve |
| P2-04 | `any` budget in web (286 usages)            | —     | Aug 2026 | Target: 150 by Dec 2026                   |
| P2-05 | 206 ESLint-disable directives to review     | —     | Aug 2026 | Most are `no-explicit-any`                |

### P3 — Low

| ID    | Item                                              | Owner | Created  | Notes                                 |
| ----- | ------------------------------------------------- | ----- | -------- | ------------------------------------- |
| P3-01 | 3 models flagged for archival (duplicates)        | —     | Aug 2026 | BeautySanta, BeautyQuest, Affirmation |
| P3-02 | JSON localization lacks DB-level shape validation | —     | Aug 2026 | Currently validated only in app layer |
| P3-03 | Turbo cache warnings (shared/ui no output)        | —     | Aug 2026 | Cosmetic — builds work fine           |

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
