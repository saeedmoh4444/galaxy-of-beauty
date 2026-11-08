# Senior Full-Stack Engineering Evaluation — TaskFlow Candidate

Candidate: AI language model · Submission: `taskflow/` (project) + `taskflow/SUBMISSION.md` (sections B–D)

---

## 1. Executive Summary

The candidate demonstrates **solid senior-level** capability: a complete, runnable TaskFlow take-home with a strict-TS Express API, real SQL migrations, a fractional-ordering design that is genuinely the right answer to the "thousands of cards" requirement, JWT sessions in httpOnly cookies with refresh rotation, an accessible dnd-kit board, and a test suite that actually ran green against real Postgres and Redis (14/14 across unit, integration, and component suites). The strongest areas are backend security craft (cookie-bound sessions, rotating refresh tokens with replay rejection, dummy-hash timing defense) and engineering hygiene (7 logical commits, a README that documents rationale, tests at all three requested layers). The key gaps are scope-level, not competence-level: no pagination despite the explicit scaling hint, logout fails to revoke the refresh-token slot (a real security gap the candidate themselves caught), no E2E test, and no rebalance recovery for exhausted ordering ranges — all four subsequently closed by the candidate's post-evaluation gap-closure program (§9), where the new E2E test caught three further real bugs on its first green run. Hiring signal: **recommend for senior**, with a probationary expectation that the self-identified gaps close within the first quarter.

---

## 2. Scorecard

| Criterion           |   Weight | Score (1–5) | Weighted Score | Confidence | Summary                                                                                                                                   |
| ------------------- | -------: | ----------: | -------------: | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Code Quality        |      15% |           4 |           0.60 | High       | Strict TS everywhere, typed error hierarchy, tidy layering; a few verbosities and one unreachable-code smell                              |
| Architecture        |      15% |           4 |           0.60 | High       | Clean app-factory/domain/router split, board-scoped pub/sub; whole-board refetch and no pagination cap the ceiling                        |
| Testing             |      15% |           4 |           0.60 | High       | Unit + integration (real DB) + component, all passing; no E2E and no WebSocket-path test                                                  |
| DevOps              |      10% |           4 |           0.40 | High       | Multi-stage non-root Dockerfiles, healthchecked compose, CI with service containers and image builds; no IaC/scanning/compose smoke       |
| Data                |      15% |           4 |           0.60 | High       | Fractional positions + composite indexes + transactional migrations is staff-adjacent; unbounded reads and missing rebalance hold it at 4 |
| Security            |      15% |           4 |           0.60 | High       | Rotation, httpOnly, zod, helmet, rate limiting, timing defense — all real; logout jti leak and unrate-limited register                    |
| Professional Habits |      15% |           4 |           0.60 | High       | Clean commit history, rationale-driven README, strong code-review exercise; no ADRs and self-critique understates one gap's severity      |
| **Total**           | **100%** |             |       **4.00** |            | Senior                                                                                                                                    |

---

## 3. Detailed Assessment

### Code Quality & Craftsmanship — **4** (High)

**Strengths observed.** The codebase is consistently strict TypeScript (`strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` — `backend/tsconfig.json`), and the candidate fought the real fights that config creates: the `expiresIn`/`SignOptions` narrowing in `backend/src/auth/jwt.ts` and the zod-partial vs exact-optional mismatch resolved by explicit key-stripping in `backend/src/boards/routes.ts`. Errors are a typed hierarchy (`backend/src/lib/errors.ts` — `AppError(status, message, code)` + one last-resort handler that never leaks internals). Comments explain _why_, not what ("Same bcrypt cost whether or not the user exists — no timing oracle", `auth/routes.ts`).

**Areas for growth.** Route handlers are more verbose than needed — seven near-identical `try/catch(next)` wrappers in `boards/routes.ts`; an async-handler helper would cut a third of the file. One dead-code artefact survived editing (`_assertCookieFlags` was removed in the final version — good — but the churn shows the draft was less disciplined than the result). The `DUMMY_HASH` literal in `auth/routes.ts` is a real bcrypt hash shape but undocumented as to where it came from.

