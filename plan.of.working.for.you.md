# Galaxy of Beauty — Complete Remediation and Implementation Plan

**File:** `plan.of.working.for.you.md`

**Prepared for:** Galaxy of Beauty

**Prepared by:** Manus AI

**Date:** 11 August 2026

**Source assessment:** [`Your report boss.md`](./Your%20report%20boss.md)

> **Primary objective:** Convert the current broad but unreliable implementation into a secure, reproducible, tested, deployable, and professionally governed platform, then complete every missing assessment artifact. The order in this document is mandatory because later work depends on a trustworthy baseline.

## 1. Executive Direction

The platform should enter a temporary **stabilization freeze**. Do not add product features until the repository installs from a fresh clone, all mandatory CI gates pass, the web authentication model is coherent, Socket.IO authorization is correct, and known critical/high production vulnerabilities are either removed or formally accepted with compensating controls. The evaluation found a failed current root build, a stale committed lockfile, entirely failing inspected CI/deployment history, authentication and realtime defects, 24 high dependency findings, and direct test references for only about 23 of 243 API namespaces.[1]

This plan is organized as a sequence of small, reviewable pull requests rather than one large rewrite. It deliberately preserves working product behavior while replacing fragile boundaries and creating evidence for every claim. A single engineer should treat the timeline as approximately **12–16 focused weeks**; two engineers working in parallel after the baseline is green can shorten it to approximately **8–12 weeks**. These are planning ranges, not deadlines.

## 2. Non-Negotiable Working Rules

| Rule                                      | Required practice                                                                                                                                                                         |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Protect existing work                     | Never use `git reset --hard`, `git clean -fd`, or overwrite uncommitted files without an explicit backup and review. The current working tree contains intentional and uncertain changes. |
| One objective per PR                      | Each pull request must have one primary outcome, an issue link, verification commands, risk notes, rollback notes, and screenshots/traces when applicable.                                |
| No feature expansion during stabilization | New product features remain frozen through Phase 6. Only defect fixes, tests, security, build, infrastructure, and documentation accuracy work are allowed.                               |
| Clean-clone evidence                      | A change is not complete because it works on the existing machine. It must work from a fresh clone with a frozen lockfile and provisioned test dependencies.                              |
| Protect the default branch                | `master` must require an approved PR and passing mandatory checks. Direct pushes are disabled after the first green pipeline.                                                             |
| Security by explicit design               | Authentication, CORS, CSRF, JWT, rate limiting, and realtime authorization decisions require an ADR and tests.                                                                            |
| Migrations over schema push               | Shared/staging/production environments use versioned Prisma migrations. `prisma db push` is limited to disposable local experiments.                                                      |
| Evidence before status claims             | README badges and “production-ready” language must reflect actual automated results, not manual assertions.                                                                               |
| No hidden debt                            | Deferred findings receive an issue, owner, severity, target milestone, and compensating control.                                                                                          |

## 3. Target End State

The program is complete only when the following outcomes are simultaneously true.

| Area                    | Target outcome                                                                                                                                              |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Repository              | A fresh clone with Node 20 and pnpm 9.15.4 installs using `pnpm install --frozen-lockfile`; the package graph is acyclic.                                   |
| Quality                 | Real ESLint, Prettier, TypeScript, dependency-boundary checks, and schema validation run at the root and in CI.                                             |
| Security                | Web sessions are server-issued and coherent across middleware, SSR, tRPC, exports, logout, and Socket.IO; no sensitive web tokens remain in `localStorage`. |
| Reliability             | Unit, integration, migration, contract, and E2E suites are hermetic and repeatable; Chromium, Firefox, and mobile Chrome pass in CI.                        |
| Dependencies            | No known critical/high production vulnerabilities remain without a time-bounded exception approved in the repository.                                       |
| Data                    | Critical financial, booking, identity, and authorization invariants are enforced by schema/migrations and tested.                                           |
| Delivery                | CI builds immutable artifacts; staging deployment, smoke tests, promotion, health-based rollout, and rollback are automated.                                |
| Operations              | Metrics are aggregated, logs are structured/redacted, alerts have owners/runbooks, and restore/rollback drills are documented.                              |
| Collaboration           | Human-authored PRs, issue tracking, branch protection, CODEOWNERS, review templates, and accurate documentation are standard.                               |
| Missing assessment work | TaskFlow, the requested code review, five behavioural answers, and self-critique exist as a focused, reproducible submission.                               |

## 4. Roadmap Overview

|                                                      Phase | Priority |    Indicative duration | Required exit gate                                                                      |
| ---------------------------------------------------------: | -------- | ---------------------: | --------------------------------------------------------------------------------------- |
|                      0. Preserve and classify current work | P0       |              0.5–1 day | Every dirty-tree change is backed up and classified.                                    |
|               1. Restore deterministic repository baseline | P0       |               2–4 days | Fresh frozen install, type-check, real lint, format, and root build pass.               |
|                        2. Restore CI and branch protection | P0       |               2–4 days | At least three consecutive green CI runs on PRs.                                        |
|            3. Redesign authentication/session architecture | P0       |               4–7 days | One documented and tested session model replaces the split cookie/localStorage model.   |
|                              4. Harden security boundaries | P0       |               3–5 days | CORS, JWT, CSRF, rate limiting, feature flags, and secrets meet explicit policy tests.  |
|               5. Repair realtime correctness/authorization | P0       |               2–4 days | Correct socket identity and authorized room membership are proven by integration tests. |
|                       6. Remediate production dependencies | P0       |               3–6 days | No unaccepted critical/high production audit finding remains.                           |
|                      7. Make tests hermetic and risk-based | P1       |              1–2 weeks | Clean-environment suites pass with coverage thresholds and E2E artifacts.               |
|                   8. Harden database schema and migrations | P1       |              1–2 weeks | Forward/rollback migration tests and critical database constraints pass.                |
|               9. Reduce architecture and code-quality debt | P1/P2    | 2–4 weeks, incremental | Package boundaries, module-size goals, and unsafe-typing budgets are enforced.          |
| 10. Complete frontend i18n, accessibility, and performance | P1/P2    |              1–2 weeks | Arabic/English semantics, WCAG checks, mobile navigation, and budgets pass.             |
|                 11. Modernize observability and deployment | P1       |              1–2 weeks | Immutable staging deployment and rollback drill succeed.                                |
|     12. Correct documentation and collaboration governance | P1       | 2–4 days, then ongoing | Documentation matches automation; PR/issue governance is active.                        |
|        13. Complete missing TaskFlow and written artifacts | P2       |              1–2 weeks | All requested take-home artifacts are present and reproducible.                         |

## 5. Phase 0 — Preserve and Classify the Current Working Tree

### Objective

