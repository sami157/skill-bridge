'use client';

import { StudentGuard } from '@/components/guards/StudentGuard';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();

  const handleSignOut = async () => {
    await logout();
  };

  return (
    <StudentGuard>
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="w-64 border-r bg-muted/40 p-4">
          <div className="mb-6">
            <h2 className="text-xl font-bold">Student Dashboard</h2>
            {user && (
              <p className="text-sm text-muted-foreground mt-1">{user.name}</p>
            )}
          </div>
          <nav className="space-y-2">
            <Link
              href="/dashboard"
              className="block px-3 py-2 rounded-md hover:bg-muted transition-colors"
            >
              Overview
            </Link>
            <Link
              href="/dashboard/bookings"
              className="block px-3 py-2 rounded-md hover:bg-muted transition-colors"
            >
              My Bookings
            </Link>
            <Link
              href="/dashboard/profile"
              className="block px-3 py-2 rounded-md hover:bg-muted transition-colors"
            >
              Profile
            </Link>
            <Link
              href="/tutors"
              className="block px-3 py-2 rounded-md hover:bg-muted transition-colors"
            >
              Browse Tutors
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
    </StudentGuard>
  );
}
