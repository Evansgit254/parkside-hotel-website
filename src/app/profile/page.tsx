"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUserBookings, updateProfile, requestBookingAction } from "../actions";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./profile.module.css";
import {
    User, Calendar, Settings, LogOut,
    ChevronRight, MapPin, Clock, CheckCircle2,
    AlertCircle, Camera, Edit2
} from "lucide-react";

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("bookings");

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
            router.push("/login");
            return;
        }
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);

        getUserBookings(parsedUser.id).then(data => {
            setBookings(data);
            setLoading(false);
        });
    }, [router]);

    function handleLogout() {
        localStorage.removeItem("user");
        router.push("/");
    }

    if (loading) return <div className={styles.loading}>Curating Dashboard...</div>;

    return (
        <div className={styles.profilePage}>
            <div className={styles.container}>
                {/* --- Sidebar --- */}
                <aside className={styles.sidebar}>
                    <div className={styles.userBrief}>
                        <div className={styles.avatarWrapper}>
                            <div className={styles.avatar}>
                                <User size={40} />
                            </div>
                            <button className={styles.avatarEdit}><Camera size={14} /></button>
                        </div>
                        <h2 className={styles.userName}>{user.name}</h2>
                        <p className={styles.userEmail}>{user.email}</p>
                    </div>

                    <nav className={styles.sideNav}>
                        <button
                            className={`${styles.navBtn} ${activeTab === 'bookings' ? styles.active : ''}`}
                            onClick={() => setActiveTab('bookings')}
                        >
                            <Calendar size={18} /> My Reservations
                        </button>
                        <button
                            className={`${styles.navBtn} ${activeTab === 'settings' ? styles.active : ''}`}
                            onClick={() => setActiveTab('settings')}
                        >
                            <Settings size={18} /> Account Settings
                        </button>
                        <hr className={styles.divider} />
                        <button className={styles.logoutBtn} onClick={handleLogout}>
                            <LogOut size={18} /> Sign Out
                        </button>
                    </nav>
                </aside>

                {/* --- Content Area --- */}
                <main className={styles.mainContent}>
                    <AnimatePresence mode="wait">
                        {activeTab === 'bookings' ? (
                            <motion.div
                                key="bookings"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className={styles.tabPanel}
                            >
                                <div className={styles.panelHeader}>
                                    <h1 className={styles.panelTitle}>Reservation History</h1>
                                    <button className={styles.buttonGold} onClick={() => router.push('/rooms')}>Book New Stay</button>
                                </div>

                                {bookings.length > 0 ? (
                                    <div className={styles.bookingGrid}>
                                        {bookings.map((booking) => (
                                            <div key={booking.id} className={styles.bookingCard}>
                                                <div className={styles.bookingStatus}>
                                                    {booking.status === 'Confirmed' ? (
                                                        <span className={styles.statusBadgeConfirmed}>
                                                            <CheckCircle2 size={12} /> Confirmed
                                                        </span>
                                                    ) : (
                                                        <span className={styles.statusBadgePending}>
                                                            <Clock size={12} /> Pending
                                                        </span>
                                                    )}
                                                </div>
                                                <div className={styles.bookingDetails}>
                                                    <h3 className={styles.roomName}>{booking.room}</h3>
                                                    <p className={styles.bookingDate}>
                                                        <Calendar size={14} /> {booking.date}
                                                    </p>
                                                    <p className={styles.bookingGuests}>
                                                        <User size={14} /> {booking.guests} Guests
                                                    </p>
                                                </div>
                                                <div className={styles.bookingActions}>
                                                    <button
                                                        className={styles.actionLink}
                                                        onClick={() => {
                                                            const type = confirm("Would you like to MODIFY or CANCEL this reservation?\n\nOK for Modify, Cancel for Cancellation") ? 'modify' : 'cancel';
                                                            const reason = prompt(`Please specify the reason for ${type}:`);
                                                            if (reason) {
                                                                requestBookingAction(booking.id, type as any, reason).then(() => {
                                                                    alert("Your request has been sent to our concierge team.");
                                                                    location.reload();
                                                                });
                                                            }
                                                        }}
                                                    >
                                                        Manage Reservation <ChevronRight size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className={styles.emptyState}>
                                        <AlertCircle size={48} />
                                        <h3>No Bookings Found</h3>
                                        <p>Your journey with Parkside starts here. Browse our rooms to make your first reservation.</p>
                                    </div>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="settings"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className={styles.tabPanel}
                            >
                                <div className={styles.panelHeader}>
                                    <h1 className={styles.panelTitle}>Account Settings</h1>
                                </div>

                                <div className={styles.settingsForm}>
                                    <div className={styles.inputGroup}>
                                        <label className={styles.label}>Full Name</label>
                                        <div className={styles.inputWrapper}>
                                            <input type="text" className={styles.input} defaultValue={user.name} />
                                            <button className={styles.insideBtn}><Edit2 size={14} /></button>
                                        </div>
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label className={styles.label}>Email Address</label>
                                        <div className={styles.inputWrapper}>
                                            <input type="email" className={styles.input} defaultValue={user.email} disabled />
                                        </div>
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label className={styles.label}>Phone Number</label>
                                        <div className={styles.inputWrapper}>
                                            <input type="tel" className={styles.input} placeholder="Enter your phone number" />
                                            <button className={styles.insideBtn}><Edit2 size={14} /></button>
                                        </div>
                                    </div>
                                    <button className={styles.buttonGold}>Save Changes</button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
}
