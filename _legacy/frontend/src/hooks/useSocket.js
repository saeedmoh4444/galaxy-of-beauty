import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

/**
 * Socket.IO hook — manages real-time connection and event handling.
 *
 * Handles:
 *   - Booking lifecycle events (new request, accepted, rejected, cancelled)
 *   - Payment events (payment success)
 *   - Wallet updates
 *   - Waitlist notifications
 *   - General in-app notifications
 *   - Admin dashboard updates
 *
 * Auto-reconnects with exponential backoff.
 */
export function useSocket() {
  const socketRef = useRef(null);
  const reconnectAttempt = useRef(0);
  const { accessToken, isAuthenticated, user } = useAuthStore();
  const queryClient = useQueryClient();

  const invalidateBookings = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['bookings'] });
  }, [queryClient]);

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    const wsUrl = import.meta.env.VITE_WS_URL || (import.meta.env.DEV ? 'http://localhost:4000' : '');
    const socket = io(wsUrl, {
      auth: { token: accessToken },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 30000,
    });
    socketRef.current = socket;

    // ── Connection Events ──────────────────────────────
    socket.on('connect', () => {
      reconnectAttempt.current = 0;
      if (import.meta.env.DEV) {
        console.log('[Socket] Connected', socket.id);
      }

      // Join waitlist rooms for any waitlisted technicians
      if (user?.role === 'CUSTOMER') {
        socket.emit('join:waitlist');
      }
    });

    socket.on('disconnect', (reason) => {
      if (import.meta.env.DEV) {
        console.log('[Socket] Disconnected:', reason);
      }
    });

    socket.on('connect_error', (error) => {
      reconnectAttempt.current++;
      if (import.meta.env.DEV) {
        console.warn('[Socket] Connection error (attempt ' + reconnectAttempt.current + '):', error.message);
      }
      // After 5 failed attempts, stop trying (prevents infinite reconnect loops)
      if (reconnectAttempt.current >= 10) {
        socket.disconnect();
      }
    });

    // ── Booking Events ─────────────────────────────────
    socket.on('new_booking_request', (data) => {
      invalidateBookings();
      queryClient.invalidateQueries({ queryKey: ['technician-bookings'] });
      toast(
        `طلب حجز جديد! ${data.booking?.bookingCode || ''}`,
        { icon: '📨', duration: 8000 },
      );
    });

    socket.on('booking_accepted', (data) => {
      invalidateBookings();
      toast.success(data.message || '✨ تم قبول حجزك! يمكنك الآن إتمام الدفع.');
    });

    socket.on('booking_rejected', (data) => {
      invalidateBookings();
      toast.error(data.reason || 'تم رفض طلب الحجز');
    });

    socket.on('booking_cancelled', (data) => {
      invalidateBookings();
      toast(data.reason || 'تم إلغاء الحجز', { icon: '🚫' });
    });

    // ── Payment Events ─────────────────────────────────
    socket.on('payment_success', () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      invalidateBookings();
      toast.success('💳 تم تأكيد الدفع بنجاح');
    });

    // ── Wallet Events ──────────────────────────────────
    socket.on('wallet_updated', () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['wallet-transactions'] });
    });

    // ── Waitlist Events ────────────────────────────────
    socket.on('waitlist_update', (data) => {
      queryClient.invalidateQueries({ queryKey: ['waitlist'] });
      if (data.message) {
        toast(data.message, { icon: '🔔', duration: 6000 });
      }
    });

    // ── Notification Events ────────────────────────────
    socket.on('new_notification', (notification) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });

      // Show a toast for high-priority notifications
      const priorityTypes = ['booking_request', 'booking_accepted', 'booking_rejected', 'payment_success'];
      if (priorityTypes.includes(notification.type)) {
        const title = notification.title?.ar || notification.title?.en || '';
        toast(title, { icon: '🔔', duration: 5000 });
      }
    });

    // ── Admin Events ───────────────────────────────────
    socket.on('admin_update', () => {
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
    });

    // ── Cleanup ────────────────────────────────────────
    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off('new_booking_request');
      socket.off('booking_accepted');
      socket.off('booking_rejected');
      socket.off('booking_cancelled');
      socket.off('payment_success');
      socket.off('wallet_updated');
      socket.off('waitlist_update');
      socket.off('new_notification');
      socket.off('admin_update');
      socket.disconnect();
    };
  }, [isAuthenticated, accessToken, user?.role, invalidateBookings, queryClient]);

  return socketRef;
}

export default useSocket;
