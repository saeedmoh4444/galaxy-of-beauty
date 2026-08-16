# Security Policy — Galaxy of Beauty

## Supported Versions

| Version        | Supported             |
| -------------- | --------------------- |
| master         | ✅ Active development |
| Latest release | ✅ Supported          |

## Vulnerability Reporting

**Do not open a public issue.** Email security concerns to the maintainers.

We aim to acknowledge reports within 48 hours and provide an initial assessment within 5 business days.

## Dependency Audit (August 2026)

As of 2026-08-12, `pnpm audit --prod` reports **8 high findings** across the following packages:

### Next.js — ✅ RESOLVED

All 8 Next.js 14.2.35 advisories were resolved by upgrading to **Next.js 15.5.23** (commit `c3fa2ea`).

### sharp / libvips (1 finding)

- **Type**: Inherited vulnerabilities in libvips image processing library
- **Status**: ✅ **Accepted risk** — sharp is a transitive dependency used by Next.js 15 for image optimization
- **Compensating controls**: `images.remotePatterns` restricts remote image sources to known CDN/object storage

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

| Priority    | Package    | Action                            | Timeline |
| ----------- | ---------- | --------------------------------- | -------- |
| ✅ Complete | Next.js 15 | Migrated 14.2.35 → 15.5.23        | Aug 2026 |
| P1          | Socket.IO  | Upgrade parser to patched version | Q4 2026  |
| P2          | Expo SDK   | Resolve peer dependency alignment | Q4 2026  |

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
