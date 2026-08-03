# Galaxy of Beauty — Plan to Add Value

> **How to go from 55% tested / $110K to 95% tested / $250K+**

---

## Current Weaknesses (Honest Assessment)

### Architectural Limitations
- **Monolithic API** — all 176 tRPC routers in one package. No separation of concerns. A booking spike affects auth performance.
- **Single database** — one PostgreSQL instance for reads and writes. No read replicas, no query optimization for analytics vs. transactional workloads.
- **No message queue** — everything is synchronous. Booking confirmation waits for wallet update, loyalty points, notification, and calendar sync before responding.
- **Shared package couples UI to API** — the `@galaxy/shared` package re-exports JSX components, forcing the API package to include `DOM` lib and `jsx: preserve`.

### Feature Gaps (Mock Data / Low Depth)
- **Live Streaming** — hardcoded stream list with fake viewer counts. No YouTube/Twitch API integration.
- **Monitoring Dashboard** — all health data is fabricated (`uptime: '14d 6h 32m'`, `errorRate: 0.02`). No Prometheus/Grafana/Datadog.
- **Booking Heatmap** — was Math.random(), now queries real bookings but data is sparse (6 bookings total).
- **Geofence Offers** — hardcoded offer list with random distance. No geo-aware promotion engine.
- **Beauty Stats** — `happyCustomers` is `totalBookings * 0.95` (fabricated metric).
- **Seed Data** — 6 bookings vs. plan of 50. 6 customers vs. plan of 15. 3 technicians vs. plan of 8.
- **Referral Race** — campaign end date still resets on server restart (no database-backed campaigns).
- **Mobile App** — 47 screens exist but zero have been visually verified or E2E tested.

---

## Phase 1: Architectural Hardening (Weeks 1-4)

> **Goal:** Prepare the monorepo for 10K+ users without a full rewrite
> **Cost:** 80-120 hours (~$8K-$15K)

### 1.1 Extract API into Domain Modules

**Current:** All 176 routers in `packages/api/src/routers/` — one flat directory.

**Target:** Group by domain, enable independent deployment later:

```
packages/api/src/
├── domains/
│   ├── auth/          # register, login, refresh, 2FA, forgot-password
│   ├── booking/       # create, list, transition, availability, calendar
│   ├── catalog/       # categories, services, variants, search, tags
│   ├── payments/      # wallet, transactions, top-up, withdraw, cashback
│   ├── loyalty/       # tiers, points, rewards, redeem
│   ├── social/        # community, inspiration, reviews, referrals
│   ├── admin/         # users, analytics, disputes, KYC, exports
│   ├── ai/            # chatbot, skin-analysis, routine, feed
│   ├── zatca/         # invoice generation, reporting, compliance
│   └── realtime/      # socket events, notifications, live-chat
├── middleware/         # auth, rate-limit, CSRF, feature-flags
├── lib/               # cache, redis, jwt, password, storage, email
└── __tests__/         # per-domain test files
```

**Benefits:**
- Clear ownership boundaries — a developer can own `booking/` without touching `loyalty/`
- Enables future microservice extraction: `booking/` → `booking-service` without touching other domains
- Test files live next to their domain, not in a separate `__tests__/` directory

**Acceptance:** All 307 tests still pass. Domain imports are explicit (no circular dependencies).

### 1.2 Add Redis-Based Job Queue

**Current:** Everything is synchronous. `booking.create` → `wallet.update` → `loyalty.accrue` → `notification.send` → response.

**Target:** Fire-and-forget for non-critical side effects using Redis-backed queues:

```
booking.create → response (fast)
              → queue: wallet.cashback.accrue
              → queue: loyalty.points.earn
              → queue: notification.send
              → queue: calendar.sync
```

**Implementation:**
- Use `bullmq` (Redis-based, already have Redis)
- Create 4 queues: `wallet`, `loyalty`, `notifications`, `integrations`
- Each queue has a worker process (`packages/api/src/workers/`)
- Failed jobs retry 3x with exponential backoff, then go to dead-letter queue

**Acceptance:**
- Booking creation returns in < 500ms (vs. current ~1-3s including all side effects)
- Queue dashboard at `/admin/queues` shows queue depth, failed jobs, processing rate
- Dead-letter queue visible in admin panel with retry button

