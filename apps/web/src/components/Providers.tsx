'use client';

import type { ReactNode } from 'react';
import TRPCProvider from '@/components/TRPCProvider';
import SocketProvider from '@/components/SocketProvider';
import { CookieConsent } from '@galaxy/ui';

/**
 * Root client-side providers wrapper.
 * Order: TRPCProvider (React Query) → SocketProvider (needs QueryClient)
 * → CookieConsent (C2 — the PDPL banner was built but never mounted).
 */
export default function Providers({ children }: { children: ReactNode }): ReactNode {
  return (
    <TRPCProvider>
      <SocketProvider>
        {children}
        <CookieConsent />
      </SocketProvider>
    </TRPCProvider>
  );
}
