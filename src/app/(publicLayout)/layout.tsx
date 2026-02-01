'use client';

import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function PublicLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const { user, role, loading, refetch } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        await signOut();
        router.push('/');
        router.refresh();
        // Refetch to update auth state
        setTimeout(() => {
            refetch();
        }, 100);
    };

    return (
        <div>
            <Navbar
                user={!loading && user ? {
                    name: user.name,
                    email: user.email,
                    role: role || 'USER',
                } : undefined}
                onLogout={handleLogout}
            />
            {children}
        </div>
    );
}
