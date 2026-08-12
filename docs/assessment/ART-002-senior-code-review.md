# ART-002 — Senior Code Review of Fictional Auth Middleware

**Reviewed by**: Senior Full-Stack Engineer  
**PR**: #427 — "Add JWT authentication middleware"  
**Verdict**: ❌ Do not merge — 5 blocking security issues, 3 high-priority fixes required

---

## 🔴 Blocking Security Issues

### 1. Algorithm Confusion Vulnerability (CRITICAL)

```js
const decoded = jwt.verify(token, getSecret());
```

**Problem**: The `jsonwebtoken` library's `verify()` accepts any algorithm by default, including `none`. An attacker can forge a token with `{ alg: "none" }` and the library will accept it without verifying the signature.

**Exploit**: Attacker crafts `header.{"role":"admin"}.` (empty signature) → gains admin access to any account.

**Fix**:
```js
const decoded = jwt.verify(token, getSecret(), { algorithms: ['HS256'] });
```

### 2. Token in URL Query Parameter (CRITICAL)

```js
|| req.query.token;
```

**Problem**: Tokens in URLs are logged by proxies, CDNs, browser history, and server access logs. This is a permanent credential leak vector.

**Fix**: Remove `req.query.token`. Accept only `Authorization: Bearer` header and secure HttpOnly cookie.

### 3. Token + Stack Trace Leaked in Logs and Errors (HIGH)

```js
console.log(`[AUTH] User ${decoded.email} authenticated. Token: ${token}`);
// ...
return res.status(500).json({ error: err.message, stack: err.stack });
```

**Problem**: Full JWT logged to console (persisted in log files, shipped to log aggregators). Stack traces exposed to clients reveal internal paths, library versions, and code structure.

**Fix**:
```js
// Log only user ID, never the token
logger.info({ userId: decoded.id }, 'User authenticated');
// Return generic error to client, log details server-side
return res.status(500).json({ error: 'Internal server error' });
```

### 4. Synchronous DB Query + No Error Handling (HIGH)

```js
const rows = db.querySync('SELECT * FROM users WHERE id = ?', [decoded.id]);
if (!rows.length) return res.status(403).send('User gone');
```

**Problem**: Synchronous I/O blocks the event loop. No try/catch — a DB error crashes the process. `SELECT *` returns password hash unnecessarily.

**Fix**:
```js
try {
  const user = await db.query(
    'SELECT id, email, role, is_active FROM users WHERE id = $1',
    [decoded.id]
  );
  if (!user.rows.length) {
    return res.status(401).json({ error: 'Authentication failed' });
  }
  if (!user.rows[0].is_active) {
    return res.status(403).json({ error: 'Account deactivated' });
  }
} catch (err) {
  logger.error({ err }, 'Database query failed during auth');
  return res.status(500).json({ error: 'Internal server error' });
}
```

### 5. Synchronous File Read on Every Request (MEDIUM)

```js
function getSecret() { return fs.readFileSync('/etc/secrets/jwt.key', 'utf8').trim(); }
```

**Problem**: `readFileSync` on the hot path (every authenticated request) blocks the event loop. At scale, this adds milliseconds of synchronous I/O per request.

**Fix**: Read once at startup, validate, cache in memory:
```js
const JWT_SECRET = (() => {
  const secret = fs.readFileSync('/etc/secrets/jwt.key', 'utf8').trim();
  if (secret.length < 32) throw new Error('JWT secret too short');
  return secret;
})();
```

---

## 🟡 Non-Blocking Improvements

### 6. Inconsistent Error Response Shape

`401` returns `{ error: "..." }`, `403` returns plain text `"User gone"`, `500` returns `{ error, stack }`. Clients must handle three different response shapes.

**Fix**: Use a consistent error format across all responses:
```js
{ error: { code: 'UNAUTHORIZED', message: '...' } }
```

### 7. No Rate Limiting

No protection against brute-force token guessing. An attacker can hammer the endpoint with malformed JWTs.

**Fix**: Add rate limiting per IP before the auth middleware.

### 8. No Token Expiry Check Before DB Query

An expired token still triggers a database query before jwt.verify throws. At scale, expired tokens waste DB connections.

**Fix**: Decode the JWT payload (without verifying) to check expiry first, skip DB if already expired.

---

## Summary for the Author

This is a solid first attempt at auth middleware — you correctly identified the need for JWT verification and user lookup. The main learning areas are:

1. **Never trust the JWT library defaults** — always pin the algorithm
2. **Tokens are secrets** — treat them like passwords in logs, URLs, and error messages
3. **Async all the way** — no synchronous I/O in request handlers
4. **Consistent error shapes** make clients simpler and debugging easier

Please address the 5 blocking issues and re-request review. Happy to pair on the fixes if helpful.
