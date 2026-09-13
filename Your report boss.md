# Senior Full-Stack Evaluation Report

**Candidate submission:** Galaxy of Beauty monorepo

**Requested assessment:** Senior Full-Stack Engineer / “TaskFlow” take-home rubric

**Evaluated revision:** `1519a1efad38` on `master`, plus the connected uncommitted working tree

**Evaluation date:** 10 August 2026

**Evaluator:** Manus AI

> **Assessment principle:** The candidate is credited only for artifacts that were present and behavior that was directly observable. Repository claims were cross-checked against source, local commands, and GitHub workflow history. Missing TaskFlow, code-review, behavioural, and self-reflection artifacts are marked **not demonstrated**, rather than inferred.

## 1. Executive Summary

The submission demonstrates **mid-level engineering capability with several senior-level strengths**, especially in typed backend design, relational modeling, platform breadth, documentation, and awareness of production concerns. However, the current working tree does not pass its root build, the committed revision cannot be installed with a frozen lockfile, the delivery workflows have no successful CI or deployment runs in the inspected history, and material authentication, realtime, and dependency-security defects remain. Testing is meaningful but disproportionately narrow relative to 243 API namespaces, while several README claims contradict direct verification. **I do not recommend hiring this candidate as a senior full-stack engineer on the current submission**, although a narrower and reproducible resubmission could justify reconsideration.

## Assessment Scope and Artifact Compliance

The supplied assessment requested a specific **TaskFlow mini-Kanban application**, a fictional authentication-middleware code review, five written behavioural answers, and a self-critique. The available artifact was instead the Galaxy of Beauty marketplace monorepo, whose README describes a Next.js/Expo/tRPC/PostgreSQL/Redis architecture rather than TaskFlow.[1] [2]

| Requested artifact                                 | Submission status              | Evaluation treatment                                                                                                                                                                                                                                                                                                      |
| -------------------------------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A. TaskFlow project**                            | **Not submitted as specified** | Transferable evidence is credited: a keyboard-enabled sortable grid, JWT/tRPC authentication, Prisma migrations, Redis, Socket.IO, Docker, CI configuration, backend tests, and Playwright tests. No credit is given for the missing board/column/card domain, TaskFlow REST contract, or exact take-home implementation. |
| **B. Fictional PR diff and candidate code review** | **Absent**                     | Code-review thoroughness, tone, and technical accuracy are **not demonstrated**. Repository comments are not a substitute for a submitted review.                                                                                                                                                                         |
| **C. Five behavioural answers**                    | **Absent**                     | Direct behavioural maturity cannot be scored. Only cautious indirect observations from commits, ADRs, documentation, and issue-management practices are included.                                                                                                                                                         |
| **D. Self-reflection**                             | **Absent**                     | The candidate did not identify limitations or improvement priorities for the submitted code.                                                                                                                                                                                                                              |

The codebase itself is substantial: it is a pnpm/Turborepo monorepo containing web, mobile, API, database, shared, UI, and configuration workspaces.[1] [2] The committed API registry exposes 243 top-level namespaces/procedures, and the Prisma schema contains 202 models with extensive indexing and relationship definitions.[3] [4]

## Overall Scoring

| Criterion                             |       Score | Senior bar | Summary                                                                                                                                                 |
| ------------------------------------- | ----------: | ---------: | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Code Quality & Craftsmanship          | **2.5 / 5** |        4.0 | Strong typed foundations, but inconsistent enforcement, large files, widespread unsafe typing, format failure, and a broken current root build.         |
| Full-Stack Architecture               | **3.1 / 5** |        4.0 | Broad and generally well-separated platform architecture, weakened by feature/model sprawl and inconsistent cross-layer contracts.                      |
| Testing & Reliability                 | **2.6 / 5** |        4.0 | Meaningful backend and E2E tests, but limited namespace coverage, environment dependence, brittle expectations, and structurally broken CI E2E startup. |
| DevOps & Infrastructure               | **1.6 / 5** |        4.0 | Many infrastructure artifacts exist, but installation, CI, deployment, and current-root build reliability are below a senior production bar.            |
| Data & Persistence                    | **3.2 / 5** |        4.0 | Thoughtful transactional modeling and indexes, with excessive schema breadth and insufficient database-level invariants.                                |
| Security                              | **1.8 / 5** |        4.0 | Good security primitives are present, but critical session-boundary, CORS, realtime authorization, token, and dependency issues remain.                 |
| Professional Habits & Collaboration   | **2.3 / 5** |        4.0 | Strong documentation and generally descriptive commits; weak review/issue evidence, inaccurate status claims, and a persistently failing mainline.      |
| TaskFlow Artifact Compliance          | **0.8 / 5** |        4.0 | Transferable components exist, but the requested application and contract were not delivered.                                                           |
| Code Review Quality                   | **0.0 / 5** |        4.0 | **Not demonstrated.**                                                                                                                                   |
| Behavioural Answers & Self-Reflection | **0.0 / 5** |        4.0 | **Not demonstrated.**                                                                                                                                   |