Create a recoverable baseline before changing manifests, lockfiles, deleted reports, Storybook files, environment examples, or `.history` content. The current tree contains modified package files, deleted tracked documents, untracked history content, and the evaluation report.[1]

### Tasks

| ID      | Implementation task                                                                                                                                                                                            | Verification / acceptance                                                                          |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| GOV-001 | Create a timestamped patch of tracked changes with `git diff --binary` and separately list untracked files. Store the backup outside the repository and do not commit secret-bearing history files.            | Patch exists, can be inspected, and has a checksum. `git status --short` is captured in the issue. |
| GOV-002 | Create a working branch such as `remediation/stabilization-baseline`. Do not mix remediation with unrelated product work.                                                                                      | Branch points to current `master`; no files are lost.                                              |
| GOV-003 | Classify every changed/deleted file as **keep**, **revert**, **recreate**, or **exclude**. Review `.env.example`, all package manifests, Storybook changes, lockfile changes, deleted reports, and `.history`. | A table in the PR description records the decision for every path.                                 |
| GOV-004 | Add `.history/`, generated reports, Playwright output, and local audit artifacts to `.gitignore` where appropriate. Do not ignore required source documentation.                                               | `git status` no longer lists local/generated artifacts after intentional cleanup.                  |
| GOV-005 | Scan the current working tree and Git history for credentials before pushing. Rotate any real credential discovered in tracked or history files.                                                               | Secret scan returns no unapproved findings; rotation evidence is recorded without exposing values. |

### Exit gate

Phase 0 ends only when all current work is recoverable, no secret is at risk of being committed, and remediation can proceed on an isolated branch.

## 6. Phase 1 — Restore a Deterministic Repository Baseline

### Objective

Make the repository reproducible before touching product architecture. The evaluated tree had a shared/UI package cycle, the committed mobile manifest and lockfile disagreed, root scripts were incomplete, and formatting failed.[1]

### Tasks

| ID       | Files / area                                               | Implementation task                                                                                                                                                                 | Acceptance evidence                                                                                                          |
| -------- | ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| BASE-001 | `packages/shared/package.json`, `packages/ui/package.json` | Restore a one-way dependency: UI may depend on shared; shared must not depend on UI. Move Storybook stories that require UI into the UI workspace or a dedicated Storybook app.     | `pnpm build` reports no cycle; add a dependency-graph test.                                                                  |
| BASE-002 | All `package.json`, `pnpm-lock.yaml`                       | Choose the intended Expo version, align every manifest, then regenerate the lockfile once. Do not hand-edit the lockfile.                                                           | Fresh clone passes `pnpm install --frozen-lockfile`.                                                                         |
| BASE-003 | Root `package.json`, workspace manifests                   | Add root scripts for `test`, `test:unit`, `test:integration`, `test:e2e`, `lint`, `format:check`, `db:migrate:status`, `db:validate`, `audit:prod`, and `verify`.                   | Every documented root command exists and has a single clear purpose.                                                         |
| BASE-004 | `turbo.json`                                               | Add missing migration tasks, correct task outputs, and ensure build/test dependencies reflect generated Prisma artifacts. Remove misleading outputs for tasks that only type-check. | Turbo shows no missing-task or no-output warning for configured tasks.                                                       |
| BASE-005 | ESLint configs and workspace scripts                       | Replace “lint equals TypeScript” with actual ESLint. Keep `type-check` separate. Cover web, mobile, API, DB helpers, shared, UI, and scripts.                                       | `pnpm lint` runs ESLint in all code-bearing workspaces and returns zero errors.                                              |
| BASE-006 | Prettier config and scripts                                | Rename `scripts/k6-load-test.js` to `.ts` and configure a TypeScript-capable k6 build, or remove TS syntax and keep `.js`. Format the repository in a dedicated mechanical PR.      | `pnpm format:check` passes from a fresh clone.                                                                               |
| BASE-007 | Next.js config                                             | Remove `eslint.ignoreDuringBuilds` after lint errors are fixed. Keep build-time type validation enabled unless an explicit CI dependency guarantees it.                             | Build no longer reports skipped lint/type validation, or the PR documents an enforced earlier gate with failure propagation. |
| BASE-008 | Root verification script                                   | Create `pnpm verify` to run formatting, lint, type-check, schema validation, tests, build, and production audit in a deterministic order.                                           | `pnpm verify` passes locally and is the CI entry point.                                                                      |
| BASE-009 | Toolchain                                                  | Add `.node-version` or `.nvmrc`, retain one exact `packageManager` declaration, and document Corepack setup.                                                                        | Local and CI use the same Node/pnpm versions.                                                                                |

### Exit gate

