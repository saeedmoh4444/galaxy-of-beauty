# Brain Code — Galaxy of Beauty

> **Honest architecture audit:** What we use, what we skip, and what we must adopt.
> No fluff. No marketing. Just engineering decisions and their reasons.

---

## The Blueprint (Macro Architecture)

### 1. Software Engineering Paradigm — _What academic term describes this system?_

**Paradigm: Feature-Driven, Domain-Modular Monolith**

We practice **Feature-Driven Design (FDD)** at the project level and **Domain-Driven Design (DDD) Lite** at the code level. The system is a **modular monolith** — not microservices, but organized so each domain _could_ be extracted independently.

```
Academic classification:
├── Paradigm:          Declarative + Imperative hybrid
├── Architecture:      Modular Monolith (not Microservices)
├── Decomposition:     Domain-based (14 bounded contexts)
├── Communication:     Synchronous (tRPC) + Async (BullMQ)
└── Data:              Single PostgreSQL (no CQRS, no read replicas)
```

**Why not Microservices?**

- Team size: 1-3 developers. Microservices overhead would kill velocity.
- 14 domain modules give us 80% of the benefit at 5% of the cost.
- We can extract a domain into a service later if needed (the barrel pattern enables this).

### 2. Software Anatomy — _What organs does this system have?_

```
galaxy-of-beauty/                    # The Body
├── apps/
│   ├── web/          (Next.js 15)   # The Face — user-facing web app
│   └── mobile/       (Expo 57)      # The Hands — mobile companion
├── packages/
│   ├── api/          (tRPC v11)     # The Brain — business logic, 177 routers
│   ├── db/           (Prisma)       # The Spine — data persistence
│   ├── shared/       (pure TS)      # The Blood — types, constants, i18n
│   ├── ui/           (React)        # The Skin — 18 reusable components
│   └── config/       (tooling)      # The DNA — lint, format, type rules
├── docker-compose.yml               # The Circulatory System
├── turbo.json                       # The Nervous System (orchestration)
└── pnpm-workspace.yaml              # The Skeleton
```

### 3. Structural Blueprint — _What industry metaphor fits?_

**Metaphor: The Shopping Mall**

| Layer            | Mall Equivalent | Our Implementation                    |
| ---------------- | --------------- | ------------------------------------- |
| Storefronts      | Pages/Routes    | 254 Next.js routes (public stores)    |
| Back Offices     | Admin Panel     | `/admin/*` — 25 management pages      |
| Loading Docks    | API Layer       | tRPC — goods come in and out          |
| Warehouse        | Database        | PostgreSQL — inventory, orders, users |
| Security Office  | Auth Middleware | JWT + CSRF + rate limiting            |
| Delivery Fleet   | Job Queues      | BullMQ — async order processing       |
| Mall Directory   | Domain Modules  | 14 domains — organized by department  |
| Mall Map         | Sitemap         | 41 SEO pages                          |
| Security Cameras | Monitoring      | Real DB/Redis/perf metrics            |

### 4. Software Architecture and Design — _The standard CS term_

**Architecture Style: Layered + Domain-Modular Monolith**

```
┌─────────────────────────────────────────┐
│         PRESENTATION LAYER              │
│  apps/web (Next.js)  apps/mobile (Expo) │
├─────────────────────────────────────────┤
│          APPLICATION LAYER              │
│  packages/api (tRPC routers)            │
│  ├── domains/auth       (3 routers)     │
│  ├── domains/booking    (12 routers)    │
│  ├── domains/catalog    (14 routers)    │
│  ├── domains/payments   (9 routers)     │
│  ├── domains/loyalty    (8 routers)     │
│  ├── domains/social     (12 routers)    │
│  ├── domains/admin      (13 routers)    │
│  ├── domains/ai         (10 routers)    │
│  ├── domains/zatca      (1 router)      │
│  ├── domains/realtime   (7 routers)     │
│  ├── domains/content    (15 routers)    │
│  ├── domains/market     (13 routers)    │
│  ├── domains/wellness   (21 routers)    │
│  └── domains/operations (18 routers)    │
├─────────────────────────────────────────┤
│         INFRASTRUCTURE LAYER            │
│  packages/db (Prisma)                   │
│  Redis (cache + queues + rate limiting) │
│  Docker (containerization)              │
└─────────────────────────────────────────┘
```

