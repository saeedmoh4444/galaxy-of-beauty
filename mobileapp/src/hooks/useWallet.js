import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

export function useWallet() {
  return useQuery({
    queryKey: ['wallet'],
    queryFn: async () => { const { data } = await api.get('/wallet'); return data; },
    staleTime: 30000,
  });
}

export function useWalletTransactions(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });

  return useQuery({
    queryKey: ['wallet-transactions', filters],
    queryFn: async () => { const { data } = await api.get(`/wallet/transactions?${params}`); return data; },
    staleTime: 15000,
  });
}

export function useWithdraw() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (amount) => {
      const { data } = await api.post('/wallet/withdraw', { amount, idempotencyKey: `${Date.now()}` });
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['wallet'] }); qc.invalidateQueries({ queryKey: ['wallet-transactions'] }); },
  });
}

export function useStreak() {
  return useQuery({
    queryKey: ['streaks'],
    queryFn: async () => { const { data } = await api.get('/streaks'); return data; },
    staleTime: 60000,
  });
}

export function useReferralStats() {
  return useQuery({
    queryKey: ['referrals'],
    queryFn: async () => { const { data } = await api.get('/referrals'); return data; },
  });
}
