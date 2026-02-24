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
    ChevronRight
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
                    <span className={styles.sidebarBrand}>Parkside Villa</span>
                    <span className={styles.sidebarSubtitle}>Estate Management Console</span>
                </div>

                <nav className={styles.sidebarNav}>
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`${styles.navLink} ${pathname === item.href ? styles.navLinkActive : ""}`}
                        >
                            <item.icon size={16} className={styles.navIcon} />
                            {item.name}
                        </Link>
                    ))}
                </nav>

                <div className={styles.sidebarFooter}>
                    <div className={styles.sidebarUserInfo}>
                        <div className={styles.userAvatar}>PV</div>
                        <div>
                            <div className={styles.userName}>Administrator</div>
                            <div className={styles.userRole}>Estate Manager</div>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className={styles.navLink}
                        style={{ color: "rgba(239, 68, 68, 0.5)" }}
                    >
                        <LogOut size={16} className={styles.navIcon} />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main */}
            <main className={styles.mainContent}>
                {/* Top Bar */}
                <div className={styles.topBar}>
                    <div className={styles.topBarLeft}>
                        <span>Admin</span>
                        <ChevronRight size={12} />
                        <span className={styles.topBarBreadcrumb}>{currentPage}</span>
                    </div>
                    <div className={styles.topBarRight}>
                        <span className={styles.topBarTime}>{currentTime}</span>
                    </div>
                </div>

                <div className={styles.pageContent}>
                    {children}
                </div>
            </main>
        </div>
    );
}
