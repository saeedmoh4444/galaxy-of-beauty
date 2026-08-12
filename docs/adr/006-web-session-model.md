# ADR-006: Web Session Model — Server-Owned Cookies

**Status:** Accepted  
**Date:** 2026-08-11  
**Supersedes:** Implicit localStorage-based token storage

## Context

The current authentication model is internally inconsistent:

- **Login/Register** pages store access + refresh JWTs in `localStorage`
- **useAuth** hook reads/writes tokens from `localStorage`
- **Next.js middleware** reads a `gob_access` cookie that is **never set** by any login flow
- **tRPC route handler** reads tokens from the `Authorization: Bearer` header
- **Socket.IO** verifies a JWT but misaligns `id`/`userId` field names

This means SSR-protected pages redirect authenticated users (cookie missing), while the client considers itself authenticated (localStorage has tokens). The OWASP HTML5 Security Cheat Sheet explicitly warns against storing sensitive session identifiers in `localStorage` because JavaScript can access them.

## Decision

Adopt **server-owned, HttpOnly cookies** for web sessions, with a bearer-token fallback for mobile.

### Target architecture

| Client | Access credential | Refresh credential | Storage |
|---|---|---|---|
| Web | Short-lived JWT in `HttpOnly`, `Secure`, `SameSite=Lax` cookie named `gob_access` | Rotating JWT in `HttpOnly`, `Secure`, `SameSite=Strict` cookie named `gob_refresh` with `Path=/api/trpc/auth.refresh` | Cookies only; no JavaScript access |
| Mobile | Short-lived JWT in memory (React state) | Rotating JWT in Expo SecureStore | SecureStore for refresh; memory for access |
| Socket.IO | Cookie-authenticated same-origin (web) or token param (mobile) | Never sent to Socket.IO | N/A |

### Session lifecycle

```
LOGIN:
  1. Client POSTs credentials → /api/trpc/auth.login
  2. Server validates, creates access + refresh JWTs
  3. Server sets gob_access cookie (15min, Lax) + gob_refresh cookie (7d, Strict, path-scoped)
  4. Server returns user object in body (no tokens in response body for web)

REFRESH:
  1. Browser auto-sends gob_refresh cookie (path-scoped to auth.refresh)
  2. Server verifies JWT signature + checks DB for revocation/reuse
  3. Server rotates: revokes old, issues new, stores hashed family lineage
  4. Server sets new gob_access + gob_refresh cookies
  5. If old token was already revoked → revoke entire token family (reuse detection)

LOGOUT:
  1. Client calls auth.logout (with gob_access cookie for auth)
  2. Server revokes all active refresh tokens for user
  3. Server clears cookies

PASSWORD CHANGE / ACCOUNT SUSPENSION:
  - Revokes all refresh tokens → immediate session termination on all devices
```

### Cookie configuration (production)

| Cookie | HttpOnly | Secure | SameSite | Path | Max-Age |
|---|---|---|---|---|---|
| `gob_access` | true | true | Lax | / | 900 (15 min) |
| `gob_refresh` | true | true | Strict | /api/trpc | 604800 (7 days) |
| `csrf-token` | false | true | Strict | / | 86400 (24h) |

## Consequences

### Positive
- Single source of truth: middleware, SSR, tRPC, exports all read the same cookie
- XSS-resistant: tokens are never accessible to JavaScript
- CSRF-resistant: refresh cookie is SameSite=Strict + path-scoped
- Refresh reuse detection works because lineage is preserved
- Mobile path preserved via Authorization header fallback

### Negative
- Mobile clients must send tokens via header (needs adapter)
- Web clients can no longer read access token expiry from JS (rely on /me endpoint)
- Deployment must ensure `Secure` flag is set (requires HTTPS)
- Existing Playwright tests rely on localStorage token access → must be updated

## Implementation Plan

See Phase 3 tasks AUTH-002 through AUTH-010 in `plan.of.working.for.you.md`.

## References

- [OWASP HTML5 Security Cheat Sheet — Storage APIs](https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html#storage-apis)
- [RFC 7519 — JSON Web Token (JWT)](https://datatracker.ietf.org/doc/html/rfc7519)
- [SameSite cookies explained](https://web.dev/articles/samesite-cookies-explained)
