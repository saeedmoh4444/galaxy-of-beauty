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
// Storage adapters
// Web: tokens are HttpOnly cookies (sent automatically). Only user data is cached.
// Mobile: tokens stored via adapter (e.g., Expo SecureStore).
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
  /** If true, tokens are stored server-side (HttpOnly cookies). Default: true. */
  serverTokens?: boolean;
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
  const serverTokens = options?.serverTokens ?? true;
  const [user, setUserState] = useState<AuthUser | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Hydrate from storage on mount
  useEffect(() => {
    (async () => {
      try {
        if (serverTokens) {
          // Web: tokens are HttpOnly cookies. Only hydrate user data.
          const userJson = await storage.getItem(KEYS.USER);
          if (userJson) {
            try {
              setUserState(JSON.parse(userJson));
              // Mark as having tokens (cookies handle this)
              setTokens({ accessToken: '', refreshToken: '' });
            } catch {
              /* ignore corrupt */
            }
          }
        } else {
          // Mobile: read tokens + user from secure storage
          const [accessToken, refreshToken, userJson] = await Promise.all([
            storage.getItem(KEYS.ACCESS),
            storage.getItem(KEYS.REFRESH),
            storage.getItem(KEYS.USER),
          ]);
          if (accessToken && refreshToken) {
            setTokens({ accessToken, refreshToken });
          }
          if (userJson) {
            try {
              setUserState(JSON.parse(userJson));
            } catch {
              /* ignore corrupt */
            }
          }
        }
      } finally {
        setIsLoading(false);
      }
    })();
  }, [storage, serverTokens]);

  const login = useCallback(
    async (newTokens: AuthTokens, newUser: AuthUser) => {
      // Always cache user data
      await storage.setItem(KEYS.USER, JSON.stringify(newUser));

      if (!serverTokens) {
        // Mobile: store tokens in secure storage
        await Promise.all([
          storage.setItem(KEYS.ACCESS, newTokens.accessToken),
          storage.setItem(KEYS.REFRESH, newTokens.refreshToken),
        ]);
      }

      setTokens(newTokens);
      setUserState(newUser);
    },
    [storage, serverTokens],
  );

  const logout = useCallback(async () => {
    await storage.removeItem(KEYS.USER);

    if (!serverTokens) {
      await Promise.all([
        storage.removeItem(KEYS.ACCESS),
        storage.removeItem(KEYS.REFRESH),
      ]);
    }

    setTokens(null);
    setUserState(null);
  }, [storage, serverTokens]);

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
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    setUser: setUserFn,
    hasRole,
  };
}
