# ADR-003: Async Job Processing with BullMQ

**Date:** 2026-08-04
**Status:** Accepted

## Context

Booking creation was fully synchronous. The `booking.create` procedure waited for:
- Wallet cashback accrual
- Loyalty points earning
- Notification dispatch (email, SMS, push)
- Google Calendar sync

This made booking creation take 1-3 seconds. Every side effect failure blocked the booking.

## Decision

Use BullMQ (Redis-backed job queues) for fire-and-forget async processing. Create 4 queues:

| Queue | Purpose | Example Jobs |
|-------|---------|-------------|
| `gob-wallet` | Cashback, bonuses, referral rewards | `cashback.accrue` |
| `gob-loyalty` | Points, tier upgrades, streaks | `points.earn` |
| `gob-notifications` | Email, SMS, push | `booking.requested`, `promotion.new` |
| `gob-integrations` | Calendar sync, ZATCA, webhooks | `calendar.create` |

## Architecture

```
booking.create
  ├── 1. Validate input (Zod)
  ├── 2. DB transaction (create booking)
  ├── 3. Emit real-time events (Socket.IO) ← synchronous, fast
  └── 4. Enqueue async jobs (BullMQ)       ← fire-and-forget
       ├── walletQueue.add('cashback.accrue')
       ├── loyaltyQueue.add('points.earn')
       ├── notificationQueue.add('booking.requested')
       └── integrationQueue.add('calendar.create')
  Response: <500ms
```

## Worker Behavior

- 3 retries with exponential backoff (1s → 2s → 4s)
- Completed jobs kept for 24 hours (debugging)
- Failed jobs kept for 7 days (inspection)
- Redis unavailable → queue creation returns null (graceful degradation)
- Workers auto-start with socket server or standalone (`pnpm worker`)

## Consequences

**Positive:**
- Booking creation response time dropped from 1-3s to <500ms
- Side effect failures don't block the main flow
- Jobs are retried automatically (at-least-once delivery)
- Workers can be scaled independently

**Negative:**
- At-least-once delivery (not exactly-once) — need idempotency keys on all job handlers
- Added operational complexity (4 queues to monitor)
- Redis is now a critical dependency (was optional before)

## Alternatives Considered

1. **Synchronous** — Keep everything in the request/response cycle. Rejected: too slow, fragile.
2. **In-process queue** — `setTimeout` or Node.js event loop. Rejected: lost on restart.
3. **Apache Kafka** — Full event streaming platform. Rejected: overkill at our scale.
