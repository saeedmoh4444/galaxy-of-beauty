import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';

export function useWallet() {
  const { user } = useAuthStore();
  return useQuery({
    queryKey: ['wallet'],
    queryFn: async () => {
      const { data } = await api.get('/wallet');
      return data;
    },
    enabled: !!user,
    staleTime: 1000 * 30,
  });
}

export function useWalletTransactions(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });

  return useQuery({
    queryKey: ['wallet-transactions', filters],
    queryFn: async () => {
      const { data } = await api.get(`/wallet/transactions?${params}`);
      return data;
    },
    staleTime: 1000 * 15,
  });
}

export function useWithdraw() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (amount) => {
      const { data } = await api.post('/wallet/withdraw', {
        amount,
        idempotencyKey: crypto.randomUUID(),
      });
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['wallet'] });
      toast.success(`تم طلب سحب ${data.withdrawal?.net} ر.س بنجاح`);
    },
    onError: (err) => toast.error(err.response?.data?.error?.message || 'فشل السحب'),
  });
}

export function useTechnicianPayouts() {
  return useQuery({
    queryKey: ['payouts'],
    queryFn: async () => {
      const { data } = await api.get('/payouts');
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });
}
