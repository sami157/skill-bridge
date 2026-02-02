'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface StudentGuardProps {
  children: React.ReactNode;
}

/**
 * Protects routes that require STUDENT role
 * Redirects to /login if not authenticated
 * Blocks access if user has wrong role
 */
export function StudentGuard({ children }: StudentGuardProps) {
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
      if (normalizedRole !== 'STUDENT' && (!hasToken || user)) {
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

  // If we have a token but user hasn't loaded yet, keep waiting
  if (hasToken && (!user || !normalizedRole)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user || normalizedRole !== 'STUDENT') {
    return null;
  }

  return <>{children}</>;
}
