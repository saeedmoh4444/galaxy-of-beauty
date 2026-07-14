import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../lib/api';

// =============================================================================
// Availability Slots
// =============================================================================

export function useSlots(techId, date) {
  const params = date ? { date } : {};
  return useQuery({
    queryKey: ['slots', techId, date],
    queryFn: async () => {
      const searchParams = new URLSearchParams(params);
      const { data } = await api.get(`/technicians/${techId}/slots?${searchParams}`);
      return data.slots;
    },
    enabled: !!techId,
    staleTime: 1000 * 30, // 30 seconds - slots change frequently
  });
}

// =============================================================================
// Bookings
// =============================================================================

export function useUserBookings(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });

  return useQuery({
    queryKey: ['bookings', filters],
    queryFn: async () => {
      const { data } = await api.get(`/bookings?${params}`);
      return data;
    },
    staleTime: 1000 * 15,
  });
}

export function useBookingDetail(id) {
  return useQuery({
    queryKey: ['bookings', id],
    queryFn: async () => {
      const { data } = await api.get(`/bookings/${id}`);
      return data.booking;
    },
    enabled: !!id,
  });
}

export function useCreateBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post('/bookings', {
        ...payload,
        idempotencyKey: crypto.randomUUID(),
      });
      return data.booking;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookings'] });
      qc.invalidateQueries({ queryKey: ['slots'] });
      toast.success('تم إرسال طلب الحجز بنجاح! ✨');
    },
    onError: (err) => {
      toast.error(err.response?.data?.error?.message || 'فشل إنشاء الحجز');
    },
  });
}

export function useTransitionBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ bookingId, action, reason }) => {
      const { data } = await api.patch(`/bookings/${bookingId}/status`, { action, reason });
      return data.booking;
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['bookings'] });
      qc.invalidateQueries({ queryKey: ['slots'] });
      const msgs = {
        accept: 'تم قبول الحجز ✅',
        reject: 'تم رفض الحجز',
        cancel: 'تم إلغاء الحجز',
        complete: 'تم إكمال الحجز بنجاح ✨',
        no_show: 'تم تسجيل عدم الحضور',
      };
      toast.success(msgs[variables.action] || 'تم تحديث الحجز');
    },
    onError: (err) => {
      toast.error(err.response?.data?.error?.message || 'فشل تحديث الحجز');
    },
  });
}

export function useRescheduleBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ bookingId, newSlotId, reason }) => {
      const { data } = await api.post(`/bookings/${bookingId}/reschedule`, {
        newSlotId,
        reason,
        idempotencyKey: crypto.randomUUID(),
      });
      return data.booking;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookings'] });
      qc.invalidateQueries({ queryKey: ['slots'] });
      toast.success('تم تغيير الموعد بنجاح');
    },
    onError: (err) => {
      toast.error(err.response?.data?.error?.message || 'فشل تغيير الموعد');
    },
  });
}
