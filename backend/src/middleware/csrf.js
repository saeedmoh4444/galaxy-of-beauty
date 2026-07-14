import crypto from 'crypto';
import env from '../config/env.js';
import logger from '../config/logger.js';

/**
 * CSRF protection using the double-submit cookie pattern.
 *
 * How it works:
 * 1. On first request, a random CSRF token is set as a cookie (not httpOnly — the SPA reads it).
 * 2. The SPA sends this token in the X-CSRF-Token header on state-changing requests.
 * 3. We compare the cookie value with the header value — they must match.
 *
 * This is effective because an attacker on a different origin cannot read or set
 * cookies for our domain, so they cannot produce a matching header.
 *
 * Note: JWT Bearer tokens provide inherent CSRF protection since browsers
 * do not automatically attach Authorization headers. This middleware adds
 * an additional layer of defense-in-depth.
 */
export function csrfProtection(req, res, next) {
  // Skip CSRF check for safe HTTP methods
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) {
    // Set/refresh CSRF cookie on safe requests
    const existingToken = req.cookies?.['csrf-token'];
    const token = existingToken || crypto.randomBytes(32).toString('hex');

    if (!existingToken) {
      res.cookie('csrf-token', token, {
        httpOnly: false, // SPA needs to read it
        secure: env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        path: '/',
      });
    }

    return next();
  }

  // For state-changing methods, verify the CSRF token
  const cookieToken = req.cookies?.['csrf-token'];
  const headerToken = req.headers['x-csrf-token'];

  if (!cookieToken || !headerToken) {
    logger.warn('CSRF token missing', {
      method: req.method,
      path: req.path,
      hasCookie: !!cookieToken,
      hasHeader: !!headerToken,
    });

    return res.status(403).json({
      error: {
        code: 'CSRF_INVALID',
        message: 'CSRF token missing. Please refresh the page and try again.',
      },
    });
  }

  // Constant-time comparison to prevent timing attacks
  if (!crypto.timingSafeEqual(Buffer.from(cookieToken), Buffer.from(headerToken))) {
    logger.warn('CSRF token mismatch', { method: req.method, path: req.path });

    return res.status(403).json({
      error: {
        code: 'CSRF_INVALID',
        message: 'CSRF validation failed. Please refresh the page and try again.',
      },
    });
  }

  next();
}

/**
 * Exclude certain paths from CSRF protection.
 * Webhook endpoints called by external services should be exempt.
 */
export function csrfUnless(excludePaths = []) {
  return (req, res, next) => {
    if (excludePaths.some((p) => req.path.startsWith(p))) {
      return next();
    }
    return csrfProtection(req, res, next);
  };
}

export default { csrfProtection, csrfUnless };
