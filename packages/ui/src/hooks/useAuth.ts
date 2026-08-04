'use client';

import { useCallback, useEffect, useState } from 'react';

// ---------------------------------------------------------------------------
// Minimal auth types (mirrors JwtPayload without depending on @galaxy/api)
// ---------------------------------------------------------------------------
export interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: 'CUSTOMER' | 'TECHNICIAN' | 'ADMIN';
  phone?: string;
  avatarUrl?: string;
  preferredLanguage: 'ar' | 'en';
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// ---------------------------------------------------------------------------
// Storage adapters — web uses localStorage, mobile can inject SecureStore
// ---------------------------------------------------------------------------
const defaultStorage = {
  getItem: (key: string) => {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(key);
  },
  setItem: (key: string, value: string) => {
    if (typeof window !== 'undefined') window.localStorage.setItem(key, value);
  },
  removeItem: (key: string) => {
    if (typeof window !== 'undefined') window.localStorage.removeItem(key);
  },
};

export interface AuthStorage {
  getItem(key: string): string | null | Promise<string | null>;
  setItem(key: string, value: string): void | Promise<void>;
  removeItem(key: string): void | Promise<void>;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
interface UseAuthOptions {
  storage?: AuthStorage;
}

interface UseAuthReturn {
  user: AuthUser | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (tokens: AuthTokens, user: AuthUser) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: AuthUser) => Promise<void>;
  hasRole: (...roles: string[]) => boolean;
}

const KEYS = { ACCESS: 'gob_access', REFRESH: 'gob_refresh', USER: 'gob_user' };

export function useAuth(options?: UseAuthOptions): UseAuthReturn {
  const storage = options?.storage ?? defaultStorage;
  const [user, setUserState] = useState<AuthUser | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Hydrate from storage on mount
  useEffect(() => {
    (async () => {
      try {
        const [accessToken, refreshToken, userJson] = await Promise.all([
          storage.getItem(KEYS.ACCESS),
          storage.getItem(KEYS.REFRESH),
          storage.getItem(KEYS.USER),
        ]);
        if (accessToken && refreshToken) {
          setTokens({ accessToken, refreshToken });
        }
        if (userJson) {
          try { setUserState(JSON.parse(userJson)); } catch { /* ignore corrupt */ }
        }
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = useCallback(
    async (newTokens: AuthTokens, newUser: AuthUser) => {
      await Promise.all([
        storage.setItem(KEYS.ACCESS, newTokens.accessToken),
        storage.setItem(KEYS.REFRESH, newTokens.refreshToken),
        storage.setItem(KEYS.USER, JSON.stringify(newUser)),
      ]);
      setTokens(newTokens);
      setUserState(newUser);
    },
    [storage],
  );

  const logout = useCallback(async () => {
    await Promise.all([
      storage.removeItem(KEYS.ACCESS),
      storage.removeItem(KEYS.REFRESH),
      storage.removeItem(KEYS.USER),
    ]);
    setTokens(null);
    setUserState(null);
  }, [storage]);

  const setUserFn = useCallback(
    async (updated: AuthUser) => {
      await storage.setItem(KEYS.USER, JSON.stringify(updated));
      setUserState(updated);
    },
    [storage],
  );

  const hasRole = useCallback(
    (...roles: string[]) => (user ? roles.includes(user.role) : false),
    [user],
  );

  return {
    user,
    tokens,
    isAuthenticated: !!tokens && !!user,
    isLoading,
    login,
    logout,
    setUser: setUserFn,
    hasRole,
  };
}