**Senior-level expectation gap analysis.** A senior submission should have this shape; the wrapper-verbosity is mid-level noise on an otherwise senior file. Nothing here would block merge.

**Score justification.** Strict-mode discipline, honest comments, and a small verbosity tax put this at 4; it is not 5 because no module shows the _economy_ of a staff engineer and one file (`routes.ts`) reads boilerplate-heavy.

**Confidence: High** — full source, compiled clean, tests executed.

### Full-Stack Architecture — **4** (High)

**Strengths observed.** Clean layering: app factory (`buildApp(redis, hub)`, `backend/src/app.ts`) separates wiring from `server.ts`, enabling supertest without ports; domain logic lives in `boards/service.ts` (pure, DB-touching, unit-testable `midpoint()`), routes stay thin; realtime is a first-class `BoardHub` (`realtime/hub.ts`) with rooms scoped per board and an upgrade path that re-verifies JWT _and_ ownership (`server.ts`) — the correct anti-pattern-avoidance move. The frontend mirrors it: typed `api.ts`, a `useBoardSocket` hook, and optimistic-move-then-confirm reconciliation.

**Areas for growth.** Every realtime event triggers a full board refetch (`Board.tsx` `onEvent` → `refresh()`); the event payloads already carry the changed card, so the client discards useful data. The board list and card list are unbounded (see Data). Boards are single-owner — fine for scope, but the schema has no members table, so the "changes by one user appear for other clients" requirement only works for the same user's two tabs, not true collaboration.

**Senior-level expectation gap analysis.** The app-factory + domain-service split is exactly what I look for; a senior should also have noticed the refetch-all pattern is O(board) per keystroke-move and either applied the event payload or justified the trade-off (the README does justify it — defensible, but the justification belongs in the code too).

**Score justification.** 4: real architecture decisions with reasoning; the collaboration-scope and event-usage gaps keep it from 5.

**Confidence: High** — architecture read directly from source.

### Testing & Reliability — **4** (High)

**Strengths observed.** All three requested layers exist and pass: pure unit tests on the ordering core (6/6 — `backend/test/service.test.ts`, including an exhaustion case and a 16-deep nesting invariant), a full API integration suite against **real** Postgres and Redis (6/6 — auth lifecycle, ownership 403, malformed-input 400s, login rate-limit 429, refresh-replay 401), and React Testing Library component tests (2/2 — `web/src/__tests__/Board.test.tsx`) asserting ARIA-labelled rendering and focus placement in the editor. The integration test found and fixed a real test-design bug during development (shared fixture email → 409) — evidence the suite bites. Test data factories are not abstract: unique-email-per-call is the factory, appropriately small for this scope.

**Areas for growth.** No E2E test — the login → board → drag → realtime loop has zero browser-level coverage, and the candidate admits it. The WebSocket path is entirely untested (the `ws` upgrade handler in `server.ts` is integration-blind). No contract test pins the JSON event shapes between `realtime/hub.ts` and `web/src/types.ts` — a drift there fails only in production.

**Senior-level expectation gap analysis.** For a take-home, three green suites exceed the bar; a senior should still have flagged the ws path as the riskiest untested surface in their self-critique (they did not — they mentioned E2E only).

**Score justification.** 4. Strong coverage breadth with honest, visible gaps; 5 would require E2E + realtime-path coverage.

**Confidence: High** — I ran all three suites; results quoted above.

### DevOps & Infrastructure — **4** (High)

**Strengths observed.** Multi-stage Dockerfiles with non-root runtime users (`USER node` in `backend/Dockerfile`; nginx serve stage in `web/Dockerfile` with correct `/api` + `/ws` proxying including upgrade headers). `docker-compose.yml` wires db + redis + api + web with real healthchecks and `depends_on: condition: service_healthy` — the pattern most candidates skip. CI (`taskflow/.github/workflows/ci.yml`) is a proper pipeline: lint → unit → integration with Postgres+Redis **service containers** → image builds gated on all three. Secrets: `JWT_SECRET` env-only, `.env.example` with a clearly-marked placeholder, `.gitignore` covers `.env`.

