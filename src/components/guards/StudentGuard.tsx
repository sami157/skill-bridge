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

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
        return;
      }
      if (role !== 'STUDENT') {
        router.push('/');
        return;
      }
    }
  }, [user, role, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user || role !== 'STUDENT') {
    return null;
  }

  return <>{children}</>;
}
