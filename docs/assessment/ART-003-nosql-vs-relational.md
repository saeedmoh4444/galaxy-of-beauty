# ART-003 — NoSQL vs Relational Database Selection

## The Question

"When would you choose a NoSQL database over a relational database? Give a concrete example."

## Answer

I choose the database that matches the data's shape and access pattern, not the one that's trending.

### Choose Relational (PostgreSQL) when:

- **Data has relationships that matter.** In Galaxy of Beauty: a Booking belongs to a Customer, a Technician, a Service, a Payment, and a Review. These are six foreign-key relationships in one entity. A document database would force me to either embed (duplicating data that goes stale) or reference (reimplementing joins in application code).
- **Transactions span multiple entities.** When a customer pays for a booking, I need to: create a Payment row, update the Booking status, increment the Wallet balance, and insert an AuditLog — atomically. PostgreSQL's `BEGIN; ...; COMMIT;` gives me this. MongoDB's multi-document transactions exist but carry performance penalties and operational complexity.
- **The schema is known and stable.** Beauty services have names, prices, durations, categories — this structure is well-understood. Relational schemas enforce this at the database layer, preventing invalid data from ever being stored.

### Choose NoSQL (Redis) when:

- **The access pattern is a simple key-value lookup.** Galaxy of Beauty uses Redis for rate limiting: `INCR ratelimit:anon:192.168.1.1:auth.login`. Each key is independent — no joins, no relationships. Redis gives us atomic increments, automatic expiry, and sub-millisecond latency that PostgreSQL cannot match for this workload.
- **Data is ephemeral.** Rate-limit counters expire in 60 seconds. Session caches expire in 15 minutes. There's no value in relational integrity for data that deletes itself.

### Concrete Example: Booking Slot Reservation

When reserving a booking slot, I need:

1. **PostgreSQL**: Check slot availability with `SELECT ... FOR UPDATE` (row-level lock), insert Booking row, update Availability. This requires ACID — if the payment fails, the entire transaction rolls back.
2. **Redis**: Cache the availability calendar for fast reads (key: `slots:technician:42:2026-08-15` → set of available times). When a slot is booked, remove it from the set. If Redis is unavailable, fall back to the database query — the cache is an optimization, not the source of truth.

I use both in the same application because they solve different problems. PostgreSQL is the system of record for everything that matters. Redis is the acceleration layer for hot-path reads and distributed coordination. The choice isn't "NoSQL vs relational" — it's "which tool handles this specific access pattern correctly, reliably, and at the needed scale."
