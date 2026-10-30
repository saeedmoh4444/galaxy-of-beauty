# Brain Code — Galaxy of Beauty

> **Honest architecture audit:** What we use, what we skip, and what we must adopt.
> No fluff. No marketing. Just engineering decisions and their reasons.
> Rebuilt: 2026-10-30 — post vendor program (Waves 0–D, master `cfb42068`→`14dfea08`), post reels program **Phases 1–3 COMPLETE** (#541–#558, master `4e6b5231`): swipe feeds, watch analytics, shoppable tags, conversion attribution, portal reel analytics.

---

# PART 1 — The Blueprint (Macro Architecture)

## 1. Software Engineering Paradigm — _The Academic Term_

**Paradigm: Feature-Driven, Domain-Modular Monolith** with **Domain-Driven Design (DDD) Lite** at the code level.

```
Academic classification:
├── Paradigm:          Declarative + Imperative hybrid (typed functional core, imperative IO edges)
├── Architecture:      Modular Monolith — NOT microservices
├── Decomposition:     Domain-based — bounded contexts exported through domain barrels
├── Communication:     Synchronous (tRPC, type-safe RPC) + Async (BullMQ on Redis) + Real-time (Socket.IO)
├── Data:              Single PostgreSQL (JSONB bilingual fields), Redis for cache/queues/rate-limits
├── Read models:       Materialized daily stats (VendorDailyStat, ReelDailyStat) — NOON-UTC buckets
└── Typing:            End-to-end TypeScript strict — tRPC + Zod infer the contract, no codegen
```

**Why not Microservices?**

- Team size: 1–3 developers. Microservices overhead would kill velocity.
- Domain barrels give ~80% of the benefit at ~5% of the cost; any domain _can_ be extracted later.
- Single-DB transactions are still cheap at this scale; Sagas/Outbox are only justified when extraction happens.
- **When we do need async scale, we already have the seam**: BullMQ queues per job family (`gob-media`, `gob-payouts`, `gob-sla`, `gob-disputes`, `gob-reminders`, `gob-notifications`, daily-stats, advisor) — the "extract this domain" path is paved, not hypothetical.

## 2. Software Anatomy — _The Practical Term_

```
galaxy-of-beauty/                       # The Body
├── apps/
│   ├── web/      Next.js 16.4 App Router   # The Face — ~320 routes, SEO, dashboards, storefronts
│   └── mobile/   Expo SDK 58 (RN 0.88)     # The Hands — ~320 screens, OTA via EAS, APK pipeline
├── packages/
│   ├── api/      tRPC v11                  # The Brain — 267 routers / 1,211 procedures, every router barreled
│   ├── db/       Prisma 7.10 + PostgreSQL  # The Spine — 251 models, hand-reviewed migrations, typed seed
│   ├── shared/   pure TS                   # The Blood — types, i18n (per-platform + per-locale split)
│   ├── ui/       React 19 + Tailwind 4     # The Skin — 560+ components + design tokens
│   └── config/   tooling                   # The DNA — shared tsconfig, eslint-flat, prettier
├── scripts/                                # The Immune System — 20+ gates: budgets, leaks,
│                                           #   Arabic scan, cycles, dedupe, prune, sitemap, hygiene
├── docker-compose.yml + .prod.yml          # The Circulatory System
├── turbo.json + pnpm-workspace.yaml        # The Nervous System
└── .github/workflows/ci.yml                # The Reflex Arc — 9-check CI pipeline
```

**Scale facts (measured, not vibes):** web bundle classes 221/213/298/226 KB gz (ratcheted baseline); i18n catalog ~5,300 web keys / ~8,800 mobile keys, split per-platform AND per-locale so no route ships both locales; 246 api test files (~1,500+ tests) + E2E on three browser projects + k6 load scripts + axe a11y gate.

## 3. Structural Blueprint — _The Industry Metaphor_

**Metaphor: The Shopping Mall**

| Layer            | Mall Equivalent | Our Implementation                                      |
| ---------------- | --------------- | ------------------------------------------------------- |
| Storefronts      | Pages/Routes    | ~320 Next.js routes (public + customer + storefronts)   |
| Back Offices     | Admin Panels    | `/admin/*`, `/tech/*`, vendor portal (`/store`)         |
| Loading Docks    | API Layer       | tRPC — 267 routers, 5 auth tiers, Zod contracts         |
| Warehouse        | Database        | PostgreSQL — bilingual JSONB, Prisma 7, 251 models      |
| Night Shift      | Job Queues      | BullMQ — payouts/SLA/disputes/reminders/media/stats     |
| Security Office  | Auth Middleware | JWT + 2FA + CSRF + tiered rate limiting                 |
| Mall Directory   | Domain Modules  | Domain barrels — the extraction seams                   |
| Security Cameras | Monitoring      | Sentry (active, all surfaces) + audit logs + SLO page   |
| Payment Desk     | Gateway         | MyFatoorah (hosted invoice + shipping) + ZATCA          |
| Ad Screens       | Reels Commerce  | Short feed → tag tap → attribution → vendor read-models |

## 4. Software Architecture and Design — _The Standard Term_

**Architecture Style: Layered + Domain-Modular Monolith, with materialized read-models.**

```
┌───────────────────────────────────────────────┐
│           PRESENTATION LAYER                  │
│  apps/web (Next.js 16)  apps/mobile (Expo 58) │
│  → web: getWebCatalog(locale) lazy-loaded     │
│    per-locale catalogs (React use()-safe);    │
│    server pages: t() from i18n/web-server     │
│  → mobile: i18n-mobile catalog (eager)        │
├───────────────────────────────────────────────┤
│            APPLICATION LAYER                  │
│  packages/api — domain barrels:               │
│  admin · ai · auth · booking · catalog ·      │
│  content · loyalty · market · operations ·    │
│  payments · realtime · safety · social ·      │
│  wellness · zatca                             │
│  → tiered procedures (public/protected/       │
│    customer/technician/admin)                 │
├───────────────────────────────────────────────┤
│            INFRASTRUCTURE LAYER               │
│  packages/db (Prisma 7, driver adapter)       │
│  Redis (cache + BullMQ queues + rate limits)  │
│  Workers: media · payouts · sla · disputes ·  │
│    reminders · notifications · daily-stats    │
│  Read models: VendorDailyStat · ReelDailyStat │
│  External: MyFatoorah · Sentry · ZATCA ·      │
│    OpenAI · Google Calendar · SMS · WhatsApp  │
└───────────────────────────────────────────────┘
```

---

# PART 2 — The Tools (Design Patterns — Micro Level)

## Patterns We Use (and Why)

| Pattern                         | Where                                                                                                                                 | Why                                                                                                        |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| **Module (Barrel)**             | `domains/<name>/index.ts`                                                                                                             | Single entry per domain; extraction-ready.                                                                 |
| **Decorator / Middleware**      | tRPC procedure factories                                                                                                              | `customerProcedure = protectedProcedure.use(hasRole('CUSTOMER'))` — composable tiers.                      |
| **Repository**                  | Prisma client in `packages/db`                                                                                                        | One data access point; swap DB without touching logic.                                                     |
| **Facade (fail-closed)**        | `lib/fatoorah.ts`, `lib/sentry.ts`                                                                                                    | Third parties behind typed facades; no config → throw/dev-stub, never fake success.                        |
| **Strategy**                    | Payment methods, shipping couriers                                                                                                    | wallet vs online; DHL vs Aramex — swappable per request.                                                   |
| **State Machine**               | Booking/order/checkout lifecycles — engine-exported transition maps reused by the vendor flow                                         | Impossible invalid states; ONE machine, no copies.                                                         |
| **Observer**                    | Socket.IO emitters                                                                                                                    | `emitToUser/emitToAdmin` — decoupled realtime events.                                                      |
| **Command**                     | BullMQ jobs (one queue per job family, one handler per worker)                                                                        | Fire-and-forget side effects, 3 retries + exp backoff, idempotent sweeps.                                  |
| **Factory**                     | `createQueue(name)`                                                                                                                   | Consistent Redis wiring.                                                                                   |
| **Singleton**                   | Prisma + Redis clients                                                                                                                | `globalForPrisma` — one pool per process.                                                                  |
| **Adapter**                     | Auth storage (web/mobile): localStorage vs SecureStore behind one interface                                                           | Platform difference contained.                                                                             |
| **Post-Commit Event → Inbox**   | Vendor mutations emit typed events after the transaction commits; the notifications domain renders them (F1)                          | Side effects stay out of money transactions.                                                               |
| **Materialized Read Model**     | `VendorDailyStat` + `ReelDailyStat` — nightly NOON-UTC buckets, portal reads ONLY the read model                                      | Analytics never hammer live order tables; upserts make re-runs idempotent.                                 |
| **Attribution Ledger**          | `ShortTagClick` snapshots `productId` at tap time; the D1 materializer joins clicks→orders over a 7-day window (reels Q3)             | Attribution survives later tag edits; deterministic earliest-tap-wins rule.                                |
| **Virtualized Snap Feed**       | Web feed mounts ≤3 `<video>` elements (±1 window), autoplay-muted, wheel-scroll snap (reels P1)                                       | Never N videos for N reels; KSA mobile-data respectful.                                                    |
| **Per-Platform Catalog**        | `i18n/{web,mobile,index}.ts` + runtime                                                                                                | Bundle isolation: web 5,300 keys, mobile 8,800; merged module only via `i18n-all`.                         |
| **Lazy-Loaded Locale Catalogs** | `getWebCatalog(locale)` + generated `{en,ar}.ts`                                                                                      | Dynamic import + promise cache loads ONLY the active locale (~118 KB gz saved per route).                  |
| **Server-Only Subpath Export**  | `@galaxy/shared/i18n/web-server`                                                                                                      | Importing it client-side is a BUILD failure (locale-split guard).                                          |
| **Build-Level Guard**           | `checkLocaleSplit()` / `checkCatalogLeak()` / drift / sitemap / config-hygiene / size budgets / cycles                                | Architecture invariants enforced by scanning artifacts — regressions fail CI, not review.                  |
| **Error-State Guard**           | `isError → ErrorAlert/retry` on every data query (100 web pages + mobile gating)                                                      | A failing query must never render silent emptiness.                                                        |
| **Idempotency-Key Contract**    | `fulfillOrder(orderId, idempotencyKey?)` + mobile per-tap keys                                                                        | Retries after client timeouts receive the current row, not BAD_REQUEST.                                    |
| **Auth-Gate Before Mutation**   | Feed tag shop-now checks `isAuthenticated` BEFORE calling a customer-gated mutation (reels Q2 fix)                                    | The web tRPC client auto-redirects on UNAUTHORIZED — checking first lets the UI show an inline affordance. |
| **Scheduled Reminder Job**      | `gob-reminders` — `upsertJobScheduler` + a `licenseRemindedAt` dedupe stamp (G3)                                                      | Cron-style reminders with replay safety.                                                                   |
| **Mobile Pure-Helper Layer**    | `apps/mobile/src/utils/*.ts` — logic as node-testable pure functions; screens stay thin                                               | RN components can't run in node tests; CI runs the pure layer.                                             |
| **Tie-Shuffle-Proof E2E**       | Reels specs scroll the feed until the target is active; seed anchors use titleJson path equality, not ids (createMany timestamps tie) | Equal createMany timestamps shuffle feed order per DB — tests must not assume order.                       |

## Patterns We Don't Use (and Why)

| Pattern                  | Why We Skip It                                                                                             |
| ------------------------ | ---------------------------------------------------------------------------------------------------------- |
| **CQRS**                 | No read/write separation beyond materialized analytics. Premature at 1K–10K users. _Re-evaluate at 100K+._ |
| **Event Sourcing**       | AuditLog + idempotency keys + attribution ledgers cover our needs.                                         |
| **Saga / Outbox**        | All mutations are single-DB transactions. Needed only if a domain is extracted.                            |
| **Clean Architecture**   | Domain modules + Prisma give ~90% of the benefit at ~20% of the boilerplate.                               |
| **Mediator**             | tRPC is already the mediator.                                                                              |
| **Specification**        | Prisma `where` clauses are composable; the pattern adds abstraction without value.                         |
| **Unit of Work**         | Prisma `$transaction` already does this.                                                                   |
| **Redux/Zustand**        | TanStack Query (via tRPC) owns server state; no complex client state exists.                               |
| **GraphQL/REST/gRPC**    | tRPC is strictly better for an all-TypeScript stack.                                                       |
| **Kubernetes**           | Docker Compose + PM2 covers 1–10 servers. Re-evaluate at 100K+ users.                                      |
| **Kafka**                | BullMQ on Redis is plenty at this scale.                                                                   |
| **Elasticsearch**        | Postgres ILIKE + JSONB handles Arabic search well enough today.                                            |
| **Terraform/Pulumi**     | No cloud infra yet; the `deploy/terraform/` sketch exists for when AWS happens.                            |
| **Feature-toggles SaaS** | A `FeatureFlag` table + middleware exists; no runtime delivery tooling (P2).                               |
| **Drizzle/other ORMs**   | Prisma already migrated and stable; switching costs more than the cold-start pain.                         |

## Patterns We Must Adopt (Production Hardening)

| Pattern                      | What                                                            | Why                                                                                  | Priority |
| ---------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------ | -------- |
| **Circuit Breaker + Retry**  | Per-gateway breaker (MyFatoorah, OpenAI, ZATCA, SMS)            | Today only BullMQ's 3 retries exist. A down gateway degrades the whole booking flow. | 🔴 P0    |
| **Staging Environment**      | Clone of prod (DB + services)                                   | No staging exists; risky changes ride against the shared dev DB.                     | 🔴 P0    |
| **Alerting**                 | Slack/webhook alerts on error rate, payments, disk, queue depth | Sentry catches errors; nobody is paged when queues stall or disk fills.              | 🟡 P1    |
| **Read Replica / CQRS-lite** | Reads → replica, writes → primary                               | Analytics and list queries will hammer the primary at scale.                         | 🟡 P1    |
| **Saga / Outbox**            | Cross-domain consistency guarantees                             | Needed the day a domain becomes its own service.                                     | 🟡 P1    |
| **Bulkhead**                 | Separate queues per external dependency                         | OpenAI exhaustion must not block booking notifications.                              | 🟢 P2    |
| **Health-Check Hierarchy**   | Liveness vs readiness (DB/Redis/gateway probes)                 | Docker healthchecks ping one endpoint; deep readiness checks are missing.            | 🟢 P2    |

---

# PART 3 — Technology Decisions — Honest Assessment

## What We Use and Why

| Tech                   | Version     | Reason                                                                  | Choose again?                                     |
| ---------------------- | ----------- | ----------------------------------------------------------------------- | ------------------------------------------------- |
| **tRPC**               | v11         | End-to-end type safety, Zod built-in, no codegen.                       | ✅ Yes — best decision in the stack               |
| **Next.js App Router** | 16.4        | Hybrid SSR/CSR, RSC server callers, middleware.                         | ✅ Yes                                            |
| **Expo**               | SDK 58      | One RN codebase (RN 0.88) → iOS/Android/web + EAS OTA + APK pipeline.   | ✅ Yes                                            |
| **Prisma**             | 7.10        | Typed queries + driver adapter (PrismaPg) + hand-reviewed migrations.   | ⚠️ Maybe — cold start still slow; Drizzle lighter |
| **PostgreSQL**         | 15+ (dev)   | JSONB bilingual, rock solid, single source of truth.                    | ✅ Yes                                            |
| **Redis (ioredis)**    | 6           | Cache + BullMQ queues + rate limiting — one tool, three jobs.           | ✅ Yes                                            |
| **BullMQ**             | 6.4         | Reliable queues, retries/backoff, job schedulers (weekly reminders).    | ✅ Yes                                            |
| **Zod**                | 4.6         | Runtime validation that infers types.                                   | ✅ Yes                                            |
| **Socket.IO**          | 4.8         | Realtime events with polling fallback.                                  | ✅ Yes                                            |
| **Sentry**             | SDK 11      | ACTIVE on web client/server/edge + api facade, DSN wired, E2E-verified. | ✅ Yes                                            |
| **MyFatoorah**         | v2          | Saudi gateway with SHIPPING + ZATCA invoicing path.                     | ✅ Yes (live token still user-gated)              |
| **Tailwind CSS**       | 4.3         | Utility-first, RTL-friendly, tiny output, dark-mode tokens.             | ✅ Yes                                            |
| **pnpm + Turborepo**   | 9.15 + 2.11 | Strict workspace installs + cached builds (GH remote cache in CI).      | ✅ Yes                                            |
| **Vitest**             | 5.0         | Fast unit/integration tests (246 api files, ~1,500+ tests).             | ✅ Yes                                            |
| **Playwright**         | —           | E2E on chromium + firefox + mobile-chrome, axe a11y gate.               | ✅ Yes                                            |
| **k6**                 | —           | Load-test scripts (7.2).                                                | ✅ Yes                                            |
| **TypeScript**         | 6.0         | Strict everywhere incl. noUncheckedIndexedAccess.                       | ✅ Yes                                            |
| **Node**               | 22          | Required by the toolchain (vitest 5, turbo).                            | ✅ Yes                                            |

## What We Don't Use and Why

| Tech                     | Why We Skip It                                                                                      |
| ------------------------ | --------------------------------------------------------------------------------------------------- |
| **Kubernetes**           | Docker Compose + PM2 covers 1–10 servers. Re-evaluate at 100K+ users.                               |
| **Terraform/Pulumi**     | No cloud infra yet; the `deploy/terraform/` sketch exists for when AWS happens.                     |
| **Elasticsearch**        | Postgres ILIKE + JSONB handles Arabic search well enough today.                                     |
| **Kafka**                | BullMQ on Redis is plenty. Kafka only for massive event streaming.                                  |
| **Feature-toggles SAAS** | A `FeatureFlag` table + tRPC middleware already exists; no runtime tooling (P2).                    |
| **Drizzle/other ORMs**   | Prisma already migrated and stable; switching costs more than the cold-start pain.                  |
| **CDN (CloudFront)**     | User-gated infra item — reels video serves from S3 directly today. MUST add pre-launch.             |
| **Moderation API**       | Manual-only moderation queue today (R6) — MUST wire an API pre-launch per the reels plan checklist. |
| **S3 lifecycle rules**   | Reel media accumulates unbounded — MUST add expiry/bucketing pre-launch.                            |

## What We Must Add (Production Checklist)

| Priority | Item                                    | Why                                                                                      | Effort         |
| -------- | --------------------------------------- | ---------------------------------------------------------------------------------------- | -------------- |
| 🔴 P0    | **MyFatoorah live token**               | The ONLY blocker to real charges; gateway still runs on dev stubs.                       | 5 min (user)   |
| 🔴 P0    | **Database backup cron**                | `scripts/backup-db.sh` shipped but unscheduled; an un-scheduled backup protects nothing. | 1 hr           |
| 🔴 P0    | **CDN + S3 lifecycle + moderation API** | The reels pre-deployment checklist — video costs and content risk grow every day.        | 1–2 days       |
| 🔴 P0    | **Circuit breaker (gateways)**          | See Part 2.                                                                              | 8 hr           |
| 🟡 P1    | **SSL + Nginx**                         | HTTPS is non-negotiable for a payment platform.                                          | 2 hr           |
| 🟡 P1    | **Prometheus + Grafana**                | Replace in-memory counters with real metrics + dashboards.                               | 8 hr           |
| 🟡 P1    | **Alerting**                            | Error rate, payment failures, queue depth, disk >80%.                                    | 4 hr           |
| 🟡 P1    | **Staging environment**                 | Test against a prod clone, not the shared dev DB.                                        | 8 hr           |
| 🟡 P1    | **Apple Developer account (~$99/yr)**   | The ONLY blocker to an iOS dev client + App Store.                                       | account signup |
| 🟢 P2    | **App-store submission**                | EAS pipeline ready (Android APK built); staged rollout pending.                          | 1 day          |
| 🟢 P2    | **Penetration test**                    | OWASP ZAP or manual — verify CSRF/XSS/injection hardening.                               | 8 hr           |
| 🟢 P3    | **Blue-green deploys**                  | Zero-downtime deploys incl. migrations.                                                  | 8 hr           |

---

# PART 4 — Code Architecture (Micro Level)

## API structure

```
packages/api/src/
├── routers/          # 267 tRPC routers (per-domain files)
├── domains/          # domain barrels (the extraction seams)
├── lib/              # facades: fatoorah, sentry, jwt, redis, rateLimit, csrf,
│                     #   errors, storeCheckout, pricing, analyticsEngine…
├── validators/       # Zod schemas (shared by routers + contract tests)
├── queues/ + workers/# BullMQ definitions + standalone worker process
├── socket/           # Socket.IO server + typed emitters
└── __tests__/        # 246 test files (~1,500 tests)
```

**Contract gates (never edit casually):**

- `trpc-procedures.test.ts` — exactly **267 routers** (bump deliberately per new router).
- `router-inventory.test.ts` — **1,211 procedures** + tier map + SHA-256 hash (re-base via `-u` on a clean tree only; THREE gates: counts + detail snap + hash).
- `money-integrity.test.ts` — no free money: topUp never mints balance, gateway state only from verified callbacks, refunds reverse cashback.
- `catalog.test.ts` — i18n invariants: ar+en present, trim-safe, per-platform split guards.
- `check-size-budgets.mjs` — per-class gzipped budgets (221/213/298/226 KB baseline) + mobile-catalog leak sentinels + locale-split sentinels.
- `generate-locale-catalogs.mjs --check` (drift) + `check-config-hygiene` + `check-sitemap` — codegen/config/sitemap integrity.
- `find-static-arabic.mjs` — zero hardcoded Arabic outside `t()` (allowlist empty).
- `check-cycles.mjs` + `gen-dependency-graph.mjs` — import-graph discipline.

## Request flow (booking create, simplified)

```
tRPC middleware: requestCounter → rateLimit → csrf → isAuthed → hasRole
  → Zod parse → Prisma $transaction (slot/amount/code/record)
  → BullMQ side-effects (cashback, loyalty, notifications, calendar)
  → Socket.IO emits → response
```

## Reels commerce flow (Phase 3, shipped)

```
Feed slide (virtualized, autoplay-muted)
  → tag chip tap → ShortTagClick (product snapshot, anon allowed)
  → authenticated: marketplace.addToCart (auth-gated BEFORE the call)
  → nightly handleDailyStatsJob: order ←→ click join over the 7-day window
  → VendorDailyStat.reelOrders/reelRevenue + ReelDailyStat per (short, day)
  → vendorPortal.reelAnalytics reads ONLY the read models
```

## UI structure

- **4-state pattern** on every data page: loading → error(retry) → empty(CTA) → data.
- **i18n**: `useLocale().t` (client) / `getServerLocale() + t(key, locale)` (server), literal keys only, per-platform + per-locale catalogs, generated files alphabetically sorted.
- **Design tokens** in globals.css (light/dark) — semantic status colors keep WCAG AA.

## The Honest Verdict

### Strengths

- **Type safety end-to-end** — tRPC + Zod + TS strict; cross-platform key misuse is a compile error.
- **Money integrity is regression-pinned** — fail-closed gateways, verified callbacks, idempotency keys everywhere.
- **CI is a real gate, not theater** — 9 checks incl. E2E+axe, size budgets, leak guards, contract hashes.
- **Error states are systemic** — every data page fails loud with a retry path.
- **Barrel discipline is complete and ratcheted** — all 267 routers export through their domain barrel.
- **The read-model pattern is now proven twice** — D1 daily stats and reels Q3 attribution; analytics never touches live order tables.
- **Full commerce loop shipped end-to-end** — reels Phases 1–3: uploads → moderation → feeds → watch analytics → shoppable tags → conversion attribution → portal analytics (20 PRs, #541–#558).
- **Vendor OS complete** — analytics, health score, reputation, disputes, deals, inbox, payouts, staff, store-services on the shared booking engine (no forks).
- **i18n is complete and guarded** — zero static Arabic; per-locale lazy loading; drift gate.
- **Seed is fully typed** — no `(prisma as any)` casts remain; the drift class is closed.

### Weaknesses (hard truths)

- **No staging environment** — risky changes ride against the shared dev DB; the local suite shares it too.
- **E2E login flake persists** — bcrypt-under-load timeouts under parallel workers; retries absorb most; always read the playwright-report artifact before blaming a diff.
- **Single points of failure** — one PostgreSQL, one Redis, no failover.
- **Gateway resilience** — no circuit breaker; a down MyFatoorah degrades checkout.
- **FE-007 gap** — reality 213–298 KB gz vs 100–150 KB target; framework chunks are the fixed cost; app-code slimming continues against the ratcheted baseline.
- **iOS physical device blocked** — no Apple Developer account.
- **Store accounts are role-less** — `UserRole` has no VENDOR; store owners are CUSTOMER-role users with a Vendor row.
- **CI trigger gaps happen** — pushes occasionally don't create workflow runs; the recovery is the branch-update push (merge master, push — a real commit always triggers).
- **Watchers die under memory pressure** — background CI pollers get reaped; one-shot checks on demand.

### The Next Leap

1. **Production infra** — CDN for reel video, S3 lifecycle, RDS + read replica, ElastiCache.
2. **Resilience** — circuit breakers, alerting, staging environment, backup cron.
3. **Moderation SLA** — wire a moderation API into the reels pipeline; keep humans for borderline.
4. **Mobile release** — EAS staged rollout to both stores (Apple account first).
5. **Compliance** — third-party pentest, NCA-ECC/SOC 2 for the Saudi market.
6. **Audit hygiene** — run the next deep audit when the next big wave lands (pattern: AUDIT_YYYY-MM-DD.md).
