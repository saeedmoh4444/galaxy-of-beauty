'use client';

import type { ReactNode } from 'react';
import { useSocket } from '@/hooks/useSocket';

/**
 * Client component that initializes the Socket.IO connection.
 * Must be rendered inside TRPCProvider (needs React Query context).
 */
export default function SocketProvider({ children }: { children: ReactNode }): ReactNode {
  useSocket();
  return <>{children}</>;
}
