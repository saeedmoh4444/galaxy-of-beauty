# Rules to Make a Well-Architected Platform — Galaxy of Beauty

> The operating manual for improving and enhancing this codebase without breaking it.
> Rebuilt: 2026-11-15 — reflects W1–W4, the seller program, and the imagery program.
> Companion: `brain_code.md` (the architecture itself) + `docs/AUDIT_2026-11-11_MASTER_PLAN.md` (the gap tracker).

---

## 0. Golden Rules (never break these)

1. **Never fabricate.** No invented stat, price, rating, count, or persona may reach a user.
   Unwired verticals fail closed with an explicit reason. (`fabricated-analytics.test.ts` pins this.)
2. **Test-first.** Every slice ships with its tests written BEFORE the implementation.
   Red → green is the evidence trail in every PR.
3. **Never edit contract gates casually.** `router-inventory` counts, locale catalogs,
   bundle budgets, and seed contracts are CI-enforced snapshots. Regenerate them ON the
   feature branch (`vitest -u`), never by hand-editing the snapshot.
4. **One PR per 3–5 slices.** Squash-merged; auto-merge armed on CI-green (audit build-out policy).
   Strict cascade: after every merge, poke the BEHIND PRs (`gh pr update-branch <n>`, merge mode).
5. **Money-integrity beats convenience.** If a change touches wallets/payouts/refunds/commissions,
   the test must prove the race is closed, not just the happy path.
6. **Arabic-first, bilingual always.** New user-facing strings get `{ar, en}` keys. Web keys go
   in `messages/*.ts` (catalog sources — regenerate); mobile keys go in `messages/mobile/*.ts`
   (loaded directly, NOT catalog sources — do not regenerate for mobile-only keys).
7. **Ownership checked at every write.** Any write that reads another user's resource
   (address, technician, vendor, booking) verifies the caller owns it.

---

## 1. Commands (verified working forms)

### Type-checks (all packages)

```bash
pnpm --filter @galaxy/api type-check
pnpm --filter @galaxy/web type-check
pnpm --filter @galaxy/mobile type-check
pnpm --filter @galaxy/shared type-check
pnpm --filter @galaxy/db type-check
```

### Tests

```bash
# API suites (throwaway-DB recipe for CI parity):
#   createdb gob_repro → prisma migrate deploy → db:seed → run with DATABASE_URL override
cd packages/api && DATABASE_URL="…gob_repro" pnpm exec vitest run src/__tests__/<file>.test.ts
pnpm --filter @galaxy/shared test:unit
pnpm --filter @galaxy/mobile test:unit
# Full api suite locally = 37 min on Windows (280 isolated workers) — background it.
```

### Script gates

```bash
pnpm i18n:generate                # then: npx prettier --write packages/shared/src/i18n/messages/generated/*.ts
node scripts/check-locale-catalogs.test.mjs
pnpm --filter @galaxy/api exec vitest run src/__tests__/router-inventory.test.ts -u   # after adding procedures
```

### Database

```bash
# Create migrations on a THROWAWAY DB (never migrate dev against the shared dev DB blindly):
DATABASE_URL="…gob_new" pnpm --filter @galaxy/db exec prisma migrate dev --name <name>
pnpm db:generate                   # after every schema change
# Repair a half-applied migration on dev: check column/index state manually,
# apply the missing DDL, then: prisma migrate resolve --applied <name>
```

### Git / PRs

```bash
git branch -f master origin/master      # local master goes STALE after remote auto-merges
gh pr update-branch <n>                 # poke BEHIND (merge mode; --rebase fails)
gh pr merge <n> --auto --squash         # arm (create has NO --auto flag)
gh run view --job <id> --log-failed     # strip ANSI: sed 's/\x1b\[[0-9;]*m//g'
```

---

## 2. Architecture Rules

1. **New domain → new router file** + tests + export in the domain barrel + the appRouter.
   Then run the inventory `-u` (procedure counts changed).
2. **New procedure → explicit tier** (public / protected / customer / seller / technician /
   admin) + csrf for mutations. No tier = the inventory gate fails.
3. **Middleware order matters**: auth → role tier → csrf → domain guard (womenOnly, ownership).
4. **Pure logic lives in `lib/` or `@galaxy/shared`** — node-testable, no React/RN imports.
   Screens call pure decision functions (`vendorPortalGate`, `biometricLoginOutcome`,
   `resolveEntityImage`, `resolveSocketUrl`) instead of inlining branching.
5. **Real-time emits go through the helpers** (`emitToUser` etc.). Never call socket APIs
   directly from routers; the W3-1 bridge is the only path and it must stay exactly-once.
6. **Approval pipeline for trust events**: stores, products (strict mode), packages, promotions
   flow through ProviderSubmission → `providerReview.decide`. `ensureVendor` auto-creates are
   INACTIVE + filed for review (W3-2) — never bypass with a direct active create.
7. **Fail closed, then build real**: if a feature needs data that doesn't exist, remove or
   hide the surface (SheLeadsProgramCard precedent) — never ship fallback fiction.

## 3. Database Rules

1. **Migrations are reviewed artifacts** — create on a throwaway DB, read the SQL before pushing.
   Drift diffs may carry unrelated index churn; harmless but don't hand-delete it blindly.
2. **Seed must be idempotent** and must keep the catalog bookable: every service maps to a
   technician (round-robin post-pass). The isolated-DB contract tests enforce this.
