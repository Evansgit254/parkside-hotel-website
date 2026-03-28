"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import styles from "../page.module.css";
import { usePathname } from "next/navigation";
import { useCurrency } from "../context/CurrencyContext";
import { User, X, Menu, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { getPublicSiteData } from "../actions";

export default function Header() {
    const { currency, toggleCurrency } = useCurrency();
    const [isScrolled, setIsScrolled] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [content, setContent] = useState<any>({});
    const [rooms, setRooms] = useState<any[]>([]);
    const [conferenceHalls, setConferenceHalls] = useState<any[]>([]);
    const [facilities, setFacilities] = useState<any[]>([]);
    const [diningVenues, setDiningVenues] = useState<any[]>([]);
    const pathname = usePathname();
    const isHomepage = pathname === '/';

    useEffect(() => {
        getPublicSiteData().then(data => {
            if (data?.content) setContent(data.content);
            if (data?.rooms) setRooms(data.rooms);
            if (data?.conferenceHalls) setConferenceHalls(data.conferenceHalls);
            if (data?.facilities) setFacilities(data.facilities);
            if (data?.diningVenues) setDiningVenues(data.diningVenues);
        });

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

    // Build dynamic nav links based on CMS content
    const navMain = content.nav_main || {};
    const navAcc = content.nav_accommodation || {};

    const navLinks = [
        { href: "/", label: navMain.home || "Home" },
        {
            href: "/rooms",
            label: navMain.rooms || "Accommodation",
            subLinks: [
                ...rooms.map(r => ({ href: `/rooms/${r.id}`, label: r.name })),
                { href: "/rooms", label: "All Accommodations" },
            ]
        },
        {
            href: "/conference",
            label: navMain.conference || "Conference",
            subLinks: [
                ...conferenceHalls.map(h => ({ href: `/conference/${h.slug}`, label: h.name })),
                { href: "/conference", label: "All Hall Selections" },
            ]
        },
        {
            href: "/facilities",
            label: navMain.facilities || "Facilities",
            subLinks: [
                ...facilities.map(f => ({ href: `/facilities/${f.id}`, label: f.title })),
                { href: "/facilities", label: "All Hotel Facilities" },
            ]
        },
        {
            href: "/dining",
            label: navMain.dining || "Dining",
            subLinks: [
                ...diningVenues.map(v => ({ href: `/dining/${v.slug}`, label: v.name })),
                { href: "/dining#menu", label: "Our Menu" },
                { href: "/dining", label: "All Dining Venues" },
            ]
        },
        { href: "/gallery", label: navMain.gallery || "Gallery" },
        { href: "/blog", label: navMain.blog || "Blog" },
        { href: "/#contact", label: navMain.contact || "Contact" },
    ];

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

    return (
        <>
            <header
                className={`${styles.header} ${isScrolled ? styles.headerScrolled : ''} ${!isHomepage ? `${styles.navDarkText} ${styles.headerNonHome}` : ''}`}
            >
                <div className={styles.navContainer}>
                    <motion.div
                        className={styles.logoContainer}
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                    >
                        <Link href="/">
                            <Image
                                src="/logo_kitui_white.png"
                                alt="Parkside Villa Kitui"
                                width={320}
                                height={100}
                                className={styles.logoImageFinal}
                                priority
                            />
                        </Link>
                    </motion.div>

                    {/* Desktop nav */}
                    <nav className={styles.nav}>
                        {navLinks.map(link => {
                            const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
                            return (
                                <div
                                    key={link.label + link.href}
                                    className={styles.navItemContainer}
                                    onMouseEnter={() => link.subLinks && setActiveDropdown(link.label)}
                                    onMouseLeave={() => setActiveDropdown(null)}
                                >
                                    <Link
                                        href={link.href}
                                        className={`${isActive ? styles.navActive : ''} ${link.subLinks ? styles.hasSublinks : ''}`}
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
                                                {link.subLinks.map(subLink => {
                                                    const isSubActive = pathname === subLink.href;
                                                    return (
                                                        <Link
                                                            key={subLink.href + subLink.label}
                                                            href={subLink.href}
                                                            className={`${styles.dropdownItem} ${isSubActive ? styles.navActive : ''}`}
                                                            onClick={() => setActiveDropdown(null)}
                                                        >
                                                            {subLink.label}
                                                        </Link>
                                                    );
                                                })}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })}
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
                            <Image 
                                src="/logo_kitui_white.png" 
                                alt="Parkside Villa Kitui" 
                                width={220} 
                                height={70} 
                                className={styles.logoImageFinal}
                                style={{ filter: 'brightness(0) invert(0.2) sepia(1) hue-rotate(100deg) saturate(3) contrast(1.2)' }}
                            />
                            <button
                                className={styles.mobileMenuClose}
                                onClick={() => setIsMobileMenuOpen(false)}
                                aria-label="Close menu"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <nav className={styles.mobileNav}>
                            {navLinks.map(link => {
                                const isOpen = activeDropdown === link.label;
                                return (
                                    <div key={link.label + link.href}>
                                        {link.subLinks ? (
                                            <button
                                                className={`${styles.mobileNavLink} ${styles.mobileNavAccordion} ${pathname.startsWith(link.href) ? styles.navActive : ''}`}
                                                onClick={() => setActiveDropdown(isOpen ? null : link.label)}
                                                aria-expanded={isOpen}
                                            >
                                                {link.label}
                                                <ChevronDown
                                                    size={16}
                                                    className={styles.accordionChevron}
                                                    style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                                                />
                                            </button>
                                        ) : (
                                            <Link
                                                href={link.href}
                                                className={`${styles.mobileNavLink} ${pathname === link.href ? styles.mobileNavLinkActive : ''}`}
                                                onClick={() => setIsMobileMenuOpen(false)}
                                            >
                                                {link.label}
                                            </Link>
                                        )}
                                        <AnimatePresence>
                                            {link.subLinks && isOpen && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                                                    style={{ overflow: 'hidden' }}
                                                >
                                                    <div className={styles.mobileSubNav}>
                                                        {link.subLinks.map(subLink => {
                                                            const isSubActive = pathname === subLink.href;
                                                            return (
                                                                <Link
                                                                    key={subLink.href + subLink.label}
                                                                    href={subLink.href}
                                                                    className={`${styles.mobileSubNavLink} ${isSubActive ? styles.navActive : ''}`}
                                                                    onClick={() => setIsMobileMenuOpen(false)}
                                                                >
                                                                    {subLink.label}
                                                                </Link>
                                                            );
                                                        })}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            })}
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
                            <div id="google_translate_admin" className={styles.translateWrapperMobile}></div>
                        </div>

                    </div >
                </div >
            )
            }
        </>
    );
}
