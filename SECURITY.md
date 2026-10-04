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

As of 2026-10-04, `pnpm audit --prod` reports **0 critical / 8 high / 5 moderate** (baseline enforced by `scripts/audit-check.mjs` in CI). The 8 accepted high findings:

### sharp / libheif (1 finding) — 🟡 OPEN (fix available)

- **CVE**: GHSA-rgj7-g3m4-5g8c — libheif vulnerabilities (GHSA-g89c-p67h-r497, GHSA-2jg2-4ch7-h545)
- **Type**: Image parsing vulnerabilities; affects sharp `<0.35.4` (0.35.3 currently resolved by the `>=0.35.0` override)
- **Status**: ✅ **Accepted** until the override is bumped — P1 (one-line change)
- **Note**: The previous libvips finding (CVE-2026-33327, CVE-2026-33328, CVE-2026-35590, CVE-2026-35591) is resolved.

### engine.io (1 finding) — 🟡 OPEN (fix available)

- **CVE**: GHSA-2gc4-cqfq-p2gv — Engine.IO protocol revision mismatch DoS; affects `>=6.6.0 <6.6.10`
- **Status**: ✅ **Accepted** — fixable via `engine.io >=6.6.10` override (P2)
- **Compensating controls** (unchanged from Socket.IO policy):
  - Per-socket message rate limiting (30 msg/s)
  - All event payloads validated with Zod
  - Authenticated connections only
  - Ping timeout: 60s
- **Note**: The previous Socket.IO parser finding (GHSA-2m8v-j782-fhvr, zero-attachment memory exhaustion) is no longer reported.

### brace-expansion (2 findings) — 🟡 OPEN (fix available)

- **CVE**: GHSA-qhr7-859c-m2p7, GHSA-6j4f-fj2g-mc7p — DoS via uncontrolled recursion; affects `>=4.0.0 <5.0.11`
- **Status**: ✅ **Accepted** — fixable via `brace-expansion >=5.0.11` override (P2). The existing override only pins `<2 → 1.1.18`.
- **Compensating controls**: Transitive build-tooling dependency — expansion patterns originate from repo config, not user input.

### deepmerge-ts (1 finding) — 🟡 OPEN (fix available, major)

- **CVE**: GHSA-ggr8-5vv4-36mx — stack exhaustion when merging recursive object graphs; affects `<8.0.0`
- **Status**: ✅ **Accepted** — fix requires a major upgrade (evaluate consumer first, P3)
- **Compensating controls**: Merged objects are internal config/state, not attacker-controlled input.

### mysql2 (1 finding) — 🟡 OPEN (fix available)

- **CVE**: GHSA-3f6p-5ww8-9rcr — auth plugin downgrade to `mysql_clear_password` leaks plaintext credentials; affects `<3.22.0`
- **Status**: ✅ **Accepted** — transitive dependency only; the platform uses PostgreSQL via Prisma and opens no MySQL connections. Fixable via `mysql2 >=3.22.0` override (P3).

### node-forge (1 finding) — 🔴 OPEN (no patch yet)

- **CVE**: GHSA-86w9-cpqp-85rv — RSA PKCS#1 v1.5 signature verification accepts extra nested DigestAlgorithm elements; affects `<=1.4.0` with no patched release
- **Status**: ✅ **Accepted** (time-bounded per CI policy) — transitive build/deploy-tooling dependency, not exposed to end-user input.

### braces (1 finding) — 🔴 OPEN (no patch yet)

- **CVE**: GHSA-vfj7-8cjw-p6xm — stack-exhaustion DoS via deeply nested patterns; affects `<=3.0.3` with no patched release
- **Status**: ✅ **Accepted** (time-bounded per CI policy) — glob patterns originate from repo config, not user input.

## Previously Resolved

- **Next.js** — all 8 Next.js 14.2.35 advisories resolved by upgrading to 15.5.23 (commit `c3fa2ea`); the app has since moved to **Next.js 16**.
- **sharp / libvips** — CVE-2026-33327, CVE-2026-33328, CVE-2026-35590, CVE-2026-35591 resolved via the `>=0.35.0` override (superseded by the libheif finding above).
- **image-size (2)**, **JS-YAML (1)**, **nanoid (2)** — no longer reported (`nanoid >=3.3.9` override remains).

## Planned Remediation

| Priority | Package            | Action                               | Timeline |
| -------- | ------------------ | ------------------------------------ | -------- |
| ✅ Done  | Next.js            | Migrated 14.2.35 → 15.5.23 → 16      | 2026     |
| P1       | sharp              | Bump override to `>=0.35.4`          | Oct 2026 |
| P2       | engine.io          | Override `>=6.6.10`                  | Oct 2026 |
| P2       | brace-expansion    | Override `>=5.0.11`                  | Oct 2026 |
| P3       | mysql2             | Override `>=3.22.0`                  | Q4 2026  |
| P3       | deepmerge-ts       | Evaluate `>=8.0.0` major upgrade     | Q4 2026  |
| Monitor  | node-forge, braces | No upstream patch — re-check monthly | Q4 2026  |

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
