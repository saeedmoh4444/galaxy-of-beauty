import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Authentication store - manages JWT tokens and user state.
 * Persisted to localStorage for session survival.
 */
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      /** Set user and tokens (e.g., after login) */
      login: (user, accessToken, refreshToken) =>
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
        }),

      /** Update tokens only (e.g., after refresh) */
      setTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken }),

      /** Update user profile */
      setUser: (user) => set({ user }),

      /** Clear auth state */
      logout: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        }),

      /** Check if user has a specific role */
      hasRole: (role) => get().user?.role === role,
    }),
    {
      name: 'gob-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
