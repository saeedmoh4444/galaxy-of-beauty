# Recommendations Roadmap — 2026-10

> Every open item from the honest audit (`brain_code.md`) and the debt register (`docs/TECHNICAL_DEBT.md`),
> sequenced by impact: what it is, what it improves, effort, and dependencies.
> Treat phases as a pipeline: each phase unblocks the next.

---

## Phase A — Unblock Revenue & Resilience (P0 · start now)

| #   | Recommendation                                                                                                                                                                     | What it improves                                                                                                             | Effort          | Notes / dependency                                                                   |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | --------------- | ------------------------------------------------------------------------------------ |
| A1  | **MyFatoorah live token** → wire `FATOORAH_API_TOKEN`, run sandbox E2E (countries → cities → charge → 1-SAR invoice link), then live token                                         | Real payments — the single thing between the platform and revenue; also unblocks the ZATCA e-invoicing activation path       | 5 min + 1 h E2E | **USER-GATED**: token from MyFatoorah dashboard                                      |
| A2  | **Circuit breaker + retry facade** for external gateways (MyFatoorah, OpenAI, ZATCA, SMS, WhatsApp) — per-gateway breaker with half-open recovery, wrapping today's BullMQ 3-retry | Checkout stops degrading when a gateway stalls; graceful "try again later" instead of failed bookings; fewer support tickets | 6–8 h           | House pattern: fail-closed facades in `packages/api/src/lib/`; add tests per gateway |
| A3  | **Staging environment** — a compose override + a scripted dev-DB snapshot/restore so risky changes test against a prod-like clone                                                  | Safe testing for schema changes and gateway wiring; faster confident deploys                                                 | 6–8 h           | Depends on A1 for gateway testing value                                              |

## Phase B — Launch & Operations Readiness (P0/P1)

| #   | Recommendation                                                                                                 | What it improves                                                           | Effort | Notes / dependency                         |
| --- | -------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ------ | ------------------------------------------ |
| B1  | **Scheduled DB backups + restore drill in prod** (`scripts/backup-db.sh` exists — cron/RDS snapshots)          | Business continuity; recover from corruption/deletion                      | 2 h    | Drill procedure already documented         |
| B2  | **SSL + Nginx + PM2 production setup** per `docs/DEPLOYMENT.md`                                                | HTTPS is non-negotiable for a payment platform; proper process supervision | 4 h    | Server-side; runbook exists                |
| B3  | **Alerting** — Slack/webhook alerts on error rate >5%, payment failures, BullMQ depth, disk >80%               | Mean-time-to-detect drops from days to minutes                             | 4 h    | Pairs with Sentry (already active)         |
| B4  | **Observability dashboards** — Prometheus + Grafana (or Sentry metrics) for API latency, DB pools, queue depth | Visibility into the real bottlenecks before they become outages            | 8 h    | Can start with a queue dashboard only (P2) |

## Phase C — Performance & Scale (P1/P2)

| #   | Recommendation                                                                                                                                            | What it improves                                                                  | Effort              | Notes / dependency                              |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ------------------- | ----------------------------------------------- |
| C1  | **FE-007 bundle slimming** — audit the shared chunk set (tRPC/API client, ui barrel, marketing chunk); the catalog split (#368) was step 1 (−91 KB/route) | LCP/TTI on 3G, SEO, conversion; routes currently 560–650 KB vs 100–150 KB targets | 2–3 days, iterative | Measure with the existing size gate each step   |
| C2  | **k6 load test at 1K concurrent users** against staging                                                                                                   | Find the real breaking point before real traffic does                             | 4 h                 | After A3                                        |
| C3  | **Read replica plan** (10K+ users trigger) — route analytics/list queries to a replica                                                                    | Primary DB stops being the single hammer                                          | 16 h                | Defer until scale; document the split point now |

## Phase D — Mobile & Compliance (P2/P3)

| #   | Recommendation                                                                                                                                                      | What it improves                                                         | Effort           | Notes / dependency                        |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | ---------------- | ----------------------------------------- |
| D1  | **App-store submission** — EAS pipeline is ready (APK + iOS simulator built); staged rollout                                                                        | Distribution + the revenue channel that justifies the platform valuation | 1 day            | Needs Apple credentials (user)            |
| D2  | **Expo SDK 58 upgrade**                                                                                                                                             | Latest RN fixes, continued OTA compatibility                             | 1 day            | Do as a majors-PR like previous SDK waves |
| D3  | **Security pentest + NCA-ECC compliance**                                                                                                                           | Trust, partnerships, Saudi market compliance                             | 1 week, external | After B-phase hardening                   |
| D4  | **Code-hygiene sweeps** — seed `(prisma as any)` → typed calls; lint-warning triage (~30 warnings); dangling `./ui` export; mobile `TranslationKey` cosmetic import | Lower drift risk (the review-seed bug class), cleaner signals            | 1–2 days         | Low risk, parallelizable with anything    |

---

## Sequencing rationale

1. **A1 is the keystone** — nothing in Phase B/C pays off without real payment flow.
2. **A2 + A3 make the platform safe to change**, which is what makes B/C fast rather than scary.
3. **C1 is the highest-leverage engineering item** — it's measurable (the size gate), it's user-visible (speed), and half the foundation (catalog split + gate + leak guard) is already in place.
4. **D-items are parallelizable** — they don't block anything upstream.

## What changes first, practically

| Now (this week)          | Next                      | Later                       |
| ------------------------ | ------------------------- | --------------------------- |
| A1 (token), A2 (breaker) | A3 (staging), B1–B3 (ops) | C1 (bundle), C2 (k6), D1–D4 |