---

## The Tools (Design Patterns — Micro Level)

### Patterns We Use (and Why)

| Pattern                 | Where                          | Why We Chose It                                                                                 |
| ----------------------- | ------------------------------ | ----------------------------------------------------------------------------------------------- |
| **Repository**          | Prisma client in `packages/db` | Single data access point. Swap DB without touching business logic.                              |
| **Middleware Pipeline** | tRPC middleware chain          | `rateLimitGuard → isAuthed → hasRole → csrfGuard → handler`. Composable, testable.              |
| **State Machine**       | Booking lifecycle              | 10 states, 6 actions, role-gated transitions. Impossible to reach invalid states.               |
| **Observer**            | Socket.IO events               | `emitToUser()`, `emitToTechnician()` — decoupled real-time notifications.                       |
| **Command**             | BullMQ jobs                    | `walletQueue.add('cashback.accrue', {...})` — fire and forget.                                  |
| **Factory**             | Queue/Worker creation          | `createQueue(name)`, `createWorker(name, handler)` — consistent Redis connection handling.      |
| **Strategy**            | Rate limiting tiers            | Anonymous (20/min), Authenticated (60/min), Admin (300/min). Swappable per tier.                |
| **Decorator**           | tRPC middleware                | `customerProcedure = protectedProcedure.use(hasRole('CUSTOMER'))`. Wraps behavior.              |
| **Module**              | Barrel exports                 | 14 `domains/<name>/index.ts` — clean imports, single entry point.                               |
| **Facade**              | Domain modules                 | `import { bookingRouter, slotRouter } from '../domains/booking'` — hides 12 individual imports. |
| **Adapter**             | `useAuth` storage              | Pluggable `AuthStorage` interface — localStorage (web) or SecureStore (mobile).                 |
| **Singleton**           | Prisma client, Redis client    | `globalForPrisma.prisma` — one connection pool per process.                                     |
| **Circuit Breaker**     | Rate limiter fail-open         | `if (!redis) return { allowed: true }` — availability over consistency.                         |

### Patterns We Don't Use (and Why)

| Pattern                | Why We Skip It                                                                                                                          |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| **CQRS**               | No read/write separation. Single PostgreSQL. Premature optimization at our scale (1K-10K users). _Will need it at 100K+ users._         |
| **Event Sourcing**     | Massive complexity. We use simple AuditLog instead. Event sourcing only justified for financial ledgers or compliance-critical systems. |
| **Saga**               | No distributed transactions. All mutations are single-DB. If we extract microservices later, we'll need Sagas.                          |
| **Clean Architecture** | Overkill. Our domain modules + Prisma repository give us 90% of Clean Architecture benefits at 20% of the boilerplate.                  |
| **Mediator**           | tRPC is already a mediator. Adding MediatR/CQRS library would be redundant.                                                             |
| **Specification**      | Prisma `where` clauses are already composable. A specification pattern would add abstraction without value.                             |
| **Unit of Work**       | Prisma `$transaction` handles this. Explicit UoW would duplicate what Prisma already does.                                              |
| **Proxy**              | No need. tRPC client is already a type-safe proxy to the server.                                                                        |

### Patterns We Must Adopt (Production Hardening)

