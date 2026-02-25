"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import styles from "../page.module.css";
import { usePathname } from "next/navigation";
import { useCurrency } from "../context/CurrencyContext";
import { User } from "lucide-react";

export default function Header() {
    const { currency, toggleCurrency } = useCurrency();
    const [isScrolled, setIsScrolled] = useState(false);
    const [user, setUser] = useState<any>(null);
    const pathname = usePathname();
    const isHomepage = pathname === '/';

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener("scroll", handleScroll);

        // Listen for auth changes
        const checkUser = () => {
            const stored = localStorage.getItem("user");
            setUser(stored ? JSON.parse(stored) : null);
        };
        checkUser();
        window.addEventListener("storage", checkUser);

        return () => {
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("storage", checkUser);
        };
    }, []);

    // On the homepage: start transparent, darken on scroll
    // On all other pages: always dark charcoal (nav text is always visible)
    const nonHomeStyle = !isHomepage ? {
        position: 'fixed' as const,
        background: 'rgba(21, 21, 20, 0.98)',
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
                    <Link href="/rooms" className={pathname === '/rooms' ? 'gold-text' : ''}>Accommodation</Link>
                    <Link href="/#conference">Conference</Link>
                    <Link href="/facilities" className={pathname === '/facilities' ? 'gold-text' : ''}>Facilities</Link>
                    <Link href="/gallery" className={pathname === '/gallery' ? 'gold-text' : ''}>Gallery</Link>
                    <Link href="/blog" className={pathname === '/blog' ? 'gold-text' : ''}>Blog</Link>
                    <Link href="/dining" className={pathname === '/dining' ? 'gold-text' : ''}>Dining</Link>
                    <Link href="/#contact">Contact</Link>
                </nav>
                <div className={styles.headerActions}>
                    <Link href={user ? "/profile" : "/login"} className={styles.profileLink}>
                        <User size={20} className={user ? 'gold-text' : ''} />
                        <span className={styles.profileText}>{user ? 'Profile' : 'Sign In'}</span>
                    </Link>
                    <button onClick={toggleCurrency} className={styles.currencyToggle}>
                        {currency}
                    </button>
                    <div id="google_translate_element" className={styles.translateWrapper}></div>
                </div>
            </div>
        </header>
    );
}
