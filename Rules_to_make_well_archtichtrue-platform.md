# Rules to Make a Well-Architected Platform — Galaxy of Beauty

> The working rulebook for developing, improving, and enhancing this codebase.
> Every rule below is load-bearing: it exists because something broke when it was ignored.
> Updated: 2026-10-09 (post 12-PR wave: store shell, commissions, seed typing, tree-shaking).

---

## 0. Golden Rules (never break these)

1. **RTK first**: prefix terminal commands with `rtk` (token-optimized proxy); plain commands where `rtk` passthrough breaks a specific command.
2. **TDD**: the test file is written (and failing where meaningful) _before_ the implementation. No exceptions.
3. **All gates before push**: the five package type-checks + per-app lint + affected unit tests + affected script tests. CI enforces the rest, but never push red.
4. **Money integrity is sacred**: fail-closed gateways, verified callbacks only, idempotency keys, `$transaction` for any multi-write involving money. Never fake `success: true`.
5. **One agent in the shared worktree at a time**: parallel agents run `git checkout` in the same directory and clobber each other (this has happened). Sequential dispatch only; the next agent starts only after the previous PR merges.
6. **Never merge red / never bypass protection**: merges happen only on full CI green; use `--auto` when the head needs fresh checks after a branch update.

## 1. Commands (verified working forms)

```bash
# Type-checks (all five packages)
pnpm --filter @galaxy/shared type-check && pnpm --filter @galaxy/api type-check
pnpm --filter @galaxy/web type-check && pnpm --filter @galaxy/mobile type-check && pnpm --filter @galaxy/ui type-check

# Tests (rtk vitest passthrough is broken at the root — use pnpm exec forms)
pnpm --dir packages/api exec vitest run <files>
pnpm --filter @galaxy/shared exec vitest run src/catalog.test.ts
pnpm --filter @galaxy/ui test:unit

# Script gates
node scripts/find-static-arabic.mjs          # must print "0 across 0 files"
node scripts/check-size-budgets.mjs          # needs a fresh web build
node --test scripts/*.test.mjs
node scripts/check-cycles.mjs
node scripts/gen-dependency-graph.mjs --check

# Database (migrate dev is BROKEN — hand-write migrations)
pnpm db:generate                              # after ANY schema.prisma change
pnpm db:migrate:status                        # exits 1 when migrations are pending (expected)
pnpm db:migrate:deploy                        # apply pending migrations
pnpm --filter @galaxy/db db:seed              # full reseed (wipes dev DB — verify it stays idempotent)

# Git / PRs
gh pr update-branch <n>                       # MERGE mode only — --rebase fails on merge commits/catalog appends
gh pr merge <n> --squash --delete-branch      # verify state == MERGED after (exit 0 lies)
```

## 2. Architecture Rules

1. **New tRPC router** → new file in `routers/`, re-export in its `domains/<name>/index.ts`, and **bump the 266-router gate** in `trpc-procedures.test.ts`. Prefer adding procedures to an existing router over a new one.
2. **Every new procedure** comes from a tiered factory (`publicProcedure`/`protectedProcedure`/`customerProcedure`/`technicianProcedure`/`adminProcedure`) — never a bare `procedure` (tier meta is stamped by the factory).
3. **Router inventory ritual**: after adding/removing procedures, run `pnpm --dir packages/api exec vitest run src/__tests__/router-inventory.test.ts -u` **on a clean tree**, review the `.snap` diff (counts + hash), and never contaminate it with unrelated edits.
4. **Prisma 7 relations**: writes use `connect` (or `connectOrCreate`) — relation connects and FK scalars are mutually exclusive. Required relations on BOTH sides must be satisfied.
5. **New gateway/external client** → a facade in `lib/` that is **fail-closed**: no config → throw or dev-stub (only when `*_SIMULATE=true` AND not production), never fake success. Test the failure paths.
6. **i18n catalog split is an invariant** (see `docs/architecture/i18n-catalog-split.md`):
   - Web runtime graph: root barrel → `i18n/web` → 11 domain files + runtime. **Never** re-export `sharedMessages`/`mobileMessages` runtime values from the root barrel (the CI leak guard fails the build).
   - New web strings → domain catalogs (`messages/*.ts`). New mobile strings → `messages/mobile/customerB.ts` appended at the end.
   - `t()` keys are **literals only** (TranslationKey union enforces it). Values must have **no leading/trailing spaces** (catalog.test.ts trim gate) — separators are stored trimmed and spaced at the join site.
   - Web legacy `t()` accepts **web keys only** (`WebTranslationKey`); `useLocale().t` keeps the global union for dynamic keys.
