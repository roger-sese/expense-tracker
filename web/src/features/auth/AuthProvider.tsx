'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { setUnauthorizedHandler } from '@/lib/api-client';
import { clearToken, getToken, setToken } from '@/lib/token-storage';
import type { User } from '@/lib/types';

type Status = 'loading' | 'authenticated' | 'unauthenticated';

export interface AuthContextValue {
  user: User | null;
  status: Status;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<Status>('loading');

  const resetSession = useCallback(() => {
    clearToken();
    setUser(null);
    setStatus('unauthenticated');
    queryClient.clear();
  }, [queryClient]);

  // Restore the session from the cookie on first load.
  useEffect(() => {
    if (!getToken()) {
      setStatus('unauthenticated');
      return;
    }
    api.auth
      .me()
      .then((me) => {
        setUser(me);
        setStatus('authenticated');
      })
      .catch(resetSession);
  }, [resetSession]);

  // An expired token anywhere in the app sends the user back to login.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      resetSession();
      router.replace('/login?expired=1');
    });
    return () => setUnauthorizedHandler(null);
  }, [resetSession, router]);

  const startSession = useCallback((token: string, me: User) => {
    setToken(token);
    setUser(me);
    setStatus('authenticated');
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await api.auth.login(email, password);
      startSession(res.accessToken, res.user);
    },
    [startSession],
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const res = await api.auth.register(name, email, password);
      startSession(res.accessToken, res.user);
    },
    [startSession],
  );

  const logout = useCallback(() => {
    resetSession();
    router.replace('/login');
  }, [resetSession, router]);

  const value = useMemo(
    () => ({ user, status, login, register, logout }),
    [user, status, login, register, logout],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