| Pattern                                  | What                                            | Why We Need It                                                                                                                             | Priority            |
| ---------------------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------- |
| **Read Replica / CQRS-lite**             | Route reads to replica, writes to primary       | Analytics queries (heatmaps, reports) will hammer the primary DB at scale.                                                                 | 🔴 P0 at 10K+ users |
| **Saga / Outbox**                        | Guarantee cross-domain consistency              | Booking create → wallet + loyalty + notification. If one fails, we need compensation. Currently fire-and-forget (at-least-once).           | 🟡 P1 at 50K+ users |
| **Retry with Backoff**                   | Exponential backoff on external API calls       | PayFort, OpenAI, ZATCA, SMS gateways fail. Currently 3 retries on BullMQ. Need circuit breaker for external APIs.                          | 🟡 P1               |
| **Correlation ID / Distributed Tracing** | Trace a request across services                 | Currently we have request counting but no end-to-end tracing. Needed for debugging production issues.                                      | 🟡 P2               |
| **Feature Toggle Service**               | Runtime feature flags without redeploy          | We have a FeatureFlag table + tRPC middleware. Need admin UI + gradual rollout (0%→100%).                                                  | 🟢 P2               |
| **API Versioning**                       | `/api/v1/`, `/api/v2/` or header-based          | tRPC doesn't need URL versioning (types are the contract). But mobile app needs backward-compatible API changes.                           | 🟢 P3               |
| **Bulkhead**                             | Isolate resource pools per domain               | If `ai.chatbot` exhausts OpenAI rate limit, it shouldn't block `bookings.create`. Separate queue per external dependency.                  | 🟡 P2               |
| **Health Check Hierarchy**               | Deep health checks (DB + Redis + external APIs) | Docker healthchecks currently ping the tRPC health endpoint. Production needs: liveness (process alive) vs readiness (dependencies ready). | 🟡 P1               |

---

## Code Architecture — How Our Code is Organized

### File Structure (Feature-Driven)

```
src/
├── routers/           # 177 tRPC procedure files
│   ├── auth.ts
│   ├── bookings.ts
│   └── ...
├── domains/           # 14 domain barrel modules
│   ├── auth/index.ts
│   ├── booking/index.ts
│   └── ...
├── lib/               # Shared infrastructure
│   ├── jwt.ts         # Token signing/verification
│   ├── redis.ts       # Redis client singleton
│   ├── rateLimit.ts   # Tiered rate limiting
│   ├── csrf.ts        # CSRF protection
│   ├── errors.ts      # Typed error catalog
│   ├── requestCounters.ts  # In-memory metrics
│   └── zatcaMock.ts   # ZATCA sandbox
├── validators/        # Zod schemas
│   ├── auth.ts
│   ├── booking.ts
│   ├── catalog.ts
│   └── payment.ts
├── queues/            # BullMQ queue definitions
│   └── index.ts       # wallet, loyalty, notifications, integrations
├── workers/           # Background job handlers
│   ├── index.ts       # Worker factory + handlers
│   ├── run.ts         # Standalone worker process
│   └── tokenCleanup.ts # Expired token purge
├── socket/            # WebSocket server
│   ├── index.ts       # Event emitters
│   └── server.ts      # Socket.IO server
└── __tests__/         # 16 test suites, 318 tests
```

### Request Flow (Booking Creation)

```
1. POST /api/trpc/bookings.create
   │
2. tRPC Middleware Pipeline
   ├── requestCounter    → incrementRequestCount() + start timer
   ├── rateLimitGuard    → check Redis counter
   ├── csrfGuard         → verify X-CSRF-Token header
   ├── isAuthed          → verify JWT access token
   └── hasRole('CUSTOMER')
   │
3. Zod Validation
   └── createBookingSchema.parse(input)
   │
4. Prisma Transaction
   ├── Validate slot availability
   ├── Calculate total amount
   ├── Generate booking code
   ├── Create booking record
   └── Mark slot as booked
   │
5. Async Side Effects (fire-and-forget)
   ├── walletQueue.add('cashback.accrue')     → 5% cashback
   ├── loyaltyQueue.add('points.earn')        → earn points
   ├── notificationQueue.add('booking.created') → notify customer
   ├── notificationQueue.add('booking.requested') → notify technician
   └── integrationQueue.add('calendar.create') → Google Calendar sync
   │
6. Real-time Events (immediate)
   ├── emitToTechnician('new_booking_request')
   ├── emitToUser('new_booking_request')
   └── emitToAdmin('admin_update')
   │
7. Response
   └── Return booking with full relations
   │
8. recordTiming('bookings.create', duration) → monitoring dashboard
```

