"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";

export default function ClientBranding({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isHideBranding = pathname?.startsWith('/admin') && pathname !== '/admin/login';
    const isHomepage = pathname === '/';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            {!isHideBranding && <Header />}
            <div style={{ flex: 1, marginTop: !isHomepage && !isHideBranding ? '80px' : '0' }}>
                {children}
            </div>
            {!isHideBranding && <Footer />}
        </div>
    );
}
