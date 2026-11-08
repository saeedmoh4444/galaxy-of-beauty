# Galaxy of Beauty — Platform Improvement Plan (2026)

**Author role:** senior full-stack engineer (20+ yrs) — written against the platform's own evidence: the 2026-09-30 deep audit, the 2026-10-30 audit-build program, the reels launch-gate audit, and the shipped architecture (266 tRPC routers / 1,204 procedures, ~251 Prisma models, ~1,905 tests, 353 green E2E, 9 CI gates).

**Status:** PLAN ONLY — nothing in this document is implemented until the boss says "start working".

---

## 1. Where the platform actually is (honest assessment)

**Strong — protect these as invariants:**

- Gate culture: every architecture PR must keep the ratchet (size 221/213/298/226 KB, API-coverage floors, static-Arabic gate, axe, router-inventory contracts). This is rarer than most teams ever achieve.
- Payment integrity: idempotent fulfill (H0), atomic wallet withdrawals (#579), payCart guards — the money paths were engineered, not assembled.
- Typed contracts end-to-end: tRPC + zod 4 at the boundary, wire contracts shared with realtime, i18n keyed with `t()` (5,891+ mobile keys).
- Programs that delivered: vendor marketplace (100%), shoppable reels (100%), audit-build wave (100% through #600).

**Weak — what the audits already proved, in severity order:**

| #   | Gap                             | Evidence                                                                                                    | Consequence today                                                             |
| --- | ------------------------------- | ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| 1   | **No production payments**      | Fatoorah live token + ZATCA activation user-gated; `FATOORAH_SIMULATE=true` locally, CI skips real checkout | The marketplace cannot take money; BNPL honestly stubbed                      |
| 2   | **Flying blind in prod**        | Sentry SDK shipped (#352) but dormant; no DSN, no releases/source maps                                      | Errors, crashes, and perf regressions are invisible post-deploy               |
| 3   | **UGC unmoderated**             | Reels + reviews shipped; moderation API never built (audit 2026-10-30)                                      | One abusive upload is a legal/compliance event (KSA audience)                 |
| 4   | **No external security review** | Pentest deferred since 2026-09; attack surface grew (reels, WebRTC, WhatsApp, marketplace)                  | 266 routers of authz surface verified only by us                              |
| 5   | **No CDN / media pipeline**     | Photography assets user-gated; images served from origin; S3 lifecycle deferred                             | Slow loads on 4G (the primary customer network), storage cost growth          |
| 6   | **E2E trust erosion**           | Login flake under dev-DB contention (bcrypt cost 12 under parallel load); suite 60→90 min                   | The one gate that catches integration bugs is the one people retry-and-ignore |
| 7   | **Facade tech debt**            | `womensServicesMap` (289-item static facade) maps to real services only at booking time                     | Catalog has two sources of truth; drift is guaranteed                         |
| 8   | **No release channel for iOS**  | Apple account user-gated; OTA/Android pipeline exists                                                       | Half the addressable market cannot install the app                            |
| 9   | **Staging incomplete**          | D3 staging deferred; backup/alerting shipped but restore never drilled                                      | We cannot rehearse a failure before prod has one                              |

---

## 2. Strategy

**Principles (architecture-derived):**

1. **Risk before revenue.** Nothing here is "nice to have" ordering — items 1-4 are the difference between an incident and a company-ending event. Payments go live only with observability + moderation + pentest in place or in parallel, never alone.
2. **Every phase ships a gate.** Our culture's superpower is the ratchet. Each phase below ends with a new CI gate, contract, or E2E — so improvement is measurable, not anecdotal.
3. **User-gated items are unblocked by the boss, not worked around.** No fake keys, no skipped integrations that read as shipped.
4. **One slice = one PR = TDD.** Same discipline that ran the vendor program (TDD per Droid Factory protocol: test file before implementation).
5. **Mobile parity is product parity.** The customer reality is mobile-first (Saudi market, OTA shipped). Web-only fixes don't count as done.

---

## 3. The Plan — six phases

### Phase A — Trust & Compliance (the firewall before money)

**A1 · Production secrets completion** _(user-gated, no code)_

- Unblock: Fatoorah live token (→ real checkout + ZATCA e-invoicing activation), Sentry prod DSN, AWS console access (→ CDN + S3 lifecycle config), Apple account (→ iOS release).
- **Why (our architecture):** every downstream phase references these. `FATOORAH_SIMULATE` was designed as a dev affordance — leaving it on in the roadmap conversation is how "the platform is done" becomes "the platform is pretend".
- Deliverable: a secrets register in the ops docs (which secret, which env, who rotates, rotation procedure). No code.

**A2 · Content moderation service (build the missing API)**

- Slices: A2a moderation schema + report API (TDD) → A2b admin review queue (vendor-style drawer, reuse existing admin patterns) → A2c automated triage: blocklist + heuristics + optional AI classifier behind a feature flag → A2d S3 lifecycle for UGC retention (auto-expire reels/uploads).
- **Why (our architecture):** reels/UGC is the only surface where third-party content reaches other customers. The platform already has the review/approval pattern (disputes, KYC, vendor applications) — moderation is the same state machine with a different entity. The API exists as a 266-router tRPC surface, so this is additive, not invasive.
- Gate: E2E "user uploads → report → admin acts → content hidden" + a moderation coverage contract in the API ratchet.

**A3 · External pentest + fix wave**

- Scope: authz across the 266 routers (not injection — parameterized queries are already the invariant), the wallet/money paths, the realtime/socket upgrade path, the marketplace vendor flows, and the mobile token storage.
- **Why (our architecture):** we proved our own invariants with tests, but 1,204 procedures is past the point where self-review finds the deep bugs. The vendor program's permission matrix (`(vendor)+(owner)` groups) is exactly the kind of combinatorial surface pentests are good at breaking.
- Deliverable: findings triage → fixes as normal slices (test-first) → a "security posture" doc update.
- Gate: pentest retest clean on the fixed findings.

**A4 · Rate-limit & session hygiene sweep**

- Audit every public procedure for rate limits (login has it; register, password reset, booking creation, reels upload, contact forms must). Mobile refresh-token rotation parity with web (#597-adjacent work is done — verify).
- **Why (our architecture):** limits are middleware-based (single choke point), so this is mostly a config audit + missing-middleware tests, not a rewrite.
- Gate: unit contract that every `publicProcedure` with side effects has a rate limiter (extend router-inventory contract).

### Phase B — Observability & Reliability (see the failures before the customers do)

**B1 · Activate Sentry everywhere**

- Web + mobile + API: DSN wiring (user-gated), release tracking tied to EAS + Vercel deploys, source maps upload in CI, alert routing rules (error-rate, crash-free threshold on mobile).
- **Why (our architecture):** Sentry SDK is already installed and dormant (#352/#313). This is wiring, not new tooling — the cheapest high-value phase in the plan.
- Gate: CI smoke test asserting the Sentry init runs in the built bundles; a docs runbook for triage.

**B2 · Correlation IDs + structured logs**

- tRPC context gains a request id (passed through BullMQ jobs and socket events); worker logs go structured; log drain to the existing monitoring stack.
- **Why (our architecture):** a booking touches web → tRPC → BullMQ worker → socket → mobile. Today a failed fulfillment is four disconnected log lines. One id stitches them.
- Gate: integration test that a synthetic order's id appears in the worker log line (log capture in test).

**B3 · Load gates in CI (k6) on the money + browse paths**

- Reuse the k6 setup from 7.2: checkout POST, catalog browse, booking create against staging, with p95 budgets.
- **Why (our architecture):** bcrypt cost 12 + Prisma pooling under concurrency is a known hazard (the dev-DB flake is the warning). Measure before prod traffic does it for us.
- Gate: k6 job in CI (staging-only), budgets ratcheted like size gates.

**B4 · Database hardening**

- Slow-query logging + index audit on the hot paths (catalog browse, bookings by technician/time, order lookup); connection-pool tuning for BullMQ + API concurrency; a **restore drill** of the shipped backup (#561) on staging.
- **Why (our architecture):** 251 models with Prisma 7 back-relations; the API is the only consumer today, but the marketplace grows the write rate. Backups that were never restored are not backups.
- Gate: restore-drill runbook with a recorded pass; slow-query budget in CI for the seeded catalog queries.

**B5 · Kill the E2E flake for good**

- Root-cause the login flake (bcrypt under dev-DB contention): test-env bcrypt cost via env override, or CI-only service containers with tuned postgres. Add Playwright retry policy + trace retention rules.
- **Why (our architecture):** the E2E suite is our only integration gate across web↔api↔db↔redis, and 353 green specs are worthless if engineers retry-and-ignore failures. Trust in the gate is infrastructure.
- Gate: 10 consecutive green CI runs on master without manual reruns, recorded in CI history.

### Phase C — Revenue path (make the money real)

**C1 · Payments go live, safely**

- Fatoorah live mode → ZATCA e-invoicing activation (#6.1d) → staging E2E of charge + refund + dispute → **reconciliation job** (daily API→Fatoorah report diff, alert on mismatch) → the wallet's atomicity gets its first real traffic under monitoring from Phase B.
- **Why (our architecture):** idempotency and atomicity (#579, H0) are already built — going live is config + reconciliation + observability, which is why A+B come first. The reconciliation job closes the loop the simulate mode never exercised.
- Gate: reconciliation E2E on staging (seed divergent rows → job flags them); ZATCA invoice XML contract test.

**C2 · Abandoned-cart & booking-reminder automation**

- Reuse the notification infra (push + WhatsApp #6.5): cart-abandon after N minutes, booking reminder 24h/1h before, post-service review request.
- **Why (our architecture):** the worker + notification system already exists; this is a few BullMQ job definitions and templates. Highest ROI per line of code in the phase.
- Gate: worker integration tests for each new job (idempotent, retry-safe — same convention as #594's lesson: post-commit notifications never fail the purchase).

**C3 · Search & discovery (catalog scale-up)**

- Server-side search: Postgres FTS first (zero new infra), Typesense/Meilisearch later if the catalog keeps growing. Filters wired to the existing catalog types.
- **Why (our architecture):** 300+ services make client-side filtering brittle and bundle-heavy; the catalog split (#403) kept sizes down but search belongs server-side, next to the API that already owns catalog contracts.
- Gate: search contract tests (relevance ordering pinned for seeded fixtures) + a k6 browse/search budget.

### Phase D — Performance & delivery edge (make it fast on 4G)

**D1 · CDN + image pipeline**

- AWS console (user-gated) → CloudFront in front of uploads, `next/image`/Expo Image everywhere with responsive sizes, AVIF/WebP conversion on upload, lazy-load below the fold (skeletons #407 already in place).
- **Why (our architecture):** photography assets are the one remaining content gap; origin-served full-size images on mobile data is the single biggest perceived-performance cost. The Q7 skeletons mean the UX already waits correctly — now make the bytes arrive fast.
- Gate: Lighthouse budgets (LCP on catalog pages) as a CI check on the web app; image-size contract test on mobile.

**D2 · Finish the catalog source-of-truth**

- Replace the `womensServicesMap` facade with real catalog rows (the 289 items become seeded services with a mapping table for legacy references), then delete the facade.
- **Why (our architecture):** the facade was the right emergency bridge (#589), but two sources of truth means the next catalog edit will drift. The booking layer already maps facade→service; moving the mapping into the DB kills the drift permanently.
- Gate: a contract test that catalog search and booking availability return identical service ids (the drift test that should have existed).

**D3 · Cache hot reads**

- Redis cache middleware for catalog reads (tRPC-level, typed keys), stale-while-revalidate on web queries, tuned Query persister on mobile (already wired).
- **Why (our architecture):** ioredis 6 + BullMQ already share Redis; a typed cache layer on the API keeps invalidation explicit (worker emits invalidation on catalog writes) instead of scattered.
- Gate: cache-hit rate assertion in the k6 job; invalidation integration test (edit service → cache entry stale-proof).

### Phase E — Mobile release wave (get it in customers' hands)

**E1 · iOS release** _(Apple account user-gated)_ → TestFlight → App Store; store listing assets from the photography track.
**E2 · Mobile wave from the audit backlog**: push-notification hardening, offline gaps, app-size trim (Hermes + asset budgets), OTA cadence policy.
**E3 · Parity audit**: booking/vendor flows on mobile vs web — one E2E per critical mobile flow on the simulator in CI.

- **Why (our architecture):** SDK 58/RN 0.88 is current, OTA already auto-publishes — the pipeline exists and only Apple creds block distribution. Parity E2Es close the last untested platform.
- Gate: mobile smoke E2E job in CI (simulator), crash-free rate ≥ 99.5% as a Sentry alert.

### Phase F — Engineering culture compounding (make the next 6 months cheaper)

**F1 · Flake & tech-debt register discipline** — the debt register (docs) gets a review cadence; every phase closes entries, never opens without a ticket.
**F2 · OpenAPI export from tRPC** → publish to Postman (CLI + plugin available) → live contract tests against staging.
**F3 · Docs canonical pair refresh** (brain_code + Rules) after every phase, per the established convention.

- **Why (our architecture):** the platform's competitive moat is that gates + docs + tests compound. Phases A–E make the product better; F makes the team faster, forever.
- Gate: the existing architecture-gates job already enforces the doc pair — F just schedules the work.

---

## 4. Dependencies & sequencing

```
A1 (secrets) ─────────────┬─▶ B1 (Sentry) ─▶ B2/B3/B4/B5 (observability+reliability)
                          │                        │
A2 (moderation) ──────────┼─▶ C1 (payments live) ◀─┘
                          │        │
A3 (pentest) ─────────────┘        ├─▶ C2 (automation) ─▶ C3 (search)
                                   └─▶ D2 (catalog single source)
D1 (CDN) ─▶ D3 (cache) ─▶ E1 (iOS) ─▶ E2/E3 (mobile wave)
F runs alongside everything (weekly cadence)
```

**Parallel tracks once A is done:** (B + C2) and (D2 + D3) can run concurrently — different owners, disjoint code areas. C1 waits on B1 + A1 + A3 findings, by design.

**Effort view (rough, in engineer-weeks):**

- A: A1 (0 — user-gated) · A2 (3) · A3 (2 + external) · A4 (1)
- B: B1 (0.5) · B2 (1) · B3 (1) · B4 (1.5) · B5 (1)
- C: C1 (2) · C2 (1) · C3 (2)
- D: D1 (1 + user-gated) · D2 (2) · D3 (1)
- E: E1 (0.5 + user-gated) · E2 (2) · E3 (2)
- F: F1–F3 (1, spread)

Total ≈ 25 engineer-weeks of code, ~6 of which are blocked on user-gated items. This is a quarter at two engineers, or two quarters at one.

---

## 5. Definition of done for the program

1. Real money moves end-to-end with ZATCA invoices, reconciliation, and Sentry observability live.
2. A pentest ran, its findings shipped, and the moderation service is live with an admin queue.
3. Master CI includes: k6 budgets, mobile smoke E2E, moderation coverage, search contracts, and a green-run streak of 10+ with no manual reruns.
4. The 289-item facade is deleted; catalog has one source of truth.
5. iOS build is on the App Store with OTA flowing.
6. Every phase added its gate — the ratchet only moved up.

---

## 6. What I will NOT do

- Touch user-gated items (Fatoorah key, Apple account, AWS console, Sentry DSN) — I'll prepare everything up to the credential, then hand you the exact step.
- Start implementation until you type **"start working"**.
- Lower any existing gate, or merge without CI green.

_Plan written 2026-11-08. Revisited and updated after each phase, per the F3 convention._