### 1.3 Split Shared Package

**Current:** `@galaxy/shared` exports both UI components (JSX) and constants/utilities. The API package needs `jsx: preserve` just to import constants.

**Target:** Two packages:

```
packages/
├── shared/           # Constants, types, i18n, theme tokens (NO JSX)
│   └── src/
│       ├── constants.ts
│       ├── types/
│       ├── i18n/
│       └── theme/
└── ui/               # UI components (JSX) — only imported by web + mobile
    └── src/
        ├── Button.tsx
        ├── Card.tsx
        └── ...
```

**Acceptance:**
- API package removes `jsx: preserve` and `DOM` lib from tsconfig
- API package only imports from `@galaxy/shared` (constants, types)
- Web + mobile import from both `@galaxy/shared` and `@galaxy/ui`

### 1.4 Database Read Replicas

**Current:** All queries hit the primary PostgreSQL instance.

**Target:** Route read-heavy queries to replicas:

| Query Type | Target | Examples |
|------------|--------|----------|
| Writes (mutations) | Primary | create booking, update wallet, insert review |
| Critical reads | Primary | login (password check), payment verification |
| List queries | Replica | services.list, bookings.list, wallet.transactions |
| Analytics | Replica | admin dashboards, reports, heatmaps |

**Implementation:**
- Add read replica to AWS RDS
- Extend Prisma client to support read/write split (Prisma Accelerate or manual)
- Analytics queries use a separate connection pool

**Acceptance:**
- Primary DB CPU < 50% under load
- List queries route to replica (verified by query logging)

---

## Phase 2: Feature Deepening (Weeks 5-8)

> **Goal:** Replace mock data with real production features
> **Cost:** 120-180 hours (~$12K-$22K)

### 2.1 Real Monitoring Dashboard

**Current:** All health data fabricated in `monitoring.ts`.

**Target:** Real system metrics from:

| Metric | Source | Implementation |
|--------|--------|----------------|
| Uptime | `process.uptime()` | Real Node.js process uptime |
| Request rate | tRPC middleware | Counter per procedure, exposed via `/metrics` |
| Error rate | Sentry / tRPC onError | Real error count by type (last 24h/week) |
| DB connections | `pg_stat_activity` | Query PostgreSQL for active connections |
| Redis memory | `redis INFO memory` | Real used/total memory |
| Slow endpoints | tRPC middleware | Track p95/p99 per procedure name |
| Booking count (today) | `prisma.booking.count` | Real count `WHERE createdAt >= today` |
| Login count (today) | `prisma.auditLog.count` | Real count of login events |
| Payment success rate | `prisma.payment.count` | Real ratio of CAPTURED vs. FAILED |

**Implementation:**
- Add `prom-client` (Prometheus client for Node.js)
- Expose `/metrics` endpoint (scraped by Prometheus)
- Build Grafana dashboard (or keep simple JSON API for admin UI)
- Admin monitoring page consumes real API, not mock constants

**Acceptance:**
- `/api/trpc/adminTools.health` returns real metrics from the live system
- No mock data remaining in `monitoring.ts`

### 2.2 Live Streaming Integration

**Current:** Hardcoded stream list in `liveStream.ts`.

**Target:** Real streaming with YouTube Live API or MUX:

| Feature | Implementation |
|---------|----------------|
| Stream creation | Admin creates stream (title, category, scheduled time) |
| Stream storage | `LiveStream` database model with status, URL, viewer count |
| Embed | YouTube IFrame embed with real stream URLs |
| Chat | Keep existing Socket.IO chat (works well) |
| Viewer count | YouTube Data API for live viewer count; fallback to Socket.IO connected count |
| Recording | Auto-save VOD after stream ends |
| Schedule | Calendar view of upcoming streams |
| Notifications | Push notification to followers when stream starts |

**Database model needed:**
```prisma
model LiveStream {
  id              Int      @id
  technicianId    Int
  titleJson       Json     // { ar, en }
  category        String
  streamUrl       String   // YouTube / MUX URL
  thumbnailUrl    String?
  status          String   // SCHEDULED, LIVE, ENDED
  viewerCount     Int      @default(0)
  scheduledAt     DateTime
  startedAt       DateTime?
  endedAt         DateTime?
  recordingUrl    String?
  createdAt       DateTime @default(now())
}
```

