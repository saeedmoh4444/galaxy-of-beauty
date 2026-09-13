# Galaxy of Beauty — Production Deployment Plan

> **Status:** Draft | **Target:** Saudi Arabia production launch | **Platform:** Web + Mobile + API + Real-time

---

## 1. Executive Summary

Galaxy of Beauty is a Saudi-compliant beauty services marketplace with 254 routes, 87 database models, 307 automated tests, and zero TypeScript or ESLint errors. This plan covers the complete path from current state to a production-grade deployment serving customers, technicians, and admins across Saudi Arabia.

**Estimated production timeline: 4-6 weeks** with a dedicated 2-person DevOps + Backend team.

---

## 2. Infrastructure Architecture

### 2.1 Production Topology

```
                           ┌──────────────┐
                           │   Cloudflare  │  DNS + CDN + WAF
                           │  (galaxyofbeauty.sa)
                           └──────┬───────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │     Load Balancer (ALB)    │
                    │   SSL Termination (TLS 1.3)│
                    └─────────────┬─────────────┘
                                  │
              ┌───────────────────┼───────────────────┐
              │                   │                   │
     ┌────────▼────────┐  ┌───────▼───────┐  ┌───────▼───────┐
     │  Next.js Web    │  │  Socket.IO    │  │  Mobile API   │
     │  (2+ instances) │  │  (1 instance) │  │  (same Next)  │
     │  Port 3000      │  │  Port 4001    │  │  Port 3000    │
     └────────┬────────┘  └───────┬───────┘  └───────┬───────┘
              │                   │                   │
              └───────────────────┼───────────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │     Internal Network      │
                    └─────────────┬─────────────┘
                                  │
              ┌───────────────────┼───────────────────┐
              │                   │                   │
     ┌────────▼────────┐  ┌───────▼───────┐  ┌───────▼───────┐
     │  PostgreSQL 15  │  │   Redis 7     │  │  File Storage  │
     │  (RDS / Cloud)  │  │  (ElastiCache)│  │  (S3 / R2)    │
     │  Primary+Replica │  │  Cluster Mode │  │  Uploads+Assets│
     └─────────────────┘  └───────────────┘  └───────────────┘
```

### 2.2 Recommended Providers

| Service        | Provider                               | Why                                                       |
| -------------- | -------------------------------------- | --------------------------------------------------------- |
| **Compute**    | AWS ECS Fargate / Railway / Vercel Pro | Managed containers, auto-scale, zero-downtime deploy      |
| **Database**   | AWS RDS PostgreSQL 15 / Supabase       | Automated backups, point-in-time recovery, read replicas  |
| **Cache**      | AWS ElastiCache Redis 7 / Upstash      | Managed Redis, cluster mode, automatic failover           |
| **Storage**    | AWS S3 / Cloudflare R2                 | User uploads, gallery images, KYC documents               |
| **CDN**        | Cloudflare                             | DDoS protection, Saudi POPs, image optimization           |
| **DNS**        | Cloudflare / AWS Route 53              | .sa domain management                                     |
| **Email**      | AWS SES / Resend                       | Transactional emails (verification, reset, notifications) |
| **Monitoring** | Sentry + AWS CloudWatch / Datadog      | Error tracking, performance, uptime                       |
| **CI/CD**      | GitHub Actions (existing) + AWS ECR    | Build → test → push image → deploy                        |

### 2.3 Sizing Estimates (Saudi Market)

| Tier       | Users            | Compute                         | Database                                      | Cache                     | Monthly Cost (est.) |
| ---------- | ---------------- | ------------------------------- | --------------------------------------------- | ------------------------- | ------------------- |
| **MVP**    | < 1,000          | 2 vCPU, 4 GB × 2                | db.t4g.medium (2 vCPU, 4 GB)                  | cache.t4g.micro           | ~$150-250/mo        |
| **Growth** | 1,000 - 10,000   | 4 vCPU, 8 GB × 3                | db.t4g.large (2 vCPU, 8 GB) + read replica    | cache.t4g.small           | ~$500-800/mo        |
| **Scale**  | 10,000 - 100,000 | 8 vCPU, 16 GB × 4+ (auto-scale) | db.r6g.xlarge (4 vCPU, 32 GB) + read replicas | cache.m6g.large (cluster) | ~$1,500-3,000/mo    |