A newly created clean directory must pass the following sequence without manual edits:

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm format:check
pnpm lint
pnpm type-check
pnpm db:validate
pnpm test:unit
pnpm build
```

## 7. Phase 2 — Restore CI and Protect the Default Branch

### Objective

Turn GitHub Actions from a permanently red signal into the authoritative merge gate. The inspected history contained 38/38 failed CI runs and 35/35 failed deployment runs.[1] [2]

### Tasks

| ID     | Implementation task                                                                                                                                                                         | Acceptance evidence                                             |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| CI-001 | Remove the duplicate pnpm version from workflow configuration or from `packageManager`; retain exactly one source of truth. Pin action versions to reviewed major or commit revisions.      | Setup completes on GitHub-hosted runners.                       |
| CI-002 | Consolidate repeated checkout/Node/pnpm/install steps through a composite action or reusable workflow.                                                                                      | CI files are shorter and version changes occur once.            |
| CI-003 | Add jobs for frozen install, format, ESLint, type-check, Prisma validate/migration check, unit tests, integration tests, build, E2E, dependency audit, secret scan, and container scan.     | Every job produces a clear status and relevant artifact.        |
| CI-004 | Give E2E an explicit application lifecycle. Either enable Playwright `webServer` in CI or start `next start` in the workflow and wait on `/api/trpc/health`.                                | CI E2E never depends on an external pre-existing server.        |
| CI-005 | Cache pnpm store and appropriate build caches, but never cache generated state that can hide a broken clean build.                                                                          | Cold and warm runs both pass.                                   |
| CI-006 | Upload Vitest coverage, Playwright HTML report, traces/screenshots on failure, audit output, and container-scan output.                                                                     | Failed runs are diagnosable without reproducing locally.        |
| CI-007 | Configure branch protection for `master`: PR required, one approval minimum, stale approval dismissal, code-owner review for sensitive areas, conversation resolution, and required checks. | Direct push is rejected; merge is impossible while checks fail. |
| CI-008 | Add concurrency cancellation for superseded PR runs, while production deployment remains non-cancelable after promotion begins.                                                             | Redundant PR runs are cancelled safely.                         |
| CI-009 | Separate CI from deployment. A failed verify job must never trigger deployment.                                                                                                             | Deployment consumes only a verified artifact digest.            |

### Exit gate

Merge three small PRs through the protected workflow and produce **three consecutive fully green CI runs** before beginning the session redesign.

## 8. Phase 3 — Redesign Authentication and Session Architecture

### Objective

Replace the conflicting client/localStorage and middleware/cookie models with one explicit session architecture. Current login code stores access and refresh JWTs in `localStorage`, while middleware checks a cookie that the login flow does not set.[3] [4] [5]

### Required architecture decision

Create `docs/adr/006-web-session-model.md` and select the following target unless a documented constraint requires another design:

| Client    | Access credential                                                                                                  | Refresh credential                                                                              | Storage policy                                                                                          |
| --------- | ------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Web       | Short-lived session/access token in a server-issued `HttpOnly`, `Secure`, `SameSite=Lax` or `Strict` cookie        | Rotating opaque token or refresh JWT in a separate `HttpOnly`, `Secure` cookie with narrow path | No access or refresh token in `localStorage`; client state stores only non-sensitive user display data. |
| Mobile    | Access token in memory                                                                                             | Refresh credential in Expo SecureStore/OS keychain                                              | Never AsyncStorage for sensitive tokens.                                                                |
| Socket.IO | Short-lived access token obtained through an authenticated bootstrap or cookie-authenticated same-origin handshake | Never send refresh token to Socket.IO                                                           | Reauthenticate before expiry/reconnect.                                                                 |

### Tasks

| ID       | Implementation task                                                                                                                                                                                    | Acceptance evidence                                                                              |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| AUTH-001 | Document session lifecycle: login, refresh, rotation, logout, password change, account suspension, concurrent devices, stolen-token reuse, and expiry.                                                 | ADR reviewed before implementation.                                                              |
| AUTH-002 | Add server-owned login/refresh/logout endpoints that set/rotate/clear secure cookies. Do not return web refresh credentials to JavaScript.                                                             | Browser devtools show no sensitive token accessible through `document.cookie` or `localStorage`. |
| AUTH-003 | Refactor `useAuth` so it calls `/me` to hydrate state and no longer persists JWTs. Keep a mobile-specific storage adapter using SecureStore.                                                           | Reload, SSR navigation, middleware routing, and logout agree on authentication state.            |
| AUTH-004 | Make middleware validate the same session mechanism used by API routes. Replace the manually maintained protected-prefix list with route groups or centrally generated policy metadata where feasible. | Every customer/technician/admin route has an explicit policy test.                               |
| AUTH-005 | Update tRPC context to derive identity from the chosen cookie/session on web and bearer token on trusted mobile clients.                                                                               | API integration tests cover both transport types.                                                |
| AUTH-006 | Update export/download routes to use the same server session, not an unrelated cookie assumption.                                                                                                      | Authorized export succeeds; unauthorized and cross-user export fail.                             |
| AUTH-007 | Hash stored refresh credentials, add token family/session/device identifiers, preserve revoked-token lineage, and detect reuse. Do not delete the evidence immediately during rotation.                | Reuse of an old refresh credential revokes the token family and creates an audit event.          |
| AUTH-008 | Support multiple sessions per user with a session-management UI/API unless the product explicitly chooses one-device-only behavior.                                                                    | User can list and revoke individual sessions; “revoke all” is separate.                          |
| AUTH-009 | Invalidate sessions on password reset, sensitive email/phone changes, account suspension, and administrator action.                                                                                    | Integration tests prove invalidation.                                                            |
| AUTH-010 | Add cookie flags and production assertions: `Secure`, `HttpOnly` where applicable, correct `SameSite`, narrow `Path`, and explicit expiry.                                                             | Startup fails in production when cookie/security configuration is unsafe.                        |

### Required tests

| Test class          | Scenarios                                                                                                                                       |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Browser integration | Login, reload, SSR navigation, protected-route redirect, role mismatch, refresh, logout, expired access credential, revoked refresh credential. |
| Security            | XSS cannot read tokens; CSRF is blocked; fixation fails; stolen refresh reuse revokes family; suspended user cannot refresh.                    |
| Mobile              | SecureStore hydration, refresh, logout, reinstall/credential loss, expired token, device-session revocation.                                    |
| Contract            | `/me`, login, refresh, logout, and session-list schemas are stable and typed.                                                                   |

### Exit gate

No sensitive web token remains in `localStorage`; middleware, SSR, tRPC, exports, and browser E2E share one consistent session model.

## 9. Phase 4 — Harden Security Boundaries

### Objective

Close the remaining cross-cutting security defects after the session model is stable.

### Tasks

| ID      | Area           | Implementation task                                                                                                                                                                                       | Acceptance evidence                                                                                                       |
| ------- | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| SEC-001 | CORS           | Replace origin reflection with an exact allowlist parsed from validated environment configuration. Reject missing/unapproved origins for credentialed cross-origin requests.                              | Integration tests cover allowed, disallowed, `null`, and spoofed origins.                                                 |
| SEC-002 | JWT            | Pin allowed algorithms; require issuer, audience, subject, token type, `jti`, issued-at, and expiry. Use separate keys/claims for access and refresh.                                                     | Tampered, wrong-audience, wrong-issuer, wrong-type, and algorithm-confusion tests fail safely.                            |
| SEC-003 | CSRF           | Route every state-changing web operation through a CSRF-protected mutation path, including refresh if cookie-authenticated. Ensure the CSRF cookie uses `Secure` in production.                           | Mutation inventory has no unprotected cookie-authenticated state change.                                                  |
| SEC-004 | Rate limiting  | Key anonymous limits by trusted client identity (IP after proxy normalization plus route, or a privacy-preserving derived key), user limits by user/session, and sensitive flows by account plus network. | Load/integration tests prove one user cannot exhaust the global anonymous bucket.                                         |
| SEC-005 | Failure policy | Define fail-closed versus fail-open behavior per control. Authentication, authorization, and disabled feature flags should fail closed; low-risk public availability controls may degrade with alerts.    | Redis/DB failure tests assert the intended policy and emit telemetry.                                                     |
| SEC-006 | Secrets        | Remove predictable non-local fallbacks, validate secret length/entropy at production startup, and use environment/secret-manager injection.                                                               | Production config cannot start with default development secrets.                                                          |
| SEC-007 | Headers/CSP    | Add a nonce/hash-based Content Security Policy, `frame-ancestors`, `object-src 'none'`, and a report-only rollout before enforcement.                                                                     | Playwright verifies headers and core flows under enforced CSP.                                                            |
| SEC-008 | Uploads        | Validate MIME by content, limit size, generate server-side names, scan files, isolate storage origin, and use expiring signed URLs.                                                                       | Malicious-extension, oversized, path-traversal, and polyglot tests fail.                                                  |
| SEC-009 | Authorization  | Add resource-ownership checks for every identifier-based procedure, not only role checks.                                                                                                                 | Cross-user access matrix is tested for bookings, wallets, reviews, disputes, uploads, chat, and saved payment references. |
| SEC-010 | Auditability   | Emit structured security audit events for login failure/lockout, token reuse, role changes, session revocation, KYC, payout, refund, and administrative access.                                           | Events include actor, target, request ID, outcome, and timestamp without secrets.                                         |

### Exit gate

A documented threat model and automated security suite cover identity, authorization, CSRF, CORS, JWT, rate limiting, uploads, and critical audit events.

## 10. Phase 5 — Repair Realtime Correctness and Authorization

### Objective

Correct the `id`/`userId` mismatch and prevent arbitrary room subscriptions. The current Socket.IO code verifies a payload with `id`, casts it to a shape with `userId`, and permits any authenticated user to join a requested waitlist room.[6]

### Tasks

| ID     | Implementation task                                                                                                                                                                                                                                                    | Acceptance evidence                                                       |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| RT-001 | Define one `AuthenticatedSocketData` type derived directly from the verified access-token payload. Store it in `socket.data.user`; remove unsafe casts.                                                                                                                | Personal rooms are `user:<actual-id>`, never `user:undefined`.            |
| RT-002 | Authorize each room type server-side. Personal room comes from identity; technician room requires technician mapping; admin room requires admin role; waitlist room requires the relevant customer/technician relationship or a deliberately public aggregate channel. | Negative tests prove arbitrary room joins fail.                           |
| RT-003 | Validate event payloads with Zod and cap payload size/frequency.                                                                                                                                                                                                       | Malformed, oversized, and spam events are rejected and measured.          |
| RT-004 | Design reconnect/token-expiry behavior. Revalidate on reconnect and disconnect or reauthenticate expired sessions.                                                                                                                                                     | Integration test advances time through token expiry.                      |
| RT-005 | Add Redis adapter when multiple socket instances are used so rooms/events work across processes.                                                                                                                                                                       | Two-instance integration test delivers an event across instances.         |
| RT-006 | Add acknowledgement/error contracts and structured logs with request/correlation IDs.                                                                                                                                                                                  | Client can distinguish authorization, validation, and transient failures. |

### Exit gate

Socket integration tests prove correct identity, role/ownership authorization, multi-instance delivery, expiry handling, and denial of unauthorized subscriptions.

## 11. Phase 6 — Remediate Dependencies and Supply-Chain Risk

### Objective

Eliminate the 24 high production findings recorded during evaluation and make recurrence visible before merge.[1]

### Tasks

| ID      | Implementation task                                                                                                                                                                       | Acceptance evidence                                                                          |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| DEP-001 | Export current audit results into issues grouped by direct dependency and exploit path. Prioritize Next.js and Socket.IO parser findings.                                                 | Every critical/high finding has an owner and resolution path.                                |
| DEP-002 | Upgrade within compatible releases first, then perform planned major upgrades in isolated PRs. Do not merge Dependabot major bumps without migration/testing.                             | Frozen install and full verification pass after each upgrade.                                |
| DEP-003 | Upgrade Next.js to a supported patched line, following official migration guidance and validating middleware, App Router, caching, images, server actions, Sentry, and tRPC integrations. | No evaluated Next.js high advisory remains.                                                  |
| DEP-004 | Upgrade Socket.IO/client/parser together and rerun realtime authorization/load tests.                                                                                                     | No Socket.IO high advisory remains.                                                          |
| DEP-005 | Resolve Expo/React Native peer conflicts as one compatibility matrix rather than independent version bumps.                                                                               | `expo doctor`, mobile type-check, export/build, and smoke tests pass.                        |
| DEP-006 | Add `pnpm audit --prod`, dependency review, secret scanning, SBOM generation, license review, and container scanning to CI.                                                               | CI blocks new unaccepted critical/high findings.                                             |
| DEP-007 | Create `SECURITY.md`, vulnerability intake instructions, supported-version policy, and time-bounded exception template.                                                                   | Security exception includes CVE/advisory, exposure, compensating control, owner, and expiry. |
| DEP-008 | Review all open Dependabot PRs; close obsolete/conflicting PRs and merge only verified groups.                                                                                            | Dependency backlog reflects intentional decisions.                                           |

### Exit gate

The production dependency tree has no known critical/high finding without an approved, expiring exception and compensating control.

## 12. Phase 7 — Make Testing Hermetic, Risk-Based, and Measurable

### Objective

Make tests independent of the developer’s local database and concentrate coverage on business risk rather than raw feature count.

### Test architecture

| Suite           | Purpose                                                            | Dependency strategy                                                                  | CI frequency                                                                                     |
| --------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| Unit            | Pure domain rules, validators, calculations, token helpers         | No network/DB; deterministic clock/IDs                                               | Every push                                                                                       |
| Integration     | Prisma repositories, tRPC procedures, Redis limits/queues, sockets | Ephemeral PostgreSQL/Redis; migrations applied; transaction or schema reset per test | Every PR                                                                                         |
| Contract        | Frontend/backend payload compatibility and error shapes            | Generated router types plus explicit schema assertions                               | Every PR                                                                                         |
| Migration       | Forward migration, rollback/restore, seed compatibility            | Disposable database restored from representative snapshot                            | Every migration PR                                                                               |
| E2E             | Critical user journeys                                             | Built app plus ephemeral services and deterministic seed                             | Every PR for Chromium; scheduled Firefox/mobile if runtime is high, then required before release |
| Load/resilience | Rate limits, concurrency, queue retry, degraded dependencies       | Staging-like environment                                                             | Nightly and before release                                                                       |

### Tasks

| ID       | Implementation task                                                                                                                                                                                                                | Acceptance evidence                                                                           |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| TEST-001 | Add a test-environment launcher using CI service containers or Testcontainers. Apply Prisma migrations, not `db push`.                                                                                                             | Tests pass on a machine with no pre-existing DB/Redis.                                        |
| TEST-002 | Split unit and integration configuration. Remove conditional tests that silently accept either Redis availability or fail-open behavior.                                                                                           | Each suite has deterministic expectations.                                                    |
| TEST-003 | Add factories/builders for users, technicians, services, slots, bookings, payments, wallets, sessions, and permissions.                                                                                                            | Tests do not rely on global seed IDs or execution order.                                      |
| TEST-004 | Use database transaction rollback, isolated schema, or explicit cleanup for every integration test.                                                                                                                                | Reordering/parallelizing tests does not change results.                                       |
| TEST-005 | Add Vitest coverage and initial thresholds focused on critical domains: statements/lines 80%, branches 70%, and 90%+ for auth/payment/wallet transition services. Ratchet upward; do not use coverage as the only quality measure. | CI publishes coverage and blocks regression.                                                  |
| TEST-006 | Create an API risk matrix. Tier 1 includes auth, sessions, users, bookings, slots, payments, wallet, payouts, disputes, uploads, admin permissions, notifications, and Socket.IO.                                                  | Tier 1 has success, validation, authorization, conflict, idempotency, and failure-path tests. |
| TEST-007 | Repair stale Playwright expectations for AI chat, skin analysis, and marketplace according to the new route policy and current UI contracts.                                                                                       | Tests verify intended policy, not obsolete copy.                                              |
| TEST-008 | Start the app explicitly in CI, wait for health, run Chromium/Firefox/mobile Chrome, and upload traces/screenshots on failure.                                                                                                     | All configured browser projects pass from a clean environment.                                |
| TEST-009 | Add accessibility scans to representative public, auth, customer, technician, and admin pages.                                                                                                                                     | No serious/critical automated accessibility violations.                                       |
| TEST-010 | Add mutation/property tests for pricing, wallet arithmetic, loyalty, idempotency, booking transitions, and date/slot overlap rules.                                                                                                | Boundary and concurrency defects are covered.                                                 |
| TEST-011 | Add chaos/degradation tests for Redis unavailable, DB timeout, email/SMS/payment provider failure, queue retry, and duplicate webhook delivery.                                                                                    | Behavior matches documented fail/degrade policy.                                              |

### Coverage order

Do not attempt to test all 243 namespaces alphabetically. Cover them in this order: identity/session; money; booking/availability; authorization/admin; uploads/chat/realtime; notifications/queues; marketplace purchases; then remaining feature routers by usage and risk. Remove or archive unused/stub routes instead of testing dead scope.

### Exit gate

All suites run in a clean environment, Tier 1 coverage meets thresholds, migrations are exercised, and all browser projects pass with artifacts.

## 13. Phase 8 — Harden Database Schema and Migrations

### Objective

Preserve the strong relational foundation while reducing sprawl, redundant indexes, and unconstrained business state.[7]

### Tasks

| ID       | Implementation task                                                                                                                                                                             | Acceptance evidence                                                                            |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| DATA-001 | Build a model ownership map: identity, booking, catalog, finance, trust/safety, communications, content, and experimental features. Mark unused/low-value models for deprecation.               | Every model has an owner/context and lifecycle status.                                         |
| DATA-002 | Inventory all indexes against production-like query patterns and `EXPLAIN (ANALYZE, BUFFERS)`. Remove redundant indexes already covered by unique constraints.                                  | Index ADR records retained/removed indexes and evidence.                                       |
| DATA-003 | Add enums/reference tables or check constraints for language, tiers, channels, state machines, ratings, positive durations, and non-negative monetary fields where business rules require them. | Invalid direct SQL inserts fail; migrations include data cleanup.                              |
| DATA-004 | Define booking/payment/wallet state-transition services and transaction boundaries. Use row locking or serializable/optimistic strategies for slot reservation and ledger updates.              | Concurrency tests prevent double booking and double spending.                                  |
| DATA-005 | Replace or validate JSON localization shape. Add application validation and, where justified, database checks/generated columns/search indexes.                                                 | Every localized record has required language shape or documented fallback.                     |
| DATA-006 | Add migration naming/review standards, backward-compatible expand/migrate/contract procedures, and a rollback/restore plan.                                                                     | Migration PR template includes lock duration, data rewrite, rollback, and compatibility notes. |
| DATA-007 | Create migration tests from a sanitized production-like snapshot and verify seed scripts against the current schema.                                                                            | Seed warnings are eliminated; migration and rollback drill succeed.                            |
| DATA-008 | Define retention/deletion/anonymization for audit logs, uploads, analytics, sessions, notifications, and personal data.                                                                         | Scheduled cleanup and user-deletion tests exist.                                               |
| DATA-009 | Add backup encryption, restore instructions, retention policy, and quarterly restore drill.                                                                                                     | Documented RPO/RTO and successful restore evidence.                                            |

### Exit gate

Critical invariants are enforced in both service logic and the database, migration tests pass on realistic data, redundant indexes are addressed, and backup restoration is proven.

## 14. Phase 9 — Reduce Architecture and Code-Quality Debt

### Objective

Reduce the maintenance cost created by 243 top-level API namespaces, 202 models, oversized routers, unsafe casts, and hundreds of lint suppressions.[1]

### Tasks

| ID       | Implementation task                                                                                                                              | Acceptance evidence                                                                                            |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| ARCH-001 | Create `docs/architecture/context-map.md` and classify each feature as core, supporting, generic, experimental, duplicate, or deprecated.        | Product/engineering approve a scope-reduction list.                                                            |
| ARCH-002 | Introduce API domain modules with public entrypoints. The root router imports domain routers rather than hundreds of leaf routers.               | Root registry becomes a concise composition layer.                                                             |
| ARCH-003 | Add dependency-boundary rules with ESLint or a graph tool: config/shared → domain/API/UI → apps; no reverse dependency from shared into UI/apps. | CI fails on forbidden imports/cycles.                                                                          |
| ARCH-004 | Split routers over an agreed threshold (for example 300–400 lines) by use case/service/repository, not arbitrary file slicing.                   | Auth, bookings, services, women’s services, payments, and admin modules have cohesive units and focused tests. |
| ARCH-005 | Replace broad `(api as any)` access with generated tRPC types and explicit adapters.                                                             | Unsafe API access is zero in Tier 1 pages.                                                                     |
| ARCH-006 | Establish an `any` budget: no new explicit `any`; reduce existing count by domain each sprint. Prefer `unknown` plus validation.                 | CI tracks and rejects count regression.                                                                        |
| ARCH-007 | Review every ESLint suppression. Keep only localized, explained suppressions with a linked issue when temporary.                                 | Suppression count declines and has no unexplained blanket disables.                                            |
| ARCH-008 | Introduce service-layer transaction/use-case boundaries for auth, booking, payment, wallet, payout, and notification workflows.                  | Procedures are thin; business rules have unit tests independent of tRPC.                                       |
| ARCH-009 | Archive or feature-gate incomplete/unused features rather than presenting them as production-ready.                                              | Route inventory distinguishes production, beta, experimental, and disabled.                                    |
| ARCH-010 | Add API deprecation/versioning policy and generated reference documentation.                                                                     | Breaking changes require a migration path and changelog entry.                                                 |

### Exit gate

The package graph is enforced, Tier 1 domains are modular, unsafe typing no longer grows, and experimental scope is isolated from production claims.

## 15. Phase 10 — Complete Frontend Internationalization, Accessibility, and Performance

### Objective

Replace the current localStorage-and-reload language toggle and static Arabic document semantics with a real Arabic/English architecture, while improving accessibility and performance.[8]

### Tasks

| ID     | Implementation task                                                                                                                                   | Acceptance evidence                                                       |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| FE-001 | Select locale routing (`/ar`, `/en`) or a server-readable locale cookie and integrate a supported i18n solution. Keep translations in typed catalogs. | Direct links, SSR, metadata, and refresh preserve locale.                 |
| FE-002 | Set `<html lang>` and `dir` dynamically. Remove hard-coded Arabic from shared navigation where English mode is expected.                              | Playwright asserts `ar/rtl` and `en/ltr` on representative pages.         |
| FE-003 | Add a usable mobile navigation replacement where desktop navigation is hidden.                                                                        | Keyboard, touch, focus trap, escape, and screen-reader behavior pass.     |
| FE-004 | Audit semantic headings, labels, names, errors, focus management, dialogs, images, drag-and-drop announcements, and contrast.                         | Automated scans plus manual keyboard/screen-reader checklist pass.        |
| FE-005 | Add reduced-motion support globally and remove the known 2/547-component limitation through reusable motion tokens.                                   | `prefers-reduced-motion` E2E/CSS tests pass.                              |
| FE-006 | Add component tests for design-system primitives and critical forms; use Storybook accessibility checks.                                              | UI package has deterministic component coverage.                          |
| FE-007 | Define performance budgets for LCP, INP, CLS, initial JS, and key route bundles. Reduce universal client-side code and unnecessary dynamic rendering. | Lighthouse/Web Vitals thresholds pass in staging.                         |
| FE-008 | Replace raw `<img>` where Next image optimization or explicit dimensions are appropriate; validate remote-image policy after dependency upgrades.     | No layout shifts from unbounded images; security configuration is narrow. |
| FE-009 | Add loading, empty, error, offline, retry, and unauthorized states for Tier 1 flows.                                                                  | Component/E2E tests cover each state.                                     |

### Exit gate

Arabic and English are semantically correct across SSR/navigation, representative pages meet accessibility checks, reduced motion works, mobile navigation is complete, and performance budgets are enforced.

## 16. Phase 11 — Modernize Observability and Deployment

### Objective

Convert the existing monitoring/deployment intent into a reproducible and reversible operating model.

### Tasks

| ID      | Implementation task                                                                                                                                                                                                                   | Acceptance evidence                                                            |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| OPS-001 | Replace process-local request counters with OpenTelemetry/Prometheus-compatible aggregated metrics. Add route latency, error rate, saturation, DB pool, Redis, queue depth/age, socket connections, and business transaction metrics. | Multiple app instances report coherent metrics.                                |
| OPS-002 | Standardize structured Pino logs with request/session correlation, service/version/environment fields, redaction, and centralized collection.                                                                                         | A request can be traced across web/API/worker/socket without exposing secrets. |
| OPS-003 | Define SLOs and alerts for authentication, booking, payment, wallet, notifications, API availability/latency, DB, Redis, queues, and socket delivery.                                                                                 | Every alert has severity, owner, runbook, and tested routing.                  |
| OPS-004 | Build one immutable container/image per deployable service. Use a non-root runtime user, minimal production dependencies, health/readiness endpoints, and an SBOM.                                                                    | Image scan passes and digest is recorded in release metadata.                  |
| OPS-005 | Deploy the exact verified image to staging, run migrations as a controlled job, execute smoke/E2E tests, then promote the same digest to production.                                                                                  | No `git pull` or production rebuild occurs on the server.                      |
| OPS-006 | Implement rolling/canary or blue-green deployment with readiness checks and automatic rollback on failed health/SLO signals.                                                                                                          | Staging rollback drill succeeds.                                               |
| OPS-007 | Define backward-compatible database deployment sequencing and prevent application promotion when migrations are unsafe.                                                                                                               | Expand/migrate/contract demonstration succeeds.                                |
| OPS-008 | Validate the actual hosting model. If using plain Compose/PM2, remove misleading replica declarations; if horizontal scale is required, use an orchestrator/load balancer and shared Socket.IO adapter.                               | Runtime topology matches configuration/documentation.                          |
| OPS-009 | Create incident runbooks for auth outage, DB saturation, Redis loss, payment provider failure, queue backlog, deployment rollback, credential leak, and data restore.                                                                 | Tabletop exercise records actions and gaps.                                    |
| OPS-010 | Add release notes, provenance, changelog automation, and Sentry release association to the immutable artifact.                                                                                                                        | Production event maps to commit, image digest, migrations, and approving PR.   |

### Exit gate

A staging release is built once, promoted by digest, monitored, rolled back successfully, and documented with end-to-end provenance.

## 17. Phase 12 — Correct Documentation and Collaboration Governance

### Objective

Make repository documentation a reliable operating interface rather than an aspirational status report.

### Tasks

| ID      | Implementation task                                                                                                            | Acceptance evidence                                                          |
| ------- | ------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| DOC-001 | Rewrite README status and commands from verified automation. Remove manual green badges or connect them to real workflows.     | Every documented command passes in a clean clone.                            |
| DOC-002 | Correct route, model, migration, test, and feature counts. Prefer generated inventories over manually maintained numbers.      | Documentation check detects stale generated sections.                        |
| DOC-003 | Replace “production-ready” with explicit readiness criteria and current status.                                                | Launch checklist links to evidence for every gate.                           |
| DOC-004 | Update architecture, security, deployment, data, testing, and run-local docs after each relevant phase.                        | PR checklist requires documentation impact review.                           |
| DOC-005 | Add issue templates for defect, security, technical debt, architecture decision, and operational task.                         | Every deferred item has severity, owner, acceptance criteria, and milestone. |
| DOC-006 | Add PR template with problem, scope, design, tests, screenshots, risk, security/data impact, rollout, rollback, and checklist. | Human-authored PRs consistently contain reviewable evidence.                 |
| DOC-007 | Add `CODEOWNERS` for auth/security, database/migrations, payments/wallet, deployment, and shared packages.                     | Sensitive changes require appropriate review.                                |
| DOC-008 | Establish conventional commit/changelog rules and release tagging.                                                             | Release notes are generated from merged PRs.                                 |
| DOC-009 | Maintain a technical-debt register ranked by severity, risk, effort, and age; review it each sprint.                           | Debt is visible and aging P0/P1 items trigger escalation.                    |

### Exit gate

The README and operational documentation match actual behavior, protected PR review is in use, and issues provide an auditable work queue.

## 18. Phase 13 — Complete the Missing TaskFlow and Written Assessment Artifacts

### Objective

Produce every artifact omitted from the original assessment without mixing the assessment app into the production platform. Prefer a separate private repository named `taskflow-assessment` unless the evaluator explicitly requires a subdirectory.

### TaskFlow implementation scope

| Layer          | Required implementation                                                                                                                                                                                                |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Frontend       | React/Next.js single-page board with To Do, In Progress, and Done; create/edit card; assignee; keyboard-accessible drag/drop; responsive UI; visible focus; ARIA live announcements; optimistic updates with rollback. |
| Backend        | REST API for users, boards, columns, and cards; OpenAPI contract; JWT/session authentication; authorization per board membership; validation/sanitization; rate limits; consistent errors; idempotency for card moves. |
| Database       | Users, boards, memberships, columns, cards, card activity/version; ordered-position strategy; foreign keys; unique constraints; indexes for board/column/order and assignee; migrations and seed.                      |
| Realtime       | WebSocket or SSE board channel with authenticated subscription, authorization, event version, reconnect/resync, and conflict handling.                                                                                 |
| Tests          | Critical service unit tests, REST integration tests, database/migration tests, realtime authorization tests, React component tests, and Playwright drag/keyboard/multi-client E2E.                                     |
| Infrastructure | Backend and frontend Dockerfiles, PostgreSQL and Redis Compose stack, health checks, non-root images, CI for frozen install/lint/type/tests/build/audit/containers.                                                    |
| Documentation  | README, architecture diagram, ADRs, OpenAPI, setup, threat model, testing strategy, known trade-offs, and self-critique.                                                                                               |

### TaskFlow design decisions

Use fractional ranking or evenly spaced numeric positions for card ordering, with transactional rebalance when gaps become too small. Include an optimistic-concurrency `version` field on cards so simultaneous edits return `409 Conflict` rather than silently overwriting. Realtime messages should contain entity ID, operation, version, actor, and timestamp; clients that detect a version gap must refetch board state.

### Missing written artifacts

| ID      | Artifact                                      | Completion standard                                                                                                                                                                              |
| ------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| ART-001 | Fictional poor authentication middleware diff | Include realistic but intentionally flawed code covering token parsing, algorithm confusion, missing authorization, error leakage, unsafe logging, and blocking I/O. Clearly label it fictional. |
| ART-002 | Senior code review                            | Prioritize blocking security issues, explain impact/exploitability, give corrected code or precise guidance, separate style from blockers, and use respectful mentoring language.                |
| ART-003 | NoSQL versus relational answer                | Give decision criteria and a concrete example; avoid technology-by-fashion reasoning.                                                                                                            |
| ART-004 | Product-manager/technical-debt answer         | Explain discovery, options, quantified trade-offs, time-boxed compromise, written decision, ownership, and repayment trigger.                                                                    |
| ART-005 | Monitoring answer                             | Cover SLIs/SLOs, logs/metrics/traces, frontend vitals, API/DB/queue/cache, business metrics, alerts, ownership, and incident feedback.                                                           |
| ART-006 | Approachable-codebase answer                  | Cover conventions, architecture docs, examples, review, CI, onboarding task, pairing, and debt control.                                                                                          |
| ART-007 | Slow-page debugging answer                    | Walk from RUM/browser waterfall and rendering through CDN/network/server traces, API, cache, DB query plans, reproduction, fix, and regression monitoring.                                       |
| ART-008 | Self-critique                                 | Name at least two genuine limitations, consequences, and concrete next steps; include ordering/concurrency, auth/session trade-offs, operational scaling, and test limitations.                  |

### Exit gate

A reviewer can clone TaskFlow, run one documented command, use two browser sessions to observe realtime updates, execute all tests, inspect OpenAPI/migrations/CI, and read every requested written response.

## 19. Pull Request Sequence

The following order minimizes merge conflicts and prevents architecture work from resting on an unreliable baseline.

|  PR | Title                                                       | Includes                        | Depends on                                         |
| --: | ----------------------------------------------------------- | ------------------------------- | -------------------------------------------------- |
|  00 | Preserve and classify current working tree                  | GOV-001–005                     | None                                               |
|  01 | Restore package graph and frozen lockfile                   | BASE-001–003, BASE-009          | PR-00                                              |
|  02 | Restore real lint, format, Turbo tasks, and root verify     | BASE-004–008                    | PR-01                                              |
|  03 | Repair CI bootstrap and E2E lifecycle                       | CI-001–006                      | PR-02                                              |
|  04 | Protect master and add governance templates                 | CI-007–009, initial DOC-005–007 | PR-03                                              |
|  05 | Add session architecture ADR and threat model               | AUTH-001, security design       | PR-04                                              |
|  06 | Implement server-owned web sessions                         | AUTH-002–006, AUTH-010          | PR-05                                              |
|  07 | Implement refresh-token families and session management     | AUTH-007–009                    | PR-06                                              |
|  08 | Harden CORS, JWT, CSRF, limits, secrets, and authorization  | SEC-001–010                     | PR-07                                              |
|  09 | Fix Socket.IO identity and room authorization               | RT-001–006                      | PR-07                                              |
|  10 | Upgrade vulnerable direct dependencies                      | DEP-001–005                     | PR-08/09 where relevant                            |
|  11 | Add supply-chain security gates                             | DEP-006–008                     | PR-10                                              |
|  12 | Introduce hermetic test infrastructure                      | TEST-001–004                    | PR-03                                              |
|  13 | Add Tier 1 coverage and browser reliability                 | TEST-005–011                    | PR-06–12                                           |
|  14 | Add database invariants and migration testing               | DATA-001–009                    | PR-13                                              |
|  15 | Enforce architecture boundaries and refactor Tier 1 domains | ARCH-001–010                    | PR-14                                              |
|  16 | Complete i18n, accessibility, and performance gates         | FE-001–009                      | PR-15                                              |
|  17 | Build immutable delivery and observability                  | OPS-001–010                     | PR-11, 13–16                                       |
|  18 | Reconcile all documentation and readiness claims            | DOC-001–009                     | PR-17                                              |
|  19 | Submit TaskFlow and written assessment artifacts            | ART-001–008 plus TaskFlow       | Stable foundation; separate repository recommended |

## 20. Definition of Done for Every Pull Request

A pull request is complete only when all applicable rows below are satisfied.

| Dimension     | Definition of done                                                                                        |
| ------------- | --------------------------------------------------------------------------------------------------------- |
| Scope         | One primary objective; unrelated cleanup excluded.                                                        |
| Design        | ADR or design note exists for security, data, architecture, or operational changes.                       |
| Code          | No new unsafe `any`, unexplained suppression, secret, placeholder credential, or reverse dependency.      |
| Tests         | New behavior has positive, validation, authorization, conflict, and failure-path coverage where relevant. |
| Data          | Migration is backward-compatible, reviewed, tested, and includes rollback/restore notes.                  |
| Security      | Threat/abuse cases, secret handling, logging/redaction, and authorization impact are reviewed.            |
| Operations    | Metrics/logs/alerts, rollout, feature flag, and rollback are included where relevant.                     |
| Documentation | README/API/ADR/runbook/changelog impact is addressed.                                                     |
| Automation    | Frozen install, format, lint, type-check, tests, build, audit, and applicable scans pass.                 |
| Review        | Required code owners approve; all conversations resolve; evidence is attached.                            |

## 21. Program Metrics

Track these metrics weekly in a generated dashboard or issue summary. Metrics should guide work, not reward gaming.

| Metric                                    |       Baseline from evaluation |                                                                Target |
| ----------------------------------------- | -----------------------------: | --------------------------------------------------------------------: |
| CI success rate                           |         0/38 inspected CI runs |             ≥95% on default branch; 100% required checks before merge |
| Deployment success evidence               | 0/35 inspected deployment runs |                                   ≥95% with rollback-capable releases |
| Frozen install                            |                        Failing |                                               Passing on every CI run |
| Root build                                |      Failing in connected tree |                                              Passing from clean clone |
| High production audit findings            |                             24 |                                                          0 unaccepted |
| API namespaces with direct test reference |                   About 23/243 | 100% of Tier 1; prioritized expansion or removal for remaining routes |
| Chromium E2E                              |                          53/56 |                56/56 or revised equivalent, plus Firefox/mobile green |
| Explicit `any` signals                    |            Approximately 1,936 |                       No new usage; domain-by-domain reduction target |
| ESLint-disable signals                    |              Approximately 213 |                       No unexplained/global disables; declining trend |
| Human-authored PR history                 |                  None observed |                               All substantive changes via reviewed PR |
| Open technical issues                     |                  None observed |                Every deferred P0/P1 item tracked with owner/milestone |

## 22. Risk Register

| Risk                                                            | Probability | Impact | Mitigation                                                                                                                 |
| --------------------------------------------------------------- | ----------- | ------ | -------------------------------------------------------------------------------------------------------------------------- |
| Dirty-tree work is accidentally lost                            | Medium      | High   | Complete Phase 0 backup/classification before any manifest cleanup.                                                        |
| Auth migration logs users out or breaks mobile                  | High        | High   | Feature flag, dual-read migration window where safe, staged rollout, session metrics, and rollback path.                   |
| Dependency upgrades introduce framework incompatibility         | High        | High   | One compatibility family per PR, official migration guides, full browser/mobile tests, canary release.                     |
| Database constraints fail on existing invalid data              | Medium      | High   | Preflight queries, cleanup migration, `NOT VALID`/validate pattern where supported, backup and rollback.                   |
| Scope remains too broad to test                                 | High        | High   | Product freeze, context classification, archive low-value features, risk-tier coverage.                                    |
| CI becomes too slow                                             | Medium      | Medium | Parallel independent jobs, caching, split fast PR suite from scheduled extended suite, never skip required critical tests. |
| Security controls fail open during dependency outage            | Medium      | High   | Explicit failure policy, local fallback only where safe, telemetry and alerts, integration tests.                          |
| Documentation drifts again                                      | Medium      | Medium | Generate counts/status, validate commands in CI, require docs-impact review.                                               |
| Deployment modernization is attempted before baseline stability | Medium      | High   | Enforce phase gates and immutable-artifact work only after CI/security/test exits.                                         |

## 23. Immediate First 48 Hours

| Order | Action                                                                                            | Expected result                                                      |
| ----: | ------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
|     1 | Back up and classify every current modification/deletion/untracked path.                          | No work is lost and no history/env file is committed accidentally.   |
|     2 | Create the stabilization branch and open issue/PR-00.                                             | Work is reviewable and isolated from `master`.                       |
|     3 | Remove the shared → UI dependency, decide the intended Expo version, and regenerate the lockfile. | Package graph is acyclic and frozen install is possible.             |
|     4 | Fix root scripts/Turbo tasks and the k6 extension/syntax mismatch.                                | Root verification commands exist and formatting can parse all files. |
|     5 | Replace fake lint scripts with ESLint and fix violations in a mechanical PR.                      | `pnpm lint` is meaningful.                                           |
|     6 | Fix duplicate pnpm setup in GitHub Actions and make E2E start the app.                            | CI reaches real project checks instead of failing in setup.          |
|     7 | Run the complete clean-clone verification and capture artifacts.                                  | A trustworthy baseline exists before auth/security changes.          |
|     8 | Add branch protection immediately after the first green CI run.                                   | Red code cannot merge into `master`.                                 |

## 24. Commands for the Baseline Verification

Run these only after Phase 0 has protected the current working tree. The implementation PRs may refine command names, but the final repository should support this experience:

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm format:check
pnpm lint
pnpm type-check
pnpm db:validate
pnpm test:unit
pnpm test:integration
pnpm test:e2e
pnpm audit:prod
pnpm build
docker-compose config -q
```

