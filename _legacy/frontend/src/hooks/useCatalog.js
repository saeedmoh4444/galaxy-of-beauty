import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../lib/api';

// =============================================================================
// Categories
// =============================================================================

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await api.get('/categories');
      return data.categories;
    },
    staleTime: 1000 * 60 * 30, // 30 min
  });
}

// =============================================================================
// Services
// =============================================================================

export function useServices(params = {}) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      searchParams.set(key, val);
    }
  });

  return useQuery({
    queryKey: ['services', params],
    queryFn: async () => {
      const { data } = await api.get(`/services?${searchParams.toString()}`);
      return data;
    },
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 2, // 2 min
  });
}

export function useServiceDetail(id) {
  return useQuery({
    queryKey: ['services', id],
    queryFn: async () => {
      const { data } = await api.get(`/services/${id}`);
      return data.service;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}

// =============================================================================
// Admin Mutations
// =============================================================================

export function useCreateService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const { data: result } = await api.post('/services', data);
      return result.service;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['services'] });
      toast.success('تم إضافة الخدمة بنجاح');
    },
    onError: (err) => toast.error(err.response?.data?.error?.message || 'فشل إضافة الخدمة'),
  });
}

export function useUpdateService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }) => {
      const { data: result } = await api.put(`/services/${id}`, data);
      return result.service;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['services'] });
      toast.success('تم تحديث الخدمة');
    },
    onError: (err) => toast.error(err.response?.data?.error?.message || 'فشل تحديث الخدمة'),
  });
}

export function useDeleteService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      await api.delete(`/services/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['services'] });
      toast.success('تم حذف الخدمة');
    },
    onError: (err) => toast.error(err.response?.data?.error?.message || 'فشل حذف الخدمة'),
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const { data: result } = await api.post('/categories', data);
      return result.category;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
      toast.success('تم إضافة الفئة');
    },
    onError: (err) => toast.error(err.response?.data?.error?.message || 'فشل إضافة الفئة'),
  });
}

// =============================================================================
// Technician Services
// =============================================================================

export function useTechnicianServices(techId) {
  return useQuery({
    queryKey: ['technician-services', techId],
    queryFn: async () => {
      const { data } = await api.get(`/technicians/${techId}/services`);
      return data.services;
    },
    enabled: !!techId,
  });
}

export function useAddTechnicianService(techId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const { data: result } = await api.post(`/technicians/${techId}/services`, data);
      return result.mapping;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['technician-services', techId] });
      toast.success('تم إضافة الخدمة');
    },
    onError: (err) => toast.error(err.response?.data?.error?.message || 'فشل إضافة الخدمة'),
  });
}

export function useRemoveTechnicianService(techId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (mappingId) => {
      await api.delete(`/technicians/${techId}/services/${mappingId}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['technician-services', techId] });
      toast.success('تم إزالة الخدمة');
    },
    onError: (err) => toast.error(err.response?.data?.error?.message || 'فشل إزالة الخدمة'),
  });
}
