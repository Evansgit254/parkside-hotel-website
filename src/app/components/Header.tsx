"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import styles from "../page.module.css";
import { usePathname } from "next/navigation";
import { useCurrency } from "../context/CurrencyContext";
import { User, X, Menu } from "lucide-react";

const navLinks = [
    { href: "/rooms", label: "Accommodation" },
    { href: "/#conference", label: "Conference" },
    { href: "/facilities", label: "Facilities" },
    { href: "/gallery", label: "Gallery" },
    { href: "/blog", label: "Blog" },
    { href: "/dining", label: "Dining" },
    { href: "/#contact", label: "Contact" },
];

export default function Header() {
    const { currency, toggleCurrency } = useCurrency();
    const [isScrolled, setIsScrolled] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();
    const isHomepage = pathname === '/';

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener("scroll", handleScroll);

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

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    // Lock body scroll when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [isMobileMenuOpen]);

    const nonHomeStyle = !isHomepage ? {
        position: 'fixed' as const,
        background: 'rgba(21, 21, 20, 0.98)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    } : {};

    return (
        <>
            <header
                className={`${styles.header} ${isScrolled ? styles.headerScrolled : ''}`}
                style={nonHomeStyle}
            >
                <div className={styles.navContainer}>
                    <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                        <div className={styles.logo}>
                            PARKSIDE VILLA
                        </div>
                    </Link>

                    {/* Desktop nav */}
                    <nav className={styles.nav}>
                        {navLinks.map(link => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={pathname === link.href ? 'gold-text' : ''}
                            >
                                {link.label}
                            </Link>
                        ))}
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

                        {/* Hamburger — mobile only */}
                        <button
                            className={styles.hamburger}
                            onClick={() => setIsMobileMenuOpen(true)}
                            aria-label="Open navigation menu"
                        >
                            <Menu size={24} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className={styles.mobileMenuOverlay} onClick={() => setIsMobileMenuOpen(false)}>
                    <div
                        className={styles.mobileMenuDrawer}
                        onClick={e => e.stopPropagation()}
                    >
                        <div className={styles.mobileMenuHeader}>
                            <span className={styles.logo}>PARKSIDE VILLA</span>
                            <button
                                className={styles.mobileMenuClose}
                                onClick={() => setIsMobileMenuOpen(false)}
                                aria-label="Close menu"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <nav className={styles.mobileNav}>
                            {navLinks.map(link => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`${styles.mobileNavLink} ${pathname === link.href ? styles.mobileNavLinkActive : ''}`}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>

                        <div className={styles.mobileMenuFooter}>
                            <Link
                                href={user ? "/profile" : "/login"}
                                className={styles.mobileNavLink}
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <User size={18} />
                                {user ? 'My Profile' : 'Sign In'}
                            </Link>
                            <button onClick={toggleCurrency} className={styles.currencyToggle}>
                                {currency}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
