# Platform Operations Review — 2026-11-21

Full-platform run + verification + best-practice fix list. Companion to
`PLATFORM_INVENTORY_2026-11-18.md` (feature inventory) and
`GOVERNANCE_ACCREDITATION_KSA_2026-11-20.md` (regulatory framework).

---

## 1. Running today (verified)

| Piece                             | Address                 | Evidence                                                                                          |
| --------------------------------- | ----------------------- | ------------------------------------------------------------------------------------------------- |
| gob-postgres (postgres:15-alpine) | :5433                   | containers healthy; 394 services / 33 categories / 21 users seeded + imaged                       |
| gob-redis (redis:7-alpine)        | :6379                   | all queue failed sets = 0                                                                         |
| Web (Next.js dev, Turbopack)      | :3000                   | trpc health 200; `/api-docs` 200; admin routes auth-gated (307→login)                             |
| BullMQ worker                     | — (no port)             | 16 queues + 9 repeatable schedulers + 11 interval sweeps registered; payout/sla sweeps completing |
| Socket.IO server                  | :4001                   | `GET /health` → `{status:ok}`                                                                     |
| Expo metro                        | :8083                   | listening                                                                                         |
| Prisma Studio                     | :49152                  | running (Prisma 7 assigned port)                                                                  |
| UI Storybook                      | :6006                   | listening                                                                                         |
| Docker MCP toolkit                | —                       | `claude-code` + `vscode` clients connected (restart Claude Code to pick up)                       |
| Prometheus metrics                | `GET :3000/api/metrics` | live exposition (cpu/memory/queue-depth series)                                                   |

**Verification gates run today (all green):**
`check-image-urls.mjs` (72 registry URLs resolve) · `check-orphan-routes.mjs` (312 mobile routes, 0 orphaned) · `check-cycles.mjs` (architecture gate PASSED) · k6 smoke (`scripts/load/smoke.js`): 0 failures, p95 220 ms · DB backup taken (`./backups/Galaxy_of_Beauty_dev_20261121T092240Z.sql.gz`).

## 2. Scheduled work inside the worker (no separate cron needed)

- Repeatable: `ops.health-check` (10 min) · `daily.stats` (00:30 KSA) · `advisor.digest` (Sun) · `reminders.license-expiry` (Sun) · `payouts.sweep`, `sla.sweep`, `disputes.escalate`, `reviews.remind`, `reconciliation.daily` (daily 09:00–09:20 UTC)
- Interval sweeps: tokenCleanup (hourly), checkoutExpiry (15 min), subscriptionRenewal, insightsSweep, loyaltyExpiry, welcomeSeries, reengagement, abandonedCart, postBooking, birthday, seasonalMarketing (daily)
- Monitoring endpoints: `:4001/health`, `:3000/api/metrics`, tRPC `adminTools.queueHealth`, admin pages `/admin/queues`, `/admin/monitoring`, `/admin/observability`

## 3. Not running — needs user credentials/actions (nothing broken, all fail-closed)

| Integration                                   | Missing           | Effect today                                                                                                                      |
| --------------------------------------------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| MyFatoorah live token                         | user-gated        | payments simulate; ZATCA stays in sandbox (CSID onboarding needs it)                                                              |
| Sentry DSNs (web/mobile/api + EAS env)        | user-gated        | console facade; cron heartbeats inactive; no error tracking                                                                       |
| SMTP (SendGrid)                               | creds             | emails logged to console, not sent                                                                                                |
| Twilio / WhatsApp Business                    | creds             | SMS + WhatsApp reminders silently skip                                                                                            |
| OpenAI key                                    | creds             | AI assistant returns "المساعدة غير متوفرة حالياً"                                                                                  |
| Google OAuth + Calendar                       | client/secret     | Google login + calendar sync disabled                                                                                             |
| AWS S3 + CloudFront                           | account/keys      | uploads local (`/uploads`); CDN off                                                                                               |
| ZATCA production credentials                  | portal onboarding | e-invoicing mock sandbox                                                                                                          |
| TURN relay                                    | creds             | WebRTC falls back to STUN (P2P only)                                                                                              |
| EXPO_ACCESS_TOKEN + Apple account             | user-gated        | no remote EAS builds / iOS distribution                                                                                           |
| ALERT_WEBHOOK_URL                             | webhook           | alert paging is a placeholder                                                                                                     |
| Postman API key                               | user-gated        | API workspace publish/run                                                                                                         |
| Prod/staging server + TLS + `.env.production` | user-gated        | prod/staging compose (nginx, backup sidecar, Prometheus/Grafana/Alertmanager profile) cannot run; `GRAFANA_ADMIN_PASSWORD` needed |
| `taskflow/` app                               | separate scaffold | unrelated task-tool project, not part of GOB                                                                                      |

