# Security Policy — Galaxy of Beauty

## Supported Versions

| Version | Supported          |
|---------|--------------------|
| master  | ✅ Active development |
| Latest release | ✅ Supported |

## Vulnerability Reporting

**Do not open a public issue.** Email security concerns to the maintainers.

We aim to acknowledge reports within 48 hours and provide an initial assessment within 5 business days.

## Dependency Audit (August 2026)

As of 2026-08-11, `pnpm audit --prod` reports **15 high findings** across the following packages:

### Next.js (8 findings)

- **CVE**: GHSA-h25m-26qc-wcjf, GHSA-q4gf-8mx6-v5v3, GHSA-8h8q-6873-q5fj, GHSA-rv87-rfhg-6mq9, GHSA-9wqv-6cfc-4mvj, GHSA-3h98-hf5c-cfjw, GHSA-g648-62x6-rvgq, GHSA-j98j-h76m-ph7p
- **Type**: DoS via request deserialization, SSRF in rewrites/server actions, middleware bypass
- **Affected**: Next.js 14.2.35 (patched in 15.5.16+)
- **Status**: ✅ **Accepted risk** — Next.js 15 migration is planned (see below)
- **Compensating controls**:
  - All user input validated via Zod at tRPC boundaries
  - Middleware does NOT forward unauthenticated requests to Server Components on protected routes
  - Server Actions are gated behind CSRF + auth checks
  - Strict CORS allowlist (not origin reflection)
  - Rate limiting per-client IP prevents abuse
  - CSP headers restrict script/style/frame sources

### Socket.IO (1 finding)

- **CVE**: GHSA-2m8v-j782-fhvr — Zero-attachment Memory Exhaustion in parser
- **Type**: DoS via large unvalidated attachments
- **Status**: ✅ **Accepted risk** — Socket.IO handles small JSON payloads only (no binary attachments)
- **Compensating controls**:
  - Per-socket message rate limiting (30 msg/s)
  - All event payloads validated with Zod
  - Authenticated connections only
  - Ping timeout: 60s

### image-size (2 findings)

- **CVE**: Various — DoS in ICNS/JXL/HEIF parsers
- **Type**: DoS via crafted image files
- **Status**: ✅ **Accepted risk** — image-size is a transitive dep of Next.js image optimization
- **Compensating controls**:
  - Next.js `images.remotePatterns` restricts remote image sources
  - Images served from known CDN/object storage only
  - Upload validation at application layer

### JS-YAML (1 finding)

- **CVE**: Quadratic CPU consumption in `!!omap` type
- **Type**: DoS via crafted YAML
- **Status**: ✅ **Accepted risk** — deep transitive dep, no YAML parsing in application code
- **Compensating controls**: Application does not parse YAML input

### nanoid (2 findings)

- **CVE**: Custom generators can loop indefinitely
- **Type**: DoS via poor entropy source
- **Status**: ✅ **Monitor** — fixed in nanoid 3.3.9+ (override applied); some packages pin older versions
- **Compensating controls**: Standard crypto entropy sources in Node.js 20+ are sufficient

## Planned Remediation

| Priority | Package | Action | Timeline |
|---|---|---|---|
| P0 | Next.js 15 | Migration from 14.2.35 → 15.5.x | Q4 2026 |
| P1 | Socket.IO | Upgrade parser to patched version | Q4 2026 |
| P2 | Expo SDK | Resolve peer dependency alignment | Q4 2026 |

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
