# ADR-001: TypeScript Build Strategy

**Status:** Accepted  
**Date:** 2026-07-27  
**Deciders:** Audit remediation team  

## Context

The project uses tRPC v11 with deeply nested RouterOutput types (42 Prisma models, 45 routers). Next.js 14 uses SWC for compilation during `next build`, which handles TypeScript differently from `tsc`. Specifically, SWC triggers TS2589 "type instantiation excessively deep" on certain RouterOutput type inferences that `tsc --noEmit` handles correctly.

We have two options:

1. **Remove `ignoreBuildErrors`** — convert all RouterOutput types to structural types (`Record<string, any>`) in the 22 affected files. This sacrifices type safety on deeply-nested API responses.

2. **Keep `ignoreBuildErrors: true`** — rely on the separate `pnpm type-check` step (`tsc --noEmit`, 10/10 workspaces) for real type checking. This preserves full RouterOutput type inference everywhere.

## Decision

**Option 2 — Keep `ignoreBuildErrors: true` and rely on the separate type-check step.**

## Rationale

- `tsc --noEmit` is the authoritative TypeScript checker. It catches ALL real type errors (field name mismatches, missing properties, invalid assignments). The Next.js build's SWC-based checking is a secondary pass that produces false positives on valid code.
- The separate `type-check` turbo task runs in CI before `build` and must pass for the pipeline to succeed.
- Attempting Option 1 (removing `ignoreBuildErrors`) caused the Next.js build to hang indefinitely, proving the SWC type checker cannot practically handle the tRPC type depth.
- 22 files currently use `RouterOutput` types. Converting all of them to structural types would lose valuable type safety and is not a net improvement.

## Consequences

- Developers must run `pnpm type-check` locally before committing. This is enforced by CI.
- The Next.js build output will not show TypeScript errors. Real errors are caught by `pnpm type-check`.
- If SWC's type handling improves in a future Next.js version, this decision should be revisited.