## 4. Best-practice fix list (collected for prioritization)

**High leverage (buildable now, no credentials):**

1. **One-command dev startup** — a `dev:all` script (web + worker + socket + metro via `concurrently`, or a `docker compose` dev profile) so the platform comes up in one step and survives better. PM2 topology already exists in `deploy/ecosystem.config.cjs` — reuse for local.
2. **Env-shadow hardening** — package-level `.env` files silently beat the root `.env` (the root cause of the 858-job incident). Add a load-order warning in `lib/env.ts` when a shadow file is detected, or delete the shadows and use one root `.env`.
3. **Local observability stack** — a dev-only `prometheus` service scraping `:3000/api/metrics` + Grafana without credentials (prod profile stays user-gated).
4. **Backup defaults** — `scripts/backup-db.sh` defaults to the dead DB name `Galaxy_of_Beauty_db`; default to `Galaxy_of_Beauty_dev` or read `DATABASE_URL`.
5. **Rate-limiter proxy trust** — the API trusts the first `x-forwarded-for` hop; only safe behind a trusted proxy. Enforce a trusted-proxy list in production config.
6. **Seed-enrich idempotency** — `seed-enrich.ts` re-runs create duplicate rows; add upsert guards (same class as the seed-idempotency fixes in W1).
7. **Prisma Studio port** — pin the studio port in `prisma.config.ts` (currently random 49152) for documentation.
8. **Staging bring-up runbook** — `docker-compose.staging.yml` + `.env.staging` exist but were never exercised; document/test a staging run.
9. **Log aggregation for dev** — the four processes log to scattered terminals; a pino file transport or `docker compose logs` in the dev profile fixes it.
10. **MCP_DOCKER runbook** — document `docker mcp gateway run` + `docker mcp client connect <client> -p dev_workflow` (fixed 2026-11-21).

**User-gated (blocking, already tracked):**
Fatoorah token · Sentry DSNs · SMTP/Twilio/WhatsApp/OpenAI/Google keys · AWS account (S3/CDN) · ZATCA production onboarding · TURN · EAS/Apple · prod server + TLS + monitoring profile · ALERT_WEBHOOK_URL · Postman key · third-party pentest + NCA-ECC.

**Known cosmetic gaps (tracked elsewhere):**
Bundle sizes above FE-007 targets (baseline-gated) · client-side Jummah snap for Thursday users · real photography (current imagery = verified-live Unsplash pools, swap file = `packages/shared/src/imagery.ts`).

---

## 5. Follow-up fixes shipped the same day (PR #710)

| #   | Finding                                                                                                             | Fix                                                                                                                               |
| --- | ------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `check-image-urls.mjs` only gated the 72-URL image registry — the new imagery pools (82 URLs) were unverified by CI | Gate now parses `imagery.ts` too: **198 URLs checked**; convention normalization (bare IDs vs `photo-` prefix) added; 4/4 tests   |
| 2   | `backup-db.sh` defaulted to the dead DB name                                                                        | Default → `Galaxy_of_Beauty_dev`                                                                                                  |
| 3   | `docker-compose.yml` carried the same stale-DB defaults (`gob_secure_pass_2024` / `Galaxy_of_Beauty_db`)            | Standardized to `gob_admin:gob_admin` / `Galaxy_of_Beauty_dev` + runner-convention note (compose = infra only on the dev machine) |
| 4   | `docker mcp client connect claude-code` overwrote the project `.mcp.json`                                           | Restored + manually merged the `MCP_DOCKER` gateway entry (dev_workflow profile)                                                  |
| 5   | Expo dependency drift (`expo install --check`: expo/dev-client/router patches, sentry/react alignment)              | Applied via `expo install --fix` (separate chore PR)                                                                              |

**Still user-gated / machine-level (no code fix possible):** Docker Desktop's extra containers (kind/ngrok/control-plane) pressure the memory that triggers the reaper — disable unused extensions in Docker Desktop · host postgres on :5432 with stale creds (stop the Windows service to avoid confusion) · mobile `.env` LAN IP is subnet-dependent · mobile Sentry plugin needs the user's org/project slugs · prod monitoring profile + ALERT_WEBHOOK_URL need credentials.
