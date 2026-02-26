"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import styles from "../page.module.css";
import { usePathname } from "next/navigation";
import { useCurrency } from "../context/CurrencyContext";
import { User, X, Menu, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
    {
        href: "/rooms",
        label: "Accommodation",
        subLinks: [
            { href: "/rooms/executive-suite", label: "Executive suites" },
            { href: "/rooms/deluxe-garden-room", label: "Deluxe suites" },
            { href: "/rooms/superior-twin-room", label: "Superior Twin Room" },
            { href: "/rooms", label: "All Accommodations" },
        ]
    },
    {
        href: "/facilities/conference",
        label: "Conference",
        subLinks: [
            { href: "/facilities/conference#amboseli", label: "Amboseli Hall" },
            { href: "/facilities/conference#nzambani", label: "Nzambani Hall" },
            { href: "/facilities/conference#syokimau", label: "Syokimau Hall" },
            { href: "/facilities/conference#highrise", label: "Highrise hall" },
            { href: "/facilities/conference#masaimara", label: "Masai Mara hall" },
        ]
    },
    {
        href: "/facilities",
        label: "Facilities",
        subLinks: [
            { href: "/facilities/pool", label: "Swimming pool" },
            { href: "/facilities/kids", label: "Kids Zone" },
            { href: "/facilities/pool-table", label: "Pool Table" },
            { href: "/facilities/business", label: "Business centre & gift shop" },
        ]
    },
    { href: "/gallery", label: "Gallery" },
    { href: "/blog", label: "Blog" },
    {
        href: "/dining",
        label: "Dining",
        subLinks: [
            { href: "/dining#menu", label: "Our Menu" },
            { href: "/facilities/lounge", label: "VIP Lounge" },
            { href: "/dining#bar", label: "Open Bar & restaurant" },
            { href: "/dining#pool-view", label: "Pool View Restaurant" },
        ]
    },
    { href: "/#contact", label: "Contact" },
];

export default function Header() {
    const { currency, toggleCurrency } = useCurrency();
    const [isScrolled, setIsScrolled] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
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
        background: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
    } : {};

    return (
        <>
            <header
                className={`${styles.header} ${isScrolled ? styles.headerScrolled : ''} ${!isHomepage ? styles.navDarkText : ''}`}
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
                            <div
                                key={link.href}
                                className={styles.navItemContainer}
                                onMouseEnter={() => link.subLinks && setActiveDropdown(link.label)}
                                onMouseLeave={() => setActiveDropdown(null)}
                            >
                                <Link
                                    href={link.href}
                                    className={`${pathname === link.href ? 'maroon-text' : ''} ${link.subLinks ? styles.hasSublinks : ''}`}
                                    onClick={() => setActiveDropdown(null)}
                                >
                                    {link.label}
                                    {link.subLinks && <ChevronDown size={10} style={{ marginLeft: '4px', opacity: 0.5 }} />}
                                </Link>

                                <AnimatePresence>
                                    {link.subLinks && activeDropdown === link.label && (
                                        <motion.div
                                            className={styles.dropdownMenu}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            transition={{ duration: 0.2, ease: "easeOut" }}
                                        >
                                            {link.subLinks.map(subLink => (
                                                <Link
                                                    key={subLink.href}
                                                    href={subLink.href}
                                                    className={styles.dropdownItem}
                                                    onClick={() => setActiveDropdown(null)}
                                                >
                                                    {subLink.label}
                                                </Link>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </nav>

                    <div className={styles.headerActions}>
                        <Link href={user ? "/profile" : "/login"} className={styles.profileLink}>
                            <User size={20} className={user ? 'maroon-text' : ''} />
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
                                <div key={link.href}>
                                    <Link
                                        href={link.href}
                                        className={`${styles.mobileNavLink} ${pathname === link.href ? styles.mobileNavLinkActive : ''}`}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        {link.label}
                                    </Link>
                                    {link.subLinks && (
                                        <div className={styles.mobileSubNav}>
                                            {link.subLinks.map(subLink => (
                                                <Link
                                                    key={subLink.href}
                                                    href={subLink.href}
                                                    className={styles.mobileSubNavLink}
                                                    onClick={() => setIsMobileMenuOpen(false)}
                                                >
                                                    {subLink.label}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
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
