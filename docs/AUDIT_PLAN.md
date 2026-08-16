# End-to-End Error & Bug Audit Plan

**Created**: 2026-08-13
**Scope**: Full platform — web, mobile, API, database
**Approach**: Static analysis → pattern-based bug scan → feature-flow tracing → fixes → recommendations

## Phase A — Static Audit (automated checks)

| #   | Check      | Command                          | Target                           |
| --- | ---------- | -------------------------------- | -------------------------------- |
| A1  | Type-check | `pnpm type-check`                | Zero errors                      |
| A2  | ESLint     | `pnpm lint` per workspace        | Triage all errors + warnings     |
| A3  | Tests      | `pnpm --filter @galaxy/api test` | 494 passing                      |
| A4  | Build      | `pnpm build`                     | 6/6 workspaces                   |
| A5  | Coverage   | `test --coverage`                | Identify untested critical paths |
| A6  | Format     | `pnpm format:check`              | Zero warnings                    |

## Phase B — Pattern-Based Bug Scan

| #   | Pattern                                                                                    | Risk                    |
| --- | ------------------------------------------------------------------------------------------ | ----------------------- |
| B1  | Frontend input field names vs Zod schemas (like `password` vs `newPassword` found earlier) | Silent API failures     |
| B2  | `as unknown as` casts that mask type mismatches                                            | Hidden runtime bugs     |
| B3  | Null-unsafe `new Date(x)` / `.toLocaleString()` without guards                             | Crashes on missing data |
| B4  | React `key` prop using array index with mutation                                           | Rendering bugs          |
| B5  | `useState` setter-only patterns (unused state)                                             | Dead code               |
| B6  | API router inputs vs mobile/web call sites (field name drift)                              | 400 errors              |
| B7  | Error swallowing `.catch(() => {})` without logging                                        | Hidden failures         |

## Phase C — End-to-End Feature Flow Tracing

| Flow | Path     | Verify                                           |
| ---- | -------- | ------------------------------------------------ |
| C1   | Auth     | register → login → 2FA → refresh → logout        | Field names, status codes |
| C2   | Booking  | browse → service detail → create → confirm → pay | Input schemas match       |
| C3   | Wallet   | balance → top-up → transactions → withdraw       | Decimal handling          |
| C4   | Admin    | dashboard → users → bookings → payouts           | Role guards               |
| C5   | Realtime | socket auth → rooms → events                     | Identity mapping          |

## Phase D — Fix Findings (batched commits)

Fix each finding category in its own commit:

- D1: Field-name mismatches (highest impact)
- D2: Null-unsafe patterns
- D3: Error swallowing
- D4: Dead code / unused state
- D5: Key prop issues

## Phase E — Recommendations Report

Deliver `docs/AUDIT_REPORT.md` with:

- Findings table (severity, file, fix, commit)
- Feature matrix status
- Recommendations for further hardening
