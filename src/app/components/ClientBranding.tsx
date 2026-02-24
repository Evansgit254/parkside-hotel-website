"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";

export default function ClientBranding({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isHideBranding = pathname?.startsWith('/admin') && pathname !== '/admin/login';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            {!isHideBranding && <Header />}
            <div style={{ flex: 1 }}>
                {children}
            </div>
            {!isHideBranding && <Footer />}
        </div>
    );
}
