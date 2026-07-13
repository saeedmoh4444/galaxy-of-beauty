import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';

// ── Configuration ──────────────────────────────────────────

const SOCKET_URL =
  (typeof process !== 'undefined' && (process.env as Record<string, string>)['EXPO_PUBLIC_SOCKET_URL']) ||
  'http://localhost:4001';

// ── In-memory token store (set by login flow) ──────────────

let storedToken: string | null = null;

export function setSocketToken(token: string | null): void {
  storedToken = token;
}

export function getSocketToken(): string | null {
  return storedToken;
}

// ── Cache tags invalidated on real-time events ─────────────

const EVENT_CACHE_MAP: Record<string, string[]> = {
  new_booking_request: ['bookings'],
  booking_accepted: ['bookings'],
  booking_rejected: ['bookings'],
  booking_cancelled: ['bookings'],
  booking_started: ['bookings'],
  booking_completed: ['bookings'],
  booking_no_show: ['bookings'],
  payment_success: ['wallet', 'wallet-transactions', 'bookings'],
  wallet_updated: ['wallet', 'wallet-transactions'],
  waitlist_update: ['waitlist'],
  new_notification: ['notifications'],
  admin_update: ['admin-stats', 'admin-dashboard'],
};

// ── Hook ───────────────────────────────────────────────────

/**
 * React Native / Expo hook for real-time Socket.IO connectivity.
 *
 * Call `setSocketToken(token)` after login to enable the socket connection.
 * The hook auto-connects when a token is available and disconnects on cleanup.
 */
export function useSocket(): void {
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    let socket: Socket | null = null;
    let mounted = true;

    const connect = () => {
      const token = storedToken;
      if (!token || !mounted) return;

      // Don't reconnect if already connected
      if (socketRef.current?.connected) return;

      socket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 30000,
      });

      socketRef.current = socket;

      socket.on('connect', () => {
        // eslint-disable-next-line no-console
        console.log('[Socket] Connected:', socket?.id);
      });

      socket.on('connect_error', (err: Error) => {
        // eslint-disable-next-line no-console
        console.error('[Socket] Connection error:', err.message);
      });

      socket.on('disconnect', (reason: string) => {
        // eslint-disable-next-line no-console
        console.log('[Socket] Disconnected:', reason);
      });

      // Incoming events → invalidate React Query caches
      Object.entries(EVENT_CACHE_MAP).forEach(([event, tags]) => {
        socket?.on(event, (_data: unknown) => {
          tags.forEach((tag) => {
            queryClient.invalidateQueries({ queryKey: [tag] });
          });
        });
      });
    };

    // Attempt connection immediately
    connect();

    // Poll for token availability (every 2s for the first 30s)
    const interval = setInterval(() => {
      if (!socketRef.current?.connected && storedToken) {
        connect();
      }
    }, 2000);

    // Stop polling after 30 seconds
    const timeout = setTimeout(() => {
      clearInterval(interval);
    }, 30000);

    return () => {
      mounted = false;
      clearInterval(interval);
      clearTimeout(timeout);
      if (socket) {
        Object.keys(EVENT_CACHE_MAP).forEach((event) => {
          socket?.off(event);
        });
        socket.disconnect();
        socketRef.current = null;
      }
    };
  }, [queryClient]);
}