The engineering-only average across the seven core technical/professional criteria is **2.4 / 5**. Scores for absent written artifacts are reported separately so that missing responses do not obscure the strengths and weaknesses of the code that was actually available.

## 2. Detailed Assessment

### 2.1 Code Quality & Craftsmanship — 2.5 / 5

**Strengths observed.** The codebase uses TypeScript across the stack, Zod validation at API boundaries, tRPC contracts, Prisma-generated types, structured `TRPCError` handling, environment validation, and reusable UI packages.[5] [6] Core middleware centralizes request counting, rate limiting, CSRF checks, and role enforcement rather than reimplementing these concerns in every router.[5] The connected working tree passed the repository-wide type check across six executing workspaces, and the committed revision also passed type checking after Prisma client generation.

The repository shows awareness of maintainability through workspace separation, shared constants, design-system components, ADRs, API documentation, and a known-issues register.[2] [14] The generic `SortableGrid` uses pointer and keyboard sensors with `sortableKeyboardCoordinates`, which is a positive accessibility-oriented implementation detail and transferable evidence for the requested drag-and-drop task.[15]

**Areas for growth.** The connected working tree introduced a circular package dependency by adding `@galaxy/ui` to `@galaxy/shared` while UI already depends on shared; consequently, `pnpm build` failed before compilation. The configured `pnpm lint` gate runs only `tsc --noEmit` for web and mobile, so it is not an ESLint gate and leaves API, database, shared, UI, and config packages effectively unlinted. `pnpm format:check` failed across many files and eventually hit a parser error because `scripts/k6-load-test.js` contains TypeScript syntax despite its `.js` extension.[16]

The maintainability profile is also concerning at this scale. Static inspection found approximately **1,936 explicit `any` casts or annotations**, **213 ESLint-disable directives**, and several oversized implementation files, including routers of roughly 745–983 lines. The central API registry is 458 lines and imports/mounts hundreds of feature routers in one module.[3] These are not automatically defects, but together they indicate that delivery breadth has outpaced refactoring and enforcement.

**Senior-level expectation gap.** A senior engineer should keep the package dependency graph acyclic, ensure that the checked-out branch has a deterministic green build, and make “lint” mean actual semantic/style linting. They should split oversized routers by cohesive use case, reduce `any` at client/API boundaries, make formatting deterministic, and prevent unformatted or cyclic changes from reaching the main branch through pre-merge checks.

### 2.2 Full-Stack Architecture — 3.1 / 5

**Strengths observed.** The repository has recognizable separation between Next.js web, Expo mobile, tRPC API, Prisma persistence, shared domain assets, reusable UI, and common configuration.[1] [2] PostgreSQL is used for transactional state, Redis for rate limiting/cache/queues, BullMQ for background work, and Socket.IO for realtime updates. Docker Compose describes web, socket, mobile, PostgreSQL, and Redis services with health checks and dependency ordering.[17]

The API applies typed input contracts and role-aware procedures, while the database models bookings, payments, wallets, disputes, audit logs, refresh tokens, notifications, idempotency keys, and localized content.[4] [5] The architecture therefore demonstrates broad full-stack fluency and an ability to connect user-facing flows to persistence, realtime communication, and operational services.

**Areas for growth.** The platform is excessively broad for its demonstrated delivery maturity: 243 top-level API namespaces and 202 models create a large change surface and diffuse ownership.[3] [4] The root registry remains a large integration point, and the schema combines core transactions with a long tail of social, wellness, content, gamification, marketplace, and speculative features. This breadth raises coupling, migration, testing, and operational costs.

