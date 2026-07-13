import type { ReactNode } from 'react';
import { useSocket } from '@/hooks/useSocket';

/**
 * Client component that initializes the Socket.IO connection for mobile.
 * Must be inside QueryClientProvider.
 */
export default function SocketProvider({ children }: { children: ReactNode }): ReactNode {
  useSocket();
  return <>{children}</>;
}
