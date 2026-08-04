# ADR-005: Replace Mock Monitoring with Real System Metrics

**Date:** 2026-08-04
**Status:** Accepted

## Context

The admin monitoring dashboard (`/admin/monitoring`) displayed entirely fabricated data:
- `uptime: '14d 6h 32m'` (hardcoded)
- `connections: 45` (hardcoded)
- `errorRate: 0.02` (hardcoded)
- `bookings today: 47` (hardcoded)
- All charts and error feeds were mock data

This made the monitoring dashboard useless for actual operations.

## Decision

Replace all mock data with real system queries:

| Metric | Before | After |
|--------|--------|-------|
| Database connections | `45` (hardcoded) | `SELECT count(*) FROM pg_stat_activity` |
| Database latency | `12ms` (hardcoded) | `performance.now()` around query |
| Redis memory | `256MB / 1GB` (hardcoded) | `INFO memory` parsing |
| Redis clients | Not shown | `INFO clients` |
| API uptime | `14d 6h 32m` (hardcoded) | `process.uptime()` |
| API requests/min | `850` (hardcoded) | In-memory counter ÷ uptime |
| API error rate | `0.02` (hardcoded) | Error count / total requests |
| Payment success | `99.7%` (hardcoded) | `Payment` table CAPTURED/total |
| Errors last 24h | `12` (hardcoded) | `AuditLog` where action starts with ERROR_ |
| Bookings today | `47` (hardcoded) | `Booking` count where createdAt >= today |
| Logins today | `520` (hardcoded) | `AuditLog` where action = LOGIN_SUCCESS |
| Activity chart | `[35,42,38,...]` (hardcoded) | Real 7-day `Booking` counts |
| Error feed | 3 fabricated messages | Real recent `AuditLog` entries |

## Architecture

```
Middleware: requestCounter → incrementRequestCount() + recordTiming(path, duration)
Monitoring router: queries prisma + redis for real metrics
Admin page: displays live data with graceful fallbacks
```

## Consequences

**Positive:**
- Monitoring dashboard now shows real operational data
- Slow query detection (500ms threshold) via Prisma middleware
- Performance tracking per tRPC procedure (p95/p99)
- Error rate tracking with in-memory counters

**Negative:**
- Health endpoint now does DB + Redis queries (was static JSON)
- Redis unavailable → metrics show 'unavailable' (graceful)
- In-memory counters reset on server restart (acceptable for single-process)

## Alternatives Considered

1. **Prometheus/Grafana** — Full metrics stack. Rejected as requiring production infrastructure. Our in-memory approach is the MVP; Prometheus is the production upgrade path.
2. **Sentry only** — Error tracking only. Rejected because we need operational metrics (DB, Redis, bookings) not just error tracing.