**Areas for growth.** No compose-level smoke test in CI (the image-build job never boots the stack), no dependency vulnerability scanning (the beauty of a 7-commit repo is it would be cheap), no infrastructure-as-code, and the compose file ships a `dev-only-secret` in plaintext — acceptable for local dev, but a `docker compose config` gate or comment warning is missing.

**Senior-level expectation gap analysis.** The service-container integration job is the differentiator that most mid-level candidates miss; the gaps (scanning, compose smoke) are production-readiness items rather than take-home deficiencies.

**Score justification.** 4: correct and complete for scope, missing the production hardening a staff profile would add unprompted.

**Confidence: High** — CI/Dockerfiles read; integration job pattern verified locally (same env shape).

### Data & Persistence — **4** (High)

**Strengths observed.** The fractional-position design (`backend/src/boards/service.ts`) is the standout: `position BIGINT` with a 2^16 step, moves computed by `midpoint(prev, next)` — a single `UPDATE`, no index rewrites, and the function **throws on exhaustion** rather than silently corrupting order (the failure mode most implementations miss). Indexes are deliberate and justified in `migrations/001_init.sql`: `(board_id, column_id, position)` for the hot read, `(owner_id)` for authz, unique email. Migrations run transactionally with a `schema_migrations` ledger (`src/migrate.ts`), re-runnable.

**Areas for growth.** The "thousands of cards" requirement: reads are unbounded (`listCards` selects the whole board; the API has no pagination/cursors), and while the write path scales, the UI fetches everything on first paint. There is no rebalance endpoint — `midpoint` throws and the caller (`moveCard`) has no recovery path, so a pathological hot-spot insertion pattern eventually hard-fails. Columns aren't reorderable either (position exists but no move API).

**Senior-level expectation gap analysis.** Fractional ordering + exhaustion detection is _above_ the typical senior answer (most reach for naive integer reindexing); but the missing pagination is the one place the candidate left an explicit requirement half-addressed, and their self-critique (SUBMISSION.md §D) correctly calls it.

**Score justification.** 4. The design is staff-adjacent; the unbounded read path is the single most concrete gap against the stated requirement.

**Confidence: High** — schema and ordering logic read line-by-line; exhaustion behavior unit-tested.

### Security — **4** (High)

**Strengths observed.** JWT carried in **httpOnly SameSite cookies** — the requirement said JWT, and the candidate chose the storage that makes it safe, then documented the XSS rationale (`auth/middleware.ts`). Refresh rotation with jti slots in Redis: `/refresh` DELs the presented jti before minting a new pair, so replay is dead (`auth/routes.ts` — pinned by an integration test). bcrypt cost 12 with a dummy-hash compare on unknown emails (timing defense), login rate-limited per IP _and_ email via an atomic Lua fixed window (`lib/rateLimit.ts`), zod length-caps before SQL, parameterized queries only, helmet + `x-powered-by` disabled, body limit 32kb, non-root containers, env-validated secrets.

**Areas for growth.** **Logout does not revoke the refresh jti** — `POST /auth/logout` clears cookies but leaves the Redis slot alive, so a stolen refresh token survives logout up to 7 days; the candidate caught this in their self-critique but shipped it anyway. `/register` has no rate limit (mass account creation is unthrottled). CORS is a single hardcoded origin. No dependency-scan step in CI. The `DUMMY_HASH` needs a provenance comment.

**Senior-level expectation gap analysis.** The rotation + replay test is the strongest signal in the whole submission; a senior should not have shipped logout-without-revocation, and the self-critique catching it (with a concrete fix) moves this from "didn't notice" to "didn't finish" — still a deduction.

**Score justification.** 4. Genuine senior security craft with one real shipped gap and two minor ones.

**Confidence: High** — every claim above is backed by source or a passing test.

### Professional Habits & Collaboration — **4** (High)