### Component Hierarchy (4-State Pattern)

```
Every data-fetching page:
┌──────────────────────────────────┐
│         Page Component           │
│  ┌────────────────────────────┐  │
│  │   isLoading → <Skeleton>   │  │  ← 11 variants (Dashboard, CardList, etc.)
│  │   isError  → <ErrorAlert>  │  │  ← Retry button
│  │   isEmpty  → <EmptyState>  │  │  ← CTA action
│  │   data     → <DataView>    │  │  ← Actual content
│  └────────────────────────────┘  │
└──────────────────────────────────┘
```

---

## Technology Decisions — Honest Assessment

### What We Use and Why

| Tech                      | Reason                                                                   | Would We Choose Again?                                                 |
| ------------------------- | ------------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| **tRPC v11**              | End-to-end type safety without code generation. Zod validation built in. | ✅ Yes — best decision in the stack.                                   |
| **Next.js 15 App Router** | Hybrid SSR/CSR. ISR for static pages. Middleware for auth.               | ✅ Yes — stayed with Next through the v14→v15 migration.               |
| **Prisma**                | Type-safe queries, migrations, great DX.                                 | ⚠️ Maybe — Drizzle ORM is lighter. Prisma cold start is slow.          |
| **Expo SDK 54**           | Write once, deploy to iOS + Android + Web.                               | ⚠️ Maybe — React Native has rough edges. Flutter for better mobile UX. |
| **BullMQ**                | Redis-backed job queues. Exactly what we needed.                         | ✅ Yes — but need monitoring dashboard for queues.                     |
| **Tailwind CSS**          | Utility-first, no CSS files, great with RTL.                             | ✅ Yes — production build is tiny (purged).                            |
| **PostgreSQL**            | Rock solid, JSONB for Arabic content, full-text search.                  | ✅ Yes — no reason to use anything else.                               |
| **Redis**                 | Cache, rate limiting, job queues, session store.                         | ✅ Yes — single Redis does everything we need.                         |
| **Zod**                   | Runtime validation that infers TypeScript types.                         | ✅ Yes — essential for API safety.                                     |
| **Socket.IO**             | Real-time events, fallback to polling.                                   | ⚠️ Maybe — could use tRPC WebSocket subscriptions instead.             |
| **pnpm**                  | Fast, strict, disk-efficient.                                            | ✅ Yes — beats npm and yarn.                                           |
| **Turborepo**             | Build caching, parallel execution.                                       | ✅ Yes — saves minutes on CI.                                          |

### What We Don't Use and Why

| Tech                                   | Why We Skip It                                                                                                       |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| **GraphQL**                            | tRPC gives us type safety without schema stitching, codegen, or N+1 problems. GraphQL adds complexity we don't need. |
| **REST**                               | tRPC is strictly better for TypeScript-only stacks. REST only needed for public/external APIs.                       |
| **gRPC**                               | Overkill. tRPC + HTTP/2 gives enough performance. gRPC needed for polyglot microservices.                            |
| **Redux / Zustand**                    | TanStack Query (via tRPC) handles server state. No complex client state to manage.                                   |
| **React Native Web**                   | We use Expo web export for mobile preview, but web gets its own Next.js app. Better UX.                              |
| **Kubernetes**                         | Overkill at our scale. Docker Compose + PM2 handles 1-10 servers perfectly. Re-evaluate at 100K+ users.              |
| **Terraform / Pulumi**                 | We don't have cloud infra yet. When we move to AWS, we'll need IaC.                                                  |
| **Elasticsearch**                      | PostgreSQL full-text search with ILIKE handles Arabic well enough. Re-evaluate if search becomes a bottleneck.       |
| **Apache Kafka**                       | BullMQ on Redis handles our async workload. Kafka needed only for event streaming at massive scale.                  |
| **Sentry** (configured but not active) | We have the SDK integrated (`@sentry/nextjs`) but no DSN configured. Should activate for production.                 |

