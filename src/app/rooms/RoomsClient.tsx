"use client";

import { useEffect, useState } from "react";
import { addLead } from "../actions";
import { useCurrency } from "../context/CurrencyContext";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronLeft, ArrowUpRight, Wifi, Coffee, Tv,
    Wind, Star, CheckCircle2, Calendar, Phone, Mail,
    Smartphone, CreditCard, Shield, Check, Loader2, Wine, Users, X
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import styles from "./rooms.module.css";
import { useRouter } from "next/navigation";
import Footer from "../components/Footer";

interface RoomsClientProps {
    initialRooms: any[];
    initialContent: any;
    contactInfo: any;
}

export default function RoomsClient({ initialRooms, initialContent, contactInfo }: RoomsClientProps) {
    const router = useRouter();
    const { formatPrice } = useCurrency();
    const [rooms] = useState(initialRooms);
    const [content] = useState(initialContent);
    const [selectedRoom, setSelectedRoom] = useState<any>(null);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [bookingStep, setBookingStep] = useState(1);
    const [paymentStep, setPaymentStep] = useState<"method" | "mpesa" | "card" | "success" | null>(null);
    const [mpesaTimer, setMpesaTimer] = useState(0);
    const [bookingStatus, setBookingStatus] = useState("");
    const [bookingData, setBookingData] = useState({
        name: "", email: "", phone: "",
        checkIn: "", checkOut: "", guests: "2 Adults",
        paymentMethod: "", mpesaPhone: ""
    });

    // Filtering State
    const [searchQuery, setSearchQuery] = useState("");
    const [maxPrice, setMaxPrice] = useState(20000);
    const [guestFilter, setGuestFilter] = useState("Any");
    const [filteredRooms, setFilteredRooms] = useState(initialRooms);

    useEffect(() => {
        const result = rooms.filter(room => {
            const matchesSearch = room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                room.desc.toLowerCase().includes(searchQuery.toLowerCase());

            const numericPrice = typeof room.price === 'string'
                ? parseInt(room.price.replace(/[^0-9]/g, ""))
                : room.price;
            const matchesPrice = isNaN(numericPrice) || numericPrice <= maxPrice;

            const matchesGuests = guestFilter === "Any" || (room.capacity || 2) >= parseInt(guestFilter);
            return matchesSearch && matchesPrice && matchesGuests;
        });
        setFilteredRooms(result);
    }, [searchQuery, maxPrice, guestFilter, rooms]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (mpesaTimer > 0) {
            interval = setInterval(() => {
                setMpesaTimer(prev => prev - 1);
            }, 1000);
        } else if (mpesaTimer === 0 && paymentStep === "mpesa") {
            setPaymentStep("success");
            setBookingStatus("Payment Successful!");
            setTimeout(() => {
                setBookingStatus(""); setIsBookingModalOpen(false); setBookingStep(1); setPaymentStep(null);
                setBookingData({ name: "", email: "", phone: "", checkIn: "", checkOut: "", guests: "2 Adults", paymentMethod: "", mpesaPhone: "" });
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [mpesaTimer, paymentStep]);

    const roomsKeys = content?.rooms_intro || {};

    const fadeUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0 }
    };

    const handleBookingSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setPaymentStep("method");
    };

    return (
        <main className={styles.pageWrapper}>
            {/* HERO SECTION */}
            <section className={styles.hero}>
                <Image
                    src="https://res.cloudinary.com/dizwm3mic/image/upload/v1772446787/parkside-villa-media/Front_Image_Or_Background_Image/_MG_0698_zmv8bg.jpg"
                    alt="Rooms Hero"
                    fill
                    priority
                    className={styles.heroImg}
                />
                <div className={styles.heroOverlay} />
                <div className={styles.heroContent}>
                    <motion.span initial="hidden" animate="visible" variants={fadeUp} className={styles.accentText}>
                        Exquisite Living
                    </motion.span>
                    <motion.h1 initial="hidden" animate="visible" variants={fadeUp} transition={{ delay: 0.1 }}>
                        {roomsKeys.title || "Accommodation & Suites"}
                    </motion.h1>
                    <motion.p initial="hidden" animate="visible" variants={fadeUp} transition={{ delay: 0.2 }}>
                        {roomsKeys.subtitle || "Discover our range of meticulously designed spaces for your ultimate comfort."}
                    </motion.p>
                </div>
            </section>

            {/* FILTER BAR */}
            <section className={styles.filterSection}>
                <div className={styles.container}>
                    <div className={styles.filterBar}>
                        <div className={styles.searchGroup}>
                            <label>Search Rooms</label>
                            <input
                                type="text"
                                placeholder="Suite, Cottage..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className={styles.priceGroup}>
                            <label>Max Price: {formatPrice(maxPrice)}</label>
                            <input
                                type="range"
                                min="2000"
                                max="20000"
                                step="500"
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                            />
                        </div>
                        <div className={styles.guestGroup}>
                            <label>Guests</label>
                            <select value={guestFilter} onChange={(e) => setGuestFilter(e.target.value)}>
                                <option>Any</option>
                                <option>1</option>
                                <option>2</option>
                                <option>4</option>
                            </select>
                        </div>
                    </div>
                </div>
            </section>

            {/* ROOMS GRID */}
            <section className={styles.roomsSection}>
                <div className={styles.container}>
                    <div className={styles.roomsGrid}>
                        <AnimatePresence mode="popLayout">
                            {filteredRooms.map((room, i) => (
                                <motion.div
                                    key={room.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.4 }}
                                    className={styles.roomCard}
                                >
                                    <div className={styles.roomImage}>
                                        <Image src={room.image} alt={room.name} fill className={styles.img} />
                                        {room.tag && <span className={styles.tag}>{room.tag}</span>}
                                        <div className={styles.roomPrice}>
                                            {formatPrice(room.price)}<span>/night</span>
                                        </div>
                                    </div>
                                    <div className={styles.roomInfo}>
                                        <h3>{room.name}</h3>
                                        <p>{room.desc}</p>
                                        <div className={styles.amenities}>
                                            <div className={styles.amenity}><Wifi size={16} /> <span>Wifi</span></div>
                                            <div className={styles.amenity}><Coffee size={16} /> <span>Breakfast</span></div>
                                            <div className={styles.amenity}><Users size={16} /> <span>{room.capacity} Guests</span></div>
                                        </div>
                                        <div className={styles.cardActions}>
                                            <button
                                                onClick={() => { setSelectedRoom(room); setIsBookingModalOpen(true); }}
                                                className={styles.primaryBtn}
                                            >
                                                Book Now
                                            </button>
                                            <Link href={`/rooms/${room.id}`} className={styles.secondaryBtn}>
                                                Details <ArrowUpRight size={16} />
                                            </Link>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            </section>

            <Footer contactInfo={contactInfo} />

            {/* BOOKING MODAL (Simplified duplication for brevity, same as HomeClient logic) */}
            <AnimatePresence>
                {isBookingModalOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={styles.modalOverlay}>
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className={styles.modal}>
                            <button onClick={() => { setIsBookingModalOpen(false); setBookingStep(1); setPaymentStep(null); }} className={styles.closeBtn}><X /></button>
                            <div className={styles.modalContent}>
                                <h2>Book {selectedRoom?.name || "Suite"}</h2>
                                {paymentStep === null ? (
                                    <form onSubmit={handleBookingSubmit} className={styles.form}>
                                        <div className={styles.inputRow}>
                                            <input type="text" placeholder="Full Name" required value={bookingData.name} onChange={e => setBookingData({ ...bookingData, name: e.target.value })} />
                                            <input type="email" placeholder="Email" required value={bookingData.email} onChange={e => setBookingData({ ...bookingData, email: e.target.value })} />
                                        </div>
                                        <div className={styles.inputRow}>
                                            <input type="tel" placeholder="Phone" required value={bookingData.phone} onChange={e => setBookingData({ ...bookingData, phone: e.target.value })} />
                                            <select value={bookingData.guests} onChange={e => setBookingData({ ...bookingData, guests: e.target.value })}>
                                                <option>1 Adult</option>
                                                <option>2 Adults</option>
                                                <option>Family</option>
                                            </select>
                                        </div>
                                        <div className={styles.inputRow}>
                                            <input type="date" required value={bookingData.checkIn} onChange={e => setBookingData({ ...bookingData, checkIn: e.target.value })} />
                                            <input type="date" required value={bookingData.checkOut} onChange={e => setBookingData({ ...bookingData, checkOut: e.target.value })} />
                                        </div>
                                        <button type="submit" className={styles.submitBtn}>Continue to Payment</button>
                                    </form>
                                ) : paymentStep === "method" ? (
                                    <div className={styles.paymentMethods}>
                                        <button onClick={() => { setPaymentStep("mpesa"); setMpesaTimer(30); }} className={styles.methodBtn}>M-Pesa STK Push</button>
                                        <button onClick={() => setPaymentStep("card")} className={styles.methodBtn}>Credit Card</button>
                                    </div>
                                ) : (
                                    <div className={styles.status}>
                                        <Loader2 className={styles.spin} />
                                        <p>Processing Payment...</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );
}
