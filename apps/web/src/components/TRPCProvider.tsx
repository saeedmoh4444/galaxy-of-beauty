'use client';

import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { useState } from 'react';
import type { ReactNode } from 'react';
import superjson from 'superjson';
import { api } from '@/lib/trpc';

function getCsrfToken(): string | null {
  if (typeof window === 'undefined') return null;
  // Read the CSRF cookie value
  const match = document.cookie.match(/(?:^|;\s*)csrf-token=([^;]*)/);
  return match?.[1] ?? null;
}

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};

  if (typeof window !== 'undefined') {
    // Auth token is now an HttpOnly cookie — sent automatically by the browser.
    // No need to read from localStorage.

    // Include CSRF token header
    const csrfToken = getCsrfToken();
    if (csrfToken) {
      headers['x-csrf-token'] = csrfToken;
    }
  }

  return headers;
}

type TrpcClient = ReturnType<typeof api.createClient>;

// Global UNAUTHORIZED handler: a stale/expired cookie passes the
// middleware but the API rejects every protected query — instead of
// error banners everywhere, clear the cookies and go to /login once.
let redirecting = false;

async function handleUnauthorized(error: unknown, client: TrpcClient): Promise<void> {
  if (typeof window === 'undefined' || redirecting) return;
  const code = (error as { data?: { code?: string } } | null)?.data?.code;
  if (code !== 'UNAUTHORIZED') return;
  redirecting = true;
  try {
    await client.auth.clearSession.mutate();
  } catch {
    // Cookie may already be gone — proceed regardless.
  }
  // Clear the localStorage session marker too: useAuth() hydrates from
  // gob_user, and without this the notification badge / cart widget
  // still report authenticated and keep firing protected queries on the
  // login page (the UNAUTHORIZED loop the monitor caught).
  try {
    window.localStorage.removeItem('gob_user');
  } catch {
    // Storage may be unavailable — the redirect still proceeds.
  }
  window.location.replace('/login');
  // Allow a future expired session to trigger the flow again.
  setTimeout(() => {
    redirecting = false;
  }, 3000);
}

export default function TRPCProvider({ children }: { children: ReactNode }): ReactNode {
  const [trpcClient] = useState<TrpcClient>(() =>
    api.createClient({
      links: [
        httpBatchLink({
          url: '/api/trpc',
          headers: getAuthHeaders,
          transformer: superjson,
        }),
      ],
    }),
  );

  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error) => void handleUnauthorized(error, trpcClient),
        }),
        mutationCache: new MutationCache({
          onError: (error) => void handleUnauthorized(error, trpcClient),
        }),
      }),
  );

  return (
    <api.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </api.Provider>
  );
}