---

## 3. Pre-Launch Checklist

### 3.1 Security Hardening

- [ ] **Environment Variables** — All 20 env vars from `packages/api/src/lib/env.ts` documented and set in production
  - [ ] `DATABASE_URL` — production PostgreSQL (never default)
  - [ ] `REDIS_URL` — production Redis (never default)
  - [ ] `JWT_ACCESS_SECRET` — 64+ char random, stored in secrets manager
  - [ ] `JWT_REFRESH_SECRET` — 64+ char random, stored in secrets manager
  - [ ] `ZATCA_VAT_NUMBER` — real Saudi VAT registration number
  - [ ] `ZATCA_API_KEY` + `ZATCA_API_SECRET` — from ZATCA sandbox/production portal
  - [ ] `OPENAI_API_KEY` — production OpenAI key
  - [ ] `SENTRY_DSN` — production Sentry project
  - [ ] `NEXT_PUBLIC_APP_URL` — `https://galaxyofbeauty.sa`
  - [ ] `CORS_ORIGIN` — `https://galaxyofbeauty.sa`
  - [ ] `ZATCA_SIMULATE` — **must be unset or `false` in production**
  - [ ] `REFERRAL_CAMPAIGN_START` — ISO date for current campaign

- [ ] **Secrets Management** — store all secrets in AWS Secrets Manager / GitHub Secrets / Vercel Env
- [ ] **Database Password** — rotate from `gob_secure_pass_2024` to a proper random password
- [ ] **SSL/TLS** — TLS 1.3, HSTS header, redirect HTTP → HTTPS
- [ ] **Security Headers** — verify Helmet middleware is active in production
- [ ] **CORS** — restrict to `galaxyofbeauty.sa` and mobile app origins
- [ ] **Rate Limiting** — verify Redis-backed rate limiting is operational
- [ ] **CSRF** — verify double-submit cookie pattern works under production domain
- [ ] **ZATCA** — switch from simulation to real API credentials
- [ ] **Payment Gateway** — configure PayFort / Amazon Payment Services production keys

### 3.2 Database

- [ ] **Backup Strategy** — automated daily backups, 30-day retention, point-in-time recovery
- [ ] **Migration Plan** — run `pnpm db:migrate:deploy` (not `db:push`) in production
- [ ] **Connection Pooling** — use PgBouncer or RDS Proxy for connection management
- [ ] **Index Audit** — verify all Prisma indexes are created, check query performance
- [ ] **Seed for Production** — create initial admin user, categories, Saudi cities (run seed once)
- [ ] **Data Encryption** — enable encryption at rest (RDS default) and in transit (SSL)

### 3.3 Performance

- [ ] **Next.js Build** — run `next build` (already passing, 254 pages)
- [ ] **ISR Strategy** — enable Incremental Static Regeneration on public pages (home, services, blog)
- [ ] **Image Optimization** — use Next.js Image component or Cloudflare Images for user uploads
- [ ] **CDN** — Cloudflare in front of all static assets (JS, CSS, images)
- [ ] **Redis Caching** — verify cache TTL (300s default) is appropriate for catalog data
- [ ] **Database Query Optimization** — review slow queries, add missing indexes
- [ ] **Bundle Analysis** — run `@next/bundle-analyzer` to identify large chunks

### 3.4 Monitoring & Observability

- [ ] **Sentry** — error tracking with source maps, alert rules for critical paths
- [ ] **Uptime Monitoring** — setup health check endpoint monitoring (every 60s)
- [ ] **API Monitoring** — track p95/p99 response times per tRPC procedure
- [ ] **Database Monitoring** — CPU, connections, slow queries, replication lag
- [ ] **Redis Monitoring** — memory usage, hit rate, evictions
- [ ] **Log Aggregation** — structured JSON logs, ship to CloudWatch / Datadog
- [ ] **Alerting** — PagerDuty / Slack alerts for: error rate spike, database down, Redis down, payment failures, ZATCA failures

