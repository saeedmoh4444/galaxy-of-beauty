/**
 * tRPC + TanStack React Query provider for mobile.
 *
 * Mirrors apps/web/src/components/TRPCProvider.tsx with mobile-specific
 * auth token handling (uses the shared useAuth hook with SecureStore).
 *
 * Usage: Wrap your root layout with <TRPCProvider>{children}</TRPCProvider>
 * Then:  const { data } = trpc.bookings.list.useQuery({ limit: 10 });
 *
 * The hooks client is fully typed — any phantom router or procedure name
 * (e.g. `loyalty.getAccount` when the router only has `myAccount`) is a
 * compile-time error, not a silent runtime 404.
 */

import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { httpBatchLink, createTRPCClient } from '@trpc/client';
import type { TRPCLink } from '@trpc/client';
import { createTRPCReact } from '@trpc/react-query';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import superjson from 'superjson';
import type { AppRouter } from '@galaxy/api';
import { DEFAULT_LOCAL_URL } from '@galaxy/ui';
import { router } from 'expo-router';
import {
  getAuthHeaders,
  getAuthToken,
  getAuthRefreshToken,
  setAuthToken,
  setAuthRefreshToken,
} from './authToken';
import { setSocketToken } from '@/hooks/useSocket';
import { AsyncStorage } from '@/utils/storage';
import { isPersistedQueryKey, PERSIST_BUSTER } from '@/utils/persistConfig';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? `${DEFAULT_LOCAL_URL}/api/trpc`;

// Create the tRPC React client
export const trpc = createTRPCReact<AppRouter>();

// ── Session refresh (audit D1) ──────────────────────────────────
// The access token expires after 15 minutes; browsers silently refresh
// via the HttpOnly cookie, mobile must do it explicitly. This link
// retries an UNAUTHORIZED operation ONCE after a successful
// auth.refresh — the QueryCache never sees the intermediate error, so
// the global logout handler below only fires when refresh truly fails.

/** Refresh-only client: no refresh link of its own (no recursion). */
const refreshOnlyClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: API_URL,
      headers: getAuthHeaders,
      transformer: superjson,
    }),
  ],
});

let refreshPromise: Promise<boolean> | null = null;

/** One in-flight refresh shared by concurrent UNAUTHORIZED ops. */
function refreshTokensOnce(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const rt = getAuthRefreshToken();
      if (!rt) return false;
      try {
        const res = await refreshOnlyClient.auth.refresh.mutate({ refreshToken: rt });
        await setAuthToken(res.accessToken);
        await setAuthRefreshToken(res.refreshToken);
        return true;
      } catch {
        return false;
      }
    })();
    void refreshPromise.finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

const authRefreshLink: TRPCLink<AppRouter> =
  () =>
  ({ op, next }) => {
    let retried = false;
    let innerUnsub: { unsubscribe: () => void } | null = null;
    const run = (observer: {
      next: (v: unknown) => void;
      error: (e: unknown) => void;
      complete: () => void;
    }) => {
      innerUnsub = next(op).subscribe({
        next: (result) => {
          const envelope = result.result as
            { type: string; error?: { data?: { code?: string } } } | undefined;
          const isUnauthorized =
            envelope?.type === 'error' && envelope.error?.data?.code === 'UNAUTHORIZED';
          if (isUnauthorized && !retried && getAuthToken()) {
            retried = true;
            void refreshTokensOnce().then((ok) => {
              if (ok) run(observer);
              else observer.next(result);
            });
            return;
          }
          observer.next(result);
        },
        error: (err) => observer.error(err),
        complete: () => observer.complete(),
      });
    };
    return {
      subscribe(observer: {
        next: (v: unknown) => void;
        error: (e: unknown) => void;
        complete: () => void;
      }) {
        run(observer);
        return {
          unsubscribe: () => innerUnsub?.unsubscribe(),
        };
      },
      pipe() {
        // Only tRPC's internal link composition uses pipe; this terminal
        // link is never piped further.
        throw new Error('pipe is not supported on the auth-refresh link');
      },
    };
  };

// Vanilla client — works outside React (offlineQueue replay, scripts).
export const trpcClient = trpc.createClient({
  links: [
    authRefreshLink,
    httpBatchLink({
      url: API_URL,
      headers: getAuthHeaders,
      transformer: superjson,
    }),
  ],
});

// Global UNAUTHORIZED handler: a stale token (or a guest opening an
// authenticated screen) must not leave the app stuck on error states —
// clear the session once and go to login.
let redirecting = false;

function handleUnauthorized(error: unknown): void {
  if (redirecting) return;
  const code = (error as { data?: { code?: string } } | null)?.data?.code;
  if (code !== 'UNAUTHORIZED') return;
  // Only redirect sessions that EXISTED — guests with no token (e.g. a
  // failed login attempt) must not bounce around; their screens render
  // their own guest states.
  if (!getAuthToken()) return;
  redirecting = true;
  void setAuthToken(null);
  setSocketToken(null);
  router.replace('/(auth)/login');
  // Allow a future expired session to redirect again.
  setTimeout(() => {
    redirecting = false;
  }, 3000);
}

export function TRPCProvider({ children }: { children: ReactNode }): ReactNode {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000, // 30s before refetch
            retry: 2,
            refetchOnWindowFocus: false, // mobile doesn't have window focus
          },
        },
        queryCache: new QueryCache({ onError: handleUnauthorized }),
        mutationCache: new MutationCache({ onError: handleUnauthorized }),
      }),
  );

  // Offline-first (5.5): persist the public catalog cache so discovery
  // screens render instantly offline/on cold start. User-scoped queries
  // never touch storage (persistConfig whitelist). maxAge bounds how long
  // stale catalog data may survive without a network refresh.
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    try {
      // persistQueryClient returns [unsubscribe, hydratedPromise]
      [unsubscribe] = persistQueryClient({
        queryClient,
        persister: createAsyncStoragePersister({ storage: AsyncStorage }),
        buster: PERSIST_BUSTER,
        maxAge: 24 * 60 * 60 * 1000, // 24h
        dehydrateOptions: {
          shouldDehydrateQuery: (query) =>
            query.state.status === 'success' && isPersistedQueryKey(query.queryKey),
        },
      });
    } catch {
      // Storage unavailable (pre-module binary) — run without persistence.
    }
    return () => unsubscribe?.();
  }, [queryClient]);

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
