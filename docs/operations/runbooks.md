# Incident Runbooks — OPS-009

**Updated**: 2026-08-11
**Applies to**: Galaxy of Beauty production deployment

## 1. Auth Outage (users cannot log in)

**Symptoms**:

- Login endpoint returns 500 or timeout
- `/me` returns 401 for valid cookies
- JWT verification errors in logs

**Response**:

1. Check JWT secrets are set and consistent: `echo $JWT_ACCESS_SECRET | wc -c` (must be ≥32)
2. Check database connectivity: `pnpm --filter @galaxy/db exec prisma db push --skip-generate` (dry-run)
3. Check Redis connectivity: `redis-cli -u $REDIS_URL PING`
4. Roll back last auth-related deployment: `git log --oneline -5`
5. If JWT secrets rotated: update environment, restart all instances

**Escalation**: If database is down → Runbook 4

## 2. Payment Processing Failure

**Symptoms**:

- Payment creation returns 500
- Wallet balance not updating
- PayFort/APS gateway timeout

**Response**:

1. Check PayFort configuration: verify `PAYFORT_*` env vars
2. Check idempotency keys: duplicate POSTs should return cached response
3. Check payment logs: `grep payment /var/log/app.log | tail -20`
4. If gateway unreachable: switch to offline mode (wallet-only payments)
5. Notify finance team

**Escalation**: If >10 failed payments → page on-call engineer

## 3. Booking Slot Conflict (double booking)

**Symptoms**:

- Two customers book the same slot
- Booking status inconsistency

**Response**:

1. Identify conflicting booking IDs from logs
2. Cancel the newer booking, refund if paid
3. Notify affected customers
4. Check database for missing unique constraints on slots
5. If recurrence: add pessimistic row locking to booking creation

## 4. Database Saturation

**Symptoms**:

- Queries timing out
- Connection pool exhausted
- Prisma errors: `Timed out fetching a new connection`

**Response**:

1. Check active connections: `SELECT count(*) FROM pg_stat_activity WHERE state = 'active'`
2. Check long-running queries: `SELECT query, age(now(), query_start) FROM pg_stat_activity WHERE state = 'active' ORDER BY query_start LIMIT 10`
3. Kill queries running >30s: `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'active' AND age(now(), query_start) > interval '30 seconds'`
4. Scale connection pool: increase `DATABASE_URL?connection_limit=20`
5. If persistent: add read replicas for non-transactional queries

## 5. Redis Loss

**Symptoms**:

- Rate limiting fails open (requests allowed)
- Session cache misses
- Socket.IO rooms not synced across instances

**Response**:

1. Check Redis: `redis-cli -u $REDIS_URL PING`
2. If down: application continues with degraded performance (rate limiting, cache miss)
3. Restart Redis: `docker compose restart redis` or cloud provider console
4. After restore: verify Socket.IO adapter reconnects

## 6. Deployment Rollback

**Symptoms**: New deployment causes errors, regressions, or downtime

**Response**:

1. **Immediate**: Run rollback script
   ```bash
   # Roll back to previous deployment
   cd /app/galaxy-of-beauty
   git log --oneline -5          # Find previous good commit
   git checkout <previous-commit>
   pnpm install --frozen-lockfile
   pnpm db:generate
   pnpm build
   pm2 reload all
   ```
2. If database migration was part of deployment: apply rollback migration
   ```bash
   pnpm --filter @galaxy/db exec prisma migrate down 1
   ```
3. Verify health: `curl -f https://galaxyofbeauty.sa/api/trpc/health`
4. Notify team in Slack/Escalation channel
5. **Post-mortem**: document what went wrong in incident tracker

## 7. Credential Leak

**Symptoms**: API keys, JWT secrets, or credentials found in logs/commits

**Response**:

1. **Immediate**: Rotate compromised credentials
   - JWT secrets: generate new values, update env, restart all instances (all sessions invalidated)
   - API keys: revoke in provider console, generate new
   - Database password: update PostgreSQL, update DATABASE_URL
2. Scan git history: `git log --all --full-history -- '*.env'` — remove any tracked secrets
3. Force push cleaned history if secrets were committed
4. Enable branch protection rules
5. Audit access logs for unauthorized use of compromised credentials

## Escalation Contacts

| Role                     | Contact                      |
| ------------------------ | ---------------------------- |
| On-call engineer         | Primary (rotation)           |
| Security incident        | security@galaxyofbeauty.sa   |
| Database admin           | dba@galaxyofbeauty.sa        |
| Payment provider support | PayFort/APS merchant support |

## Post-Incident Checklist

- [ ] Incident recorded in tracker with timeline
- [ ] Root cause identified
- [ ] Fix deployed and verified
- [ ] Monitoring alert added for early detection
- [ ] Runbook updated if response differed from documented procedure
