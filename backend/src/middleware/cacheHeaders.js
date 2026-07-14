/**
 * Cache Control & ETag Middleware
 *
 * Adds intelligent caching headers based on route type:
 *   - Static/public data (categories, services): short CDN-friendly cache
 *   - User-specific data (bookings, wallet): no-store (dynamic)
 *   - Immutable assets (uploads): long cache with ETag
 *
 * ETags are generated from response body hash for efficient revalidation.
 */
import crypto from 'crypto';

/**
 * Set cache control headers based on route pattern.
 */
export function cacheHeadersMiddleware(req, res, next) {
  const path = req.path;

  // Public catalog data — cache briefly (2 min browser, 10 min CDN)
  if (path.startsWith('/categories') || path.startsWith('/services')) {
    res.set({
      'Cache-Control': 'public, max-age=120, s-maxage=600, stale-while-revalidate=300',
      'Vary': 'Accept-Language, Accept-Encoding',
    });
  }
  // Static uploads — cache longer (1 hour)
  else if (path.startsWith('/uploads')) {
    res.set({
      'Cache-Control': 'public, max-age=3600, immutable',
    });
  }
  // Admin endpoints — never cache
  else if (path.startsWith('/admin')) {
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, private',
      'Pragma': 'no-cache',
    });
  }
  // Auth endpoints — never cache
  else if (path.startsWith('/auth')) {
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, private',
    });
  }
  // API responses — default: private, short cache
  else {
    res.set({
      'Cache-Control': 'private, max-age=30, must-revalidate',
    });
  }

  next();
}

/**
 * Generate a weak ETag from the response body.
 * Attach to res via monkey-patching res.json / res.send.
 * Used for 304 Not Modified responses.
 */
export function etagMiddleware(req, res, next) {
  // Only apply to GET requests
  if (req.method !== 'GET') return next();

  const originalJson = res.json.bind(res);
  const originalSend = res.send.bind(res);

  res.json = function (body) {
    const bodyStr = JSON.stringify(body);
    const hash = crypto.createHash('md5').update(bodyStr).digest('hex').substring(0, 16);
    res.set('ETag', `W/"${hash}"`);

    // Check If-None-Match for 304
    const ifNoneMatch = req.headers['if-none-match'];
    if (ifNoneMatch && ifNoneMatch.includes(hash)) {
      return res.status(304).end();
    }

    return originalJson(body);
  };

  res.send = function (body) {
    if (typeof body === 'string') {
      const hash = crypto.createHash('md5').update(body).digest('hex').substring(0, 16);
      res.set('ETag', `W/"${hash}"`);

      const ifNoneMatch = req.headers['if-none-match'];
      if (ifNoneMatch && ifNoneMatch.includes(hash)) {
        return res.status(304).end();
      }
    }
    return originalSend(body);
  };

  next();
}

export default { cacheHeadersMiddleware, etagMiddleware };
