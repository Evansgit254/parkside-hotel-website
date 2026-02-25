"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { getSiteData, addLead } from "../actions";
import { useCurrency } from "../context/CurrencyContext";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronLeft, ArrowUpRight, Wifi, Coffee, Tv,
    Wind, Star, CheckCircle2, Calendar, Phone, Mail,
    Smartphone, CreditCard, Shield, Check, Loader2, Wine, Users
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import styles from "./rooms.module.css";
import { useRouter } from "next/navigation";

export default function RoomsPage() {
    const router = useRouter();
    const { formatPrice } = useCurrency();
    const [rooms, setRooms] = useState<any[]>([]);
    const [content, setContent] = useState<any>({});
    const [loading, setLoading] = useState(true);
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
    const [maxPrice, setMaxPrice] = useState(1000);
    const [guestFilter, setGuestFilter] = useState("Any");
    const [filteredRooms, setFilteredRooms] = useState<any[]>([]);

    useEffect(() => {
        getSiteData().then(data => {
            const roomList = data.rooms || [];
            setRooms(roomList);
            setFilteredRooms(roomList);
            if (data && data.content) setContent(data.content);
            setLoading(false);
        });
    }, []);

    useEffect(() => {
        const result = rooms.filter(room => {
            const matchesSearch = room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                room.desc.toLowerCase().includes(searchQuery.toLowerCase());

            // Handle numeric price conversion (stripping symbols)
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

    if (loading) return <div className={styles.loading}>Curating Collections...</div>;

    const roomsKeys = content?.rooms_intro || {};

    const fadeUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <main className={styles.pageWrapper}>
            {/* HERO SECTION */}
            <section className={styles.hero}>
                <div className={styles.heroOverlay} />
                <div className={styles.heroContent}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className={styles.badge}>{roomsKeys.badge || "Our Collection"}</span>
                        <h1 className={styles.title}>{roomsKeys.title || "Luxury Reimagined"}</h1>
                        <p className={styles.subtitle}>
                            {roomsKeys.desc || "A curated selection of sanctuaries designed for ultimate comfort and cultural elegance."}
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* FILTER BAR */}
            <section className={styles.filterSection}>
                <div className={styles.container}>
                    <div className={styles.filterBar}>
                        <div className={styles.filterGroup}>
                            <label className={styles.filterLabel}>Search Sanctuary</label>
                            <input
                                type="text"
                                placeholder="e.g. Deluxe, Suite..."
                                className={styles.filterInput}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className={styles.filterGroup}>
                            <label className={styles.filterLabel}>Max Nightly Rate: ${maxPrice}</label>
                            <input
                                type="range"
                                min="50"
                                max="1000"
                                step="50"
                                className={styles.rangeInput}
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                            />
                        </div>
                        <div className={styles.filterGroup}>
                            <label className={styles.filterLabel}>Min Guests</label>
                            <select
                                className={styles.filterSelect}
                                value={guestFilter}
                                onChange={(e) => setGuestFilter(e.target.value)}
                            >
                                <option value="Any">Any Capacity</option>
                                <option value="1">1 Person</option>
                                <option value="2">2 Persons</option>
                                <option value="3">3 Persons</option>
                                <option value="4">4+ Persons</option>
                            </select>
                        </div>
                    </div>
                </div>
            </section>

            {/* ROOMS GRID */}
            <section className={styles.gridSection}>
                <div className={styles.container}>
                    <div className={styles.roomGrid}>
                        {filteredRooms.map((room, index) => (
                            <motion.div
                                key={room.id}
                                variants={fadeUp}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                className={styles.roomCard}
                                onClick={() => router.push(`/rooms/${room.id}`)}
                            >
                                <div className={styles.imageWrapper}>
                                    <Image src={room.image} alt={room.name} fill className={styles.roomImage} />
                                    {room.tag && <span className={styles.roomTag}>{room.tag}</span>}
                                    <div className={styles.imageOverlay} />
                                </div>

                                <div className={styles.roomContent}>
                                    <div className={styles.roomHeader}>
                                        <h3 className={styles.roomName}>{room.name}</h3>
                                        <div className={styles.priceInfo}>
                                            <span className={styles.priceValue}>{formatPrice(room.price)}</span>
                                            <span className={styles.perNight}>/ night</span>
                                        </div>
                                    </div>

                                    <p className={styles.roomDesc}>{room.desc}</p>

                                    <div className={styles.amenitiesShort}>
                                        <div className={styles.amenity}><Wifi size={14} /> WiFi</div>
                                        <div className={styles.amenity}><Wind size={14} /> AC</div>
                                        <div className={styles.amenity}><Tv size={14} /> TV</div>
                                    </div>

                                    <div className={styles.cardActions}>
                                        <Link href={`/rooms/${room.id}`} className={styles.detailsLink}>
                                            View Details
                                        </Link>
                                        <button
                                            className={styles.bookBtn}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedRoom(room);
                                                setIsBookingModalOpen(true);
                                            }}
                                        >
                                            Book Now
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* BOOKING MODAL */}
            <AnimatePresence>
                {isBookingModalOpen && selectedRoom && (
                    <motion.div
                        className={styles.modalOverlay}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => { setIsBookingModalOpen(false); setBookingStep(1); setPaymentStep(null); }}
                    >
                        <motion.div
                            className={styles.modalContent}
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 30, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <button className={styles.closeModal} onClick={() => { setIsBookingModalOpen(false); setBookingStep(1); }}>&times;</button>

                            {/* Progress */}
                            <div className={styles.progressContainer}>
                                <div className={styles.progressBar} style={{ width: `${(bookingStep / 3) * 100}%` }} />
                            </div>

                            <span className={styles.stepBadge}>Step {bookingStep} of 3</span>
                            <h3 className={styles.modalTitle}>{selectedRoom.name}</h3>
                            <p className={styles.modalSubtitle}>{formatPrice(selectedRoom.price)} · PER NIGHT</p>

                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                if (bookingStep === 1) { setBookingStep(2); return; }
                                if (bookingStep === 2) { setBookingStep(3); setPaymentStep("method"); return; }

                                if (bookingStep === 3) {
                                    if (paymentStep === "method") {
                                        if (bookingData.paymentMethod === "mpesa") {
                                            setPaymentStep("mpesa");
                                            setMpesaTimer(10);
                                            return;
                                        } else if (bookingData.paymentMethod === "card") {
                                            setPaymentStep("card");
                                            return;
                                        }
                                    }

                                    if (paymentStep === "card") {
                                        setBookingStatus("Processing Card...");
                                        await new Promise(r => setTimeout(r, 2000));
                                        setPaymentStep("success");
                                        setBookingStatus("Payment Successful!");
                                    }
                                }

                                if (paymentStep === "success" || !paymentStep) {
                                    setBookingStatus("Finalizing...");
                                    await addLead({
                                        name: bookingData.name, email: bookingData.email,
                                        phone: bookingData.phone,
                                        date: `${bookingData.checkIn} to ${bookingData.checkOut}`,
                                        room: selectedRoom.name, guests: bookingData.guests,
                                    });
                                    setBookingStatus("Reservation Confirmed!");
                                    setTimeout(() => {
                                        setBookingStatus(""); setIsBookingModalOpen(false); setBookingStep(1); setPaymentStep(null);
                                        setBookingData({ name: "", email: "", phone: "", checkIn: "", checkOut: "", guests: "2 Adults", paymentMethod: "", mpesaPhone: "" });
                                    }, 2500);
                                }
                            }}>
                                <AnimatePresence mode="wait">
                                    {bookingStep === 1 && (
                                        <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className={styles.formStep}>
                                            <div className={styles.formGrid}>
                                                <div className={styles.formGroup}>
                                                    <label className={styles.formLabel}>CHECK IN</label>
                                                    <input type="date" required value={bookingData.checkIn} onChange={e => setBookingData({ ...bookingData, checkIn: e.target.value })} className={styles.input} />
                                                </div>
                                                <div className={styles.formGroup}>
                                                    <label className={styles.formLabel}>CHECK OUT</label>
                                                    <input type="date" required value={bookingData.checkOut} onChange={e => setBookingData({ ...bookingData, checkOut: e.target.value })} className={styles.input} />
                                                </div>
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label className={styles.formLabel}>GUESTS</label>
                                                <select value={bookingData.guests} onChange={e => setBookingData({ ...bookingData, guests: e.target.value })} className={styles.input}>
                                                    <option>1 Adult</option>
                                                    <option>2 Adults</option>
                                                    <option>2 Adults, 1 Child</option>
                                                    <option>2 Adults, 2 Children</option>
                                                    <option>Family (4+ Persons)</option>
                                                </select>
                                            </div>
                                            <button type="submit" className={styles.buttonPrimary}>Continue</button>
                                        </motion.div>
                                    )}

                                    {bookingStep === 2 && (
                                        <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className={styles.formStep}>
                                            <div className={styles.formGroup}>
                                                <label className={styles.formLabel}>FULL NAME</label>
                                                <input type="text" required placeholder="John Doe" value={bookingData.name} onChange={e => setBookingData({ ...bookingData, name: e.target.value })} className={styles.input} />
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label className={styles.formLabel}>EMAIL ADDRESS</label>
                                                <input type="email" required placeholder="john@example.com" value={bookingData.email} onChange={e => setBookingData({ ...bookingData, email: e.target.value })} className={styles.input} />
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label className={styles.formLabel}>PHONE NUMBER</label>
                                                <input type="tel" required placeholder="+254 700 000 000" value={bookingData.phone} onChange={e => setBookingData({ ...bookingData, phone: e.target.value })} className={styles.input} />
                                            </div>
                                            <div className={styles.modalActions}>
                                                <button type="button" onClick={() => setBookingStep(1)} className={styles.buttonSecondary}>Back</button>
                                                <button type="submit" className={styles.buttonPrimary}>Continue to Payment</button>
                                            </div>
                                        </motion.div>
                                    )}

                                    {bookingStep === 3 && (
                                        <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className={styles.formStep}>
                                            {paymentStep === "method" && (
                                                <div className={styles.paymentMethodList}>
                                                    <div
                                                        onClick={() => setBookingData({ ...bookingData, paymentMethod: 'mpesa' })}
                                                        className={`${styles.paymentOption} ${bookingData.paymentMethod === 'mpesa' ? styles.paymentOptionActive : ''}`}
                                                    >
                                                        <Smartphone size={20} />
                                                        <div className={styles.paymentText}>
                                                            <p className={styles.paymentTitle}>M-Pesa STK Push</p>
                                                            <p className={styles.paymentDesc}>Payment via Safaricom line</p>
                                                        </div>
                                                        {bookingData.paymentMethod === 'mpesa' && <Check size={16} color="var(--gold)" />}
                                                    </div>

                                                    <div
                                                        onClick={() => setBookingData({ ...bookingData, paymentMethod: 'card' })}
                                                        className={`${styles.paymentOption} ${bookingData.paymentMethod === 'card' ? styles.paymentOptionActive : ''}`}
                                                    >
                                                        <CreditCard size={20} />
                                                        <div className={styles.paymentText}>
                                                            <p className={styles.paymentTitle}>Credit/Debit Card</p>
                                                            <p className={styles.paymentDesc}>Visa, Mastercard, AMEX</p>
                                                        </div>
                                                        {bookingData.paymentMethod === 'card' && <Check size={16} color="var(--gold)" />}
                                                    </div>

                                                    <div
                                                        onClick={() => setBookingData({ ...bookingData, paymentMethod: 'paypal' })}
                                                        className={`${styles.paymentOption} ${bookingData.paymentMethod === 'paypal' ? styles.paymentOptionActive : ''}`}
                                                    >
                                                        <Wine size={20} />
                                                        <div className={styles.paymentText}>
                                                            <p className={styles.paymentTitle}>PayPal / International</p>
                                                            <p className={styles.paymentDesc}>Secure checkout via PayPal</p>
                                                        </div>
                                                        {bookingData.paymentMethod === 'paypal' && <Check size={16} color="var(--gold)" />}
                                                    </div>

                                                    <div
                                                        onClick={() => setBookingData({ ...bookingData, paymentMethod: 'cheque' })}
                                                        className={`${styles.paymentOption} ${bookingData.paymentMethod === 'cheque' ? styles.paymentOptionActive : ''}`}
                                                    >
                                                        <Users size={20} />
                                                        <div className={styles.paymentText}>
                                                            <p className={styles.paymentTitle}>Corporate Cheque</p>
                                                            <p className={styles.paymentDesc}>For corporate and group bookings</p>
                                                        </div>
                                                        {bookingData.paymentMethod === 'cheque' && <Check size={16} color="var(--gold)" />}
                                                    </div>

                                                    <div className={styles.modalActions}>
                                                        <button type="button" onClick={() => { setBookingStep(2); setPaymentStep(null); }} className={styles.buttonSecondary}>Back</button>
                                                        <button type="submit" disabled={!bookingData.paymentMethod} className={styles.buttonPrimary}>Proceed to Pay</button>
                                                    </div>
                                                </div>
                                            )}

                                            {paymentStep === "mpesa" && (
                                                <div className={styles.statusView}>
                                                    <div className={styles.timerCircle}>
                                                        <motion.div
                                                            animate={{ rotate: 360 }}
                                                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                                            className={styles.spinner}
                                                        />
                                                        <span className={styles.timerText}>{mpesaTimer}s</span>
                                                    </div>
                                                    <h4 className={styles.statusTitle}>Requesting Payment...</h4>
                                                    <p className={styles.statusDesc}>Enter your M-Pesa PIN on your phone to complete.</p>
                                                    <button type="button" onClick={() => setPaymentStep("method")} className={styles.buttonSecondary}>Cancel</button>
                                                </div>
                                            )}

                                            {paymentStep === "card" && (
                                                <div className={styles.cardForm}>
                                                    <div className={styles.formGroup}>
                                                        <label className={styles.formLabel}>CARD NUMBER</label>
                                                        <div className={styles.inputWithIcon}>
                                                            <input type="text" placeholder="**** **** **** 4242" className={styles.input} required />
                                                            <CreditCard size={14} className={styles.inputIcon} />
                                                        </div>
                                                    </div>
                                                    <div className={styles.formGrid}>
                                                        <div className={styles.formGroup}>
                                                            <label className={styles.formLabel}>EXPIRY</label>
                                                            <input type="text" placeholder="MM/YY" className={styles.input} required />
                                                        </div>
                                                        <div className={styles.formGroup}>
                                                            <label className={styles.formLabel}>CVV</label>
                                                            <div className={styles.inputWithIcon}>
                                                                <input type="password" placeholder="***" className={styles.input} required />
                                                                <Shield size={14} className={styles.inputIcon} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className={styles.modalActions}>
                                                        <button type="button" onClick={() => setPaymentStep("method")} className={styles.buttonSecondary}>Back</button>
                                                        <button type="submit" disabled={!!bookingStatus} className={styles.buttonPrimary}>
                                                            {bookingStatus ? <Loader2 size={14} className={styles.spin} /> : `Pay ${formatPrice(selectedRoom.price)}`}
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {paymentStep === "success" && (
                                                <div className={styles.statusView}>
                                                    <div className={styles.successIcon}><Check size={32} /></div>
                                                    <h4 className={styles.statusTitle}>Payment Successful</h4>
                                                    <p className={styles.statusDesc}>Your transaction has been processed securely.</p>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );
}