The most important cross-layer flaw is the authentication contract. Client code stores access and refresh JWTs in `localStorage`, while Next.js middleware expects a `gob_access` cookie that no tracked login/register flow sets.[7] [8] [9] Some customer pages are absent from the middleware’s protected-path list and have no page-level guard, while other middleware-protected pages can redirect a client that considers itself authenticated. This is an architectural inconsistency, not merely an isolated frontend bug.

The submission also does not satisfy the requested TaskFlow architecture. It exposes tRPC rather than the requested boards/columns/cards REST API and does not provide the requested TaskFlow data model or state-transition design. Transferable capability is visible, but exact design compliance is absent.

**Senior-level expectation gap.** A senior engineer should define bounded contexts, a one-directional package graph, and a single documented session/authentication model that works across SSR, middleware, API calls, sockets, and mobile clients. They should prioritize a smaller number of complete, observable, and well-tested flows over hundreds of shallow feature namespaces, and explicitly document major choices in an ADR before implementation.

### 2.3 Testing & Reliability — 2.6 / 5

**Strengths observed.** On the connected machine, `pnpm --filter @galaxy/api test` passed **24 files and 350 tests**. The test corpus covers contracts, password behavior, CSRF, rate limiting, authentication, booking flows, business logic, resilience, payments, loyalty, and selected feature routers. Chromium Playwright execution completed **56 tests**, with **53 passing**, including security headers, CSRF-cookie creation, RTL rendering, login, wallet, bookings, and navigation. These are meaningful unit/integration/E2E signals rather than a token test suite.

CI configuration also attempts separate jobs for type checks, lint, unit tests, build, E2E, and Docker build, with PostgreSQL and Redis service containers.[10] The project includes Playwright projects for desktop Chromium, desktop Firefox, and mobile Chrome, demonstrating awareness of cross-browser and responsive testing.[18]

**Areas for growth.** The tests do not scale with the feature surface. A deterministic static scan found direct references to only **23 of 243 API namespaces (9.5%)**, leaving approximately 220 without direct namespace-level tests; the project’s own known-issues register independently acknowledges roughly 221 untested routers.[14] There is no configured coverage provider, threshold, or CI coverage artifact.

The backend suite is not hermetic. In a clean clone without the developer’s local database, 12 test files failed and 37 tests were skipped because callers reached `localhost:5433`. Tests should provision and reset their own data or clearly separate pure unit tests from database integration suites. The README instructs users to run `pnpm test`, but the root package has no such script.[1]

The three Chromium failures expose contract drift. AI chat and skin analysis expected unauthenticated redirects, yet neither route is protected by middleware and their dashboard shell performs no authentication check.[8] [19] Marketplace expected a heading that no longer matches the implementation. More seriously, Playwright configuration disables its `webServer` whenever `CI` is set, while the CI workflows never start the application server before invoking Playwright.[10] [18] Thus the E2E job is structurally unable to connect in a normal CI runner.

**Senior-level expectation gap.** A senior submission should include a test pyramid tied to risk: pure unit tests for business rules, isolated repository/service integration tests with deterministic fixtures, contract tests for all critical client/API payloads, and E2E tests for a small set of high-value user journeys. CI should start the application explicitly, publish traces/screenshots, enforce realistic coverage thresholds, and block merges on failures.

### 2.4 DevOps & Infrastructure — 1.6 / 5

**Strengths observed.** The repository includes multi-stage Dockerfiles, development and production Compose definitions, health checks, persistent volumes, PM2 process definitions, Terraform, Prometheus scrape configuration, alert rules, a Grafana dashboard, database backup tooling, and separate CI, production-deploy, and mobile-build workflows.[10] [11] [17] [20] The production workflow attempts verification, E2E tests, schema migration, deployment, and a post-deploy health check.[11]

The committed source can produce a successful full build after an unfrozen dependency install and Prisma generation. The connected web workspace also built 280 routes successfully when invoked directly, and the Compose configuration validates with the installed legacy Compose client.

**Areas for growth.** The delivery system is not operational. The clean committed revision fails `pnpm install --frozen-lockfile` because `apps/mobile/package.json` and `pnpm-lock.yaml` disagree on the Expo version. The connected working tree fails its root build because of the uncommitted shared/UI dependency cycle. GitHub history showed **38 of 38 inspected CI runs failed**, **35 of 35 deployment runs failed**, and **24 of 24 mobile-build runs failed**; the latest CI/deploy failures occurred before installation because the workflow supplies pnpm version `9` while `package.json` also specifies `pnpm@9.15.4`, which `pnpm/action-setup` rejects.[10] [11] [21]

