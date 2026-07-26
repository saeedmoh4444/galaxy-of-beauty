import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

export function useUserBookings(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });

  return useQuery({
    queryKey: ['bookings', filters],
    queryFn: async () => { const { data } = await api.get(`/bookings?${params}`); return data; },
    staleTime: 15000,
  });
}

export function useBookingDetail(bookingId) {
  return useQuery({
    queryKey: ['bookings', bookingId],
    queryFn: async () => { const { data } = await api.get(`/bookings/${bookingId}`); return data.booking; },
    enabled: !!bookingId,
  });
}

export function useTransitionBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ bookingId, action, reason }) => {
      const { data } = await api.patch(`/bookings/${bookingId}/status`, { action, reason });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

export function useCreateBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (bookingData) => {
      const { data } = await api.post('/bookings', {
        ...bookingData,
        idempotencyKey: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

export function useSlots(technicianId, date) {
  const params = date ? `?date=${date}` : '';
  return useQuery({
    queryKey: ['slots', technicianId, date],
    queryFn: async () => { const { data } = await api.get(`/technicians/${technicianId}/slots${params}`); return data.slots; },
    enabled: !!technicianId,
  });
}

export function useTechnicianBookings() {
  return useQuery({
    queryKey: ['technician-bookings'],
    queryFn: async () => { const { data } = await api.get('/bookings'); return data; },
    staleTime: 10000,
  });
}
