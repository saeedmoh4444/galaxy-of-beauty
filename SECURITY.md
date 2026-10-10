# Security Policy — Galaxy of Beauty

## Supported Versions

| Version        | Supported             |
| -------------- | --------------------- |
| master         | ✅ Active development |
| Latest release | ✅ Supported          |

## Vulnerability Reporting

**Do not open a public issue.** Email security concerns to the maintainers.

We aim to acknowledge reports within 48 hours and provide an initial assessment within 5 business days.

## Dependency Audit (October 2026)

As of 2026-10-10, `pnpm audit --prod` reports **0 critical / 3 high / 2 moderate** (down from 8 high / 5 moderate on 2026-10-04 — the dependabot wave + two new overrides closed the rest). Baseline enforced by `scripts/audit-check.mjs` in CI (criticals block the merge; high/moderate are documented here). The 3 accepted high findings:

### braces (1 finding) — 🔴 OPEN (no patch yet)

- **CVE**: GHSA-vfj7-8cjw-p6xm — stack-exhaustion DoS via deeply nested patterns; affects `<=3.0.3` with no patched release
- **Status**: ✅ **Accepted** (time-bounded per CI policy) — glob patterns originate from repo config, not user input.

### deepmerge-ts (1 finding) — 🟡 OPEN (fix available, major)

- **CVE**: GHSA-ggr8-5vv4-36mx — stack exhaustion when merging recursive object graphs; affects `<8.0.0`
- **Status**: ✅ **Accepted** — the fix requires a MAJOR upgrade, and deepmerge-ts 7.x is pinned inside `@prisma/config@7.10.0` (repo rule: never override it to a major). Re-evaluate when Prisma bumps.
- **Compensating controls**: Merged objects are internal config/state, not attacker-controlled input.

### node-forge (1 finding) — 🔴 OPEN (no patch yet)

- **CVE**: GHSA-86w9-cpqp-85rv — RSA PKCS#1 v1.5 signature verification accepts extra nested DigestAlgorithm elements; affects `<=1.4.0` with no patched release
- **Status**: ✅ **Accepted** (time-bounded per CI policy) — transitive build/deploy-tooling dependency, not exposed to end-user input.

### Moderate findings (2, accepted)

| Package                      | CVE                                     | Reason accepted                                                                          |
| ---------------------------- | --------------------------------------- | ---------------------------------------------------------------------------------------- |
| `uuid` 7.0.3                 | missing buffer bounds check in v3/v5/v6 | Fix requires a major (`>=11.1.1`) from a transitive chain — accepted, re-check quarterly |
| `decode-uri-component` 0.2.2 | DoS via exponential decoding            | Fix is a breaking rewrite (`>=0.5.0`) deep in RN tooling — accepted, re-check quarterly  |

## Previously Resolved

- **Next.js** — all 8 Next.js 14.2.35 advisories resolved by upgrading to 15.5.23 (commit `c3fa2ea`); the app has since moved to **Next.js 16**.
- **sharp / libvips + libheif** — resolved via the `>=0.35.4` override.
- **engine.io** — resolved via the `>=6.6.10` override.
- **brace-expansion** — resolved via the `>=5.0.11` override (kept alongside the `<2 → 1.1.18` pin).
- **mysql2** — resolved via the `>=3.22.0` override.
- **source-map-js** — resolved 2026-10-10 via the `>=1.2.2` override (patch bump).
- **fast-uri** — resolved 2026-10-10 via the `>=3.1.8` override (patch bump).
- **image-size (2)**, **JS-YAML (1)**, **nanoid (2)** — no longer reported (`nanoid >=3.3.9` override remains).

## Planned Remediation

| Priority | Package              | Action                                | Timeline |
| -------- | -------------------- | ------------------------------------- | -------- |
| P3       | deepmerge-ts         | Re-evaluate when Prisma bumps the pin | Q1 2027  |
| P3       | uuid                 | Major upgrade in the transitive chain | Q1 2027  |
| P3       | decode-uri-component | Replace the consuming chain           | Q1 2027  |
| Monitor  | node-forge, braces   | No upstream patch — re-check monthly  | Ongoing  |

## Audit in CI

`pnpm audit --prod` runs in CI on every PR. **New** critical/high findings must be either:

1. Resolved in the PR, OR
2. Accepted with a time-bounded exception (max 90 days), documented in this file

Merging is blocked while unaccepted critical/high findings remain.

## Secure Development Practices

- **Secrets**: Never committed. `.env.example` provided with all sensitive values commented out. JWT secrets validated at startup (rejects defaults in production).
- **Authentication**: Server-owned HttpOnly cookies (ADR-006). No tokens in `localStorage`.
- **CSRF**: Double-submit cookie pattern with constant-time comparison on all mutations.
- **CORS**: Strict allowlist (not origin reflection).
- **JWT**: HS256 with separate access/refresh secrets, issuer/audience/type claims enforced.
- **Rate Limiting**: Per-client-IP for anonymous, per-user for authenticated.
- **Audit**: Structured security events for login, password change, token reuse.
- **SQL Injection**: Prevented by Prisma ORM with parameterized queries.
- **XSS**: React JSX auto-escaping + CSP headers.