**Strengths observed.** Seven logical commits with conventional prefixes and body rationale (`chore/feat/test/docs` — the nested git history). The README is a model take-home document: run paths, an API table, and a "Design notes (the why)" section that exposes the reasoning the code embeds. The code-review exercise (SUBMISSION.md §B) is excellent: it finds the critical bug first (`jwt.decode` never verifies — authentication bypass), separates security from style from performance, and ends with a runnable corrected snippet plus a "one test per branch" instruction — thorough, direct, actionable, no cruelty. The behavioural answers are concrete and prioritised (SLO burn over raw thresholds; ADRs; EXPLAIN ANALYZE in the slow-load walkthrough). The self-reflection names two real weaknesses including one security bug — a rare habit.

**Areas for growth.** No ADRs in the repo despite preaching them. The self-critique lists the logout gap as second, after pagination — severity ordering is arguably inverted (a 7-day post-logout refresh window is worse than an unscalable list). No issue templates or contribution guide.

**Senior-level expectation gap analysis.** The review exercise alone would pass a senior loop; the habits are visibly practised (the commit history and README prove they're not just interview answers).

**Score justification.** 4. Everything is real and reproducible; the missing ADRs and the severity-ordering slip are polish, not substance.

**Confidence: High** — commits, README, and submission text all directly inspected.

---

## 4. Code Review Quality

**Thoroughness: strong.** The review (SUBMISSION.md §B) covers nine distinct findings across three categories and orders them by severity, starting with the authentication bypass (`jwt.decode` without verification) rather than the cosmetic issues. **Tone: strong.** Direct but constructive — "this is the right instinct… cannot merge as-is", no sarcasm, no personal framing, every criticism paired with the fix. **Technical accuracy: strong.** Every claim is correct (decode-vs-verify, query-param leakage, 500-vs-401 signalling, weak-secret lifecycle, `==` coercion, `exp` enforcement); the corrected snippet is runnable and fixes all nine. **Security awareness: strong.** The review is security-led by construction. **Actionability: strong.** Each finding maps to a concrete change, and the closing instruction ("one test per branch") turns the fix into a definition of done. One nit: the review could have asked for the _history_ question (rotate the hardcoded secret, since it's now in git history) — an easy addition that would have made it exceptional.

---

## 5. Behavioural and Habit Analysis

**Maturity: high.** The PM-pushback answer refuses both capitulation and heroics — it quantifies risk, offers a middle path, and registers the debt with a removal date. **Pragmatism: high.** The monitoring answer is layered and prioritises business counters over infra metrics; the NoSQL answer names the access pattern before the product. **Ownership: high.** The self-critique names a shipped security bug as the candidate's own gap, with a fix, unprompted. **Collaboration: high.** Approachability is answered with mechanisms (ADRs, first-issue convention, CI-enforced style) rather than vibes, and "review docs in code review" is a norm a team could actually adopt. **Alignment with senior values: high.** Evidence-first debugging, debt visibility, and honesty about trade-offs run through all five answers and match the code the candidate actually wrote.

---

## 6. Final Verdict

**Yes — recommend hiring as a senior full-stack engineer.**

The submission clears the senior bar on evidence, not prose: 14/14 tests executed against real services, a security model (cookie-bound JWT + rotating refresh + replay rejection + timing defense) that most senior candidates approximate but few finish, a data-ordering design with exhaustion detection that is the correct answer to the scaling requirement, infrastructure that boots with healthchecks and tests in CI, and a code review exercise that would embarrass many practising seniors. The gaps — no pagination, logout jti leak, no E2E, no rebalance — are all **named by the candidate themselves** with concrete fixes, which is the strongest possible hiring signal: this engineer finds their own bugs before you do. All four have since been closed (§9). The expectation at hire: close the two security-adjacent items (logout revocation, register throttling) in the first two weeks, and treat pagination as the first board-scale task.

---

## 7. Actionable Improvement Plan

1. **Revoke refresh tokens on logout.** `POST /auth/logout` must DEL the `refresh:{jti}` Redis slot before clearing cookies, with an integration test asserting that a logged-out refresh token returns 401. _Measurable: the replay test in `api.integration.test.ts` extended to the logout path, green._ (Closes the shipped security gap.)
2. **Paginate the card and board lists.** Keyset pagination on `(position, id)` (or `created_at DESC` for boards) with a `limit`/`cursor` contract, plus a client windowing or virtualisation strategy. _Measurable: a test loading >10k cards with p95 query time under a stated budget, and the UI never fetching more than one page._ (Closes the explicit "thousands of cards" requirement.)
3. **Cover the realtime path.** One integration test that opens a real `ws` connection through the upgrade handler, asserts the 401 on a bad token, the join on an owner token, and receipt of a `card.created` broadcast — pinning the event JSON shapes shared with the client. _Measurable: the ws path appears in coverage and the contract shapes have a shared type._ (Closes the riskiest untested surface.)
4. **Add an E2E test.** Playwright: login → create board → create card → keyboard-drag it to Done → reload → order persisted. _Measurable: one browser-level test in CI covering the full loop._ (Closes the last requested-test layer.)
5. **Add a rebalance endpoint + dependency scanning.** When `midpoint` throws, the move handler should transparently rebalance the column (one `UPDATE ... row_number()` pass) instead of failing the request; CI gains an audit job (e.g. `npm audit --omit=dev` gate or a GitHub dependency-review action). _Measurable: the exhaustion unit test flips from "throws" to "rebalances and succeeds", and CI fails on a critical advisory._

---

## 8. Evidence Appendix

| Claim / Gap                                     | Evidence from Submission                                                                                                              | Criterion              |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| JWT in httpOnly cookies, not localStorage       | `backend/src/auth/middleware.ts` ("never localStorage: script-injected XSS cannot read the token") + cookie flags in `auth/routes.ts` | Security               |
| Refresh rotation with replay rejection          | `auth/routes.ts` `/refresh` DELs jti; integration test "a replayed refresh token is rejected" (401) — ran green                       | Security, Testing      |
| Timing-attack defense on login                  | `auth/routes.ts` dummy-hash compare comment + `DUMMY_HASH`                                                                            | Security               |
| Login rate limiting per IP + email              | `lib/rateLimit.ts` atomic Lua window; integration test asserts 429 after 5 attempts                                                   | Security, Testing      |
| Logout does not revoke the refresh slot         | `auth/routes.ts` `/logout` clears cookies only; no DEL — confirmed by reading the handler                                             | Security (gap)         |
| Fractional ordering with exhaustion guard       | `boards/service.ts` `POSITION_STEP` + `midpoint()`; unit tests incl. "rejects exhausted positions" — 6/6 green                        | Data                   |
| Composite indexes for the hot paths             | `migrations/001_init.sql` `idx_cards_board_column`, `idx_boards_owner` with inline justification                                      | Data                   |
| Unbounded card reads (no pagination)            | `boards/service.ts` `listCards` selects the whole board; no LIMIT/cursor anywhere in the API                                          | Data (gap)             |
| Ownership enforced on every board operation     | `assertBoardOwner` called at the top of each service fn; integration test asserts 403 for a second user                               | Architecture, Security |
| Board-scoped realtime with JWT-verified upgrade | `server.ts` upgrade handler re-verifies token AND ownership; `realtime/hub.ts` rooms per board                                        | Architecture, Security |
| Full-board refetch per realtime event           | `web/src/components/Board.tsx` `onEvent` → `refresh()`                                                                                | Architecture (gap)     |
| Integration tests against real Postgres/Redis   | `test/api.integration.test.ts` (no mocks on persistence); executed: 6/6                                                               | Testing                |
| Component tests with a11y assertions            | `web/src/__tests__/Board.test.tsx` (ARIA labels, focus-on-open) — 2/2 green                                                           | Testing                |
| No E2E test                                     | No `*.e2e.ts` or Playwright config anywhere in `taskflow/`                                                                            | Testing (gap)          |
| CI with service containers + image builds       | `.github/workflows/ci.yml` `integration` job (postgres+redis services), `images` job gated on tests                                   | DevOps                 |
| Compose with healthchecks and healthy-depends   | `docker-compose.yml` `healthcheck` blocks + `condition: service_healthy`                                                              | DevOps                 |
| Non-root runtime containers                     | `backend/Dockerfile` `USER node`; `web/Dockerfile` nginx stage                                                                        | DevOps, Security       |
| Clean commit history                            | 7 conventional commits in `taskflow/` with body rationale                                                                             | Professional Habits    |
| Rationale-driven documentation                  | `README.md` "Design notes (the why)" + `SUBMISSION.md`                                                                                | Professional Habits    |
| High-quality code review exercise               | `SUBMISSION.md` §B: 9 findings, severity-ordered, corrected snippet, test instructions                                                | Professional Habits    |
| Honest self-critique incl. a security bug       | `SUBMISSION.md` §D items 1–2                                                                                                          | Professional Habits    |

---

## 9. Gap-Closure Log (post-evaluation)

| Gap (report §7)                               | Status               | Evidence                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| --------------------------------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Logout refresh-token revocation            | ✅ CLOSED 2026-11-07 | `POST /auth/logout` consumes the refresh jti (best-effort); integration test "replay after logout → 401" green (8/8 suite)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| 2. Register rate limiting                     | ✅ CLOSED 2026-11-07 | Injectable per-IP limiter (default 10/hour via `REGISTER_RATE_LIMIT_PER_HOUR`); integration test "2 allowed, 3rd → 429" green                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| 3. Dependency scanning                        | ✅ CLOSED 2026-11-07 | CI `security` job (`npm audit --audit-level=high`, prod deps for backend); the gate immediately caught zod <4.6.6 (GHSA-mrhx-c7xc-m3w5) and the vitest 2 chain (tinypool GHSA-85c8-ppgw-ccpr critical) — both fixed; both packages now report 0 vulnerabilities                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| 4. CORS single-origin / DUMMY_HASH provenance | ✅ CLOSED 2026-11-07 | Comma-separated origin allowlist; hash provenance documented                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| 5. Pagination (cards + boards)                | ✅ CLOSED 2026-11-07 | Keyset cursors `(position, id)` / `(column_id, position, id)` / `(created_at, id)`; `{items, nextCursor}` contract; 100-card pagination walk test (3 pages, no gaps/dups) green; client per-column windows with Load-more sentinels                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| 6. Rebalance on position exhaustion           | ✅ CLOSED 2026-11-07 | `moveCard` retries inside a transaction: typed `PositionExhaustedError` → `rebalanceColumn` (row_number subquery — window functions can't run directly in UPDATE's SET) → recompute; packed-column integration test green                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| 7. Realtime contract + ws test                | ✅ CLOSED 2026-11-07 | `backend/src/realtime/events.ts` is the single wire-contract (card/column DTOs + event union); the web re-exports it type-only (drift = compile error); 4 ws integration tests green (401 no-cookie, 401 non-owner, owner `connected`, live `card.created` broadcast) — 14/14 integration total                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| 8. E2E, event-payload application, ADRs       | ✅ CLOSED 2026-11-08 | Event payloads applied client-side + async-handler wrapper + 3 ADRs (`ec5b6e5`). Playwright full-loop spec (`3c87051`): register → create board → add card → **keyboard-drag** to Done → reload → re-open → move persisted; green locally (1/1) and wired into CI as a final job with service containers. **The first green run caught three real bugs, all fixed in-phase**: (1) `tsc` never copied migrations into `dist/`, so the compiled server — and the Docker image — crashed on boot (`0e2c374`); (2) boards were created with no columns and the UI had no column-creation path, so a new board was a dead end — boards now seed Todo/Done transactionally (`01a9a7d`); (3) the CI e2e job's `JWT_SECRET` was under the 32-char minimum |
| 9. Membership (multi-user boards)             | ⏳ open              | Needs product input (invite UX) — see `taskflow/PLAN_FIX_GAPS.md` Phase 5                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
