"use client";

import styles from "./admin.module.css";
import {
    Users, Hotel, Utensils, MessageSquare,
    TrendingUp, Clock, ArrowUpRight, Calendar,
    Star, ChefHat, CheckCircle, BarChart3, Globe, RefreshCw, Loader2
} from "lucide-react";
import { useState, useEffect } from "react";
import { getDashboardStats } from "../actions";
import { showToast } from "./components/AdminToast";

export default function AdminDashboard() {
    const [liveStats, setLiveStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getDashboardStats().then(data => {
            setLiveStats(data);
            setLoading(false);
        });
    }, []);

    const stats = [
        { name: "Visitors", value: liveStats?.visitors?.toString() || "—", label: "Monthly Visits", icon: TrendingUp, color: "#3b82f6" },
        { name: "Reservations", value: liveStats?.leads?.toString() || "0", label: "Pending Enquiries", icon: MessageSquare, color: "#C9A84C" },
        { name: "Accommodations", value: liveStats?.rooms?.toString() || "0", label: "Active Suites", icon: Hotel, color: "#10b981" },
        { name: "Menu Items", value: liveStats?.menus?.toString() || "0", label: "Dining Curations", icon: Utensils, color: "#f59e0b" },
    ];

    const recentActivity = liveStats?.recentActivity || [];
    const agenda = liveStats?.agenda || [];

    return (
        <>
            <div className={styles.sectionHeader}>
                <div className={styles.sectionTitleGroup}>
                    <span className={styles.sectionEyebrow}>Estate Overview</span>
                    <h1 className={styles.sectionTitle}>Dashboard</h1>
                    <p className={styles.sectionSubtitle}>Live intelligence from Parkside Villa</p>
                </div>
            </div>

            {/* Stat Cards — Borderless grid */}
            <div className={styles.cardGrid}>
                {stats.map((stat) => (
                    <div key={stat.name} className={styles.card} style={{ borderLeft: `4px solid ${stat.color}` }}>
                        <div className={styles.cardInner}>
                            <div className={styles.cardIconRow}>
                                <div className={styles.cardIcon} style={{ background: `${stat.color}10`, color: stat.color, border: `1px solid ${stat.color}20` }}>
                                    <stat.icon size={18} />
                                </div>
                                <span style={{ fontSize: '0.625rem', fontWeight: 700, color: stat.color, textTransform: 'uppercase', letterSpacing: '0.1em' }}>+12%</span>
                            </div>
                            <div className={styles.cardValue} style={{ fontSize: '2.5rem', marginBottom: '0.25rem' }}>{stat.value}</div>
                            <div className={styles.cardLabel} style={{ fontSize: '0.75rem', color: 'var(--admin-text)', fontWeight: 700 }}>{stat.name}</div>
                            <div className={styles.cardSubLabel} style={{ fontSize: '0.8125rem', color: 'var(--admin-text-soft)' }}>{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Activity + Agenda two-col */}
            <div className={styles.twoCol}>
                {/* Recent Activity */}
                <div className={styles.panelDark}>
                    <div className={styles.panelHeader}>
                        <div>
                            <h2 className={styles.panelTitle} style={{ fontSize: '1.5rem' }}>Recent Activity</h2>
                            <p className={styles.panelSub} style={{ fontSize: '0.875rem' }}>Live feed of guest interactions</p>
                        </div>
                        <span className={styles.liveIndicator}>Live Now</span>
                    </div>

                    <div className={styles.activityFeed}>
                        {recentActivity.length > 0 ? (
                            recentActivity.map((a: any) => (
                                <div key={a.id} className={styles.activityItem} style={{ padding: '1.25rem 0' }}>
                                    <div className={styles.activityIconBox} style={{ color: a.color, width: '40px', height: '40px', borderRadius: '12px' }}>
                                        {a.type === "Lead" ? <Calendar size={16} /> : <Star size={16} />}
                                    </div>
                                    <div className={styles.activityContent}>
                                        <div
                                            className={styles.activityTag}
                                            style={{ color: a.color, borderColor: `${a.color}30`, background: `${a.color}10`, padding: '0.25rem 0.75rem', fontSize: '0.625rem' }}
                                        >
                                            {a.type}
                                        </div>
                                        <div className={styles.activityUser} style={{ fontSize: '1rem', fontWeight: 600 }}>{a.user}</div>
                                        <div className={styles.activityDesc} style={{ fontSize: '0.875rem', color: 'var(--admin-text-soft)' }}>{a.action}</div>
                                    </div>
                                    <div className={styles.activityTime} style={{ fontSize: '0.75rem', fontWeight: 500 }}>{a.time}</div>
                                </div>
                            ))
                        ) : (
                            <div className={styles.emptyFeed} style={{ padding: '3rem 0', textAlign: 'center', color: 'var(--admin-text-muted)' }}>
                                <p>No recent activity detected.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Agenda */}
                <div className={styles.panelDark}>
                    <div className={styles.panelHeader}>
                        <div>
                            <h2 className={styles.panelTitle} style={{ fontSize: '1.5rem' }}>Today&apos;s Agenda</h2>
                            <p className={styles.panelSub} style={{ fontSize: '0.875rem' }}>Priority tasks for estate management</p>
                        </div>
                    </div>

                    <div className={styles.agendaFeed}>
                        {agenda.length > 0 ? (
                            agenda.map((item: any, i: number) => {
                                const isPriority = item.status === "Priority";
                                const dotColor = isPriority ? "#ef4444" : "#C9A84C";
                                const badgeColor = isPriority
                                    ? { color: "#ef4444", borderColor: "rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.06)" }
                                    : item.status === "Pending"
                                        ? { color: "#d97706", borderColor: "rgba(217,119,6,0.2)", background: "rgba(217,119,6,0.06)" }
                                        : { color: "var(--admin-text-soft)", borderColor: "var(--admin-border)", background: "transparent" };

                                return (
                                    <div key={i} className={styles.agendaItem} style={{ padding: '1.25rem 0' }}>
                                        <div className={styles.agendaDot} style={{ background: dotColor, transform: 'scale(1.2)' }} />
                                        <div className={styles.agendaContent}>
                                            <div className={styles.agendaTask} style={{ fontSize: '1rem', fontWeight: 600 }}>{item.task}</div>
                                            <div className={styles.agendaDesc} style={{ fontSize: '0.875rem', color: 'var(--admin-text-soft)' }}>{item.desc}</div>
                                            <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", marginTop: "0.75rem" }}>
                                                <span className={styles.agendaTime} style={{ fontSize: '0.75rem', fontWeight: 500 }}>{item.time}</span>
                                                <span
                                                    className={styles.agendaBadge}
                                                    style={{ ...badgeColor, padding: '0.25rem 0.75rem', fontSize: '0.625rem' }}
                                                >
                                                    {item.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className={styles.emptyFeed} style={{ padding: '3rem 0', textAlign: 'center', color: 'var(--admin-text-muted)' }}>
                                <p>No scheduled check-ins for today.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Simulated Analytics - Revenue & Traffic */}
            <div className={styles.panelDark} style={{ marginTop: '2rem' }}>
                <div className={styles.panelHeader}>
                    <div>
                        <h2 className={styles.panelTitle}>Estate Intelligence</h2>
                        <p className={styles.panelSub}>Monthly revenue and traffic conversion</p>
                    </div>
                    <div className={styles.panelHeaderGroup}>
                        <div className={styles.analyticsStat}>
                            <span className={styles.statLabel}>Est. Revenue</span>
                            <span className={styles.statValue}>{liveStats?.analytics?.revenue || "$0.00"}</span>
                        </div>
                        <div className={styles.analyticsStat}>
                            <span className={styles.statLabel}>Conversion</span>
                            <span className={styles.statValue}>{liveStats?.analytics?.conversion || "0.0%"}</span>
                        </div>
                    </div>
                </div>

                <div className={styles.analyticsChart}>
                    {(liveStats?.analytics?.chartData || [0, 0, 0, 0, 0, 0, 0]).map((val: number, i: number) => (
                        <div key={i} className={styles.barWrapper}>
                            <div className={styles.bar} style={{ height: `${Math.max(val, 2)}%` }}>
                                <div className={styles.barTooltip}>
                                    {liveStats?.analytics?.rawCounts?.[i] || 0} Enquiries
                                </div>
                            </div>
                            <span className={styles.barLabel}>{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* OTA Sync Module (Simulated) */}
            <section className={styles.otaContainer} style={{ marginTop: '2rem' }}>
                <div className={styles.otaHeader}>
                    <div className={styles.otaInfo}>
                        <Globe size={24} className="gold-text" />
                        <div>
                            <h3 className={styles.otaTitle}>Global Inventory Sync</h3>
                            <p className={styles.otaDesc}>Synchronize your availability with Booking.com, Expedia, and Airbnb.</p>
                        </div>
                    </div>
                    <div className={styles.otaActionWrapper}>
                        <OtaSyncButton />
                    </div>
                </div>
            </section>
        </>
    );
}

function OtaSyncButton() {
    const [syncing, setSyncing] = useState(false);
    const [lastSync, setLastSync] = useState("Never");

    const handleSync = () => {
        setSyncing(true);
        setTimeout(() => {
            setSyncing(false);
            setLastSync(new Date().toLocaleTimeString());
            showToast("Inventory synchronized successfully across all connected OTAs.", "success");
        }, 2000);
    };

    return (
        <div style={{ textAlign: 'right' }}>
            <button
                onClick={handleSync}
                disabled={syncing}
                className={styles.otaButton}
            >
                {syncing ? <Loader2 className={styles.spinner} size={18} /> : <RefreshCw size={18} />}
                {syncing ? "Synchronizing..." : "Sync Availability"}
            </button>
            <p style={{ fontSize: '0.65rem', color: '#6B7280', marginTop: '0.5rem' }}>
                Last sync: {lastSync}
            </p>
        </div>
    );
}
