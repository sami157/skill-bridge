import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Skill-bridge App",
    description: "A platform connecting students with teachers for skill development.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <SessionProvider>
                        {children}
                        <Toaster
                        position="top-right"
                        toastOptions={{
                            duration: 4000,
                            style: {
                                background: 'var(--background)',
                                color: 'var(--foreground)',
                                border: '1px solid var(--border)',
                            },
                            success: {
                                iconTheme: {
                                    primary: 'var(--primary)',
                                    secondary: 'var(--primary-foreground)',
                                },
                            },
                            error: {
                                iconTheme: {
                                    primary: 'var(--destructive)',
                                    secondary: 'white',
                                },
                            },
                        }}
                    />
                    </SessionProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