### 3.5 Legal & Compliance (Saudi Arabia)

- [ ] **ZATCA e-Invoicing** — complete onboarding with ZATCA sandbox → production
- [ ] **PDPL Compliance** — privacy policy, data retention policy, user data export/deletion
- [ ] **Terms of Service** — Arabic + English terms, version-tracked acceptance with IP audit
- [ ] **Payment Provider Agreement** — PayFort / Amazon Payment Services merchant account
- [ ] **Domain Registration** — galaxyofbeauty.sa registered with SaudiNIC
- [ ] **Commercial Registration** — Saudi business license (سجل تجاري)
- [ ] **VAT Registration** — 15% VAT registration number with ZATCA

### 3.6 Mobile App

- [ ] **Expo Build** — `eas build --platform ios --profile production`
- [ ] **App Store** — Apple App Store submission (Saudi region)
- [ ] **Google Play** — Google Play Store submission (Saudi region)
- [ ] **Deep Links** — verify `gob://` scheme and universal links work in production
- [ ] **Push Notifications** — Expo push notification service configured
- [ ] **API URL** — `EXPO_PUBLIC_API_URL` set to production API

### 3.7 Launch Preparation

- [ ] **Load Testing** — run k6 / Artillery against production staging (1K concurrent users)
- [ ] **Penetration Test** — third-party security audit (OWASP Top 10)
- [ ] **Disaster Recovery Test** — restore from backup, verify data integrity
- [ ] **Rollback Plan** — documented procedure for rolling back database migrations and deployments
- [ ] **On-Call Rotation** — define incident response team and escalation path
- [ ] **Documentation** — internal runbook for common operational tasks
- [ ] **Support Channels** — customer support email, WhatsApp Business, phone line

---

## 4. CI/CD Pipeline (Already Configured)

The existing `.github/workflows/ci.yml` covers:

| Job          | Trigger                           | Time   |
| ------------ | --------------------------------- | ------ |
| Type Check   | Push + PR to master/main          | ~2 min |
| Lint         | Push + PR                         | ~1 min |
| Unit Tests   | Push + PR (PostgreSQL 15 service) | ~3 min |
| Build        | After type-check + lint           | ~5 min |
| E2E Tests    | After build (PostgreSQL + Redis)  | ~3 min |
| Docker Build | After build                       | ~3 min |

**Production additions needed:**

- [ ] **Deploy Job** — push Docker image to ECR, update ECS service, run migrations
- [ ] **Smoke Test** — after deploy, hit critical endpoints to verify health
- [ ] **Rollback Job** — manual workflow_dispatch trigger to deploy previous image tag
- [ ] **Database Migration Job** — manual approval gate before running `db:migrate:deploy`

---

## 5. Deployment Strategy

### 5.1 Environment Strategy

| Environment     | Purpose                | Database                  | Domain                    |
| --------------- | ---------------------- | ------------------------- | ------------------------- |
| **Development** | Local dev              | Local PostgreSQL (Docker) | localhost:3000            |
| **Staging**     | Pre-production testing | RDS staging instance      | staging.galaxyofbeauty.sa |
| **Production**  | Live                   | RDS production (Multi-AZ) | galaxyofbeauty.sa         |

### 5.2 Deployment Process

```
1. PR merged to master
2. CI runs: type-check → lint → test → build → E2E (automated)
3. Docker image built and pushed to ECR with git SHA tag
4. Deploy to Staging (automatic)
5. Smoke tests on Staging (automated — 5 min)
6. Manual approval gate for Production
7. Run database migrations (manual trigger, with backup)
8. Deploy to Production (rolling update, 2+ instances)
9. Health check monitoring (5 min watch)
10. Rollback if error rate > threshold
```

### 5.3 Zero-Downtime Deploys

