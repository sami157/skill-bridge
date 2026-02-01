'use client';

import { Navbar } from "@/components/navbar1";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PublicLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const { user, role, loading } = useAuth();

    return (
        <div>
            <Navbar
                logo={{
                    url: "/",
                    src: "/next.svg",
                    alt: "Skill Bridge",
                    title: "Skill Bridge",
                }}
                menu={[
                    { title: "Home", url: "/" },
                    { title: "Tutors", url: "/tutors" },
                ]}
                auth={
                    !loading && user
                        ? {
                              login: {
                                  title: role === "STUDENT" ? "Dashboard" : role === "TUTOR" ? "Tutor Dashboard" : "Admin",
                                  url: role === "STUDENT" ? "/dashboard" : role === "TUTOR" ? "/tutor/dashboard" : "/admin",
                              },
                              signup: {
                                  title: user.name || "Profile",
                                  url: role === "STUDENT" ? "/dashboard/profile" : role === "TUTOR" ? "/tutor/profile" : "/admin",
                              },
                          }
                        : {
                              login: {
                                  title: "Login",
                                  url: "/login",
                              },
                              signup: {
                                  title: "Register",
                                  url: "/register",
                              },
                          }
                }
            />
            {children}
        </div>
    );
}
