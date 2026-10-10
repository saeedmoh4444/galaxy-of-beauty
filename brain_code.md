# Brain Code — Galaxy of Beauty

> **Honest architecture audit:** What we use, what we skip, and what we must adopt.
> No fluff. No marketing. Just engineering decisions and their reasons.
> Last rebuilt: 2026-10-09 (post 12-PR wave: F1-F6 fixes, S1 store dashboard, S2 mobile stores, S3 commissions, Q4 seed typing, Q1 tree-shaking).

---

# PART 1 — The Blueprint (Macro Architecture)

## 1. Software Engineering Paradigm — _The Academic Term_

**Paradigm: Feature-Driven, Domain-Modular Monolith** with **Domain-Driven Design (DDD) Lite** at the code level.

```
Academic classification:
├── Paradigm:          Declarative + Imperative hybrid (typed functional core, imperative IO edges)
├── Architecture:      Modular Monolith — NOT microservices
├── Decomposition:     Domain-based — 15 bounded contexts (domain barrels)
├── Communication:     Synchronous (tRPC, type-safe RPC) + Async (BullMQ on Redis) + Real-time (Socket.IO)
├── Data:              Single PostgreSQL (JSONB bilingual fields), Redis for cache/queues/rate-limits
└── Typing:            End-to-end TypeScript strict — tRPC + Zod infer the contract, no codegen
```

**Why not Microservices?**

- Team size: 1–3 developers. Microservices overhead would kill velocity.
- 15 domain modules give ~80% of the benefit at ~5% of the cost; the barrel pattern means any domain _can_ be extracted later.
- Single-DB transactions are still cheap at this scale; Sagas/Outbox are only justified when extraction happens.

## 2. Software Anatomy — _The Practical Term_

```
galaxy-of-beauty/                       # The Body
├── apps/
│   ├── web/      Next.js 16.3 App Router   # The Face — 319 routes, SEO, dashboards
│   └── mobile/   Expo SDK 57 (RN 0.86.3)   # The Hands — 314 screens, OTA via EAS
├── packages/
│   ├── api/      tRPC v11                  # The Brain — 266 routers / 1,114 procedures, 15 domains
│   ├── db/       Prisma 7 + PostgreSQL     # The Spine — schema, 100+ migrations, seed
│   ├── shared/   pure TS                   # The Blood — types, i18n (split per platform), constants
│   ├── ui/       React 19 + Tailwind 4     # The Skin — 560 components + design tokens
│   └── config/   tooling                   # The DNA — shared tsconfig, eslint-flat, prettier
├── scripts/                                # The Immune System — 20+ gates: budgets, leaks,
│                                           #   Arabic scan, cycles, dedupe, prune
├── docker-compose.yml + .prod.yml          # The Circulatory System
├── turbo.json + pnpm-workspace.yaml        # The Nervous System
└── .github/workflows/ci.yml                # The Reflex Arc — 9-check CI pipeline
```

## 3. Structural Blueprint — _The Industry Metaphor_

**Metaphor: The Shopping Mall**

| Layer            | Mall Equivalent | Our Implementation                          |
| ---------------- | --------------- | ------------------------------------------- |
| Storefronts      | Pages/Routes    | 319 Next.js routes (public + customer)      |
| Back Offices     | Admin Panels    | `/admin/*`, `/tech/*`, vendor portals       |
| Loading Docks    | API Layer       | tRPC — 266 routers, tiered auth             |
| Warehouse        | Database        | PostgreSQL — bilingual JSONB, Prisma 7      |
| Security Office  | Auth Middleware | JWT + 2FA + CSRF + tiered rate limiting     |
| Delivery Fleet   | Job Queues      | BullMQ — wallet/loyalty/notifications       |
| Mall Directory   | Domain Modules  | 15 domains via barrel exports               |
| Security Cameras | Monitoring      | Sentry (active) + audit logs + SLO status   |
| Payment Desk     | Gateway         | MyFatoorah (hosted invoice link + shipping) |

## 4. Software Architecture and Design — _The Standard Term_

