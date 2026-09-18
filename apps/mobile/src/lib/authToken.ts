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
  return token ? { Authorization: `Bearer ${token}` } : {};
}
