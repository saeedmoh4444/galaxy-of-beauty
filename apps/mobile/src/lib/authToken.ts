/**
 * Auth token store — feeds the Authorization header on tRPC HTTP requests.
 *
 * The API accepts the access token either as the `gob_access` cookie
 * (browser) or the `Authorization: Bearer <token>` header (mobile clients).
 * Login stores the token here; both tRPC clients read it per request.
 *
 * Persisted via AsyncStorage when available (offlineQueue.ts pattern),
 * with an in-memory fallback.
 */

// AsyncStorage is an optional dependency — require dynamically with in-memory fallback
const AsyncStorage = (() => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('@react-native-async-storage/async-storage').default;
  } catch {
    const store = new Map<string, string>();
    return {
      getItem: async (k: string) => store.get(k) ?? null,
      setItem: async (k: string, v: string) => {
        store.set(k, v);
      },
      removeItem: async (k: string) => {
        store.delete(k);
      },
    };
  }
})() as {
  getItem(k: string): Promise<string | null>;
  setItem(k: string, v: string): Promise<void>;
  removeItem(k: string): Promise<void>;
};

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