**Architecture Style: Layered + Domain-Modular Monolith**

```
┌───────────────────────────────────────────────┐
│           PRESENTATION LAYER                  │
│  apps/web (Next.js 16)  apps/mobile (Expo 57) │
│  → useLocale / t(key) per-platform catalogs   │
├───────────────────────────────────────────────┤
│            APPLICATION LAYER                  │
│  packages/api — 15 domain barrels:            │
│  admin · ai · auth · booking · catalog ·      │
│  content · loyalty · market · operations ·    │
│  payments · realtime · safety · social ·      │
│  wellness · zatca                             │
│  → tiered procedures (public/protected/       │
│    customer/technician/admin)                 │
├───────────────────────────────────────────────┤
│            INFRASTRUCTURE LAYER               │
│  packages/db (Prisma 7, 100+ migrations)      │
│  Redis (cache + BullMQ queues + rate limits)  │
│  External: MyFatoorah · Sentry · ZATCA ·      │
│    OpenAI · Google Calendar · SMS · WhatsApp  │
└───────────────────────────────────────────────┘
```

---

# PART 2 — The Tools (Design Patterns — Micro Level)

## Patterns We Use (and Why)

| Pattern                    | Where                                  | Why                                                                                      |
| -------------------------- | -------------------------------------- | ---------------------------------------------------------------------------------------- |
| **Module (Barrel)**        | 15 `domains/<name>/index.ts`           | Single entry per domain; extraction-ready.                                               |
| **Decorator / Middleware** | tRPC procedure factories               | `customerProcedure = protectedProcedure.use(hasRole('CUSTOMER'))` — composable tiers.    |
| **Repository**             | Prisma client in `packages/db`         | One data access point; swap DB without touching logic.                                   |
| **Facade**                 | `lib/fatoorah.ts`, `lib/sentry.ts`     | Gateway/third-party clients behind typed facades; fail-closed when unconfigured.         |
| **Strategy**               | Payment methods, shipping couriers     | wallet vs online; DHL vs Aramex — swappable per request.                                 |
| **State Machine**          | Booking/order/checkout lifecycles      | Enum-constrained transitions; impossible invalid states (money-integrity).               |
| **Observer**               | Socket.IO emitters                     | `emitToUser/emitToAdmin` — decoupled realtime events.                                    |
| **Command**                | BullMQ jobs                            | Fire-and-forget side effects (`cashback.accrue` etc.), 3 retries + exp backoff.          |
| **Factory**                | Queue/worker creation                  | `createQueue(name)` — consistent Redis wiring.                                           |
| **Singleton**              | Prisma + Redis clients                 | `globalForPrisma` — one pool per process.                                                |
| **Adapter**                | Auth storage (web/mobile)              | localStorage vs SecureStore behind one interface.                                        |
| **Fail-Closed Gateway**    | MyFatoorah/Sentry facades              | No config → throw/console, never fake success (money-integrity regression-pinned).       |
| **Test Seam**              | `_setSentryLoaderForTests`, `vi.mock`  | Deterministic failure simulation without network.                                        |
| **Per-Platform Catalog**   | `i18n/{web,mobile,index}.ts` + runtime | Bundle isolation: web ships 5,268 keys, mobile 8,825; merged module only via `i18n-all`. |

## Patterns We Don't Use (and Why)

| Pattern                | Why We Skip It                                                                          |
| ---------------------- | --------------------------------------------------------------------------------------- |
| **CQRS**               | No read/write separation. Premature at 1K–10K users. _Re-evaluate at 100K+._            |
| **Event Sourcing**     | AuditLog + idempotency keys cover our needs; event sourcing only for financial ledgers. |
| **Saga / Outbox**      | All mutations are single-DB transactions. Needed only if a domain is extracted.         |
| **Clean Architecture** | Domain modules + Prisma already give ~90% of the benefit at ~20% of the boilerplate.    |
| **Mediator**           | tRPC is already the mediator.                                                           |
| **Specification**      | Prisma `where` clauses are composable; the pattern would add abstraction without value. |
| **Unit of Work**       | Prisma `$transaction` already does this.                                                |
| **Redux/Zustand**      | TanStack Query (via tRPC) owns server state; no complex client state exists.            |
| **GraphQL/REST/gRPC**  | tRPC is strictly better for an all-TypeScript stack.                                    |

