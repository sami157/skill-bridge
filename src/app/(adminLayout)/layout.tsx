'use client';

import { AdminGuard } from '@/components/guards/AdminGuard';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();

  const handleSignOut = async () => {
    await logout();
  };

  return (
    <AdminGuard>
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="w-64 border-r bg-muted/40 p-4">
          <div className="mb-6">
            <h2 className="text-xl font-bold">Admin Dashboard</h2>
            {user && (
              <p className="text-sm text-muted-foreground mt-1">{user.name}</p>
            )}
          </div>
          <nav className="space-y-2">
            <Link
              href="/admin"
              className="block px-3 py-2 rounded-md hover:bg-muted transition-colors"
            >
              Overview
            </Link>
            <Link
              href="/admin/users"
              className="block px-3 py-2 rounded-md hover:bg-muted transition-colors"
            >
              Users
            </Link>
            <Link
              href="/admin/bookings"
              className="block px-3 py-2 rounded-md hover:bg-muted transition-colors"
            >
              Bookings
            </Link>
            <Link
              href="/admin/categories"
              className="block px-3 py-2 rounded-md hover:bg-muted transition-colors"
            >
              Categories
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
    </AdminGuard>
  );
}
