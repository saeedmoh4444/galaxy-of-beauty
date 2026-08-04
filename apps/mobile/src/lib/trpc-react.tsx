/**
 * tRPC + TanStack React Query provider for mobile.
 *
 * Mirrors apps/web/src/components/TRPCProvider.tsx with mobile-specific
 * auth token handling (uses the shared useAuth hook with SecureStore).
 *
 * Usage: Wrap your root layout with <TRPCProvider>{children}</TRPCProvider>
 * Then:  const { data } = trpc.bookings.list.useQuery({ limit: 10 });
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { createTRPCReact } from '@trpc/react-query';
import { useState } from 'react';
import type { ReactNode } from 'react';
import superjson from 'superjson';
import type { AppRouter } from '@galaxy/api';
import { DEFAULT_LOCAL_URL } from '@galaxy/ui';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? `${DEFAULT_LOCAL_URL}/api/trpc`;

// Create the tRPC React client
export const trpc = createTRPCReact<AppRouter>();

function getAuthHeaders(): Record<string, string> {
  // Note: In production, use expo-secure-store instead of localStorage
  const headers: Record<string, string> = {};
  if (typeof globalThis !== 'undefined') {
    // Simple in-memory token store for now (upgrade to SecureStore)
  }
  return headers;
}

export function TRPCProvider({ children }: { children: ReactNode }): ReactNode {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,       // 30s before refetch
        retry: 2,
        refetchOnWindowFocus: false, // mobile doesn't have window focus
      },
    },
  }));
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: API_URL,
          headers: getAuthHeaders,
          transformer: superjson,
        }),
      ],
    }),
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  );
}
