'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface AdminGuardProps {
  children: React.ReactNode;
}

/**
 * Protects routes that require ADMIN role
 * Redirects to /login if not authenticated
 * Blocks access if user has wrong role
 */
export function AdminGuard({ children }: AdminGuardProps) {
  const { user, role, loading } = useAuth();
  const router = useRouter();
  const normalizedRole = (role ?? user?.role)?.toUpperCase();
  const hasToken = typeof window !== 'undefined' ? !!localStorage.getItem('sb_auth_token') : false;

  useEffect(() => {
    if (!loading) {
      if (!user && !hasToken) {
        router.push('/login');
        return;
      }
      if (normalizedRole !== 'ADMIN' && (!hasToken || user)) {
        router.push('/');
        return;
      }
    }
  }, [user, normalizedRole, loading, hasToken, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (hasToken && (!user || !normalizedRole)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user || normalizedRole !== 'ADMIN') {
    return null;
  }

  return <>{children}</>;
}
