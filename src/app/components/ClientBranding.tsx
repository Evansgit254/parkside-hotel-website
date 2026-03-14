"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";
import styles from "../page.module.css";

export default function ClientBranding({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isHideBranding = pathname?.startsWith('/admin');
    const isHomepage = pathname === '/';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            {!isHideBranding && <Header />}
            <div className={!isHideBranding ? styles.contentWrapper : ''} style={{ flex: 1 }}>
                {children}
            </div>
            {!isHideBranding && <Footer />}
        </div>
    );
}