### What We Must Add (Production Checklist)

| Priority | Item                       | Why                                                                                                  | Effort |
| -------- | -------------------------- | ---------------------------------------------------------------------------------------------------- | ------ |
| 🔴 P0    | **Sentry DSN**             | Error tracking in production. Already integrated, just needs env var.                                | 5 min  |
| 🔴 P0    | **Database Backups**       | `pg_dump` cron job or RDS automated snapshots. No backups = business risk.                           | 1 hr   |
| 🔴 P0    | **SSL Certificates**       | Let's Encrypt + Nginx. HTTPS is non-negotiable for a payment platform.                               | 2 hr   |
| 🟡 P1    | **Prometheus + Grafana**   | Replace our in-memory monitoring with real metrics. Prometheus for scraping, Grafana for dashboards. | 8 hr   |
| 🟡 P1    | **Alerting**               | PagerDuty or Slack webhooks. Alert on: error rate >5%, DB down, payment failures, disk >80%.         | 4 hr   |
| 🟡 P1    | **Read Replicas**          | Route analytics/reports/list queries to read replica. Primary DB for writes only.                    | 16 hr  |
| 🟡 P1    | **CDN**                    | Cloudflare or CloudFront for static assets, images, and API caching.                                 | 4 hr   |
| 🟢 P2    | **Load Testing**           | Run k6 script against staging with real traffic patterns. Find breaking point.                       | 4 hr   |
| 🟢 P2    | **Penetration Testing**    | OWASP ZAP or manual pentest. Verify CSRF, XSS, SQL injection protection.                             | 8 hr   |
| 🟢 P3    | **Blue-Green Deployments** | Zero-downtime deploys. PM2 reload is fast but not zero-downtime for DB migrations.                   | 8 hr   |

---

## The Honest Verdict

### Strengths

- **Type safety**: tRPC + Zod + TypeScript strict. Zero runtime type errors in production paths.
- **Domain separation**: 14 modules with clear boundaries. A new developer can understand `domains/booking/` without reading `domains/loyalty/`.
- **Testing**: 318 tests cover all critical paths. Rate limiting, CSRF, auth flows, booking state machine.
- **Monitoring**: Real metrics replaced all mock data. DB connections, Redis memory, API performance.
- **Mobile parity**: 27 screens use the same tRPC API as web. Single source of truth.

### Weaknesses

- **`as any` usage**: ~47 web pages still use type assertions. tRPC's deeply nested RouterOutput types hit TypeScript limits. Mitigated by Zod runtime validation.
- **Mobile implementation depth**: 27 screens are solid. The remaining 230+ are placeholder-level. Works but not production-polished.
- **No staging environment**: Testing against production DB is risky. Need a proper staging clone.
- **Single point of failure**: One PostgreSQL, one Redis. No failover. Acceptable for MVP, not for 99.9% SLA.
- **Noisy ESLint output**: ~284 a11y warnings (mostly `jsx-a11y`). Axe audit needed but not blocking.

### The Next Leap (From $110K Platform to $250K+ Platform)

1. **Production infrastructure** — AWS RDS with read replicas, ElastiCache Redis, CloudFront CDN
2. **Observability** — Prometheus + Grafana + Sentry + PagerDuty
3. **Mobile production** — EAS submit to App Store + Play Store, staged rollout
4. **Scale testing** — k6 load test at 1K concurrent users, find and fix bottlenecks
5. **Security audit** — Third-party pentest, SOC 2 or NCA-ECC compliance for Saudi market