7. **Zero static Arabic** outside `t()` in mobile (gate + now-empty allowlist). If a legitimate exception ever appears, it goes through an explicit allowlist entry — and that is a red flag requiring review.

## 3. Database Rules

1. Schema change → `pnpm db:generate` + a **hand-written migration** (`packages/db/prisma/migrations/<timestamp>_<name>/migration.sql`) — never `prisma migrate dev` (broken in this repo: the baseline squash + a bookings-index drift make it demand a destructive reset).
   **Dev-DB application recipe (verified 2026-10-08):**
   ```bash
   cd packages/db
   docker exec -i -e PGPASSWORD=gob_secure_pass_2024 gob-postgres \
     psql -U gob_admin -d Galaxy_of_Beauty_db < prisma/migrations/<ts>_<name>/migration.sql
   #   ^^ the -i flag is REQUIRED — without it stdin drops and the SQL silently never runs
   npx prisma migrate resolve --applied <ts>_<name>   # mark it in the history
   pnpm db:generate
   ```
   Verify the columns/indexes actually changed with an information_schema/pg_indexes query before resolving.
2. Stale failed migration blocking deploys (P3009): **verify its SQL actually applied** against the DB first, then `prisma migrate resolve --applied <name>`.
3. Seed must stay **idempotent**: cleanup ordering matters (children before parents — e.g. `seasonalService` before `category`); run the seed twice back-to-back when touching it.
4. Seed writes follow the same Prisma 7 relation rules as app code — **and stay fully typed** (all `(prisma as any)` casts were removed in #394; do not reintroduce them — a cast hid the reviews drift class once already).
5. `Vendor.userId` is `@unique` — one provider (store/clinic/gym/…) per owner; tests that need a second rate/vendor must UPDATE the existing row, not create a second one.

## 4. Testing Rules

1. Every new feature/module gets a test file **before** implementation, following the house patterns:
   - Pure logic → unit tests with injected seams (`vi.mock`, loader-setter seams like `_setSentryLoaderForTests`).
   - Router flows → `appRouter.createCaller(ctx)` + seeded Prisma fixtures (factories from `packages/api/src/__tests__/factories.ts`), cleanup in `afterAll`.
2. **Parallel-DB awareness**: the suite runs ~173 files against ONE shared DB. Never assert on seeded-row counts that sibling files can disturb — backfill your own fixtures in `beforeAll` (see `postpartum.test.ts`). For tests that mutate shared rows (e.g. vendor commission rates) use `describe(name, { sequential: true }, …)` — vitest 5 has no `describe.sequential`.
3. `vi.spyOn` on module-namespace exports does **not** intercept internal calls in vitest ESM — use explicit seams.
4. Contract tests (router counts, inventory hash, money-integrity, catalog invariants) are architecture guards — update them deliberately, never delete them to make a change pass. **The router-inventory contract is THREE gates**: the inline counts snapshot, the detail `.snap` list, AND the sha256 hash inline snapshot — a procedure change must update all three.
5. Keep the size gate's leak sentinels meaningful: any new sentinel must be grep-verified absent from domain catalogs AND web source before committing it.
6. **New E2E specs run on all three projects** (chromium, firefox, mobile-chrome). Sidebars are `hidden md:block` — assertions on them must be viewport-aware (skip/assert-hidden on mobile) or the mobile project fails.
7. **Client-side route guards must wait for auth hydration** — a query `enabled: isAuthenticated` returns `undefined` while the auth context hydrates; a guard that redirects on `!data` will bounce legitimate users (this shipped broken once on `/store`). Gate on `isAuthenticated && !isLoading && !data`.

## 5. Performance Rules

1. The FE-007 budget gate enforces per-class regression limits (`scripts/size-baseline.json` × 1.05). A deliberate, justified growth (e.g. catalog expansion) may re-baseline — **after** the gate passes against the OLD baseline, and rounded UP to the next KB. Never grow a route silently.
2. Web bundle hygiene: no runtime import edge from web-reachable modules into `messages/mobile/**` or the merged i18n module (the leak guard enforces it — keep it that way).
3. **`@galaxy/shared` and `@galaxy/ui` now declare `sideEffects: false`** (#395) — tree-shaking IS enabled for them. Never add side-effectful code (css imports, top-level registrations, global mutation) to those packages; verify purity before extending them.
4. Lazy-load heavy features (the socket chunk was already split once); the remaining bulk (shared tRPC chunk set) is the known gap toward the 100–150 KB targets — measure with a fresh `next build` + the size gate after every slimming step.

## 6. Git / PR / Merge Rules

1. Branch off latest master (`git pull --ff-only` first), push with `git push origin HEAD:<branch>`.
2. Commit messages: conventional prefix (`feat(...)`, `fix(...)`, `perf(...)`, `test(...)`, `chore(...)`) + `Co-Authored-By: Claude Code <noreply@anthropic.com>`; PR body ends with the 🤖 footer.
3. Merge policy: **merge only on full CI green**. If the branch is BEHIND master: `gh pr update-branch <n>` (merge mode), then `gh pr merge <n> --squash --delete-branch --auto` (policy requires fresh checks on the updated head — `--auto` queues it).
4. Sweep-style multi-PR work: sequential slices, each merged before the next starts (prevents catalog/append conflicts).
5. `gh pr merge` can exit 0 without merging — always verify `state == MERGED`.

## 7. Improvement & Enhancement Protocol (how to propose and land new work)

1. **Scoping**: for anything touching money flow, schema, cross-app contracts, or the architecture invariants above → plan first (explore → plan agent → written plan → approval). Small, well-specified fixes (typo, seed fixture, single-file bug) may proceed directly.
2. **Execution order**: tests → code → gates → measure → commit → PR → green CI → merge.
3. **After landing**: update this rulebook/memory with any new gotcha the work surfaced; stale docs get corrected in the same PR when touched.
4. **User-gated actions** (ask first, every time): destructive ops (`prune --write`, db-cleanup `--write`), production credentials/keys, merges that bypass protection, anything outward-facing (deploys, store submissions).

## 8. Known Gotchas (the distilled list)

- `$?` after a pipe = the LAST command's exit (`head` masks `grep`'s) — judge grep by its output.
- **Route groups**: a `page.tsx` at a route-group root (`(store)/page.tsx`) resolves to `/` and collides with `(public)` — Turbopack build fails with "two parallel pages that resolve to the same path". New top-level paths get a **literal segment** (`store/page.tsx` → `/store`).
- i18n duplicate keys can survive a git merge silently — diff the catalog after merge conflicts.
- `gh run list` first row may be EAS, not CI.
- `gh pr checks` returns **EMPTY output** right after `update-branch` (no checks reported) — CI pollers must treat empty as pending, not done.
- React 19: `JSX.Element` excludes `null` — return `<></>`, not `null`; import `type { JSX }` explicitly.
- `View → TouchableOpacity` migrations leave unused imports → lint errors.
- `update-branch --rebase` rebases REMOTELY (and fails on merge commits) — prefer merge mode.
- Squash-merged PRs are not ancestors — rebase local branches after merges; `gh pr update-branch` then pull before pushing more commits.
- Turbo cache can hide lockfile breakage — `pnpm install` before blaming code.
- Dotenv URL pathnames mangle Windows paths — pass env inline instead.
- `noUncheckedIndexedAccess` — array/record access needs guards (`??`/`!` only where proven).
- NOON-UTC date convention for date-only fixtures.
- `docker exec` WITHOUT `-i` silently drops stdin — SQL fed via `< file` never runs; always `docker exec -i`.
- `%TEMP%` does not expand in Git Bash — use the absolute path (`C:\Users\<user>\AppData\Local\Temp\...`).
- `git add` paths are cwd-relative, and the session cwd drifts between repo root / apps / packages — use absolute paths or verify with `pwd` when a pathspec "does not exist".
- The local API suite runs `env=test` against the **dev DB** — running it while someone uses the dev servers causes contention and can pollute seed data (Playwright login failures locally, advisor weekly-category flake). CI's isolated DB is the authority.
- Windows CRLF noise shows as phantom `M` files with empty diffs — `git checkout -- <file>` discards it safely; it also blocks branch switches.
- Background tasks get reaped when the system is critically low on memory — do NOT restart them on your own; restart only when the user asks.
