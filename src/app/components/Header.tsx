"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import styles from "../page.module.css";
import { usePathname } from "next/navigation";

export default function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const pathname = usePathname();
    const isHomepage = pathname === '/';

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // On the homepage: start transparent, darken on scroll
    // On all other pages: always dark charcoal (nav text is always visible)
    const nonHomeStyle = !isHomepage ? {
        position: 'sticky' as const,
        background: 'rgba(28, 28, 26, 0.98)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    } : {};

    return (
        <header
            className={`${styles.header} ${isScrolled ? styles.headerScrolled : ''}`}
            style={nonHomeStyle}
        >
            <div className={styles.navContainer}>
                <Link href="/">
                    <div className={styles.logo}>
                        PARKSIDE VILLA
                    </div>
                </Link>
                <nav className={styles.nav}>
                    <Link href="/#accommodation">Accommodation</Link>
                    <Link href="/#conference">Conference</Link>
                    <Link href="/facilities" className={pathname === '/facilities' ? 'gold-text' : ''}>Facilities</Link>
                    <Link href="/gallery" className={pathname === '/gallery' ? 'gold-text' : ''}>Gallery</Link>
                    <Link href="/blog" className={pathname === '/blog' ? 'gold-text' : ''}>Blog</Link>
                    <Link href="/dining" className={pathname === '/dining' ? 'gold-text' : ''}>Dining</Link>
                    <Link href="/#contact">Contact</Link>
                </nav>
            </div>
        </header>
    );
}
