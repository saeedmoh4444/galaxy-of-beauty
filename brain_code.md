# Brain Code — Galaxy of Beauty

> **The honest architecture document.** What we use and why, what we skip and why,
> what we must adopt and why. No fluff, no marketing — engineering decisions and their reasons.
> **Rebuilt: 2026-11-18** — the audit build-out program is 100% CLOSED (board zero):
> W1 money integrity ✅ · W2 catalog bookability ✅ · W3 realtime + seller tier + privacy ✅ ·
> W4 web/mobile correctness ✅ · W5 DB & infra hardening ✅ · W6 SEO + i18n + coverage ✅.
> Companion: `Rules_to_make_well_archtichtrue-platform.md` (how to work on it) +
> `docs/AUDIT_2026-11-11_MASTER_PLAN.md` (the closed gap tracker).

---

# PART 1 — The Blueprint (Macro Architecture)

## 1. Software Engineering Paradigms — _The Academic Term_

**Paradigm: Feature-Driven, Domain-Modular Monolith** with **Domain-Driven Design (DDD) Lite**,
a **typed functional core** (pure pricing/loyalty/calendar/i18n engines in `@galaxy/shared` and
`packages/api/src/lib`) and **imperative IO edges** (routers, workers, sockets).

```
Academic classification:
├── Paradigm:          Declarative + Imperative hybrid — pure functions for business rules,
│                      imperative procedures only at the IO boundary
├── Architecture:      Modular Monolith — NOT microservices, NOT serverless
├── Decomposition:     Domain-based — ~267 routers, each a router file + tests + domain barrel
├── Communication:     Sync  → tRPC v11 (end-to-end typed, zod4-validated, no codegen)
│                      Async → BullMQ queues on Redis (payouts/sla/disputes/reminders/
│                              notifications/media + daily-stats + advisor + reconciliation)
│                      Push  → Socket.IO :4001 (standalone process) + Redis pub/sub bridge
├── Data:              ONE PostgreSQL (Prisma 7, ~272 models, bilingual JSONB fields),
│                      Redis for cache / queues / rate-limits / socket adapter
├── Read models:       Materialized daily stats (NOON-UTC buckets) — computed, never guessed
├── State machines:    Explicit booking/dispute/payout/submission transitions (VALID_TRANSITIONS)
└── Typing:            TypeScript strict everywhere; tRPC + Zod infer the contract
```

**Why not microservices?**

- Team size is 1–3. Microservices overhead would kill velocity at this scale.
- Domain barrels give ~80% of the benefit at ~5% of the cost; any domain _can_ be extracted.
- Single-DB transactions are still cheap here; Sagas/Outbox only when extraction happens.
- **The extraction seam is paved, not hypothetical**: BullMQ queues per job family + the
  Socket.IO Redis adapter + the W3-1 cross-process emit bridge.

**Why not serverless?** Long-lived BullMQ workers and Socket.IO need persistent processes;
the workload is steady-state, not spiky; cold starts would break bcrypt-heavy auth under load.

## 2. Software Anatomy — _The Practical Term_

