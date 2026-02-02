'use client';

import { useSession, signOut } from 'next-auth/react';
import type { User, Role } from '@/lib/auth';

export interface UseAuthReturn {
  user: User | null;
  role: Role | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  logout: () => Promise<void>;
}

/**
 * Auth state from NextAuth session.
 */
export function useAuth(): UseAuthReturn {
  const { data: session, status, update } = useSession();
  const loading = status === 'loading';
  const error = status === 'unauthenticated' ? null : null;

  const user: User | null = session?.user
    ? {
        id: (session.user as { id?: string }).id ?? '',
        name: session.user.name ?? '',
        email: session.user.email ?? '',
        image: session.user.image ?? undefined,
        role: ((session.user as { role?: string }).role ?? 'STUDENT') as Role,
        active: true,
        createdAt: '',
        updatedAt: '',
      }
    : null;

  const role: Role | null = user ? (user.role as Role) : null;

  const refetch = async () => {
    await update();
  };

  const logout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return {
    user,
    role,
    loading,
    error,
    refetch,
    logout,
  };
}