Even after that setup bug is fixed, CI has additional blockers: the frozen lockfile mismatch and the E2E server-start problem described above. The production workflow deploys by SSH, runs `git pull` on the server, rebuilds in place, migrates the database, and reloads PM2.[11] It does not promote an immutable artifact, capture deployment provenance, support a canary/blue-green rollout, or define an automated rollback and migration-recovery strategy.

The production Compose override declares `deploy.replicas: 2` for web, but ordinary Docker Compose does not provide Swarm-style replica orchestration. The Docker production image also runs as the default root user and copies the full monorepo `node_modules` and packages into the runtime image rather than producing a minimal standalone artifact.[20] [22]

**Senior-level expectation gap.** A senior engineer should treat a green, reproducible pipeline as the first production feature. The immediate expectation is one package-manager source of truth, a synchronized lockfile, build/lint/test/security gates that pass from a clean clone, branch protection, immutable image creation, artifact promotion across environments, migration prechecks, health-based rollout, and a tested rollback procedure.

### 2.5 Data & Persistence — 3.2 / 5

**Strengths observed.** Core transactional modeling is one of the strongest parts of the submission. Monetary values use Prisma `Decimal`; booking, payment, and wallet records include idempotency keys; users have unique email/phone constraints; bookings use customer/status/date and technician/status/start composite indexes; token tables index expiry; and audit logs capture target and before/after values.[4] The live connected database reported all eight migration directories applied, and `prisma validate` passed.

The schema also reflects practical marketplace concerns: booking/payment one-to-one relationships, disputes, reviews, payouts, wallet ledgers, availability slots, notification indexes, localization JSON, and cascade behavior.[4] These choices demonstrate relational modeling competence and awareness of transactional integrity and query access patterns.

**Areas for growth.** The 202-model schema is too broad for one persistence boundary and will be difficult to evolve safely. Two initial migrations contain roughly 1,470 and 893 lines respectively, which limits reviewability and rollback confidence. Several explicit indexes duplicate indexes already created by `@unique`, including token, booking-code/idempotency, and payment-booking fields.

Database invariants are incomplete. Fields such as preferred language, notification type/channel, loyalty tier/reason, and several business states are free-form strings rather than enums or constrained reference data. Ratings and non-negative monetary/range rules are not protected by database check constraints. JSON localization is convenient but has no database-level `{ ar, en }` shape guarantee and complicates conventional text indexing/search.

The migration workflow is also inconsistent. Root scripts advertise `db:migrate:status`, but `turbo.json` defines no matching task, so the root command fails.[1] [23] CI E2E uses `prisma db push` rather than applying and validating migrations, which can conceal migration defects.[10]

**Senior-level expectation gap.** A senior engineer should define core versus auxiliary data ownership, split or modularize the schema where appropriate, document index rationale using real query plans, encode critical invariants at the database layer, and test forward migrations against production-like snapshots. Root database commands and CI should exercise the same versioned migration path used in production.

### 2.6 Security — 1.8 / 5

**Strengths observed.** The implementation includes bcrypt password hashing, TOTP two-factor authentication, login-attempt limiting, separate access/refresh secrets, CSRF double-submit verification with constant-time comparison, role-specific tRPC procedures, Zod input validation, request IDs, security headers, Redis-backed rate limits, log-field redaction, audit records, and idempotency keys.[5] [6] [24] The Socket.IO server requires a JWT before accepting a connection, and server CORS is configurable.[13]

These controls show good security awareness. The problem is that several high-impact implementation details undermine the intended model.