- ECS Fargate rolling update (min 100% healthy, max 200%)
- Database migrations must be backwards-compatible (no destructive changes)
- Use `expand-and-contract` pattern for schema changes
- Cache invalidation via Redis key prefix rotation after deploy

---

## 6. Scaling Strategy

### 6.1 Horizontal Scaling

| Component   | Scaling Trigger                          | Action                             |
| ----------- | ---------------------------------------- | ---------------------------------- |
| Next.js Web | CPU > 70% or request latency > 500ms p95 | Add 1 instance (up to 8)           |
| Socket.IO   | Connected clients > 500                  | Add instance + Redis adapter       |
| PostgreSQL  | Connection count > 80% of max            | Add read replica                   |
| Redis       | Memory > 80%                             | Scale up instance / enable cluster |

### 6.2 Database Scaling Path

1. **Connection pooling** (PgBouncer) — handles 1000+ connections
2. **Read replicas** — route all read queries to replicas, writes to primary
3. **Vertical scaling** — increase instance size (up to r6g.8xlarge)
4. **Sharding** — shard by `userId` (future, when > 1M users)

### 6.3 Caching Strategy

| Data                   | TTL                   | Invalidation                 |
| ---------------------- | --------------------- | ---------------------------- |
| Category tree          | 5 min                 | Invalidate on admin CRUD     |
| Service list (popular) | 5 min                 | Invalidate on service update |
| Feature flags          | 30 sec                | Invalidate on flag toggle    |
| User session           | JWT-based (stateless) | N/A                          |
| Rate limit counters    | 60 sec window         | Auto-expire                  |

---

## 7. Domain & DNS Setup

```
galaxyofbeauty.sa          → Cloudflare → Load Balancer → Next.js (port 3000)
api.galaxyofbeauty.sa      → Cloudflare → Load Balancer → Next.js (port 3000)
socket.galaxyofbeauty.sa   → Cloudflare → Load Balancer → Socket.IO (port 4001)
admin.galaxyofbeauty.sa    → Cloudflare → Load Balancer → Next.js (port 3000)
cdn.galaxyofbeauty.sa      → Cloudflare R2 / S3
*.galaxyofbeauty.sa        → Redirect to galaxyofbeauty.sa
```

---

## 8. Email Configuration

| Email Type           | Provider         | From Address                    |
| -------------------- | ---------------- | ------------------------------- |
| Email Verification   | AWS SES / Resend | no-reply@galaxyofbeauty.sa      |
| Password Reset       | AWS SES / Resend | no-reply@galaxyofbeauty.sa      |
| Booking Confirmation | AWS SES / Resend | bookings@galaxyofbeauty.sa      |
| Notification Digest  | AWS SES / Resend | notifications@galaxyofbeauty.sa |
| Marketing            | AWS SES / Resend | hello@galaxyofbeauty.sa         |

**Note:** The current codebase has SMTP configured but not connected (`SMTP not configured — email not sent` in logs). Production requires:

- [ ] AWS SES domain verification for galaxyofbeauty.sa
- [ ] SMTP credentials in environment variables
- [ ] Email templates translated to Arabic

---

## 9. Risk Register

| Risk                   | Probability | Impact   | Mitigation                                                         |
| ---------------------- | ----------- | -------- | ------------------------------------------------------------------ |
| Database failure       | Low         | Critical | Multi-AZ RDS, automated backups, 5-min RPO                         |
| Redis failure          | Low         | Medium   | ElastiCache with automatic failover; app degrades gracefully       |
| ZATCA API outage       | Medium      | Medium   | Retry with exponential backoff; manual invoice submission fallback |
| Payment gateway outage | Low         | High     | Dual provider setup; offline payment fallback (cash)               |
| DDoS attack            | Low         | High     | Cloudflare WAF + rate limiting                                     |
| Data breach            | Low         | Critical | Encryption at rest + transit; audit logs; PDPL compliance          |
| Mobile app rejection   | Medium      | Low      | Follow Apple/Google guidelines; test on TestFlight first           |

---

## 10. Launch Day Runbook

### T-7 Days

