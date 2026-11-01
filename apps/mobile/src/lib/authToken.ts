/**
 * Auth token store — feeds the Authorization header on tRPC HTTP requests.
 *
 * The API accepts the access token either as the `gob_access` cookie
 * (browser) or the `Authorization: Bearer <token>` header (mobile clients).
 * Login stores the token here; both tRPC clients read it per request.
 *
 * Persisted via AsyncStorage when available (utils/storage — real module
 * on binaries that include it, in-memory fallback otherwise).
 */

import { AsyncStorage } from '@/utils/storage';

const TOKEN_KEY = 'gob_access_token';

// ── In-memory cache (sync reads for request headers) ─────────────

let token: string | null = null;

// ── Reactive subscribers (useAuthState hook) ─────────────────────

type Listener = () => void;
const listeners = new Set<Listener>();

/** Subscribe to token changes. Returns an unsubscribe function. */
export function subscribeAuthToken(fn: Listener): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

function notifyTokenChange(): void {
  listeners.forEach((fn) => fn());
}

/**
 * Restore a persisted token (call once at app start, before first request).
 */
export async function loadAuthToken(): Promise<void> {
  token = await AsyncStorage.getItem(TOKEN_KEY);
  notifyTokenChange();
}

/**
 * Store (or clear) the access token.
 */
export async function setAuthToken(t: string | null): Promise<void> {
  token = t;
  if (t) await AsyncStorage.setItem(TOKEN_KEY, t);
  else await AsyncStorage.removeItem(TOKEN_KEY);
  notifyTokenChange();
}

/** Sync accessor for per-request headers. */
export function getAuthToken(): string | null {
  return token;
}

/** Headers to attach to every tRPC HTTP request. */
export function getAuthHeaders(): Record<string, string> {
  // x-client-platform marks first-party native requests: the API exempts
  // them from the browser CSRF pair check (see shouldSkipCsrf). Browsers
  // cannot forge this cross-site (CORS preflight + strict allowlist).
  return token
    ? { Authorization: `Bearer ${token}`, 'x-client-platform': 'expo' }
    : { 'x-client-platform': 'expo' };
}

// ── Refresh token (mobile session longevity — audit D1) ─────────
// The access token expires after 15 minutes; without the refresh token
// the app logs every user out mid-task. Browsers carry the refresh token
// in an HttpOnly cookie; mobile stores it beside the access token.

const REFRESH_KEY = 'gob_refresh_token';

let refreshToken: string | null = null;

/** Restore both tokens (called once at app start). */
export async function loadAuthRefreshToken(): Promise<void> {
  refreshToken = await AsyncStorage.getItem(REFRESH_KEY);
}

/** Store (or clear) the refresh token. */
export async function setAuthRefreshToken(t: string | null): Promise<void> {
  refreshToken = t;
  if (t) await AsyncStorage.setItem(REFRESH_KEY, t);
  else await AsyncStorage.removeItem(REFRESH_KEY);
}

/** Sync accessor for the refresh flow. */
export function getAuthRefreshToken(): string | null {
  return refreshToken;
}
