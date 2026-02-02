'use client';

import { useEffect, useState, useCallback } from 'react';
import { getCurrentUser, type User, type Role } from '@/lib/auth';

const STORAGE_KEY = 'sb_auth_user';

function getStoredUser(): { user: User | null; role: Role | null } {
  if (typeof window === 'undefined') return { user: null, role: null };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { user: null, role: null };
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (parsed && typeof parsed === 'object' && parsed.id && (parsed.name || parsed.email)) {
      const user = parsed as unknown as User;
      const role = (parsed.role as Role) ?? null;
      return { user, role };
    }
  } catch {
    // ignore
  }
  return { user: null, role: null };
}

export interface UseAuthReturn {
  user: User | null;
  role: Role | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to get current authenticated user.
 * Initializes from localStorage so navbar shows user immediately after login redirect.
 * If API returns no session (e.g. cookie not sent cross-origin), keeps localStorage user so navbar stays correct.
 */
export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(() => getStoredUser().user);
  const [role, setRole] = useState<Role | null>(() => getStoredUser().role);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getCurrentUser();
      if (result.user) {
        setUser(result.user);
        setRole(result.role);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(result.user));
        } catch {
          // ignore
        }
      } else {
        const stored = getStoredUser();
        if (stored.user) {
          setUser(stored.user);
          setRole(stored.role);
        } else {
          setUser(null);
          setRole(null);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user');
      const stored = getStoredUser();
      if (stored.user) {
        setUser(stored.user);
        setRole(stored.role);
      } else {
        setUser(null);
        setRole(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, []);

  // React to login/logout in same tab and across tabs
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        const { user: u, role: r } = getStoredUser();
        setUser(u);
        setRole(r);
      }
    };
    const handleCustom = () => fetchUser();
    window.addEventListener('storage', handleStorage);
    window.addEventListener('sb-auth-updated', handleCustom as EventListener);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('sb-auth-updated', handleCustom as EventListener);
    };
  }, [fetchUser]);

  return {
    user,
    role,
    loading,
    error,
    refetch: fetchUser,
  };
}
