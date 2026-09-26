# Incident Playbook — Galaxy of Beauty

> 7.3 Observability 2.0 · v1 2026-09-26. Mirrors DEPLOYMENT.md style; the
> severity ladder maps directly to the Incident model on the /status page.

## Severity ladder

| Severity | Definition                                 | Response                    |
| -------- | ------------------------------------------ | --------------------------- |
| critical | Core flows down: bookings, payments, auth  | Immediate; page the on-call |
| major    | Degraded core flow or an admin-only outage | Within the hour             |
| minor    | Cosmetic / isolated feature / non-blocking | Next working block          |

## Triage (first 10 minutes)

1. **Confirm** — reproduce once; check /status + the SLO snapshot
   (`observability.sloStatus`): availability drop, burn rate > 1 means the
   error budget is being consumed faster than it accrues.
2. **Contain** — if a release did it, roll back first (revert the squash
   merge on master; `pnpm --filter @galaxy/api deploy` is the documented
   path), then debug.
3. **Record** — create the incident row (admin → Observability) with a
   bilingual title; severity per the ladder above.

## Investigate

- Logs: workers + sweeps log via console (tokenCleanup, subscriptionRenewal,
  loyaltyExpiry); the API errors surface through the sentry facade
  (SENTRY_DSN) or console fallback.
- Traces: set `OTEL_ENABLED=true` (+ optional `OTEL_EXPORTER_OTLP_ENDPOINT`)
  — per-procedure spans carry trpc.path / trpc.type / user.id.
- DB: `pnpm db:migrate:status` + health check (`SELECT 1` via the health
  procedure).

## Resolve

1. Fix → verify (unit suite + the affected e2e spec) → merge.
2. Mark the incident **resolved** in admin → Observability (sets
   resolvedAt; it drops to the "recently resolved" section on /status for
   7 days).

## Post-incident (same day)

- One-paragraph writeup in the PR description: what, blast radius, why it
  slipped, the test that would have caught it.
- If the burn rate exceeded 1 for the window: reopen the SLO budget note.

## Automation hook points (future)

- Sentry severity-2+ hook → auto-create Incident row.
- Slack/PagerDuty webhooks named here so seats plug in without a redesign.