## Patterns We Must Adopt (Production Hardening)

| Pattern                      | What                                                 | Why                                                                                  | Priority |
| ---------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------ | -------- |
| **Circuit Breaker + Retry**  | Per-gateway breaker (MyFatoorah, OpenAI, ZATCA, SMS) | Today only BullMQ's 3 retries exist. A down gateway degrades the whole booking flow. | 🔴 P0    |
| **Staging Environment**      | Clone of prod (DB + services)                        | No staging exists; risky changes are tested against the shared dev DB.               | 🔴 P0    |
| **Read Replica / CQRS-lite** | Reads → replica, writes → primary                    | Analytics and list queries will hammer the primary at scale.                         | 🟡 P1    |
| **Saga / Outbox**            | Cross-domain consistency guarantees                  | Needed the day a domain becomes its own service.                                     | 🟡 P1    |
| **Alerting**                 | Slack/webhook alerts on error rate, payments, disk   | Sentry catches errors; nobody is paged when queues stall or disk fills.              | 🟡 P1    |
| **Bulkhead**                 | Separate queues per external dependency              | OpenAI exhaustion must not block booking notifications.                              | 🟢 P2    |
| **Health-Check Hierarchy**   | Liveness vs readiness (DB/Redis/gateway probes)      | Docker healthchecks ping one endpoint; deep readiness checks are missing.            | 🟢 P2    |

---

# PART 3 — Technology Decisions — Honest Assessment

## What We Use and Why

| Tech                   | Version    | Reason                                                                                | Choose again?                                        |
| ---------------------- | ---------- | ------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| **tRPC**               | v11        | End-to-end type safety, Zod built-in, no codegen.                                     | ✅ Yes — best decision in the stack                  |
| **Next.js App Router** | 16.3       | Hybrid SSR/CSR, RSC server callers, middleware.                                       | ✅ Yes                                               |
| **Expo**               | SDK 57     | One RN codebase (RN 0.86.3 — aligned for EAS dev builds) → iOS/Android/web + EAS OTA. | ✅ Yes (SDK 58 queued)                               |
| **Prisma**             | 7          | Typed queries + 100+ hand-reviewed migrations.                                        | ⚠️ Maybe — cold start still slow; Drizzle is lighter |
| **PostgreSQL**         | 15+ (dev)  | JSONB for bilingual content, rock solid.                                              | ✅ Yes                                               |
| **Redis (ioredis)**    | 6          | Cache + BullMQ queues + rate limiting — one tool, three jobs.                         | ✅ Yes                                               |
| **BullMQ**             | 6          | Reliable job queues with retries/backoff; admin queues dashboard shipped.             | ✅ Yes                                               |
| **Zod**                | 4          | Runtime validation that infers types.                                                 | ✅ Yes                                               |
| **Socket.IO**          | 4          | Realtime events with polling fallback.                                                | ✅ Yes                                               |
| **Sentry**             | SDK 11     | **ACTIVE** — web client/server/edge + api facade, DSN wired, E2E-verified.            | ✅ Yes                                               |
| **MyFatoorah**         | v2         | Saudi gateway with SHIPPING (countries/cities/charge) — replaced PayFort.             | ✅ Yes (token pending)                               |
| **Tailwind CSS**       | 4          | Utility-first, RTL-friendly, tiny output.                                             | ✅ Yes                                               |
| **pnpm + Turborepo**   | 9.15 + 2.x | Strict workspace installs + cached builds (GH remote cache).                          | ✅ Yes                                               |
| **Vitest**             | 5          | Fast unit/integration tests (1,500+).                                                 | ✅ Yes                                               |
| **Playwright**         | —          | E2E incl. axe a11y gate + visual checks.                                              | ✅ Yes                                               |
| **k6**                 | —          | Load-test scripts (7.2).                                                              | ✅ Yes                                               |
| **TypeScript**         | 6.0        | Strict mode everywhere incl. noUncheckedIndexedAccess.                                | ✅ Yes                                               |

