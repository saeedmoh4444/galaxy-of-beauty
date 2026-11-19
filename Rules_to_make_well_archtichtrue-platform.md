# Rules to Make a Well-Architected Platform — Galaxy of Beauty

> The operating manual for improving and enhancing this codebase without breaking it.
> Rebuilt: 2026-11-18 — the audit build-out program is CLOSED (board zero); these rules
> encode everything the drain taught us. Companion: `brain_code.md` (the architecture) +
> `docs/AUDIT_2026-11-11_MASTER_PLAN.md` (the closed gap tracker).

---

## 0. Golden Rules (never break these)

1. **Never fabricate.** No invented stat, price, rating, count, or persona may reach a user.
   Unwired verticals fail closed with an explicit reason. (`fabricated-analytics.test.ts` pins this.)
2. **Test-first.** Every slice ships with its tests written BEFORE the implementation.
   Red → green is the evidence trail in every PR.
3. **Never edit contract gates casually.** `router-inventory` counts, locale catalogs,
   bundle budgets, seed contracts, page-metadata, and the static-Arabic allowlists are
   CI-enforced snapshots. Regenerate them ON the feature branch (`vitest -u`), never by hand.
4. **One PR per 3–5 slices.** Squash-merged; auto-merge armed on CI-green (audit build-out
   policy). Strict cascade: after every merge, poke the BEHIND PRs
   (`gh pr update-branch <n>`, merge mode).
