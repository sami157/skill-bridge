'use client';

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";

export default function PublicLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const { user, role, loading, logout } = useAuth();

    return (
        <div className="flex min-h-screen flex-col">
            <Navbar
                user={!loading && user ? {
                    name: user.name,
                    email: user.email,
                    role: role || 'STUDENT',
                } : undefined}
                onLogout={logout}
            />
            <main className="flex-1">
                {children}
            </main>
            <Footer />
        </div>
    );
}
