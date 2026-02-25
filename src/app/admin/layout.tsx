"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import styles from "./admin.module.css";
import {
    LayoutDashboard,
    Hotel,
    Utensils,
    MessageSquare,
    LogOut,
    Settings,
    Star,
    Waves,
    ChevronRight,
    Tag,
    Edit3,
    Image as ImageIcon
} from "lucide-react";
import { useEffect, useState } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentTime, setCurrentTime] = useState("");

    useEffect(() => {
        const isAuth = document.cookie.includes("admin_session=true");
        if (!isAuth && pathname !== "/admin/login") {
            router.push("/admin/login");
        } else {
            setIsAuthenticated(true);
        }
    }, [pathname, router]);

    useEffect(() => {
        const update = () => {
            setCurrentTime(new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }));
        };
        update();
        const t = setInterval(update, 60000);
        return () => clearInterval(t);
    }, []);

    const handleLogout = () => {
        document.cookie = "admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        router.push("/admin/login");
    };

    if (!isAuthenticated && pathname !== "/admin/login") return null;
    if (pathname === "/admin/login") return <>{children}</>;

    const navItems = [
        { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
        { name: "Rooms", href: "/admin/rooms", icon: Hotel },
        { name: "Dining", href: "/admin/dining", icon: Utensils },
        { name: "Facilities", href: "/admin/facilities", icon: Waves },
        { name: "Enquiries & Reservations", href: "/admin/leads", icon: MessageSquare },
        { name: "Promotions & Offers", href: "/admin/promotions", icon: Tag },
        { name: "Blog Posts", href: "/admin/blog", icon: Edit3 },
        { name: "Gallery", href: "/admin/gallery", icon: ImageIcon },
        { name: "Testimonials", href: "/admin/testimonials", icon: Star },
        { name: "Settings", href: "/admin/settings", icon: Settings },
    ];

    // Get page title from pathname
    const currentPage = navItems.find(i => i.href === pathname)?.name || "Dashboard";

    return (
        <div className={styles.adminContainer}>
            {/* Sidebar */}
            <aside className={styles.sidebar}>
                <div className={styles.sidebarHeader}>
                    <div className={styles.sidebarBrandGroup}>
                        <span className={styles.sidebarBrand}>Parkside Villa</span>
                        <span className={styles.sidebarSubtitle}>Management Console</span>
                    </div>
                </div>

                <nav className={styles.sidebarNav}>
                    <div className={styles.navGroup}>
                        <span className={styles.navGroupLabel}>Estate Management</span>
                        {navItems.slice(0, 4).map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`${styles.navLink} ${pathname === item.href ? styles.navLinkActive : ""}`}
                            >
                                <item.icon size={18} className={styles.navIcon} />
                                <span>{item.name}</span>
                            </Link>
                        ))}
                    </div>

                    <div className={styles.navGroup}>
                        <span className={styles.navGroupLabel}>Content & Marketing</span>
                        {navItems.slice(4, 9).map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`${styles.navLink} ${pathname === item.href ? styles.navLinkActive : ""}`}
                            >
                                <item.icon size={18} className={styles.navIcon} />
                                <span>{item.name}</span>
                            </Link>
                        ))}
                    </div>

                    <div className={styles.navGroup} style={{ marginTop: 'auto' }}>
                        <span className={styles.navGroupLabel}>System</span>
                        <Link
                            href="/admin/settings"
                            className={`${styles.navLink} ${pathname === "/admin/settings" ? styles.navLinkActive : ""}`}
                        >
                            <Settings size={18} className={styles.navIcon} />
                            <span>Settings</span>
                        </Link>
                    </div>
                </nav>

                <div className={styles.sidebarFooter}>
                    <div className={styles.sidebarUserInfo}>
                        <div className={styles.userAvatar}>PV</div>
                        <div className={styles.userDetails}>
                            <div className={styles.userName}>Estate Manager</div>
                            <div className={styles.userRole}>Administrator</div>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className={styles.logoutBtn}
                    >
                        <LogOut size={16} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main */}
            <main className={styles.mainContent}>
                {/* Top Bar */}
                <div className={styles.topBar}>
                    <div className={styles.topBarLeft}>
                        <div className={styles.breadcrumb}>
                            <span className={styles.breadcrumbTitle}>Admin</span>
                            <ChevronRight size={14} className={styles.breadcrumbSep} />
                            <span className={styles.breadcrumbActive}>{currentPage}</span>
                        </div>
                    </div>
                    <div className={styles.topBarRight}>
                        <div id="google_translate_admin" className={styles.adminTranslate}></div>
                        <div className={styles.statusGroup}>
                            <div className={styles.liveIndicator}>System Live</div>
                            <span className={styles.topBarTime}>{currentTime}</span>
                        </div>
                    </div>
                </div>

                <div className={styles.pageContent}>
                    {children}
                </div>
            </main>
        </div>
    );
}