```
galaxy-of-beauty/                       # The Body
├── apps/
│   ├── web/      Next.js 16.4 App Router   # The Face — 321 routes, ALL with locale-aware
│   │                                       #   metadata (W6-1 queue drained to zero), SEO,
│   │                                       #   dashboards, storefronts
│   └── mobile/   Expo SDK 58 (RN 0.88)     # The Hands — ~320 screens, OTA via EAS, APK pipeline
├── packages/
│   ├── api/      tRPC v11                  # The Brain — ~1,213 procedures across ~267
│   │                                       #   domain routers, tier-gated + ownership-guarded
│   ├── db/       Prisma 7.10 + PostgreSQL  # The Spine — ~272 models, reviewed idempotent
│   │                                       #   migrations (IF EXISTS discipline), typed
│   │                                       #   idempotent seed (every service bookable)
│   ├── shared/   pure TS                   # The Blood — types, i18n (per-platform + per-locale
│   │                                       #   split, 5,755 web keys), pricing/loyalty/calendar/
│   │                                       #   socket-url engines
│   ├── ui/       React 19 + Tailwind 4     # The Skin — 560+ components + design tokens +
│   │                                       #   locale plumbing (setUILocale — W6-2)
│   └── config/   tooling                   # The DNA — shared tsconfig, eslint-flat, prettier
├── scripts/                                # The Immune System — 20+ gates: budgets, leaks,
│                                           #   Arabic scan (mobile/web/ui), page-metadata,
│                                           #   cycles, dedupe, prune, sitemap, hygiene,
│                                           #   locale-catalog drift, router-inventory contract
├── docker-compose.yml + .prod.yml          # The Circulatory System (postgres, redis, web,
│                                           #   worker, socket — socket proxied via nginx;
│                                           #   the prod image gate builds ALL targets in CI)
├── turbo.json + pnpm-workspace.yaml        # The Nervous System
└── .github/workflows/ci.yml                # The Reflex Arc — 11-check CI + auto-merge cascade
```

**Scale facts (measured, not vibes):**

- Web bundle classes 221/213/298/226 KB gz (ratcheted baseline gate FE-007)
- i18n: 5,755 web keys + ~8,800 mobile keys, split per-platform AND per-locale
- ~290 API test files (parallel workers, shared seeded DB + isolated `gob_seed_contract` DB
  for the catalog contracts); Playwright E2E on web+mobile-chrome; k6 load gate; axe a11y gate
- Tier buckets on procedures (post-consolidation): ~public 260 / customer 576 / protected 106 /
  admin 232 / technician 42 / seller 2 / staff 0 — **staffProcedure is defined but unused**

## 3. Structural Blueprint — _The Industry Metaphor_

**Metaphor: The Shopping Mall.**