| Severity     | Finding                                                         | Evidence and impact                                                                                                                                                                                                                                                                           |
| ------------ | --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Critical** | **Inconsistent web session boundary**                           | Login/register and the shared auth hook store both JWTs in `localStorage`, while Next middleware and server export routes read a `gob_access` cookie that is never set by tracked source.[7] [8] [9] This breaks SSR/middleware authorization coherence and exposes tokens to successful XSS. |
| **High**     | **Credentialed CORS origin reflection**                         | Middleware reflects any non-empty `Origin` on `/api/trpc` while setting `Access-Control-Allow-Credentials: true`, instead of checking the configured allowlist.[8]                                                                                                                            |
| **High**     | **Realtime identity and room-authorization flaws**              | JWT payloads use `id`, but socket code casts the payload to `{ userId, role }`; personal and technician rooms therefore use `undefined`. Any authenticated client may also join an arbitrary `waitlist:<technicianId>` room without authorization.[6] [13]                                    |
| **High**     | **Known vulnerable production dependencies**                    | `pnpm audit --prod` reported **41 vulnerabilities: 24 high, 15 moderate, 2 low**, including multiple advisories affecting Next.js 14.2.35 and Socket.IO parser 4.2.6.[25] [26] No dependency-audit/SAST/container-scan gate exists in CI.[10]                                                 |
| **High**     | **Refresh-token reuse detection is not implemented as claimed** | Rotation revokes the presented token, then `storeRefreshToken` deletes every token for the user before inserting the replacement. This removes revoked-token history and also limits users to one refresh session.[12] The README nevertheless claims reuse detection.[1]                     |
| **Medium**   | **Refresh mutation bypasses the mutation CSRF wrapper**         | `auth.refresh` is a `.mutation()` built from `publicProcedure`, not `publicMutation`, so the centralized CSRF guard is omitted.[5] [12]                                                                                                                                                       |
| **Medium**   | **Anonymous rate limiting is globally contended per path**      | The anonymous key is `anon:${path}` rather than including client identity; all anonymous users share a procedure bucket. Redis absence/errors fail open.[5] [27]                                                                                                                              |
| **Medium**   | **JWT verification constraints are incomplete**                 | Verification uses only the secret and does not constrain issuer, audience, allowed algorithms, or token-use claims.[6]                                                                                                                                                                        |
| **Medium**   | **Development defaults are easy to misuse**                     | Compose provides predictable database and JWT fallback secrets. This is acceptable for disposable local development only, but dangerous if reused in shared staging or production.[17]                                                                                                        |

The CSRF cookie is correctly JavaScript-readable for a double-submit design and uses `SameSite=Strict`, but it lacks the `Secure` flag.[24] The feature-flag middleware also fails open on database errors, which may expose disabled functionality during an outage.[5]

**Senior-level expectation gap.** A senior engineer should choose one explicit web session strategy—preferably a server-issued `HttpOnly`, `Secure`, appropriately scoped cookie or a rigorously justified bearer-token design—and use it consistently across middleware, SSR, API, exports, sockets, and logout. They should enforce a strict CORS allowlist, authorize every room subscription, preserve hashed refresh-token lineage for rotation/reuse detection, constrain JWT claims/algorithms, and make dependency/security scanning a mandatory CI gate. OWASP guidance specifically warns against storing sensitive session identifiers in local storage because JavaScript can access them.[28]

### 2.7 Professional Habits & Collaboration — 2.3 / 5

**Strengths observed.** Documentation is unusually extensive. The repository contains a detailed README, API reference, architecture notes, ADRs, development workflow, deployment guide, launch-readiness material, security hardening notes, testing plans, a component catalog, and a known-issues register.[1] [14] Recent commit subjects are generally scoped and descriptive, using prefixes such as `fix:`, `test:`, `docs:`, and `feat:`.

The known-issues document candidly records test coverage gaps, reduced-motion limitations, seed warnings, and the workaround that disables ESLint during the Next build.[14] That willingness to record debt is a positive professional signal.

**Areas for growth.** The documented status is materially more optimistic than the verified state. The README displays green type-check/lint/build/Docker badges, calls the platform production-ready, documents a nonexistent root `pnpm test` command, reports nine migrations when eight exist, gives inconsistent test totals, and claims refresh-token reuse detection that the implementation does not preserve.[1] [12] [14]

Collaboration evidence is limited. The repository has 43 pull requests, all Dependabot-authored; no human-authored PRs and no GitHub issues were found in the inspected history.[29] [30] Consequently, PR-description quality, review feedback style, issue triage, mentoring language, and negotiation of technical debt are not demonstrated. More importantly, changes have continued to land on `master` while every inspected CI run was failing.[21]

**Senior-level expectation gap.** A senior engineer should maintain trustworthy status documentation, require green protected-branch checks, use human-reviewed PRs for significant changes, and track operational/technical debt in an actionable issue system. They should distinguish “implemented,” “tested,” “deployable,” and “production-ready,” and attach evidence to each claim.

