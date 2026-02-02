'use client';

import { TutorGuard } from '@/components/guards/TutorGuard';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

export default function TutorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, role, loading, logout } = useAuth();

  return (
    <TutorGuard>
      <div className="flex min-h-screen flex-col">
        <Navbar
          user={!loading && user ? { name: user.name, email: user.email, role: role ?? 'TUTOR' } : undefined}
          onLogout={logout}
        />
        <div className="flex flex-1">
          <aside className="w-64 shrink-0 border-r bg-muted/40 p-4">
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
                onClick={() => logout()}
                className="w-full"
              >
                Sign Out
              </Button>
            </div>
          </aside>
          <main className="flex-1">{children}</main>
        </div>
        <Footer />
      </div>
    </TutorGuard>
  );
}
