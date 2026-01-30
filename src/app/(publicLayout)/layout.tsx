import { Navbar } from "@/components/navbar1";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
            <div>
                <Navbar />
                {children}
            </div>
    );
}