## 3. Code Review Quality

**Result: Not demonstrated (0.0 / 5).** The candidate did not provide the requested fictional authentication-middleware diff or a written senior-review response. Therefore, there is no valid evidence with which to assess review thoroughness, tone, prioritization, security accuracy, or ability to propose concrete improvements.

The source itself contains comments and known-issue notes, but those artifacts do not demonstrate how the candidate reviews another engineer’s pull request. For a complete reassessment, the candidate should submit a review that separates blocking security defects from non-blocking style feedback, explains exploitability and business impact, proposes corrected code, and maintains a respectful coaching tone.

## 4. Behavioural & Habit Analysis

The five requested behavioural answers were not submitted, so **NoSQL selection, product/technical-debt negotiation, monitoring priorities, onboarding practices, and slow-page debugging are not directly assessable**. The repository suggests some positive instincts—ADRs, alert definitions, web-vitals/Sentry dependencies, known-issue documentation, and test planning—but indirect artifacts cannot replace concise, reasoned answers.

Likewise, the requested self-critique is absent. This is a significant gap for a senior assessment because the submission itself contains obvious trade-offs that a strong candidate should identify: uncontrolled feature breadth, a failing delivery pipeline, inconsistent authentication state, insufficient test coverage relative to API surface, and a large dependency-remediation backlog.

| Behavioural dimension          | Available evidence                                            | Assessment                                                                                          |
| ------------------------------ | ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Pragmatic trade-off reasoning  | ADRs and known-issue deferrals                                | **Partially suggested**, but no direct explanation of decision criteria or stakeholder negotiation. |
| Production monitoring mindset  | Prometheus, alert rules, Sentry dependency, monitoring router | **Positive intent**, but process-local metrics and zero successful deploy runs limit confidence.    |
| Onboarding and approachability | README, architecture/API/development docs                     | **Strong documentation signal**, offset by inaccurate commands/status claims.                       |
| Debugging methodology          | Tests, health checks, request counters                        | **Not directly demonstrated**; no browser-to-database debugging narrative was submitted.            |
| Self-awareness                 | Known-issues file                                             | **Partial**, but no candidate-authored self-critique of the submitted solution.                     |

## 5. Final Verdict

### Recommendation: **No — do not hire at Senior Full-Stack level on this submission**

The candidate shows enough breadth and implementation skill to be credible at **mid level**, with pockets of senior capability in database modeling, typed backend construction, platform documentation, and awareness of operational components. The hiring bar is not met because senior engineers must reliably close the loop from architecture to secure implementation, deterministic verification, and repeatable delivery.

The decisive blockers are:

| Blocker                                                                   | Why it matters at senior level                                                                                                    |
| ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Current root build fails; committed frozen install also fails             | The submission cannot be reproduced cleanly from either the connected working tree or the committed baseline.                     |
| CI/deployment history is entirely red                                     | A senior engineer should not represent a system as production-ready while its automated delivery path has no successful evidence. |
| Authentication and realtime boundaries are internally inconsistent        | These are high-impact correctness and confidentiality risks affecting multiple layers.                                            |
| Test coverage is narrow relative to feature breadth                       | Hundreds of API namespaces lack direct coverage, and critical suites depend on uncontrolled local state.                          |
| Twenty-four high dependency findings remain                               | Security maintenance is not integrated into delivery governance.                                                                  |
| TaskFlow, code review, behavioural answers, and self-critique are missing | Major portions of the requested assessment cannot be evaluated.                                                                   |

I would consider the candidate for a **mid-level full-stack role with strong technical guidance**, or invite a focused resubmission before making a senior decision. A resubmission should be deliberately smaller and should prove end-to-end quality rather than adding more features.

## 6. Actionable Improvement Plan

