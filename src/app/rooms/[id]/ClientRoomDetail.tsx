"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { addLead } from "../../actions";
import { useCurrency } from "../../context/CurrencyContext";
import styles from "./room-detail.module.css";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Star, Coffee, Wifi, Tv, Wind, CheckCircle2, Calendar, Phone, Mail } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import EnhancedGallery from "../../components/EnhancedGallery";

export default function ClientRoomDetail({ room, contactInfo }: { room: any; contactInfo?: any }) {
    const router = useRouter();
    const { formatPrice } = useCurrency();
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [bookingStatus, setBookingStatus] = useState("");
    const [bookingData, setBookingData] = useState({
        name: "",
        email: "",
        phone: "",
        checkIn: "",
        checkOut: "",
        guests: "2 Adults, 0 Children"
    });

    useEffect(() => {
        // Track Recent Views
        const stored = localStorage.getItem("recentRooms") || "[]";
        const recent = JSON.parse(stored);
        const filtered = recent.filter((r: any) => r.id !== room.id);
        const updated = [room, ...filtered].slice(0, 4);
        localStorage.setItem("recentRooms", JSON.stringify(updated));
    }, [room]);

    const amenities = [
        { icon: Wifi, label: "High-speed WiFi" },
        { icon: Coffee, label: "Coffee Maker" },
        { icon: Tv, label: "Premium TV" },
        { icon: Wind, label: "Air Conditioning" },
        { icon: Star, label: "24/7 Service" }
    ];

    return (
        <div className={styles.pageWrapper}>
            {/* Hero Section */}
            <section className={styles.hero}>
                <Image
                    src={room.image && room.image.trim() !== "" ? room.image : "/hero-assets/room_suite.webp"}
                    alt={room.name || "Room Detail"}
                    fill
                    priority
                    quality={100}
                    sizes="100vw"
                    className={styles.heroImage}
                    style={{ objectFit: 'cover' }}
                />
                <div className={styles.heroOverlay} />

                <div className={styles.container}>
                    <Link href="/rooms" className={styles.backLink}>
                        <ChevronLeft size={20} /> Back to Collection
                    </Link>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className={styles.heroContent}
                    >
                        {room.tag && <span className={styles.tag}>{room.tag}</span>}
                        <h1 className={styles.title}>{room.name}</h1>
                        <div className={styles.priceContainer}>
                            <span className={styles.price}>{room.price ? formatPrice(room.price) : "Price on request"}</span>
                            {room.price && <span className={styles.perNight}>/ per night</span>}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Enhanced Gallery Section (Moved above details for better visibility) */}
            {room.images && room.images.length > 0 && (
                <div style={{ background: '#fff', borderBottom: '1px solid #eee' }}>
                    <div className={styles.container}>
                        <div style={{ paddingTop: '4rem' }}>
                            <h2 style={{
                                fontSize: '2rem',
                                fontFamily: 'var(--font-serif)',
                                color: 'var(--primary)',
                                marginBottom: '0.5rem'
                            }}>
                                Explore the {room.name}
                            </h2>
                            <p style={{ color: '#6B7280', marginBottom: '2rem' }}>
                                A visual journey through our premium accommodation and bespoke interiors.
                            </p>
                        </div>
                    </div>
                    <EnhancedGallery images={room.images} title={room.name} />
                </div>
            )}

            {/* Content Section */}
            <section className={styles.detailsSection}>
                <div className={styles.container}>
                    <div className={styles.grid}>
                        <div className={styles.mainInfo}>
                            <div className={styles.card}>
                                <h2 className={styles.cardTitle}>Sophisticated Sanctuary</h2>
                                <p className={styles.description}>{room.desc}</p>

                                <div className={styles.amenitiesGrid}>
                                    {amenities.map((item, idx) => (
                                        <div key={idx} className={styles.amenityItem}>
                                            <item.icon size={20} className={styles.amenityIcon} />
                                            <span>{item.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className={styles.card} style={{ marginTop: '2rem' }}>
                                <h3 className={styles.cardSubtitle}>Exceptional Features</h3>
                                <ul className={styles.featuresList}>
                                    {[
                                        "Premium orthopedic bedding",
                                        "Panoramic views of Kitui landscape",
                                        "Designer bathroom amenities",
                                        "Private secure workspace",
                                        "Mini-bar with local and international curations"
                                    ].map((feature, i) => (
                                        <li key={i} className={styles.featureItem}>
                                            <CheckCircle2 size={18} color="var(--secondary)" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className={styles.sidebar}>
                            <div className={styles.bookingCard}>
                                <h3 className={styles.bookingTitle}>Reserve This Room</h3>
                                <p className={styles.bookingSubtitle}>Check availability and lock in your stay</p>

                                <button
                                    onClick={() => setIsBookingModalOpen(true)}
                                    className={styles.bookButton}
                                >
                                    Instant Reservation
                                </button>

                                <div className={styles.conciergeInfo}>
                                    <div className={styles.conciergeItem}>
                                        <Phone size={16} />
                                        <span>Concierge: {contactInfo?.phone || "+254 701 023 026"}</span>
                                    </div>
                                    <div className={styles.conciergeItem}>
                                        <Mail size={16} />
                                        <span>Inquiries: {contactInfo?.email || "info@parksidevillakitui.com"}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>


            {/* Booking Modal */}
            <AnimatePresence>
                {isBookingModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsBookingModalOpen(false)}
                        className={styles.modalOverlay}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            onClick={e => e.stopPropagation()}
                            className={styles.modalContent}
                        >
                            <button
                                onClick={() => setIsBookingModalOpen(false)}
                                className={styles.closeModal}
                            >
                                &times;
                            </button>
                            <h3 className={styles.modalTitle}>Book {room.name}</h3>
                            <p className={styles.modalSubtitle}>{room.price ? `${formatPrice(room.price)} / per night` : "Price on request"}</p>

                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                setBookingStatus("Booking...");
                                await addLead({
                                    name: bookingData.name,
                                    email: bookingData.email,
                                    phone: bookingData.phone,
                                    date: `${bookingData.checkIn} to ${bookingData.checkOut}`,
                                    room: room.name,
                                    guests: bookingData.guests,
                                });
                                setBookingStatus("Booking Confirmed!");
                                setTimeout(() => {
                                    setBookingStatus("");
                                    setIsBookingModalOpen(false);
                                    setBookingData({ name: "", email: "", phone: "", checkIn: "", checkOut: "", guests: "2 Adults, 0 Children" });
                                }, 2000);
                            }} className={styles.form}>
                                <div className={styles.formGrid}>
                                    <div>
                                        <label className={styles.label}>Check In *</label>
                                        <div className={styles.inputWithIcon}>
                                            <input type="date" required value={bookingData.checkIn} onChange={e => setBookingData({ ...bookingData, checkIn: e.target.value })} className={styles.input} />
                                            <Calendar size={14} className={styles.inputIcon} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className={styles.label}>Check Out *</label>
                                        <div className={styles.inputWithIcon}>
                                            <input type="date" required value={bookingData.checkOut} onChange={e => setBookingData({ ...bookingData, checkOut: e.target.value })} className={styles.input} />
                                            <Calendar size={14} className={styles.inputIcon} />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className={styles.label}>Guests *</label>
                                    <select required value={bookingData.guests} onChange={e => setBookingData({ ...bookingData, guests: e.target.value })} className={styles.input}>
                                        <option>1 Adult</option>
                                        <option>2 Adults, 0 Children</option>
                                        <option>2 Adults, 1 Child</option>
                                        <option>2 Adults, 2 Children</option>
                                        <option>Family Suite (4+)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className={styles.label}>Full Name *</label>
                                    <input type="text" required placeholder="John Doe" value={bookingData.name} onChange={e => setBookingData({ ...bookingData, name: e.target.value })} className={styles.input} />
                                </div>

                                <div className={styles.formGrid}>
                                    <div>
                                        <label className={styles.label}>Email *</label>
                                        <input type="email" required placeholder="john@example.com" value={bookingData.email} onChange={e => setBookingData({ ...bookingData, email: e.target.value })} className={styles.input} />
                                    </div>
                                    <div>
                                        <label className={styles.label}>Phone *</label>
                                        <input type="tel" required placeholder={contactInfo?.phone || "+254 701 023 026"} value={bookingData.phone} onChange={e => setBookingData({ ...bookingData, phone: e.target.value })} className={styles.input} />
                                    </div>
                                </div>

                                <button type="submit" disabled={!!bookingStatus} className={styles.submitButton}>
                                    {bookingStatus || "Confirm Reservation"}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