**Acceptance:**
- Admin can create, schedule, start, and end streams
- Customers see real streams (not hardcoded mock data)
- Chat works in real-time during live streams

### 2.3 Booking Heatmap with Real Data

**Current:** Queries bookings but seed data has only 6 bookings — sparse heatmap.

**Fix:** This is already querying real data correctly. The issue is seed data volume.

**Target:** Generate 500+ bookings in seed data across 30 days:

| Status | Count | Distribution |
|--------|-------|--------------|
| COMPLETED | 300 | 60% |
| CANCELLED | 80 | 16% |
| REJECTED | 30 | 6% |
| NO_SHOW | 20 | 4% |
| REQUESTED | 40 | 8% |
| ACCEPTED | 30 | 6% |

Add a `seed:enrich` script that generates realistic booking patterns:
- Peak hours: 16:00-20:00 (higher density)
- Peak days: Thursday, Friday, Saturday (weekend in Saudi)
- Seasonal: Ramadan patterns, Eid spikes, summer increase

**Acceptance:**
- Heatmap shows realistic booking density patterns
- Day-hour buckets have statistically meaningful values

### 2.4 Geofence Offers — Real Promotion Engine

**Current:** Hardcoded 3 offers with random distance.

**Target:** Real promotion engine with database-backed geo offers:

```prisma
model GeoPromotion {
  id          Int      @id
  titleJson   Json     // { ar, en }
  salonId     Int?     // optional — null = platform-wide
  city        String
  lat         Float
  lng         Float
  radiusKm    Float    @default(5)  // geofence radius
  discountPct Int
  maxDiscount Decimal?
  startsAt    DateTime
  endsAt      DateTime
  isActive    Boolean  @default(true)
}
```

**Implementation:**
- Admin creates geo-targeted promotions (city + radius)
- Customer API filters by city proximity
- Remove hardcoded `OFFERS` array

**Acceptance:**
- Admin can create, edit, deactivate geo promotions
- Customer API returns promotions relevant to their city
- Distance calculated from actual lat/lng of customer + promotion

### 2.5 Seed Data Production Depth

**Current:** 6 customers, 3 technicians, 6 bookings, 2 reviews, 2 wallet transactions.

**Target for realistic testing:**

| Entity | Current | Target |
|--------|---------|--------|
| Customers | 6 | 30 |
| Technicians | 3 | 12 (3 per city) |
| Bookings | 6 | 500 (across 30 days) |
| Reviews | 2 | 100 (Arabic, varied ratings) |
| Wallet Transactions | 2 | 80 |
| Loyalty Accounts | 1 | 20 (all 3 tiers) |
| Notifications | 2 | 50 |
| Promo Code Usages | 0 | 40 |
| Gift Card Redemptions | 0 | 10 |

**Implementation:** Create `seed:production` script that generates realistic volume data.

**Acceptance:**
- `pnpm db:seed` generates statistically meaningful data volumes
- All 87 models have representative row counts
- Analytics dashboards show realistic trends

---

## Phase 3: Production Operations (Weeks 9-12)

> **Goal:** Monitoring, alerting, backup, disaster recovery
> **Cost:** 60-80 hours (~$6K-$10K)

### 3.1 Production Monitoring Stack

| Layer | Tool | What It Tracks |
|-------|------|----------------|
| **APM** | Sentry (already configured) | Errors, performance traces |
| **Infrastructure** | CloudWatch / Datadog | CPU, memory, disk, network |
| **Database** | RDS Enhanced Monitoring | Queries/sec, connections, locks, replication lag |
| **Redis** | ElastiCache metrics | Memory, hit rate, evictions, connections |
| **Business** | Custom dashboard in Admin | Bookings/sec, revenue/sec, active users, payment success rate |
| **Uptime** | Betterstack / Pingdom | HTTP health check every 60s from 3 regions |

### 3.2 Alerting Rules

