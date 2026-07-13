'use client';

import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';

// ── Configuration ──────────────────────────────────────────

/**
 * URL of the standalone Socket.IO server.
 * In development, this runs on port 4001.
 * In production, it would be the same host but a different port or path.
 */
const SOCKET_URL =
  typeof window !== 'undefined'
    ? process.env['NEXT_PUBLIC_SOCKET_URL'] || `${window.location.protocol}//${window.location.hostname}:4001`
    : '';

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
 * React hook that manages a Socket.IO connection authenticated with the
 * user's JWT access token. On receiving real‑time events it invalidates
 * the matching React Query cache tags so the UI refreshes automatically.
 */
export function useSocket(): void {
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);

  const getToken = useCallback((): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('gob_access');
  }, []);

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    // ── Create and connect ──────────────────────────────
    const socket: Socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 30000,
    });

    socketRef.current = socket;

    // ── Connection lifecycle ────────────────────────────
    socket.on('connect', () => {
      // eslint-disable-next-line no-console
      console.log('[Socket] Connected:', socket.id);
    });

    socket.on('connect_error', (err: Error) => {
      // eslint-disable-next-line no-console
      console.error('[Socket] Connection error:', err.message);
    });

    socket.on('disconnect', (reason: string) => {
      // eslint-disable-next-line no-console
      console.log('[Socket] Disconnected:', reason);
    });

    // ── Incoming events → invalidate React Query caches ─
    Object.entries(EVENT_CACHE_MAP).forEach(([event, tags]) => {
      socket.on(event, (_data: unknown) => {
        tags.forEach((tag) => {
          queryClient.invalidateQueries({ queryKey: [tag] });
        });
      });
    });

    // ── Cleanup ─────────────────────────────────────────
    return () => {
      Object.keys(EVENT_CACHE_MAP).forEach((event) => {
        socket.off(event);
      });
      socket.disconnect();
      socketRef.current = null;
    };
  }, [queryClient, getToken]);
}