- [ ] All security hardening checklist items complete
- [ ] Load test passing with 2x expected peak traffic
- [ ] Database backups verified with test restore
- [ ] All environment variables set and verified in production
- [ ] Staging environment smoke tests passing

### T-3 Days

- [ ] Production database provisioned, migrated, and seeded (admin user only)
- [ ] DNS cutover tested with `/etc/hosts` or staging domain
- [ ] SSL certificates provisioned and verified
- [ ] Email delivery tested (verification, reset, notification)
- [ ] On-call schedule confirmed for launch week

### T-1 Day

- [ ] Final code freeze on master
- [ ] Full CI pipeline green (type-check, lint, test, build, E2E)
- [ ] Database migration run against production (with backup)
- [ ] Staging → Production deploy tested
- [ ] Rollback procedure documented and tested

### Launch Day (T+0)

- [ ] Deploy latest image to production
- [ ] Run smoke tests (home, login, services, bookings, wallet)
- [ ] Verify ZATCA e-invoicing simulation → switch to production if ready
- [ ] Verify payment gateway in production mode
- [ ] Monitor error rates, latency, and database connections for 4 hours
- [ ] Enable customer registration

### T+1 Day

- [ ] Review error logs, performance metrics
- [ ] Address any P0/P1 issues
- [ ] Customer support team briefed on common issues
- [ ] Post-launch retrospective scheduled

---

## 11. Cost Estimate (Monthly — AWS Saudi Region / Bahrain Region)

| Service               | MVP          | Growth       | Scale          |
| --------------------- | ------------ | ------------ | -------------- |
| Compute (ECS Fargate) | $80          | $240         | $600           |
| Load Balancer (ALB)   | $25          | $25          | $25            |
| RDS PostgreSQL        | $60          | $180         | $500           |
| ElastiCache Redis     | $20          | $60          | $200           |
| S3 Storage (10 GB)    | $3           | $10          | $30            |
| Cloudflare (Pro)      | $20          | $20          | $200           |
| SES (10K emails)      | $1           | $10          | $50            |
| Sentry (Team)         | $26          | $26          | $90            |
| GitHub Actions        | Free         | Free         | $40            |
| Domain (.sa)          | $5           | $5           | $5             |
| **Total**             | **~$240/mo** | **~$576/mo** | **~$1,740/mo** |

_Costs are estimates for Bahrain (me-central-1) or UAE (me-central-1) AWS regions. Saudi region (me-central-1) pricing may differ slightly._

---

## 12. Appendix

### A. Required Production Environment Variables

See `packages/api/src/lib/env.ts` for the complete Zod schema. Critical production vars:

```
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_ACCESS_SECRET=<64+ char random>
JWT_REFRESH_SECRET=<64+ char random>
NEXT_PUBLIC_APP_URL=https://galaxyofbeauty.sa
CORS_ORIGIN=https://galaxyofbeauty.sa
ZATCA_VAT_NUMBER=<real VAT number>
ZATCA_API_KEY=<real API key>
ZATCA_API_SECRET=<real API secret>
# ZATCA_SIMULATE must be unset or "false"
ZATCA_API_URL=https://gw-fatoora.zatca.gov.sa/e-invoicing/core
OPENAI_API_KEY=sk-...
SENTRY_DSN=https://...
```

### B. Database Migration Commands

```bash
# NEVER run these in production without a backup:
pnpm db:migrate:dev       # Creates migration from schema changes
pnpm db:migrate:deploy     # Applies pending migrations (safe for production)
pnpm db:push               # Skips migrations (DEV ONLY — never in production)
pnpm db:generate           # Regenerates Prisma client after schema changes
pnpm db:seed               # Seeds database (run ONCE for production initial setup)
```

### C. Useful Production Commands

```bash
# Health check
curl https://galaxyofbeauty.sa/api/trpc/health

# Type check all packages
pnpm type-check

# Run all tests
cd packages/api && pnpm test

# Build production
pnpm build

# Docker build
docker compose build

# Storybook
cd packages/shared && pnpm build-storybook
```
