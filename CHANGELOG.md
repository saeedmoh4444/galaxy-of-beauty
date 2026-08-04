# Changelog — Galaxy of Beauty

## [2.3.0] — 2026-08-04/05

### Architecture
- **Domain separation**: 177 routers organized into 14 domain modules (auth, booking, catalog, payments, loyalty, social, admin, ai, zatca, realtime, content, market, wellness, operations)
- **Package split**: `@galaxy/shared` (pure TS) + `@galaxy/ui` (React components). API no longer depends on React
- **Job queues**: 4 BullMQ queues (wallet, loyalty, notifications, integrations) for async side effects. Booking response <500ms
- **Health endpoint**: Real DB (SELECT 1) + Redis (PING) connectivity checks. Returns `ok` or `degraded`

### Monitoring
- **Real monitoring dashboard**: Replaced all mock data with live system metrics
- **DB metrics**: Connections from `pg_stat_activity`, max from `pg_settings`
- **Redis metrics**: Memory from `INFO memory`, clients from `INFO clients`
- **API performance**: p95/p99 response times per procedure via in-memory tracking
- **Slow query logging**: 500ms threshold via Prisma middleware
- **Web vitals**: LCP, CLS, INP, FCP, TTFB tracking component
- **Alerting rules**: 9 Prometheus alerts (availability, performance, capacity, business)
- **Grafana dashboard**: 8-panel production dashboard JSON
- **Metrics endpoint**: `/api/metrics` for Prometheus scraping

### Mobile (Expo)
- **29 screens upgraded** with ScreenState 4-state pattern (loading/error/empty/success)
- **tRPC React Query**: Proper typed hooks replacing raw `(trpc as any)` calls
- **CI/CD**: EAS Build workflow (iOS + Android + OTA updates)
- **Production fixes**: SafeAreaView, KeyboardAvoidingView, deep link config, OTA updates
- **Offline queue**: AsyncStorage-based action queue for offline booking
- **App Store metadata**: Arabic + English descriptions, keywords, screenshot specs

### Web (Next.js)
- **SSR pages**: Blog listing, blog detail, events, marketplace converted to Server Components
- **SEO**: 41-page sitemap, JSON-LD structured data (Organization, Service, Event), canonical URLs
- **CSP headers**: Content-Security-Policy with script/style/font/img directives
- **X-Request-ID**: crypto.randomUUID() propagation for distributed tracing
- **CSV export**: `/api/export/bookings` endpoint
- **Admin audit viewer**: Filterable audit log page with pagination

### Security
- **JWT jti claim**: crypto.randomUUID() on every token prevents collision
- **Session management**: List active sessions, revoke individual or all
- **Rate limiting tests**: 11 automated tests for all 3 tiers (20/60/300 per min)
- **Password validation (Arabic)**: 8+ chars, complexity rules, common password blocklist
- **Refresh token cleanup**: Hourly purge of expired/revoked tokens + old notifications
- **Prisma graceful shutdown**: SIGTERM/SIGINT handlers for safe connection closure
- **CSRF hardening**: timingSafeEqual, hex validation, SameSite=Strict

### Data
- **Seed enrichment**: 506 bookings (60% COMPLETED, 16% CANCELLED, etc.), 33 customers, 12 technicians, 100 reviews with Arabic comments, 82 wallet transactions, 30 loyalty accounts, 50 notifications
- **Seed fix**: Added 17 missing FK-dependent tables to cleanup order
- **Geo promotions**: 5 DB-backed promotions with city/radius targeting
- **Live streams**: 5 DB-backed streams (SCHEDULED/LIVE/ENDED)

### Developer Experience
- **TypeScript**: 318/318 tests (100%), 16 test suites, 0 type errors
- **ZATCA mock**: Full sandbox for e-invoicing development (SHA-256, QR, cryptographic stamp)
- **Typed error catalog**: 10 error factory functions (notFound, unauthorized, conflict, etc.)
- **Form components**: FormField, FormSelect, FormTextarea with label/error/hint
- **FormField**: Reusable input wrapper
- **i18n expansion**: 35 new translation keys (time, confirmations, status, payments, errors)
- **Storybook**: Rebuilt for @galaxy/ui with 15 component stories
- **k6 load test**: Production load test script with realistic scenarios
- **RouterOutputs**: Type helper export for tRPC consumers

### Infrastructure
- **Terraform AWS**: Full infra-as-code (VPC, EC2, RDS, ElastiCache, S3, security groups)
- **Docker production**: Resource limits, Redis tuning, 2 web replicas, healthchecks
- **Prometheus config**: Scrapes API, PostgreSQL, Redis, system
- **Sentry**: 3 Next.js configs (client/server/edge) + API integration, PII filtering
- **.env consolidation**: 3 scattered files → 1 root + 1 Prisma-only
- **.env.example**: REQUIRED/OPTIONAL labels with fallback descriptions

### Documentation (14 files)
- `brain_code.md` — Honest architecture audit with 13 patterns used, 8 skipped, 8 must-adopt
- `Rules_to_make_well_architecture-platform.md` — Development constitution (10 sections)
- `docs/API_REFERENCE.md` — Complete tRPC API reference
- `docs/DEVELOPMENT_WORKFLOW.md` — Step-by-step dev guide
- `docs/adr/002-domain-separation.md` — ADR for domain separation
- `docs/adr/003-job-queues.md` — ADR for BullMQ
- `docs/adr/004-package-split.md` — ADR for package split
- `docs/adr/005-real-monitoring.md` — ADR for monitoring
- `DELIVERY_REPORT.md` — Final delivery report
- `PLAN.md` — Audit and gap analysis
- Updated: `README.md`, `docs/run_local.md`, `docs/SECURITY_HARDENING.md`

### Removed
- `_legacy/` — 212 archived v1.0 files (Express + Vite + standalone Expo)
- Empty stub directories in `apps/web/apps/web/src/app/`
- Stale references in `.dockerignore` and `README.md`

---

## [2.2.0] — 2026-07-29
- Initial monorepo scaffold (Turborepo + pnpm)
- Next.js 14 App Router with 84 routes
- Expo SDK 54 with 47 screens
- tRPC v11 with 159 routers
- Prisma with 87 models
- Docker Compose with 5 services
- 243 API tests
