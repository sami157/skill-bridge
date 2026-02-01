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
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getCurrentUser();
      setUser(result.user);
      setRole(result.role);
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

  return {
    user,
    role,
    loading,
    error,
    refetch: fetchUser,
  };
}
