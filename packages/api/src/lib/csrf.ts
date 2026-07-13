import crypto from 'crypto';

// ── Configuration ──────────────────────────────────────────

const CSRF_COOKIE_NAME = 'csrf-token';
const CSRF_HEADER_NAME = 'x-csrf-token';
const CSRF_SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

// ── Token Generation ───────────────────────────────────────

/**
 * Generate a cryptographically random CSRF token.
 */
export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Name of the CSRF cookie set in the browser.
 */
export function getCsrfCookieName(): string {
  return CSRF_COOKIE_NAME;
}

/**
 * Name of the CSRF header sent by the client.
 */
export function getCsrfHeaderName(): string {
  return CSRF_HEADER_NAME;
}

// ── Verification ───────────────────────────────────────────

/**
 * Verify that the CSRF token in the header matches the one in the cookie.
 * Uses constant-time comparison to prevent timing attacks.
 *
 * @param cookieValue - The CSRF token from the client's cookie
 * @param headerValue - The CSRF token from the `X-CSRF-Token` request header
 * @returns true if the tokens match and are valid
 */
export function verifyCsrfToken(
  cookieValue: string | null | undefined,
  headerValue: string | null | undefined,
): boolean {
  if (!cookieValue || !headerValue) return false;

  // Validate both values are hex strings (prevent injection)
  if (!/^[a-f0-9]{64}$/.test(cookieValue)) return false;
  if (!/^[a-f0-9]{64}$/.test(headerValue)) return false;

  try {
    return crypto.timingSafeEqual(
      Buffer.from(cookieValue, 'utf8'),
      Buffer.from(headerValue, 'utf8'),
    );
  } catch {
    return false;
  }
}

/**
 * Check whether a request method requires CSRF protection.
 * Safe methods (GET, HEAD, OPTIONS) are exempt.
 */
export function isCsrfRequired(method: string): boolean {
  return !CSRF_SAFE_METHODS.has(method.toUpperCase());
}

// ── Cookie Setter ──────────────────────────────────────────

/**
 * Build a Set-Cookie header value for the CSRF cookie.
 * The cookie is NOT httpOnly so the SPA can read it and send it back as a header.
 */
export function buildCsrfCookie(token: string): string {
  // 24-hour expiry, not httpOnly (JS must read it), SameSite=Strict
  return `${CSRF_COOKIE_NAME}=${token}; Path=/; Max-Age=86400; SameSite=Strict`;
}
