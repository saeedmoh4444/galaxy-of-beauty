# ART-005 — Monitoring a Production Application

## The Question

"How would you monitor a production application? What metrics, logs, and alerts would you set up?"

## Answer

I monitor across four layers: **user experience**, **application health**, **infrastructure**, and **business metrics**. Each layer has its own signals, dashboards, and alerts.

### Layer 1: User Experience (RUM)

**What I measure**: Real User Monitoring via the browser.

| Metric | Target | Alert |
|---|---|---|
| **LCP** (Largest Contentful Paint) | <2.5s p75 | Page if p95 > 4s for 5 min |
| **INP** (Interaction to Next Paint) | <200ms p75 | Page if p95 > 500ms |
| **CLS** (Cumulative Layout Shift) | <0.1 p75 | Page if p95 > 0.25 |
| **Error rate** (JS exceptions) | <0.5% of page views | Page if >2% for 5 min |
| **API latency** (from browser) | <500ms p95 | Page if >2s p95 |

**Tool**: Sentry (already integrated in Galaxy of Beauty). Custom `useReportWebVitals` hook sends Core Web Vitals to Sentry on every route change.

### Layer 2: Application Health (Backend)

**What I measure**: Every tRPC endpoint, every background job.

| Metric | Target | Alert |
|---|---|---|
| **Request rate** | — (baseline) | Page if drops >50% from hourly average |
| **Error rate** (5xx) | <0.1% | Page if >1% for 5 min |
| **p95 latency** | <200ms | Page if >1s for 5 min |
| **Auth failures** | <5% of login attempts | Page if >20% for 5 min (credential stuffing) |
| **Payment failures** | <1% | **Page immediately** if >3% (revenue) |
| **Rate limit hits** | <1% of requests | Slack warning if >5% (abuse or misconfiguration) |

**Tool**: Pino structured logs → stdout → log aggregator (CloudWatch/Datadog). Prometheus metrics exposed via `/metrics` endpoint (request counts, latencies, error rates by endpoint). Custom business metrics: booking creations/min, payment volume/min, active WebSocket connections.

### Layer 3: Infrastructure

| Metric | Target | Alert |
|---|---|---|
| **CPU** | <70% per instance | Page if >90% for 5 min |
| **Memory** | <80% of heap | Page if >90% (potential leak) |
| **DB connections** | <80% of pool | Page if pool exhausted |
| **DB query latency** | <10ms avg | Page if p95 > 100ms |
| **Redis memory** | <80% of maxmemory | Page if evictions >0 |
| **Disk** | >20% free | Page if <10% free |

**Tool**: Cloud provider metrics (RDS, ElastiCache) + custom Prometheus exporters. Database query performance via `pg_stat_statements`.

### Layer 4: Business Metrics

These are what the CEO cares about:

| Metric | Dashboard | Alert |
|---|---|---|
| **Bookings created** | Per minute, per hour, per day | Slack if hourly rate drops >50% from last-week average |
| **Revenue** | Per minute, per payment method | Slack if hourly revenue = 0 for 15 min (payment gateway down?) |
| **New registrations** | Per hour | Slack if rate drops to 0 |
| **Active technicians** | Currently accepting bookings | Dashboard only |
| **Wallet top-ups** | Per hour, total volume | Dashboard only |

### Alert Routing

| Severity | Channel | Response time |
|---|---|---|
| **P0** (revenue down, auth broken) | PagerDuty → on-call phone | 5 min acknowledge, 30 min resolve |
| **P1** (degraded, error rate up) | Slack #incidents | 15 min acknowledge, 2 hr resolve |
| **P2** (warning, trend deviation) | Slack #monitoring | Next business day |

### Key Principle

Every alert must have: a **runbook** (linked in the alert), an **owner** (who acknowledges it), and a **post-mortem** if it fires unexpectedly. Alerts that fire and are ignored train the team to ignore all alerts. I'd rather have 10 actionable alerts than 100 noisy ones.
