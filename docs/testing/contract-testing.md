# Contract Testing — Router Inventory Gate

The API surface of this platform is the tRPC `appRouter` (~1,000 procedures
across ~220 routers). Web and mobile consume it over HTTP, so an unintended
rename, removal, or addition of a procedure is an API breaking change that
type-checking alone cannot catch across release boundaries (mobile builds
ship separately from web).

## The gate

`packages/api/src/__tests__/router-inventory.test.ts` walks
`appRouter._def.procedures` recursively and snapshots the canonical inventory:

- **Counts summary** — total procedures, queries/mutations/subscriptions,
  and per-tier counts (`public` / `protected` / `customer` / `technician` /
  `admin` / `staff`).
- **Detail list** — every procedure as `path\ttype\ttier`, sorted, in a
  snapshot file (`__snapshots__/router-inventory.test.ts.snap`). Renames
  appear as clean delete+add pairs in the diff.
- **SHA-256** — of the canonical detail string (one-line inline check).

Tiers are stamped at the factory level in `packages/api/src/trpc.ts` via
`.meta({ tier: ... })`; the meta propagates through `.use()` chains, and a
hard assertion fails if any procedure ends up without a tier (catches future
factories that forget the stamp).

The gate runs inside the regular Unit Tests CI job — no new required check.

## Bump ritual (intentional API change)

```bash
pnpm --filter @galaxy/api exec vitest run src/__tests__/router-inventory.test.ts -u
```

Then review the diff before committing: renames show as delete+add pairs,
removals as deleted lines, additions as added lines. If the diff shows
changes you did not intend, do not commit the updated snapshot.

## Why not Pact?

Pact models HTTP/REST contracts and requires a provider-verification
infrastructure. This platform's API is tRPC (single HTTP endpoint with a
proprietary envelope), and its only consumers are in-repo (web + mobile).
The inventory gate gives the equivalent breaking-change signal at a
fraction of the cost, plus tier drift detection that Pact would not see.
If external consumers are ever added over REST, revisit Pact for that
surface.