| Layer           | Mall Equivalent | Our Implementation                                                               |
| --------------- | --------------- | -------------------------------------------------------------------------------- |
| Storefronts     | Shops           | Vendor storefronts + womens/kids facilities + marketplace (approval-gated)       |
| Security desks  | Mall security   | Tier-gated procedures, CSRF, rate limits, women-only guard, ownership checks     |
| Back offices    | Shop stockrooms | vendor-portal (web) + mobile guard (W3-3), staff capabilities                    |
| Loading docks   | Goods receiving | BullMQ workers (payouts, SLA, reminders, media, notifications, reconciliation)   |
| PA system       | Announcements   | Socket.IO rooms (`user:*`, `technician:*`, `waitlist:*`, `admin`) + Redis bridge |
| Cash room       | Treasury        | Wallet + payouts + ZATCA invoices + atomic captures (W1+#691)                    |
| Info desk       | Directory       | Public catalogs with the fallback-chain image resolver (imagery I1)              |
| Mall management | Admin offices   | Admin dashboard + provider review queue (stores/products/packages/promos)        |

**Invariants that make the mall safe (the ones audits exist to protect):**

- Money: no fabricated figures anywhere; every capture is an ATOMIC status claim
  (`updateMany where status='AUTHORIZED'` — exactly one concurrent winner, #691)
- Catalog: every seeded service has a technician mapping (round-robin seed + contract test)
- Ownership: vendor/technician/address ownership checked at every write (W2-5/W2-7/W3-2)
- Realtime: emits route through Redis when no local socket server exists (W3-1) — never silent
- Imagery: every entity image resolves through a fallback chain — never a broken image (I1)
- Fixtures: generated slots are Jummah-safe AND mutually non-overlapping by construction
  (snap + watermark fixpoint, #689/#690)

## 4. Software Architecture and Design — _The Standard Term_

**Architecture Style: Layered + Domain-Modular Monolith with materialized read-models.**

```
Clients (web Next.js / mobile Expo) ──tRPC/HTTP──▶ API layer (packages/api)
                                                    │  routers (domain files)
                                                    │  middleware chain: auth → role tier →
                                                    │  csrf → women-only → ownership
                                                    ▼
                              lib/ (pure engines: pricing, loyalty, jummah,
                                    calendar, storeHealth, webrtc, queueHealth)
                                                    │
        ┌───────────────┬───────────────────────────┼────────────────────────┐
        ▼               ▼                           ▼                        ▼
   PostgreSQL     Redis (cache,      BullMQ workers (payouts/sla/...)   Socket.IO process
   (Prisma 7)     rate-limit,        ── same lib/ engines               (:4001) + Redis adapter
                  socket adapter)                                        ▲
                                                                         │ W3-1 bridge:
                                                                   API emits publish via
                                                                   broadcast-only adapter node
```

**Cross-cutting concerns (the layer that grew the most in 2026-11):**

- **Gates**: 20+ scripts (locale-catalog drift, router-inventory contract, bundle budgets,
  Arabic scan ×3 surfaces, page-metadata, cycle detection, dedupe, sitemap) — architecture
  changes are CI-enforced; the W6-1/W6-2 allowlists are RATCHETED (they can only shrink)
- **Fail-closed policy**: unwired verticals return explicit reasons, never fabricated success
- **Approval pipelines**: provider submissions (stores/products/packages/promotions) →
  admin decide → materialize (activate vendor, flip product LIVE, create FlashDeal)
- **Contracts**: TDD per slice; exact-shape assertions pin API responses; snapshots for
  procedure inventory + i18n catalogs
- **Locale plumbing**: the ui package reads the app-published locale (W6-2) — English users
  stopped silently seeing Arabic

---

# PART 2 — The Tools (Design Patterns — Micro Level)

## Patterns We Use (and Why)

| Pattern                          | Where                                                                         | Why                                                                 |
| -------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| **Typed RPC contract**           | tRPC + zod4 everywhere                                                        | One source of truth; no codegen, no drift                           |
| **Tier middleware chain**        | `public → protected → customer/seller/technician/admin → womenOnly` + csrf    | Composable gates; every procedure carries a tier meta (CI-enforced) |
| **State machines**               | bookings/disputes/payouts/submissions                                         | Explicit transitions; invalid moves rejected by design              |
| **Atomic status claims**         | payments.capture (`updateMany where status='AUTHORIZED'`)                     | Exactly one concurrent winner; read-then-write races closed (#691)  |
| **Idempotency keys**             | booking create, payout requests, wallet ops                                   | Double-click/retry safety (W1 races closed)                         |
| **Repository-less domain files** | one router file per domain + co-located tests                                 | Small cognitive surface; test files map 1:1                         |
| **Materialized read-models**     | VendorDailyStat / ReelDailyStat (NOON-UTC)                                    | Dashboards read aggregates, never recompute on request              |
| **Queue-per-job-family**         | BullMQ: payouts/sla/disputes/reminders/notifications/media                    | Independent retry + backpressure per family                         |
| **Redis adapter emit bridge**    | W3-1 broadcast-only io node                                                   | Cross-process emits without a shared process                        |
| **Fallback-chain resolver**      | imagery I1 `resolveEntityImage` (entity → category → kind → brand)            | Never a broken image; content swaps = manifest-only                 |
| **Fail-closed analytics**        | fabricated-analytics contracts + W4-1 real pro-tools                          | No invented numbers, ever                                           |
| **Approval → materialize**       | providerReview.decide                                                         | Review queue is the ONLY path to live state                         |
| **Hydration-gated UI**           | E2E login/register + guard layouts                                            | The #620 flake-war lesson: gate on hydration, never bounce early    |
| **Zod-validated socket events**  | validatedOn + ack                                                             | Structured errors instead of silent drops                           |
| **Pure-function decision cores** | vendorPortalGate, biometricLoginOutcome, resolveSocketUrl, resolveEntityImage | Business logic unit-testable in node, no React/RN imports           |
| **Locale plumbing**              | `getUILocale/setUILocale` published by both apps' LocaleProviders             | 402 shared components stopped defaulting to Arabic (W6-2)           |
| **Ratcheting allowlists**        | static-Arabic (mobile/web/ui) + page-metadata                                 | New violations fail CI; the lists only shrink (SEO queue = ZERO)    |
| **Bounded fixpoint loops**       | createUniqueSlot (Jummah snap ⇄ watermark)                                    | Two constraints converge without ping-ponging                       |

## Patterns We Don't Use (and Why)

| Pattern                      | Why we skip it                                                                 | When we'd adopt it                                      |
| ---------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------- |
| **Repository layer**         | Prisma calls read fine in routers at this size; a repo layer would be ceremony | When a domain needs multi-DB or mock-heavy testing      |
| **Event sourcing**           | State machines + audit rows cover the business need                            | When full history replay becomes a requirement          |
| **CQRS**                     | Materialized read-models give 90% of it without a second write path            | When read/write split reaches scale pain                |
| **Saga/Outbox**              | Single-DB transactions still atomic; queues fire after commit                  | The day a domain extracts to its own service            |
| **gRPC / GraphQL**           | tRPC is strictly better for one team sharing types end-to-end                  | Public third-party API (vendorApi REST exists for that) |
| **Micro-frontends**          | One team, one design system                                                    | Multi-team parallel ownership                           |
| **K8s**                      | Docker Compose (dev) + nginx (prod) is enough at this scale                    | Multi-region or autoscaling needs                       |
| **Serverless functions**     | Persistent workers + sockets + bcrypt auth favor long-lived processes          | Spiky, stateless workloads                              |
| **ORM query builders (raw)** | Prisma covers it; raw SQL only in migrations                                   | Complex analytics SQL (explored per-case)               |
| **Kafka / message buses**    | BullMQ on Redis handles the job volume; ordering per queue is enough           | Multi-consumer event fan-out at scale                   |

## Patterns We Must Adopt (Production Hardening)

| Pattern                          | Why it's now mandatory                                            | Status                         |
| -------------------------------- | ----------------------------------------------------------------- | ------------------------------ |
| **CDN + image pipeline**         | Imagery I3/I6 — S3 presigned upload + CloudFront + moderation     | USER-GATED (AWS console)       |
| **Verified-female KYC**          | W3-5 option 2 — ID upload → admin review (vendor-license pattern) | Tracked upgrade pass           |
| **Secure credential storage**    | Refresh token out of AsyncStorage → expo-secure-store (W3-4 note) | Follow-up slice                |
| **Pentest + external audit**     | Before public launch                                              | USER-GATED (pentest execution) |
| **Fatoorah live token**          | Wallet top-up completion, autoRenew capture (W1-7/W1-10)          | USER-GATED                     |
| **Alertmanager webhook**         | #562 paging is currently theoretical (W5-10)                      | Documented in DEPLOYMENT.md    |
| **Sentry DSNs (web/mobile/EAS)** | beforeSend PII scrub is built (#670); the DSNs are not set        | USER-GATED                     |
| **Deep ui t()-key migration**    | The 530-file {ar,en} data-string allowlist becomes catalog keys   | Future pass (gate ratcheted)   |

---

# PART 3 — Technology Decisions — Honest Assessment

## What We Use and Why

| Technology                     | Version         | Why it won                                                                 |
| ------------------------------ | --------------- | -------------------------------------------------------------------------- |
| pnpm + turbo                   | 10 / 2.x        | Monorepo speed, strict env, cache; Windows-safe workflows                  |
| TypeScript                     | 6.0 strict      | End-to-end typed contract                                                  |
| Next.js                        | 16.4 App Router | SEO-first web + RSC; socket/worker live OUTSIDE Next (no WS in App Router) |
| Expo / React Native            | SDK 58 / 0.88   | One codebase for iOS/Android; OTA via EAS                                  |
| tRPC + Zod                     | 11 / 4          | Type-safe RPC without codegen; zod4 is the runtime validator               |
| Prisma + PostgreSQL            | 7.10 / 15       | Typed ORM, reviewed migrations, JSONB bilingual fields                     |
| Redis + BullMQ                 | ioredis 6       | Cache, rate limits, queues, socket adapter — one dependency, four jobs     |
| Socket.IO                      | 4.x             | Rooms + auth middleware + Redis adapter; :4001 standalone process          |
| Tailwind + @galaxy/ui          | 4 / React 19    | Design tokens + 560 components; locale plumbing (W6-2)                     |
| vitest / Playwright / k6 / axe | 5 / 1.x         | Unit (parallel, shared+isolated DBs), E2E (web+mobile-chrome), load, a11y  |
| Sentry / EAS / GH Actions      | —               | Error tracking, OTA + APK builds, 11-gate CI with auto-merge cascade       |

## What We Don't Use and Why

- **No GraphQL** — tRPC's inferred types beat schema-first for a single team (measured in velocity).
- **No microservices / K8s** — see Part 1; the extraction seams exist but are intentionally unused.
- **No Kafka** — BullMQ suffices; adopting a bus now would be premature distribution.
- **No separate admin app** — admin lives in the same web app behind role gates.
- **No AI codegen in the pipeline** — the architecture gates are the source of truth, not generators.
- **No cloud DB/cache yet** — self-hosted postgres/redis via compose; cloud migration is a
  deployment decision, not a code decision (CDN/S3 are the user-gated infra items).

## What We Must Add (Production Checklist)

1. **AWS**: S3 bucket + CloudFront (imagery I3/I6) — user-gated console access
2. **Fatoorah live** + **Sentry DSNs** in EAS env — user-gated tokens
3. **Verified-female KYC** (W3-5 option 2) — ID upload → provider review
4. **expo-secure-store** for the refresh token (W3-4 hardening note)
5. **Alertmanager → real paging** (W5-10)
6. **Pentest** before launch — user-gated execution
7. **Deep ui t()-key migration** — the 530-file data-string allowlist (ratcheted; the
   functional locale plumbing is DONE via #696)

---

# PART 4 — Code Architecture (Micro Level)

## API structure

```
packages/api/src/
├── routers/            # one file per domain (bookings, payouts, vendorPortal, womensServices…)
│   └── index.ts        # the appRouter barrel — ~1,213 procedures, tier-gated
├── trpc.ts             # procedure tiers: public → protected → customer/seller/technician/admin
│                       #   + csrfGuard + womenOnlyGuard + ownership helpers
├── lib/                # pure engines: pricing, loyalty, storeHealth, webrtc, jwt, redis, push
├── socket/             # index.ts (server + emit helpers + W3-1 bridge), server.ts (:4001)
├── queues/             # BullMQ workers + registry (health monitor visibility — W1-8)
└── __tests__/          # ~290 files, parallel workers, factories.ts as the fixture language
```

**Contract gates (never edit casually):**

- `router-inventory.test.ts` — exact procedure/tier counts (bump via `-u` ON the feature branch)
- `check-locale-catalogs.test.mjs` — generated catalogs must match sources (web keys only;
  mobile keys load directly from `messages/mobile/*`)
- `seed-catalog-contract` + `dynamic-pricing-seed` — run on the ISOLATED `gob_seed_contract` DB
- `check-page-metadata.test.mjs` — every public page emits metadata (allowlist = EMPTY)
- `find-static-arabic.test.mjs` — mobile/web/ui static-Arabic gates (ratcheting allowlists)
- `fabricated-analytics` — fail-closed contracts for unwired verticals

## Request flow (booking create, after W2-5)

```
customer → bookings.create (customerMutation)
  → idempotency replay check
  → technician exists + technicianService mapping active (W2-5)
  → address exists + owned by caller (W2-5)
  → slot re-check inside transaction + Jummah window
  → pricing engine preview (tier/peak/surge + flash-deal price W2-6)
  → create booking (REQUESTED) + snapshot pricingBreakdown
  → emitToTechnician/user/admin (W3-1 Redis bridge → socket server → clients)
```

## Payment capture flow (after #691)

```
technician → payments.capture
  → ownership + AUTHORIZED status read (fast fail for the common case)
  → updateMany({ where: { id, status: 'AUTHORIZED' }, data: { status: 'CAPTURED' } })
    count === 0 → CONFLICT "Payment already captured"   # exactly one winner
  → booking → PAID
  → cashback: idempotency-keyed wallet credit (P2002 = already credited)
  → emitToUser/customer + admin events
```

## Realtime flow (after W3-1/W3-6)

```
API process (Next.js, io=null)          Socket process (:4001, io set)
  emitToUser/Technician/Waitlist/Admin      ▲
    └─ io null → getBroadcastIO()           │ Redis adapter channel (socket.io#/#)
         (new Server + redis adapter) ──────┘  → delivers to room members
  producers: bookings/chat/notifications/payments/vendorPortal/video + waitlist (W3-6)
  exactly-once: local io wins; bridge only when io is null
```

## UI structure

- **Web**: `(role)` route groups with layout guards; every public page emits locale-aware
  metadata (W6-1, queue ZERO); hydration-gated interactive elements; imagery through
  `resolveEntityImage` (I1)
- **Mobile**: expo-router groups with layout guards (D4 tech, W3-3 vendor-portal, hydration
  holds); pure decision functions in `utils/*` (node-tested); screens render honest zeros,
  never fiction
- **Shared ui**: 560 components read the app-published locale (W6-2); bilingual data maps
  remain the storage format until the deep t()-key pass

## The Honest Verdict

### Strengths

- Money-integrity discipline (W1 + #691): races closed, atomic claims, fail-closed analytics,
  ZATCA sim + clearance
- Contract enforcement in CI: 11 gates make drift visible within minutes, not months
- The whole catalog is bookable (W2): seed round-robin + mapping-aware guards + payment path
- Realtime actually works (W3): Redis bridge, producers wired, no silent no-ops
- Approval pipelines everywhere money/trust enters (stores, products, promos, packages)
- The prod Docker image now BUILDS in CI (W5-8 caught five latent breaks — ui/config/sentry
  copies, build-time env, dead COPYs)
- SEO: every public page emits metadata; the sitemap covers all static routes

### Weaknesses (hard truths)

- **staffProcedure is dead** (0 procedures) — defined but the staff model lives in ownership code
- **Mobile pure-logic tests cover utils only** — screens rely on E2E; native Detox is not wired
- **AsyncStorage holds the refresh token** (W3-4 hardening note) — acceptable now, must fix
- **Single shared test DB** still races under parallel workers (isolated DB only for 2 contracts)
- **User-gated items block real money + CDN + KYC** — the code is ready, the keys are not
- **530 ui files still hold {ar,en} data strings** — locale-correct now (#696), but they are
  not typed catalog keys yet (the ratcheted allowlist is the queue)
- **Process hazard**: a force-push loop once clobbered four branch refs and four squash merges
  silently shipped the wrong content (repaired #693/#694; the verification rule is in Rules §6)

### The Next Leap

1. Unlock the user-gated items (AWS, Fatoorah, Sentry DSNs, Apple) — the code is waiting
2. Deep ui t()-key migration (530-file allowlist, ratcheted)
3. W3-5 option 2 (verified-female KYC) as the women-only compliance upgrade
4. Extract a domain to its own worker as a PROOF of the paved extraction seam (e.g., media)
5. Pentest → launch gate review (docs/LAUNCH_READINESS.md)