3. **NOON-UTC buckets** for daily stats. No local-time date math in aggregates.
4. **Prisma 7 gotchas**: inner `array $transaction` can't see outer-tx uncommitted writes;
   Json writes need `as unknown as Prisma.InputJsonValue`; `maxRetriesPerRequest: null` ONLY
   for the BullMQ connection.
5. **Decimal fields** come back as Prisma.Decimal — `Number()` them at the API boundary
   (the pro-tools `4.7 ≠ 4.7m` bug).

## 4. Testing Rules

1. **Fixtures via `factories.ts`** (`buildUser`, `ensureTechnicianService`, `safeFutureDate`).
   Arbitrary `findFirst` picks pair up only by seed-order coincidence — the zatca breakage was
   exactly this. Always `ensureTechnicianService` + owned addresses.
2. **Parallel-worker safety**: scope every cleanup (`where: { id: { in: created… } }`).
   The shared CI DB is polluted by design; contracts that need pristine data run on the
   isolated `gob_seed_contract` DB with `SEED_CONTRACT_DB=1`.
3. **Snapshots**: stage them AFTER `vitest -u`, on the feature branch, no uncommitted edits.
4. **Exact-shape assertions** pin API responses — when you add a field, update the exact-shape
   tests in the SAME PR (technician-earnings precedent).
5. **E2E flake rules**: hydration-gated submits (wait for enabled), no 3s sleeps, capture ALL
   console types when debugging, CI is the authority for flake verdicts.

## 5. Performance Rules

1. **Bundle budgets are ratcheted** (FE-007) — web class baselines 221/213/298/226 KB gz.
   New heavy deps need a budget bump with justification.
2. **Lazy-load socket.io-client** on web (bundle slimming) — keep it dynamic-imported.
3. **Cache invalidation must be awaited** (W2-10): mutations that change catalog state
   `await invalidateCachePrefix(...)` before returning.
4. **Aggregates are materialized**, not computed per request (daily stats pattern).

## 6. Git / PR / Merge Rules

1. **Branch from a FRESH master** — `git branch -f master origin/master` first; verify the
   base (`git log --oneline -1`). Never trust the local master ref.
2. **Don't commit on the wrong branch** — the uncommitted work carries across `git switch -c`;
   check `git branch --show-current` before `git add`.
3. **A commit pushed after a PR's auto-merge lands is orphaned** — cherry-pick onto a new
   branch off the new master (#659 pattern).
4. **update-branch can CONFLICT on shared barrels** (both PRs export from the same index):
   merge master locally, keep BOTH export sets, then `git pull` (the remote may have its own
   poke-merge) before pushing.
5. **Auto-merge authorization** covers audit build-out PRs (`fix(w1/w2/w3…)`, W1–W6 waves) on
   CI-green — arm with `gh pr merge <n> --auto --squash`, no per-PR asks.
6. **Stale `.git/index.lock`** after a lint-staged crash: verify no git.exe (tasklist), then
   remove the lock.

## 7. Improvement & Enhancement Protocol

1. **Read the tracker first**: `docs/AUDIT_2026-11-11_MASTER_PLAN.md` Part B — everything is
   ranked P0→P4 with wave assignments. Pick the next slice from the current wave.
2. **Test-first, slice-small**: write the failing tests, implement the minimum, run the
   adjacent suites (the wave ripple: a guard change breaks every fixture that bypassed it).
3. **Tier/inventory discipline**: if the slice changes procedures, regenerate the inventory
   on the branch. If it adds user strings, add i18n keys (web → catalogs; mobile → direct).
4. **PR body must carry**: the audit-row reference, root cause, the TDD evidence (test names
   - counts), and any user-gated dependencies.
5. **Arm and move on**: auto-merge on green; the strict cascade (poke BEHIND after each merge)
   is the normal operating rhythm — expect it, don't fight it.
6. **User-gated items** are recorded, never blocked on: Fatoorah token, Sentry DSNs, AWS
   console (S3/CDN), Apple account, AI generator account, photography, pentest.

## 8. Known Gotchas (the distilled list)

1. `git ls-files <rev>` treats the rev as a PATHSPEC — use `git ls-tree -r <rev>`.
2. Local full-suite runs take ~37 min on Windows and contaminate the tree (snapshot regen,
   CRLF noise) — verify `--ignore-cr-at-eol` before `git checkout --`.
3. The web lint takes >180 s on Windows — lint only the changed files with the package-scoped
   config (`cd apps/web && npx eslint <file>`).
4. i18n generator emits DOUBLE-quoted output; prettier before diffing or the diff looks
   wholesale (11 k lines for a 3-key change).
5. `gh pr view` state UNKNOWN = GitHub recomputing after master moved — poll again.
6. Watchers die to the memory reaper on this machine — one-shot polls are the reliable pattern.
7. `resolveSocketUrl`: standard ports (''/80/443) = same-origin behind nginx; dev ports = :4001.
   Prod compose publishes NO host port for the socket — nginx proxies `/socket.io`.
8. Migrations can half-apply on a live dev DB (drops applied, ALTER missed) — repair manually
   - `migrate resolve --applied`, exactly as documented in §1.
9. `womenOnlyMutation` reads the LIVE User row (gender is not in the JWT) — changing gender
   takes effect immediately, no re-login needed.
10. The seller tier exists in the inventory meta but `staffProcedure` is defined and unused —
    staff authorization lives in `resolveVendorActor` + `staffHasCapability` (ownership model).
