# Load Testing (k6)

## Scripts

| Script                  | What it does                                                                                                                             |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `scripts/load/smoke.js` | 1 VU, one iteration each against `health`, `categories.list`, `services.list` — a cheap sanity check with p95 < 750 ms                   |
| `scripts/load/load.js`  | Ramp 30s → hold → ramp-down 30s; 30/30/40 weighted across the same endpoints; `http_req_failed < 1%`, `p(95) < P95_MS` (default 1500 ms) |

## Running locally

```bash
# requires the k6 binary: winget install GrafanaLabs.k6 / choco install k6
k6 run scripts/load/smoke.js -e TARGET_URL=http://localhost:3000
k6 run scripts/load/load.js -e TARGET_URL=http://localhost:3000 -e VUS=5 -e DURATION=15s
```

(Start the app first: `next start` on :3000 with a seeded database, exactly
like the E2E job.)

## CI

`.github/workflows/load-test.yml`:

- **`workflow_dispatch`** — choose target URL (default production),
  scenario (`smoke`/`load`), VUs, and hold duration. Smoke always runs;
  the load stage runs for `load` or scheduled runs.
- **Schedule** — every Saturday 01:00 UTC (03:00 SAST, off-peak).
- **Failure semantics** — threshold breach makes k6 exit non-zero, which
  fails the job. That is by design: a red scheduled run is a performance
  regression alarm. Triage via the k6 step output and Sentry.

Load tests are deliberately NOT a PR gate — they need a warm, real
environment, and every-PR runs would train everyone to ignore them.

## Rate limiting and the IP-rotation caveat

The API rate-limits anonymous requests by client IP: the first
`x-forwarded-for` hop (trusted by the route handler), 20 req/min per
IP+procedure. The scripts rotate a fresh synthetic IP per iteration so
each request gets its own bucket and the test measures handler
performance rather than the limiter.

**Caveat**: this also means the scripts bypass the limiter's protection
by design. They only hit public, read-only, cached-where-possible
endpoints, and the scheduled VU count (30) is far below what the
platform serves organically. Raise VUs only with ops awareness; never
point the load stage at write endpoints.
