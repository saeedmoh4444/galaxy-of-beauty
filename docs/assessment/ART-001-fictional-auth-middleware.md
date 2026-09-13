# ART-001 — Fictional Poor Authentication Middleware (for Code Review)

**Note**: This is a fictional diff created for the senior code-review exercise. It contains intentionally flawed code.

```diff
+ // middleware/auth.js — added by Junior Dev, PR #427
+ const jwt = require('jsonwebtoken');
+ const fs = require('fs');
+
+ // Read secret from file on every request (I/O on hot path)
+ function getSecret() {
+   return fs.readFileSync('/etc/secrets/jwt.key', 'utf8').trim();
+ }
+
+ module.exports = function authMiddleware(req, res, next) {
+   const token = req.headers.authorization?.split(' ')[1]
+              || req.cookies?.token
+              || req.query.token;  // Accepts token from URL query param
+
+   if (!token) {
+     // Leaks internal path in error message
+     return res.status(401).json({
+       error: 'No token provided. POST to /api/v1/auth/login with {email, password}.'
+     });
+   }
+
+   try {
+     // Does not constrain algorithms — accepts 'none' algorithm
+     const decoded = jwt.verify(token, getSecret());
+     req.user = decoded;
+
+     // Blocking I/O: synchronous DB call with no error handling
+     const db = require('../db');
+     const rows = db.querySync('SELECT * FROM users WHERE id = ?', [decoded.id]);
+     if (!rows.length) {
+       // Different error shape from above — inconsistent
+       return res.status(403).send('User gone');
+     }
+
+     // Logs entire token (including signature) to console
+     console.log(`[AUTH] User ${decoded.email} authenticated. Token: ${token}`);
+
+     next();
+   } catch (err) {
+     // Leaks raw JWT library error to client
+     return res.status(500).json({ error: err.message, stack: err.stack });
+   }
+ };
```
