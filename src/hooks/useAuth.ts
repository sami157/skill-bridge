'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  getAuthToken,
  getAuthUser,
  clearAuth,
  onAuthChange,
  type AuthUser,
} from '@/lib/auth-storage';
import type { Role } from '@/lib/auth';

export interface UseAuthReturn {
  user: AuthUser | null;
  role: Role | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  logout: () => Promise<void>;
}

/**
 * Auth state from localStorage (token-based). Unified with login API.
 */
export function useAuth(): UseAuthReturn {
  const router = useRouter();
  const [auth, setAuth] = useState<{ user: AuthUser | null; token: string | null } | null>(null);

  const syncAuth = () => {
    setAuth({ user: getAuthUser(), token: getAuthToken() });
  };

  useEffect(() => {
    syncAuth();
    return onAuthChange(syncAuth);
  }, []);

  const loading = auth === null;
  const user = auth?.user ?? null;
  const role: Role | null = user?.role ? (user.role as Role) : null;

  const refetch = async () => {
    syncAuth();
  };

  const logout = async () => {
    clearAuth();
    setAuth({ user: null, token: null });
    router.push('/');
    router.refresh();
  };

  return {
    user,
    role,
    loading,
    error: null,
    refetch,
    logout,
  };
}
