'use client';

import type { ReactNode } from 'react';
import TRPCProvider from '@/components/TRPCProvider';
import SocketProvider from '@/components/SocketProvider';

/**
 * Root client-side providers wrapper.
 * Order: TRPCProvider (React Query) → SocketProvider (needs QueryClient)
 */
export default function Providers({ children }: { children: ReactNode }): ReactNode {
  return (
    <TRPCProvider>
      <SocketProvider>{children}</SocketProvider>
    </TRPCProvider>
  );
}
