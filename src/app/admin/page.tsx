"use client";

import styles from "./admin.module.css";
import {
    Users, Hotel, Utensils, MessageSquare,
    TrendingUp, Clock, ArrowUpRight, Calendar,
    Star, ChefHat, CheckCircle
} from "lucide-react";

export default function AdminDashboard() {
    const stats = [
        { name: "Global Reach", value: "1,280", label: "Monthly Visits", icon: TrendingUp, color: "#3b82f6" },
        { name: "Reservations", value: "12", label: "Pending Enquiries", icon: MessageSquare, color: "#C9A84C" },
        { name: "Accommodations", value: "8", label: "Active Suites", icon: Hotel, color: "#10b981" },
        { name: "Menu Items", value: "24", label: "Dining Curations", icon: Utensils, color: "#f59e0b" },
    ];

    const recentActivity = [
        { id: 1, type: "Lead", user: "John Doe", action: "Requested Executive Suite booking", time: "2h ago", icon: Calendar, color: "#f59e0b" },
        { id: 2, type: "Review", user: "Alice Smith", action: "Left a 5-star endorsement", time: "5h ago", icon: Star, color: "#C9A84C" },
        { id: 3, type: "Dining", user: "Chef de Cuisine", action: "Updated Saturday specials menu", time: "Yesterday", icon: ChefHat, color: "#10b981" },
    ];

    const agenda = [
        { task: "VIP Arrival Check-in", desc: "Executive Suite prep for Mr. Karanja", time: "11:30 AM", status: "Priority" },
        { task: "Menu Sign-off", desc: "Approve Saturday evening curations", time: "02:00 PM", status: "Pending" },
        { task: "Facility Audit", desc: "Weekly review of Wellness Center", time: "04:30 PM", status: "Routine" },
    ];

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
                    <div key={stat.name} className={styles.card}>
                        <div className={styles.cardAccent} style={{ color: stat.color }} />
                        <div className={styles.cardInner}>
                            <div className={styles.cardIconRow}>
                                <div className={styles.cardIcon} style={{ color: stat.color }}>
                                    <stat.icon size={16} />
                                </div>
                                <div className={styles.cardTrend}>
                                    <ArrowUpRight size={11} /> +12%
                                </div>
                            </div>
                            <div className={styles.cardValue}>{stat.value}</div>
                            <div className={styles.cardLabel}>{stat.name}</div>
                            <div className={styles.cardSubLabel}>{stat.label}</div>
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
                            <h2 className={styles.panelTitle}>Recent Activity</h2>
                            <p className={styles.panelSub}>Live feed of guest interactions</p>
                        </div>
                        <span className={styles.liveIndicator}>Live</span>
                    </div>

                    <div>
                        {recentActivity.map((a) => (
                            <div key={a.id} className={styles.activityItem}>
                                <div className={styles.activityIconBox} style={{ color: a.color }}>
                                    <a.icon size={14} />
                                </div>
                                <div>
                                    <div
                                        className={styles.activityTag}
                                        style={{ color: a.color, borderColor: a.color }}
                                    >
                                        {a.type}
                                    </div>
                                    <div className={styles.activityUser}>{a.user}</div>
                                    <div className={styles.activityDesc}>{a.action}</div>
                                </div>
                                <div className={styles.activityTime}>{a.time}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Agenda */}
                <div className={styles.panelDark} style={{ borderLeft: "1px solid rgba(255,255,255,0.04)" }}>
                    <div className={styles.panelHeader}>
                        <div>
                            <h2 className={styles.panelTitle}>Today&apos;s Agenda</h2>
                            <p className={styles.panelSub}>Priority tasks for estate management</p>
                        </div>
                    </div>

                    <div>
                        {agenda.map((item, i) => {
                            const isPriority = item.status === "Priority";
                            const dotColor = isPriority ? "#ef4444" : "#C9A84C";
                            const badgeColor = isPriority
                                ? { color: "#ef4444", borderColor: "rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.06)" }
                                : item.status === "Pending"
                                    ? { color: "#f59e0b", borderColor: "rgba(245,158,11,0.2)", background: "rgba(245,158,11,0.06)" }
                                    : { color: "rgba(255,255,255,0.3)", borderColor: "rgba(255,255,255,0.08)", background: "transparent" };

                            return (
                                <div key={i} className={styles.agendaItem}>
                                    <div className={styles.agendaDot} style={{ background: dotColor }} />
                                    <div className={styles.agendaContent}>
                                        <div className={styles.agendaTask}>{item.task}</div>
                                        <div className={styles.agendaDesc}>{item.desc}</div>
                                        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginTop: "0.5rem" }}>
                                            <span className={styles.agendaTime}>{item.time}</span>
                                            <span
                                                className={styles.agendaBadge}
                                                style={badgeColor}
                                            >
                                                {item.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </>
    );
}
