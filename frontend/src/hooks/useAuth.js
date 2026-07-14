import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import api from '../lib/api';

/**
 * Hook: Register a new user.
 */
export function useRegister() {
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (data) => {
      const { confirmPassword, ...payload } = data;
      const response = await api.post('/auth/register', {
        ...payload,
        idempotencyKey: crypto.randomUUID(),
      });
      return response.data;
    },
    onSuccess: (data) => {
      login(data.user, data.accessToken, data.refreshToken);
      toast.success('تم إنشاء الحساب بنجاح! ✨');
      const role = data.user.role;
      if (role === 'TECHNICIAN') {
        navigate('/tech/dashboard');
      } else {
        navigate('/dashboard');
      }
    },
    onError: (error) => {
      const message = error.response?.data?.error?.message || 'حدث خطأ أثناء التسجيل';
      toast.error(message);
    },
  });
}

/**
 * Hook: Login.
 */
export function useLogin() {
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/auth/login', data);
      return response.data;
    },
    onSuccess: (data) => {
      login(data.user, data.accessToken, data.refreshToken);
      toast.success('مرحباً بعودتك! ✨');
      const role = data.user.role;
      if (role === 'TECHNICIAN') {
        navigate('/tech/dashboard');
      } else if (role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    },
    onError: (error) => {
      const message = error.response?.data?.error?.message || 'بيانات الدخول غير صحيحة';
      toast.error(message);
    },
  });
}

/**
 * Hook: Logout.
 */
export function useLogout() {
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const refreshToken = useAuthStore.getState().refreshToken;
      return api.post('/auth/logout', { refreshToken });
    },
    onSuccess: () => {
      queryClient.clear();
      logout();
      navigate('/');
      toast.success('تم تسجيل الخروج');
    },
    onError: () => {
      // Force logout even if API call fails
      queryClient.clear();
      logout();
      navigate('/');
    },
  });
}

/**
 * Hook: Update current user profile.
 */
export function useUpdateProfile() {
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: async (data) => {
      const response = await api.put('/me', data);
      return response.data;
    },
    onSuccess: (data) => {
      setUser(data.user);
      toast.success('تم تحديث الملف الشخصي');
    },
    onError: (error) => {
      const message = error.response?.data?.error?.message || 'فشل تحديث الملف الشخصي';
      toast.error(message);
    },
  });
}