| Priority | Required improvement                                                                                                                                                                                                                                                       | Concrete acceptance evidence                                                                                                                                                                                                                       |
| -------: | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|    **1** | **Restore a reproducible, protected delivery baseline.** Remove the shared/UI cycle, synchronize all manifests and the lockfile, fix root scripts/Turbo tasks, remove duplicate pnpm version configuration, and correct CI E2E startup.                                    | A fresh clone passes `pnpm install --frozen-lockfile`, real lint, format check, type check, unit/integration tests, E2E, build, dependency audit, and container build. The protected default branch shows at least five consecutive green CI runs. |
|    **2** | **Redesign authentication and realtime authorization.** Adopt one session model across middleware, SSR, tRPC, exports, mobile, and sockets; fix `id`/`userId`; authorize room joins; preserve hashed refresh-token lineage; constrain JWT claims; and enforce strict CORS. | Threat-model/ADR, security-focused integration tests, cookie/header tests, socket-room authorization tests, token-reuse tests, and no sensitive tokens in web `localStorage`.                                                                      |
|    **3** | **Make testing risk-based and hermetic.** Introduce isolated database fixtures/transactions or test containers, separate unit and integration suites, add contract coverage for critical domains, and remove stale/brittle UI expectations.                                | Coverage thresholds for critical services, deterministic tests from a clean environment, migration tests, and passing Chromium/Firefox/mobile E2E artifacts with traces on failure.                                                                |
|    **4** | **Reduce architecture and data sprawl.** Freeze speculative feature expansion, identify core bounded contexts, split oversized routers, remove unsafe `any`, tighten database constraints, and validate index choices using real query plans.                              | Published context map, dependency rules enforced in CI, smaller modules with clear ownership, reduced unsafe-cast count, and documented database invariants/index rationale.                                                                       |
|    **5** | **Complete the actual assessment and collaboration evidence.** Submit TaskFlow as specified, the fictional middleware review, all five behavioural answers, and a candid self-critique through a human-authored PR.                                                        | A concise PR with architecture rationale, setup instructions, tests, review comments prioritized by severity, behavioural answers, known limitations, and a 30/60/90-day improvement plan.                                                         |

## Verification Ledger

The following checks were executed against the connected working tree unless marked “clean clone.” No source code was changed by the evaluation.

| Verification                                                | Observed result                                                                                           |
| ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Git working tree                                            | Modified manifests/config/lockfile, four deleted tracked reports/plans, and untracked `.history` content. |
| Type check                                                  | **Pass:** 6/6 executed tasks; circular shared/UI dependency warning.                                      |
| Configured lint                                             | **Pass but inadequate:** only web/mobile `tsc --noEmit`; no actual ESLint execution.                      |
| Backend tests                                               | **Pass:** 24 files, 350 tests.                                                                            |
| Root build                                                  | **Fail:** Turborepo cyclic dependency between shared and UI.                                              |
| Targeted web build                                          | **Pass:** 280 routes; Next explicitly skipped type validation and linting during build.                   |
| Chromium E2E                                                | **Partial:** 53/56 passed; three failures caused by auth-protection and UI-copy drift.                    |
| Root documented test command                                | **Fail:** no `test` script.                                                                               |
| Format check                                                | **Fail:** many files plus parser error in TypeScript-syntax `.js` load-test script.                       |
| Root migration-status command                               | **Fail:** missing Turbo task.                                                                             |
| Direct migration status                                     | **Pass:** eight migrations; local DB current.                                                             |
| Prisma validation                                           | **Pass.**                                                                                                 |
| Compose validation                                          | **Pass** with installed legacy client.                                                                    |
| Clean frozen install                                        | **Fail:** mobile manifest/lockfile Expo mismatch.                                                         |
| Clean type check after unfrozen install + Prisma generation | **Pass:** 6/6.                                                                                            |
| Clean build after unfrozen install + Prisma generation      | **Pass:** 6/6, with output-declaration warnings.                                                          |
| Clean backend tests without local DB                        | **Fail/partial:** 12 files failed, 12 passed; 34 failed, 279 passed, 37 skipped.                          |
| Production dependency audit                                 | **Fail:** 41 findings, including 24 high.                                                                 |
| GitHub workflow history inspected                           | CI 0/38 success; deploy 0/35; mobile 0/24; Dependabot 3/3.                                                |

## References