| Alert | Condition | Channel | Priority |
|-------|-----------|---------|----------|
| Error rate spike | > 5% for 5 minutes | PagerDuty / Slack | P0 |
| Database down | Health check fails 3x | PagerDuty | P0 |
| Redis down | Health check fails 3x | Slack | P1 |
| Payment failure spike | > 10% for 10 minutes | Slack + Email | P1 |
| ZATCA API failure | Any failure in last 15 min | Email | P2 |
| Disk > 80% | CloudWatch | Slack | P2 |
| SSL expiry < 30 days | Automated check | Email | P2 |

### 3.3 Backup & Disaster Recovery

| Resource | Backup Method | Frequency | Retention | RPO | RTO |
|----------|--------------|-----------|-----------|-----|-----|
| PostgreSQL | RDS automated snapshots | Daily + transaction logs | 30 days | 5 min | 30 min |
| Redis | RDB snapshots to S3 | Every 6 hours | 7 days | 6 hours | 15 min |
| User uploads | S3 versioning + cross-region replication | Continuous | 90 days | 0 | 5 min |
| Config/secrets | AWS Secrets Manager | Automatic | Indefinite | 0 | Instant |

**DR Test:** Quarterly restore from backup to staging environment, verify data integrity.

---

## Phase 4: Mobile App Production Readiness (Weeks 13-14)

> **Goal:** Bring mobile app to parity with web
> **Cost:** 40-60 hours (~$4K-$7K)

### 4.1 Mobile Testing

- [ ] Visual walkthrough of all 47 screens (RTL + LTR)
- [ ] E2E test with Detox or Maestro (5 critical flows)
- [ ] Test on 3 physical devices (iPhone, Android, tablet)
- [ ] Network condition testing (3G, offline, slow)
- [ ] Push notification delivery testing

### 4.2 Mobile-Specific Fixes

- [ ] SafeAreaView on notch devices
- [ ] Keyboard avoiding on forms
- [ ] Deep link handling (`gob://` scheme)
- [ ] Expo OTA updates configured
- [ ] App Store screenshots in Arabic + English

### 4.3 Mobile CI/CD

- [ ] EAS Build in GitHub Actions
- [ ] TestFlight / Internal Testing distribution
- [ ] Staged rollout (10% → 50% → 100%)

---

## Cost Summary

| Phase | Hours | Cost ($80-120/hr) | Value Added |
|-------|-------|-------------------|-------------|
| 1. Architectural hardening | 80-120 | $8,000 - $14,400 | Scalable to 100K users, cleaner codebase |
| 2. Feature deepening | 120-180 | $12,000 - $21,600 | Real data replaces mocks, production features |
| 3. Production operations | 60-80 | $6,000 - $9,600 | Monitoring, alerting, backup, DR |
| 4. Mobile production readiness | 40-60 | $4,000 - $7,200 | Mobile app store-ready |
| **Total** | **300-440** | **$30,000 - $52,800** | |

---

## Value After Investment

| Metric | Current | After Phase 1-4 |
|--------|---------|------------------|
| Platform valuation | $85K-$150K | **$200K-$350K** |
| Test coverage | 307 tests, ~55% real | **500+ tests, ~90% real** |
| Users supported | ~1,000 (estimated) | **100,000+** (with scaling) |
| Mock data endpoints | 5 | **0** |
| Mobile app readiness | Code complete, not verified | **App Store + Play Store ready** |
| Production monitoring | Sentry only | **Full stack: APM + infra + DB + business** |
| Disaster recovery | None | **RPO 5 min, RTO 30 min** |
| Architecture scalability | Single API, single DB | **Domain-separated, read replicas, job queues** |

---

## Priority Order

If resources are limited, execute in this order for maximum value per dollar:

1. **Phase 1.1 + 1.2** — Domain separation + job queue (biggest scalability impact)
2. **Phase 2.1 + 2.5** — Real monitoring + production seed data (replaces most mock data)
3. **Phase 3.1 + 3.3** — Production monitoring + backups (operational must-have)
4. **Phase 2.2 + 2.4** — Live streaming + geo promotions (feature completeness)
5. **Phase 1.3 + 1.4** — Split shared package + read replicas (architectural purity)
6. **Phase 4** — Mobile production readiness (wider market reach)

---

**From $110K platform to $250K+ platform. 300-440 hours. $30K-$53K investment.**
