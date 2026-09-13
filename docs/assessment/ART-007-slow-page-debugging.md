# ART-007 — Debugging a Slow Page

## The Question

"A customer reports that the booking history page takes 10 seconds to load. Walk me through your debugging process."

## Answer

I debug from the user backward — starting at the browser and following the request through every layer until I find the bottleneck.

### Step 1: Is it the network?

Open Chrome DevTools → Network tab → reload the page. Filter by the API call that fetches bookings (`/api/trpc/bookings.list`).

| What I check                  | What it tells me                                                                |
| ----------------------------- | ------------------------------------------------------------------------------- |
| **TTFB** (Time to First Byte) | If >2s: server-side problem. If <200ms: client-side rendering issue.            |
| **Content Download**          | If large: too much data. Check response size.                                   |
| **Waterfall**                 | Are there sequential requests creating a waterfall? Could they be parallelized? |

**Finding**: TTFB is 8.2 seconds. This is server-side.

### Step 2: Is it the API endpoint?

Open the tRPC response in the Network tab. Check the response payload size. If the response is 2MB of JSON, the problem is over-fetching. If it's 10KB, the problem is in query execution.

Add timing to the route handler:

```typescript
const t0 = performance.now();
const result = await caller.bookings.list(input);
console.log(`bookings.list took ${performance.now() - t0}ms`);
```

**Finding**: The tRPC handler took 8.1 seconds. It's the query.

### Step 3: Is it the database query?

Check the exact query Prisma generated. In development, log all queries:

```typescript
const prisma = new PrismaClient({ log: ['query'] });
```

Or check the database directly with `EXPLAIN ANALYZE`:

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM bookings
WHERE "customerId" = 42
ORDER BY "createdAt" DESC
LIMIT 20;
```

| Signal                                  | Problem                                        |
| --------------------------------------- | ---------------------------------------------- |
| `Seq Scan on bookings` (not Index Scan) | Missing index                                  |
| `Buffers: shared hit=50000`             | Reading too much data from disk                |
| `Sort Method: external merge`           | Sorting in memory because no index on ORDER BY |

**Finding**: The query does a sequential scan on 500,000 bookings. The index on `(customerId, status, createdAt)` exists but PostgreSQL chose not to use it because the statistics were stale.

### Step 4: Fix and verify

```sql
-- Refresh table statistics
ANALYZE bookings;

-- Or if the index is genuinely suboptimal, create the right one:
CREATE INDEX CONCURRENTLY idx_bookings_customer_created
  ON bookings ("customerId", "createdAt" DESC);
```

Rerun `EXPLAIN ANALYZE` → Index Scan, 20 rows in 2ms. Reload the page → TTFB 180ms. Page loads in under 1 second.

### Step 5: Prevent regression

1. **Add a database migration** for the new index (with the ADR explaining why)
2. **Add an alert**: if `bookings.list` p95 latency > 500ms for 5 min → Slack
3. **Add a test**: `SELECT` with `EXPLAIN` to verify the index is used
4. **Document**: in the ADR, record that the composite index `(customerId, createdAt DESC)` outperforms the previous `(customerId, status, createdAt)` for the paginated-history access pattern

### Summary of the debugging flow

```
Browser Network tab (TTFB 8.2s)
  → tRPC handler timing (8.1s)
    → EXPLAIN ANALYZE (Seq Scan, 500K rows)
      → Missing/wrong index
        → CREATE INDEX + ANALYZE
          → Verify: TTFB <200ms
            → Alert + test to prevent regression
```

The principle: **start at the symptom and follow the data**. Don't guess. Don't optimize code you haven't measured. A single `EXPLAIN ANALYZE` output is worth more than an hour of code review.