5. **Money-integrity beats convenience.** If a change touches wallets/payouts/refunds/
   commissions/captures, the test must prove the race is closed — claim state transitions
   with `updateMany({ where: { status: … } })`, never read-then-write (the #691 lesson).
6. **Arabic-first, bilingual always.** New user-facing strings get `{ar, en}` keys. Web keys go
   in `messages/*.ts` (catalog sources — regenerate); mobile keys go in `messages/mobile/*.ts`
   (loaded directly, NOT catalog sources — do not regenerate for mobile-only keys).
7. **Ownership checked at every write.** Any write that reads another user's resource
   (address, technician, vendor, booking) verifies the caller owns it.
8. **Verify merges landed what you pushed.** After a force-push or squash merge, confirm the
   payload exists on the target tree (`git cat-file -e origin/master:<file>`). Green CI does
   NOT prove the right content merged — it proves whatever merged passes the gates (§6.7).

---

## 1. Commands (verified working forms)

### Type-checks (all packages)

```bash
pnpm --filter @galaxy/api type-check
pnpm --filter @galaxy/web type-check
pnpm --filter @galaxy/mobile type-check
pnpm --filter @galaxy/shared type-check
pnpm --filter @galaxy/db type-check
pnpm --filter @galaxy/ui type-check          # ui has its own tsc
```

### Tests

```bash
# API suites (throwaway-DB recipe for CI parity):
#   createdb gob_repro → prisma migrate deploy → db:seed → run with DATABASE_URL override
cd packages/api && DATABASE_URL="…gob_repro" pnpm exec vitest run src/__tests__/<file>.test.ts
pnpm --filter @galaxy/shared test:unit
pnpm --filter @galaxy/mobile test:unit
# Full api suite locally = ~37 min on Windows — background it; exit codes hide behind pipes
# (use `> file 2>&1; echo exit=$?`, never `| tail`).
```

### Script gates

```bash
pnpm i18n:generate                # then: npx prettier --write packages/shared/src/i18n/messages/generated/*.ts
node --test scripts/*.test.mjs    # Architecture Gates job runs this glob — add gates as *.test.mjs
node scripts/check-page-metadata.mjs --files > scripts/static-page-metadata-allowlist.txt  # re-seed the ratchet
cd packages/api && npx vitest run src/__tests__/router-inventory.test.ts -u   # after procedure changes
```

### Database

```bash
# Create migrations on a THROWAWAY DB (never migrate the shared dev DB blindly):
DATABASE_URL="…gob_new" pnpm --filter @galaxy/db exec prisma migrate dev --name <name>
pnpm db:generate                   # after every schema change
# Make every DROP/CREATE INDEX idempotent — another migration may have done it first:
#   DROP INDEX IF EXISTS … / CREATE INDEX IF NOT EXISTS … (the #672 lesson)
```

### Git / PRs

```bash
git branch -f master origin/master      # local master goes STALE after remote auto-merges
gh pr update-branch <n>                 # poke BEHIND (merge mode; --rebase fails)
gh pr merge <n> --auto --squash         # arm (create has NO --auto flag)
gh run view --job <id> --log-failed     # strip ANSI: sed 's/\x1b\[[0-9;]*m//g'
gh run rerun <run-id> --failed          # re-run only failed jobs (run must be COMPLETED)
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
8. **Status transitions are claims, not writes**: `updateMany({ where: { id, status: CURRENT } })`
   - typed CONFLICT on count 0. Applies to payments.capture (#691) and every future state
     machine with concurrency exposure.
9. **Shared ui strings follow the app locale**: new ui components read the language via
   `locale = getUILocale()` (packages/ui/src/locale.ts), and the apps' LocaleProviders publish
   `setUILocale`. Never reintroduce a hardcoded `locale = 'ar'` default (#696).
10. **New public page → generateMetadata**: the page-metadata gate fails new pages without it;
    wrap client pages with the server-wrapper pattern (`<Name>Client.tsx` + pageMeta).

## 3. Database Rules

1. **Migrations are reviewed artifacts** — create on a throwaway DB, read the SQL before pushing.
   Drift diffs may carry unrelated index churn; harmless but don't hand-delete it blindly.
2. **Migration statements must be idempotent across the sequence**: other migrations may have
   dropped/created the same index (the add_user_gender drift collision). Always
   `IF EXISTS` / `IF NOT EXISTS`.
3. **Seed must be idempotent** and must keep the catalog bookable: every service maps to a
   technician (round-robin post-pass). The isolated-DB contract tests enforce this.
4. **NOON-UTC buckets** for daily stats. No local-time date math in aggregates.
5. **Prisma 7 gotchas**: inner `array $transaction` can't see outer-tx uncommitted writes;
   Json writes need `as unknown as Prisma.InputJsonValue`; `maxRetriesPerRequest: null` ONLY
   for the BullMQ connection; the generated client goes stale after branch-hopping —
   `pnpm db:generate` before local runs.
6. **Decimal fields** come back as Prisma.Decimal — `Number()` them at the API boundary
   (the pro-tools `4.7 ≠ 4.7m` bug).

## 4. Testing Rules

1. **Fixtures via `factories.ts`** (`buildUser`, `ensureTechnicianService`, `createUniqueSlot`,
   `safeFutureDate`). Arbitrary `findFirst` picks pair up only by seed-order coincidence —
   the zatca breakage was exactly this. Always `ensureTechnicianService` + owned addresses.
2. **Slots come ONLY from `createUniqueSlot`**: it is Jummah-safe, per-slot-spaced, and
   watermark-collision-proof by construction (a fixpoint loop). Never hand-roll slot dates —
   the Tuesday/Wednesday/Thursday Jummah collapse is date-dependent and strikes mid-week.
3. **Parallel-worker safety**: scope every cleanup (`where: { id: { in: created… } }`).
   The shared CI DB is polluted by design; contracts that need pristine data run on the
   isolated `gob_seed_contract` DB with `SEED_CONTRACT_DB=1`.
4. **Snapshots**: stage them AFTER `vitest -u`, on the feature branch, no uncommitted edits.
5. **Exact-shape assertions** pin API responses — when you add a field, update the exact-shape
   tests in the SAME PR (technician-earnings precedent).
6. **E2E flake rules**: hydration-gated submits (wait for enabled), no 3s sleeps, capture ALL
   console types when debugging, CI is the authority for flake verdicts. Guard layouts must
   HOLD on auth hydration — never bounce pre-restore (the W3-3 lesson).

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
2. **Don't commit on the wrong branch** — uncommitted work carries across `git switch -c`;
   check `git branch --show-current` before `git add`.
3. **NEVER push `HEAD` to a list of refs in a loop** — `for b in …; do git push origin HEAD:$b -f; done`
   pushes whatever is checked out to EVERY ref. This clobbered four W6 branches and four
   squash merges silently shipped the wrong content. Push each branch only while it is
   checked out, and echo the ref per iteration.
4. **After a force-push or squash merge, VERIFY the payload** on the target tree:
   `git cat-file -e origin/master:<file>` for a sample of the PR's files; `git log -- <path>`
   empty + `git merge-base --is-ancestor <commit> <tip>` false = the commit never merged.
5. **A commit pushed after a PR's auto-merge lands is orphaned** — cherry-pick onto a new
   branch off the new master (#659 pattern). The same cherry-pick is the repair for lost
   content: `git cherry-pick <original-commit>` onto fresh master.
6. **update-branch can CONFLICT on shared barrels** (both PRs export from the same index):
   merge master locally, keep BOTH export sets, then `git pull` (the remote may have its own
   poke-merge) before pushing.
7. **Auto-merge authorization** covers audit build-out PRs (`fix(w1/w2/w3…)`, W1–W6 waves) on
   CI-green — arm with `gh pr merge <n> --auto --squash`, no per-PR asks.
8. **Stale `.git/index.lock`** after a lint-staged crash: verify no git.exe (tasklist), then
   remove the lock. Never `git add -A` mid-merge — it sweeps `taskflow/` (embedded repo) and
   `.vscode/` into the index; add paths explicitly.
9. **Prettier version drift**: after a dependency bump reformats files, run the checker with
   the NEW version (`npx prettier@X.Y.Z --check`), and install the branch lockfile first —
   otherwise lint-staged reverts your fix and blocks the commit ("Prevented an empty git commit").

## 7. Improvement & Enhancement Protocol

1. **Read the tracker first**: `docs/AUDIT_2026-11-11_MASTER_PLAN.md` — the program is CLOSED;
   what remains is the user-gated list + the two ratcheted queues (SEO = drained to zero;
   ui i18n = 530 data-string files). Pick the next slice from there.
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
7. **After the drain**: board-zero is a state to defend — every new PR re-enters the cascade;
   verify merged trees per §6.4 and re-poke the BEHIND set after every merge.

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
11. tRPC v11 rejects `undefined` for `z.object({})` inputs — call `.markAllRead({})`.
12. `cmd | tail` masks exit codes (docker builds, test runs) — redirect to a file and read
    the real exit.
13. The "flakes" are often deterministic in disguise: count-based tests = parallel-sensitivity;
    Tuesday-to-Thursday CI days = the Jummah collapse; repeated same-test failures on ONE
    branch = a fixture violating a constraint that very PR added. Read the log before rerunning.
14. Local node_modules follows the LAST branch you checked out (a dependabot branch swaps the
    deps) — `pnpm install --frozen-lockfile` and `pnpm db:generate` after switching back.
