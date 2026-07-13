'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { useState } from 'react';
import type { ReactNode } from 'react';
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
    const token = localStorage.getItem('gob_access');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Include CSRF token header
    const csrfToken = getCsrfToken();
    if (csrfToken) {
      headers['x-csrf-token'] = csrfToken;
    }
  }

  return headers;
}

export default function TRPCProvider({ children }: { children: ReactNode }): ReactNode {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    api.createClient({
      links: [
        httpBatchLink({
          url: '/api/trpc',
          headers: getAuthHeaders,
        }),
      ],
    }),
  );

  return (
    <api.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </api.Provider>
  );
}