## What We Don't Use and Why

| Tech                     | Why We Skip It                                                                     |
| ------------------------ | ---------------------------------------------------------------------------------- |
| **Kubernetes**           | Docker Compose + PM2 covers 1–10 servers. Re-evaluate at 100K+ users.              |
| **Terraform/Pulumi**     | No cloud infra yet; the `deploy/terraform/` sketch exists for when AWS happens.    |
| **Elasticsearch**        | Postgres ILIKE + JSONB handles Arabic search well enough today.                    |
| **Kafka**                | BullMQ on Redis is plenty. Kafka only for massive event streaming.                 |
| **Feature-toggles SAAS** | A `FeatureFlag` table + tRPC middleware already exists; no runtime tooling (P2).   |
| **Drizzle/other ORMs**   | Prisma already migrated and stable; switching costs more than the cold-start pain. |

## What We Must Add (Production Checklist — updated)

| Priority | Item                                  | Why                                                                                                                                         | Effort         |
| -------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| 🔴 P0    | **MyFatoorah live token**             | Payment gateway still runs on dev stubs; the ONLY blocker to real charges.                                                                  | 5 min          |
| 🔴 P0    | **Database backups**                  | `scripts/backup-db.sh` exists in compose — cron it or use RDS snapshots.                                                                    | 1 hr           |
| 🔴 P0    | **Circuit breaker (gateways)**        | See Part 2.                                                                                                                                 | 8 hr           |
| 🔴 P0    | **Bundle re-measure after #395**      | `sideEffects: false` landed but the real numbers are unmeasured — rebuild, run the size gate, and continue slimming the tRPC/API chunk set. | 4 hr           |
| 🟡 P1    | **SSL + Nginx**                       | HTTPS is non-negotiable for a payment platform.                                                                                             | 2 hr           |
| 🟡 P1    | **Prometheus + Grafana**              | Replace in-memory counters with real metrics + dashboards.                                                                                  | 8 hr           |
| 🟡 P1    | **Alerting**                          | Error rate, payment failures, queue depth, disk >80%.                                                                                       | 4 hr           |
| 🟡 P1    | **Staging environment**               | Test against a prod clone, not the shared dev DB.                                                                                           | 8 hr           |
| 🟡 P1    | **Apple Developer account (~$99/yr)** | The ONLY blocker to an iOS dev client + App Store; Expo Go cannot run the app.                                                              | account signup |
| 🟢 P2    | **App-store submission**              | EAS pipeline is ready (Android APK built + delivered); staged rollout pending.                                                              | 1 day          |
| 🟢 P2    | **Penetration test**                  | OWASP ZAP or manual — verify CSRF/XSS/injection hardening.                                                                                  | 8 hr           |
| 🟢 P3    | **Blue-green deploys**                | Zero-downtime deploys incl. migrations.                                                                                                     | 8 hr           |

---

# PART 4 — Code Architecture (Micro Level)

## API structure

```
packages/api/src/
├── routers/          # 266 tRPC routers (per-domain files)
├── domains/          # 15 barrel modules (the extraction seams)
├── lib/              # facades: fatoorah, sentry, payfort→gone, jwt, redis, rateLimit,
│                     #   csrf, errors, storeCheckout, pricing…
├── validators/       # Zod schemas (shared by routers + contract tests)
├── queues/ + workers/# BullMQ definitions + standalone worker process
├── socket/           # Socket.IO server + typed emitters
└── __tests__/        # 172 test files (~1,500 tests)
```

**Contract gates (never edit casually):**

