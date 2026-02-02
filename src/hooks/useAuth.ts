'use client';

import { useEffect, useState } from 'react';
import { getCurrentUser, type User, type Role } from '@/lib/auth';

export interface UseAuthReturn {
  user: User | null;
  role: Role | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to get current authenticated user
 * Calls /users/profile endpoint to check auth status
 */
export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const cached = localStorage.getItem('sb_auth_user');
      return cached ? (JSON.parse(cached) as User) : null;
    } catch {
      return null;
    }
  });
  const [role, setRole] = useState<Role | null>(() => user?.role ?? null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getCurrentUser();
      setUser(result.user);
      setRole(result.role);
      if (typeof window !== 'undefined' && result.user) {
        localStorage.setItem('sb_auth_user', JSON.stringify(result.user));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user');
      setUser(null);
      setRole(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  // React to token changes (login/logout) across tabs and same tab
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'sb_auth_token' || e.key === 'sb_auth_user') {
        fetchUser();
      }
    };
    const handleCustom = () => fetchUser();
    window.addEventListener('storage', handleStorage);
    window.addEventListener('sb-auth-updated', handleCustom as EventListener);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('sb-auth-updated', handleCustom as EventListener);
    };
  }, []);

  return {
    user,
    role,
    loading,
    error,
    refetch: fetchUser,
  };
}
