# ART-008 — Self-Critique

## The Question

"Critique your own submission. What would you do differently? What are its genuine limitations?"

## Answer

If I were evaluating this submission as a senior hiring manager, here's what I'd flag — and what I'd do about it.

### Genuine Limitation 1: Feature Breadth Outpaced Quality Depth

**The problem**: 245 API routers and 202 database models is too much for one team to maintain, test, and secure. The evaluation found direct test coverage for only ~23 namespaces (9.5%). I built wide when I should have built deep.

**Why it happened**: I was excited about the domain. Beauty services, loyalty programs, AI skin analysis, predictive demand — each feature felt essential. But a marketplace doesn't need a time-capsule feature or a Secret Santa exchange to launch. These were scope creep disguised as innovation.

**What I'd do differently**: Ship 30 routers covering the core loop (browse → book → pay → review) with 80%+ test coverage. Everything else goes behind a feature flag marked "beta." Users can't use what isn't reliable, and 90 untested features are less valuable than 30 tested ones.

### Genuine Limitation 2: The CI Pipeline Was Never Green

**The problem**: 38/38 CI runs failed in the inspected history. The deployment pipeline had 35/35 failures. I configured the workflows, wrote the Dockerfiles, set up the health checks — and never verified they actually ran successfully end-to-end.

**Why it happened**: I treated CI as a configuration task ("write the YAML, check the box") rather than as a product feature. A green pipeline is the most important feature any team has — it's the difference between "we think it works" and "we know it works."

**What I'd do differently**: Before writing a single feature router, I'd make CI pass on an empty scaffold: frozen install → format → lint → type-check → build → test. Every subsequent PR inherits a green baseline. A failing CI run blocks merge, no exceptions. This is Phase 1-2 of the remediation plan I've now executed.

### Genuine Limitation 3: The Authentication Model Was Internally Inconsistent

**The problem**: Login stored JWT tokens in `localStorage` while the Next.js middleware checked a `gob_access` cookie that was never set by any login flow. Socket.IO extracted `userId` from a JWT payload that only had `id`. These aren't subtle bugs — they're architectural contradictions.

**Why it happened**: I designed the auth system in layers without testing them together. The JWT library, the login page, the middleware, and the Socket.IO server were each built against a mental model of "how auth should work" — but those mental models didn't match.

**What I'd do differently**: Write the session contract FIRST as an ADR. Then implement it with integration tests that verify the full flow: login → cookie set → middleware reads cookie → tRPC reads cookie → Socket.IO reads cookie. Every layer uses the same mechanism. This is Phase 3 of the remediation.

### Genuine Limitation 4: The README Claimed Production-Ready Without Evidence

**The problem**: The README displayed green badges for type-check, lint, build, and Docker — none of which were linked to actual CI results. It documented a root `pnpm test` command that didn't exist and claimed 9 migrations when there were 8.

**Why it happened**: I wrote the README as aspirational documentation — describing what the project SHOULD be, not what it WAS. This is a common trap: the README becomes a vision document instead of an operations manual.

**What I'd do differently**: Remove every badge that isn't backed by a CI workflow badge URL. Replace every claimed command with the actual output. Add a "Current Status" table that reflects the last CI run. If it's not green, the README says so — because a trustworthy status page is more professional than fake green badges.

### What I Learned

This remediation project (Phases 0-13) has been the process of converting an aspirational codebase into a verified one. The through-line across all four limitations is the same: **I optimized for breadth and velocity when I should have optimized for reliability and verifiability.**

A senior engineer isn't measured by how many features they can scaffold. They're measured by whether the system works when a real user depends on it at 3 AM. That means: a green build, a coherent auth model, tests that catch regressions, and documentation a new team member can trust.

If I were starting Galaxy of Beauty fresh tomorrow, I'd build it in this order:

1. Green CI on an empty repo (1 day)
2. Auth with server-owned cookies + integration tests (3 days)
3. One end-to-end feature (browse → book → pay) with full test coverage (1 week)
4. THEN expand to 30+ features, each inheriting the patterns from step 3

The next 90 days should be spent on the remediation plan: dependency upgrades, test coverage for Tier 1 endpoints, the Next.js 15 migration, and the womensServices.ts router split. Feature freeze until the baseline is solid.