For CI integration tests, PostgreSQL and Redis must be provisioned by the workflow or test harness; passing must not depend on services already running on a developer’s computer.

## 25. Final Program Acceptance

The remediation program is accepted when a neutral reviewer can perform the following without private knowledge:

1. Clone the repository and complete a frozen install.
2. Run the documented verification command and receive a green result.
3. Inspect a coherent, server-owned web session flow and secure mobile storage.
4. Confirm strict authorization in HTTP and Socket.IO paths.
5. Run isolated tests with no pre-existing database or cache.
6. Review migration, backup, and restore evidence.
7. Deploy an immutable artifact to staging, observe telemetry, and execute rollback.
8. Verify README status against real protected-branch checks.
9. Review human-authored PRs and tracked technical debt.
10. Clone and run the separate TaskFlow submission and read all requested written artifacts.

> **Completion standard:** Do not declare the platform production-ready because all planned tasks are closed. Declare it ready only when every release gate has current, repeatable evidence.

## References

[1]: ./Your%20report%20boss.md 'Senior Full-Stack Evaluation Report'
[2]: https://github.com/saeedmoh4444/galaxy-of-beauty/actions 'Galaxy of Beauty GitHub Actions history'
[3]: https://github.com/saeedmoh4444/galaxy-of-beauty/blob/1519a1efad38/apps/web/src/app/%28auth%29/login/page.tsx#L22-L35 'Web login token storage'
[4]: https://github.com/saeedmoh4444/galaxy-of-beauty/blob/1519a1efad38/apps/web/src/middleware.ts 'Next.js authentication middleware'
[5]: https://github.com/saeedmoh4444/galaxy-of-beauty/blob/1519a1efad38/packages/ui/src/hooks/useAuth.ts 'Shared authentication hook'
[6]: https://github.com/saeedmoh4444/galaxy-of-beauty/blob/1519a1efad38/packages/api/src/socket/index.ts#L44-L101 'Socket.IO authentication and room subscriptions'
[7]: https://github.com/saeedmoh4444/galaxy-of-beauty/blob/1519a1efad38/packages/db/prisma/schema.prisma 'Prisma database schema'
[8]: https://github.com/saeedmoh4444/galaxy-of-beauty/blob/1519a1efad38/apps/web/src/components/LanguageToggle.tsx 'Current language toggle'
