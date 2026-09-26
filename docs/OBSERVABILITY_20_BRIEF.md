# 7.3 Observability 2.0 — Implementation Brief

> Prepared 2026-09-26 from live code (ENHANCEMENT_PLAN §7.3). Draft —
> carries on the next feature branch (master is push-protected).

## Goal (from the plan)

**OpenTelemetry tracing across services, per-team dashboards, SLO/SLI
tracking, error budgets, a public status page, and an incident playbook.**

## Current state (verified in code, 2026-09-26)

- `packages/api/src/lib/sentry.ts` — facade: `captureException` /
  `captureMessage` with dynamic `@sentry/node` import + console fallback
  (tested in sentry.test.ts). Used for error capture only; no tracing.
- Health endpoint exists (health-endpoint.test.ts asserts ok/degraded).
- 7.1/7.2 shipped CI gates (ARCH, cycles, FE-007 size, axe, router
  inventory) + k6 load tests (load-test.yml) — synthetic load exists.
- No tracing (no OTel), no SLO/SLI counters, no error budgets, no status
  page, no incident automation. Worker + cron sweeps log via console only.

## Slices (stacked PRs, each CI-green before the next)

### Slice 1 — OTel tracing core

- Add `@opentelemetry/api` + instrumentation (http, prisma, trpc? use
  auto-instrumentations where low-risk) behind a flag `OTEL_ENABLED` —
  off by default (sentry-facade pattern: dynamic import, console fallback).
- Trace headers through trpc (web/mobile) → api; span per procedure with
  tier/name attrs. Exporter: OTLP endpoint env-var; local dev = console.
- Tests: span creation via the facade (no exporter) — pure unit coverage.

### Slice 2 — SLO/SLI + error budgets

- `packages/api/src/lib/slo.ts` — in-process counters: availability
  (error-rate window), latency buckets (p95 targets per tier), burn-rate
  calc (requests vs error budget). `admin/observability` router: `/health`
  extended with `slo` block (99.9% availability, p95 < 500 ms targets).
- Dashboard data in adminAnalyticsV2 or a new observability router:
  `slo.status` (public, for the status page) + `slo.series` (admin).
- Tests: burn-rate math + counter windowing (pure, in shared).

### Slice 3 — Status page + incident playbook

- `/status` public route (web + mobile webview-friendly): uptime, current
  incidents, recent history — driven by `slo.status` + an Incident model
  (titleJson, severity, status open/resolved, timestamps) with admin CRUD.
- Incident playbook doc (docs/operations/INCIDENT_PLAYBOOK.md): severity
  tiers, on-call steps, rollback checklist — mirrors the DEPLOYMENT.md
  style; auto-create incident rows from the severity-2+ alert path
  (Sentry hook is a follow-up; v1 = manual admin create).

## Out of scope (parked)

- Sentry/pager integrations (Slack/PagerDuty webhooks) — playbook names
  the hook points, wiring comes after the seats exist.
- Per-team Grafana dashboards — needs infra the repo doesn't own yet;
  the SLO counters are the exportable substrate.
- OTel for the mobile app (RN tracing) — API+web first.

## Acceptance

- [ ] OTEL_ENABLED off by default; traces flow api→(exporter) when on
- [ ] slo.status serves availability + p95 with burn-rate math tested
- [ ] /status page renders uptime + incidents (ar/en), admin CRUD on
      incidents
- [ ] Playbook committed; CI 9/9 across the chain
