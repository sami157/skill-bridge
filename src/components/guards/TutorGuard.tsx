'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface TutorGuardProps {
  children: React.ReactNode;
}

/**
 * Protects routes that require TUTOR role
 * Redirects to /login if not authenticated
 * Blocks access if user has wrong role
 */
export function TutorGuard({ children }: TutorGuardProps) {
  const { user, role, loading } = useAuth();
  const router = useRouter();
  const normalizedRole = (role ?? user?.role)?.toUpperCase();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
        return;
      }
      if (normalizedRole !== 'TUTOR') {
        router.push('/');
        return;
      }
    }
  }, [user, normalizedRole, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user || normalizedRole !== 'TUTOR') {
    return null;
  }

  return <>{children}</>;
}