[1]: https://github.com/saeedmoh4444/galaxy-of-beauty/blob/1519a1efad38/README.md 'Galaxy of Beauty README'
[2]: https://github.com/saeedmoh4444/galaxy-of-beauty/tree/1519a1efad38 'Galaxy of Beauty repository at evaluated revision'
[3]: https://github.com/saeedmoh4444/galaxy-of-beauty/blob/1519a1efad38/packages/api/src/routers/index.ts#L148-L458 'API router composition'
[4]: https://github.com/saeedmoh4444/galaxy-of-beauty/blob/1519a1efad38/packages/db/prisma/schema.prisma 'Prisma database schema'
[5]: https://github.com/saeedmoh4444/galaxy-of-beauty/blob/1519a1efad38/packages/api/src/trpc.ts 'tRPC middleware and procedure definitions'
[6]: https://github.com/saeedmoh4444/galaxy-of-beauty/blob/1519a1efad38/packages/api/src/lib/jwt.ts 'JWT implementation'
[7]: https://github.com/saeedmoh4444/galaxy-of-beauty/blob/1519a1efad38/apps/web/src/app/%28auth%29/login/page.tsx#L22-L35 'Web login token storage'
[8]: https://github.com/saeedmoh4444/galaxy-of-beauty/blob/1519a1efad38/apps/web/src/middleware.ts 'Next.js middleware'
[9]: https://github.com/saeedmoh4444/galaxy-of-beauty/blob/1519a1efad38/packages/ui/src/hooks/useAuth.ts 'Shared authentication hook'
[10]: https://github.com/saeedmoh4444/galaxy-of-beauty/blob/1519a1efad38/.github/workflows/ci.yml 'Continuous-integration workflow'
[11]: https://github.com/saeedmoh4444/galaxy-of-beauty/blob/1519a1efad38/.github/workflows/deploy-production.yml 'Production deployment workflow'
[12]: https://github.com/saeedmoh4444/galaxy-of-beauty/blob/1519a1efad38/packages/api/src/routers/auth.ts#L69-L80 'Refresh-token storage helper'
[13]: https://github.com/saeedmoh4444/galaxy-of-beauty/blob/1519a1efad38/packages/api/src/socket/index.ts#L44-L101 'Socket.IO authentication and room subscriptions'
[14]: https://github.com/saeedmoh4444/galaxy-of-beauty/blob/1519a1efad38/docs/KNOWN_ISSUES.md 'Known issues register'
[15]: https://github.com/saeedmoh4444/galaxy-of-beauty/blob/1519a1efad38/apps/web/src/components/SortableGrid.tsx 'Keyboard-enabled sortable grid'
[16]: https://github.com/saeedmoh4444/galaxy-of-beauty/blob/1519a1efad38/scripts/k6-load-test.js#L50-L165 'Load-test script with TypeScript syntax in JavaScript file'
[17]: https://github.com/saeedmoh4444/galaxy-of-beauty/blob/1519a1efad38/docker-compose.yml 'Development/staging Compose topology'
[18]: https://github.com/saeedmoh4444/galaxy-of-beauty/blob/1519a1efad38/apps/web/playwright.config.ts 'Playwright configuration'
[19]: https://github.com/saeedmoh4444/galaxy-of-beauty/blob/1519a1efad38/apps/web/src/components/layout/DashboardLayout.tsx#L113-L181 'Dashboard shell without authentication guard'
[20]: https://github.com/saeedmoh4444/galaxy-of-beauty/tree/1519a1efad38/deploy 'Deployment and monitoring assets'
[21]: https://github.com/saeedmoh4444/galaxy-of-beauty/actions 'GitHub Actions run history'
[22]: https://github.com/saeedmoh4444/galaxy-of-beauty/blob/1519a1efad38/apps/web/Dockerfile 'Web Dockerfile'
[23]: https://github.com/saeedmoh4444/galaxy-of-beauty/blob/1519a1efad38/turbo.json 'Turborepo task configuration'
[24]: https://github.com/saeedmoh4444/galaxy-of-beauty/blob/1519a1efad38/packages/api/src/lib/csrf.ts 'CSRF token and cookie implementation'
[25]: https://github.com/advisories/GHSA-h25m-26qc-wcjf 'GitHub Advisory: Next.js request deserialization denial of service'
[26]: https://github.com/advisories/GHSA-2m8v-j782-fhvr 'GitHub Advisory: Socket.IO parser memory exhaustion'
[27]: https://github.com/saeedmoh4444/galaxy-of-beauty/blob/1519a1efad38/packages/api/src/lib/rateLimit.ts 'Rate-limit implementation'
[28]: https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html#storage-apis 'OWASP HTML5 Security Cheat Sheet — Storage APIs'
[29]: https://github.com/saeedmoh4444/galaxy-of-beauty/pulls?q=is%3Apr 'Repository pull-request history'
[30]: https://github.com/saeedmoh4444/galaxy-of-beauty/issues?q=is%3Aissue 'Repository issue history'
