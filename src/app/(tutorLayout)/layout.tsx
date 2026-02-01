'use client';

import { TutorGuard } from '@/components/guards/TutorGuard';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { signOut } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function TutorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <TutorGuard>
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="w-64 border-r bg-muted/40 p-4">
          <div className="mb-6">
            <h2 className="text-xl font-bold">Tutor Dashboard</h2>
            {user && (
              <p className="text-sm text-muted-foreground mt-1">{user.name}</p>
            )}
          </div>
          <nav className="space-y-2">
            <Link
              href="/tutor/dashboard"
              className="block px-3 py-2 rounded-md hover:bg-muted transition-colors"
            >
              Overview
            </Link>
            <Link
              href="/tutor/availability"
              className="block px-3 py-2 rounded-md hover:bg-muted transition-colors"
            >
              Availability
            </Link>
            <Link
              href="/tutor/profile"
              className="block px-3 py-2 rounded-md hover:bg-muted transition-colors"
            >
              Profile
            </Link>
          </nav>
          <div className="mt-8">
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="w-full"
            >
              Sign Out
            </Button>
          </div>
        </aside>
        {/* Main content */}
        <main className="flex-1">{children}</main>
      </div>
    </TutorGuard>
  );
}