- `trpc-procedures.test.ts` — exactly **266 routers** (bump deliberately per new router).
- `router-inventory.test.ts` — procedure counts + tier map + SHA-256 hash (re-base via `-u` on a clean tree only).
- `money-integrity.test.ts` — no free money: topUp never mints balance, gateway state only from verified callbacks, refunds reverse cashback.
- `catalog.test.ts` — i18n invariants: ar+en present, trim-safe, per-platform split guards.
- `check-size-budgets.mjs` — per-class gzipped budgets + mobile-catalog leak sentinels.
- `find-static-arabic.mjs` — zero hardcoded Arabic outside `t()` (allowlist now empty).
- `check-cycles.mjs` + `gen-dependency-graph.mjs` — import-graph discipline.

## Request flow (booking create, simplified)

```
tRPC middleware: requestCounter → rateLimit → csrf → isAuthed → hasRole
  → Zod parse → Prisma $transaction (slot/amount/code/record)
  → BullMQ side-effects (cashback, loyalty, notifications, calendar)
  → Socket.IO emits → response
```

## UI structure

- **4-state pattern** on every data page: loading → error(retry) → empty(CTA) → data.
- **i18n**: `useLocale().t` (client) / `getServerLocale() + t(key, locale)` (server), literal keys only, per-platform catalogs.
- **Design tokens** in globals.css (light/dark) — semantic 700-weight status colors must keep WCAG AA.

## The Honest Verdict

### Strengths

- **Type safety end-to-end** — tRPC + Zod + TS strict; the catalog split now makes cross-platform key misuse a _compile error_.
- **Money integrity is regression-pinned** — fail-closed gateways, verified callbacks, idempotency keys everywhere.
- **CI is a real gate, not theater** — 9 checks incl. E2E+axe, size budgets, leak guards, contract hashes.
- **i18n is complete and guarded** — zero static Arabic; 8,825-key catalog; web bundle carries only its 5,268.
- **The sweep pipeline worked** — 16 sequential slice PRs, each independently verifiable, zero regressions.
- **Store/provider system complete (2026-10-08 wave)** — dedicated `/store` dashboard shell, mobile store browsing, commission rates actually applied in settlements with an admin editor, store ratings surfaced, provider registration covering store/clinic/gym/nail-bar/at-home.
- **Seed is fully typed** — all 14 `(prisma as any)` casts removed (#394); the drift class is closed.
- **Tree-shaking unlocked** — `sideEffects: false` on `@galaxy/shared` + `@galaxy/ui` (#395); every route no longer drags the full i18n catalog and UI barrel by default.

### Weaknesses (hard truths)

- **FE-007 gap**: targets are 100–150 KB/route; reality is ~560–650 KB gzipped. The catalog split reclaimed ~91 KB and `sideEffects: false` just landed — **the remaining bulk (shared tRPC/API chunk set) is still unmeasured after #395; the slimming is not done until the gate numbers drop.**
- **No staging environment** — risky changes ride against the shared dev DB (the local test suite runs `env=test` against it too, which pollutes seed data and flaked tests).
- **Single points of failure** — one PostgreSQL, one Redis, no failover.
- **Gateway resilience** — no circuit breaker; a down MyFatoorah degrades checkout (fail-closed, but loudly).
- **Lint warnings tolerated** — ~27–174 pre-existing warnings ride under `--max-warnings`.
- **iOS physical device still blocked** — no Apple Developer account; Expo Go cannot run the app (webrtc/async-storage), so the dev-client APK is the only phone path.
- **Store accounts are role-less** — `UserRole` has no VENDOR; store owners are CUSTOMER-role users with a Vendor row, gated by ownership checks rather than a role.

### The Next Leap (from $110K platform to $250K+ platform)

1. **Production infra** — RDS + read replica, ElastiCache, CloudFront.
2. **Resilience** — circuit breakers, alerting, staging environment, backups.
3. **Bundle reality** — slim the shared chunk set toward the FE-007 targets (catalog split = step 1, `sideEffects: false` = step 2, measure + cut the tRPC/API chunk set = step 3).
4. **Mobile release** — EAS staged rollout to App Store + Play Store.
5. **Compliance** — third-party pentest, NCA-ECC/SOC 2 for the Saudi market.
