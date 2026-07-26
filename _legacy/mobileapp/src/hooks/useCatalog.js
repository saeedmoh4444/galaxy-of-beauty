import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => { const { data } = await api.get('/categories'); return data; },
    staleTime: 300000, // 5 min cache
  });
}

export function useServices(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => { if (v !== undefined && v !== '') params.set(k, v); });

  return useQuery({
    queryKey: ['services', filters],
    queryFn: async () => { const { data } = await api.get(`/services?${params}`); return data; },
  });
}

export function useServiceDetail(id) {
  return useQuery({
    queryKey: ['services', id],
    queryFn: async () => { const { data } = await api.get(`/services/${id}`); return data.service; },
    enabled: !!id,
  });
}

export function useSurpriseMe(maxPrice) {
  return useQuery({
    queryKey: ['surprise-me', maxPrice],
    queryFn: async () => {
      const p = maxPrice ? `?maxPrice=${maxPrice}` : '';
      const { data } = await api.get(`/services/surprise-me${p}`);
      return data;
    },
    enabled: false, // Manual trigger
  });
}

export function useRecommendations(limit = 6) {
  return useQuery({
    queryKey: ['recommendations', limit],
    queryFn: async () => { const { data } = await api.get(`/ai/recommend?limit=${limit}`); return data.recommendations; },
    staleTime: 120000,
  });
}

export function useTechnicianServices(technicianId) {
  return useQuery({
    queryKey: ['technician-services', technicianId],
    queryFn: async () => { const { data } = await api.get(`/technicians/${technicianId}/services`); return data.services; },
    enabled: !!technicianId,
  });
}
