# End-to-End Error & Bug Audit Report

**Date**: 2026-08-13
**Scope**: Full platform — web, mobile, API, database
**Plan**: [AUDIT_PLAN.md](./AUDIT_PLAN.md)

## Summary

| Check | Result |
|---|---|
| Type-check (6 workspaces) | ✅ 0 errors |
| API tests | ✅ 32 files, 494 tests |
| API coverage | ✅ 49.4% stmts / 57.9% branches (above thresholds) |
| API ESLint | ✅ 0 errors (149 pre-existing warnings) |
| Mobile ESLint | ✅ 0 errors after cleanup |
| Web ESLint | 🔧 177 errors → agent fixing (target 0) |
| Build | 6/6 workspaces |

## Findings Fixed

### Critical (would break production)

| # | Finding | Fix | Commit |
|---|---|---|---|
| 1 | `advanced-booking` booked hardcoded `technicianId/addressId/slotId = 1` — wrong slot, wrong address | Resolved real IDs from API (addresses.list, technicians.list, availability.list) | `86d0f367` |
| 2 | `idempotencyKey: z.string().uuid()` vs mobile's `mob_<ts>_<rand>` format — every mobile booking 400'd | Schema relaxed to opaque `min(8).max(128)` (Stripe pattern); web tech/wallet switched to `crypto.randomUUID()` | `d87a1920` |
| 3 | `brace-expansion >=1.1.17` override resolved to v2+ — broke minimatch 3.x API (vitest coverage crash) | Pinned to `1.1.17` | `4dbcd85b` |
| 4 | `reset-password` sent `{ password }` — schema expects `{ newPassword }` (masked by `as any`) | Field renamed; typed client now enforces | earlier batch |
| 5 | `emergency-booking` used hardcoded `addressId: 1` | Resolves customer's first address at booking time | `86d0f367` |
| 6 | `calendar-sync` sent fake `'google-auth-code'` — silent failure | Clear "unavailable" message instead | `86d0f367` |

### High (dead code / quality)

| # | Finding | Fix |
|---|---|---|
| 7 | 11 API ESLint errors (import() annotations, destructure omits, regex escapes) | All fixed — API now 0 errors |
| 8 | 218 `jsx-a11y/aria-role` false positives: `DashboardLayout role` prop carried a *user* role | Renamed to `userRole` across 189 call sites |
| 9 | 32 orphaned `trpc` imports after typedTrpc() migration | Removed |
| 10 | React Compiler-era rules false-positiving async `.then(setX)` | Configured off with rationale |

### Low (deferred, documented)

| # | Finding | Status |
|---|---|---|
| 11 | Mobile wallet top-up screen is UI-only (no mutation wired) | Feature gap, not bug — documented |
| 12 | `no-img-element` (36): remote Unsplash/S3 images can't use next/image without remotePatterns | Downgraded to warn; image pipeline planned |
| 13 | `label-has-associated-control` (80) a11y improvements | In progress via agent |
| 14 | `key={i}` on static demo lists | Acceptable (arrays never mutated) |

## Feature Flow Verification

| Flow | Result |
|---|---|
| C1 Auth (register→login→2FA→refresh→logout) | ✅ Field names match schemas on both platforms |
| C2 Booking (browse→create→confirm→pay) | ✅ Fixed idempotency + hardcoded IDs |
| C3 Wallet (balance→top-up→transactions) | ⚠️ Mobile top-up is UI-only stub |
| C4 Admin (dashboard→users→payouts) | ✅ 28 procedures all role-gated, 0 public |
| C5 Realtime (socket auth→rooms→events) | ✅ Fixed in Phase 5 (Zod, identity, room auth) |

## Recommendations

1. **Kill `typedTrpc()` escape hatch**: mobile's untyped client enabled bug #2 and #4. Priority: type the remaining experimental routers in AppRouter, then delete `typedTrpc()`.
2. **Wire mobile wallet top-up**: the UI exists but no mutation — complete the flow (C3).
3. **Image pipeline**: add remotePatterns for Unsplash/S3, then restore `no-img-element` to error.
4. **Coverage ratchet**: 49.4% now; raise thresholds quarterly (55% → 60% → 65%).
5. **CI lint gate**: after web ESLint reaches 0 errors, make `pnpm lint` blocking in CI.
