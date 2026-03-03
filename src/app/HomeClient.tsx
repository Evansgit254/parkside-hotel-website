"use client";

import {
    Hotel, Users, Utensils, Waves, Wine,
    Phone, Mail, MessageSquare, Instagram, Facebook, Linkedin,
    Calendar, MapPin, ChevronRight, ChevronLeft, ArrowUpRight,
    CreditCard, Smartphone, Check, Loader2, Shield
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import styles from "./page.module.css";
import { addLead } from "./actions";
import { useRouter } from "next/navigation";
import Magnetic from "./components/Magnetic";
import Schema from "./components/Schema";
import { useCurrency } from "./context/CurrencyContext";
import ReviewForm from "./components/ReviewForm";
import Footer from "./components/Footer";

const fadeUp: Variants = {
    hidden: { opacity: 0, y: 32 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

const stagger: Variants = {
    visible: { transition: { staggerChildren: 0.12 } }
};

interface HomeClientProps {
    initialData: any;
}

export default function HomeClient({ initialData }: HomeClientProps) {
    const router = useRouter();
    const { formatPrice } = useCurrency();
    const [siteData, setSiteData] = useState(initialData);

    const { rooms, facilities, testimonials, contactInfo, heroImages, content } = siteData;

    const heroKeys = content?.landing_hero || {};
    const roomsKeys = content?.rooms_intro || {};
    const facilitiesKeys = content?.facilities_intro || {};

    const [isScrolled, setIsScrolled] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [bookingStatus, setBookingStatus] = useState("");
    const [contactStatus, setContactStatus] = useState("");
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState<any>(null);
    const [bookingStep, setBookingStep] = useState(1);
    const [recentRooms, setRecentRooms] = useState<any[]>([]);
    const [isConciergeOpen, setIsConciergeOpen] = useState(false);
    const [conciergeStep, setConciergeStep] = useState(0);
    const [bookingData, setBookingData] = useState({
        name: "", email: "", phone: "",
        checkIn: "", checkOut: "", guests: "2 Adults",
        roomType: "Any Room", maxPrice: 10000,
        paymentMethod: "", mpesaPhone: ""
    });

    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [contactData, setContactData] = useState({ name: "", email: "", message: "" });
    const [paymentStep, setPaymentStep] = useState<"method" | "mpesa" | "card" | "success" | null>(null);
    const [mpesaTimer, setMpesaTimer] = useState(0);

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
                finalizeBooking();
            }, 2000);
        }
        return () => clearInterval(interval);
    }, [mpesaTimer, paymentStep]);

    useEffect(() => {
        const stored = localStorage.getItem("recentRooms");
        if (stored) setRecentRooms(JSON.parse(stored));
    }, []);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 60);
        window.addEventListener("scroll", handleScroll);
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % heroImages.length);
        }, 6000);
        return () => {
            window.removeEventListener("scroll", handleScroll);
            clearInterval(timer);
        };
    }, [heroImages.length]);

    const finalizeBooking = async () => {
        try {
            const result = await addLead({
                name: bookingData.name,
                email: bookingData.email,
                phone: bookingData.phone,
                date: `${bookingData.checkIn} to ${bookingData.checkOut}`,
                room: selectedRoom?.id || "general-enquiry",
                guests: bookingData.guests
            });

            if (result.success) {
                setBookingStatus("Booking confirmed! Our team will contact you shortly.");
                // Store in local history
                const updated = [selectedRoom, ...recentRooms.filter(r => r?.id !== selectedRoom?.id)].slice(0, 4);
                localStorage.setItem("recentRooms", JSON.stringify(updated));

                setTimeout(() => {
                    setIsBookingModalOpen(false);
                    setBookingStatus("");
                }, 5000);
            }
        } catch (e) {
            setBookingStatus("Failed to send booking request. Please call us directly.");
        }
    };

    const handleBookingSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setBookingStatus("Processing...");
        setPaymentStep("method");
    };

    const handleNextStep = () => setBookingStep(2);

    const handleContactSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setContactStatus("Sending...");
        try {
            const result = await addLead({
                name: contactData.name,
                email: contactData.email,
                phone: "Contact Form",
                date: "N/A",
                room: "General Enquiry",
                guests: contactData.message
            });
            if (result.success) {
                setContactStatus("Message sent! We will get back to you soon.");
                setContactData({ name: "", email: "", message: "" });
                setTimeout(() => setContactStatus(""), 5000);
            }
        } catch (err) {
            setContactStatus("Failed to send. Please try again or call us.");
        }
    };

    const closeBooking = () => {
        setIsBookingModalOpen(false);
        setBookingStep(1);
        setPaymentStep(null);
    };

    return (
        <main className={styles.main}>
            <Schema data={siteData} />

            {/* NAVIGATION - Using fixed position for luxury feel */}
            <nav className={`${styles.nav} ${isScrolled ? styles.navScrolled : ""}`}>
                <div className={styles.navContainer}>
                    <Link href="/" className={styles.logo}>
                        <span className={styles.logoText}>PARKSIDE</span>
                        <span className={styles.logoSubtext}>VILLA KITUI</span>
                    </Link>

                    <div className={styles.navLinks}>
                        <Link href="/" className={styles.activeLink}>Home</Link>
                        <Link href="/rooms">Accommodation</Link>
                        <Link href="/facilities">Facilities</Link>
                        <Link href="/gallery">Gallery</Link>
                        <Link href="/blog">Blog</Link>
                        <Link href="/dining">Dining</Link>
                        <Link href="/#contact">Contact</Link>
                    </div>

                    <Magnetic>
                        <button
                            onClick={() => setIsBookingModalOpen(true)}
                            className={styles.bookBtn}
                        >
                            Book Now
                        </button>
                    </Magnetic>
                </div>
            </nav>

            {/* HERO SECTION - Immersive Cinematic Experience */}
            <section className={styles.hero}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentSlide}
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                        transition={{ duration: 1.8, ease: "easeOut" }}
                        className={styles.heroImageWrapper}
                    >
                        <Image
                            src={heroImages[currentSlide]}
                            alt="Parkside Villa Luxury"
                            fill
                            priority
                            quality={100}
                            className={styles.heroImage}
                        />
                    </motion.div>
                </AnimatePresence>

                <div className={styles.heroOverlay} />

                <div className={styles.heroContent}>
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={stagger}
                        className={styles.heroText}
                    >
                        <motion.span variants={fadeUp} className={styles.heroTag}>
                            {heroKeys.tag || "The Oasis of Kitui"}
                        </motion.span>
                        <motion.h1 variants={fadeUp} className={styles.heroTitle}>
                            {heroKeys.title || "Experience Luxury Beyond Limits"}
                        </motion.h1>
                        <motion.p variants={fadeUp} className={styles.heroDesc}>
                            {heroKeys.subtitle || "A sanctuary of clinical elegance and traditional African warmth, perfectly tailored for your comfort."}
                        </motion.p>

                        <motion.div variants={fadeUp} className={styles.heroCTA}>
                            <Magnetic>
                                <button
                                    onClick={() => setIsBookingModalOpen(true)}
                                    className={styles.primaryBtn}
                                >
                                    Explore Rooms <ArrowUpRight size={20} />
                                </button>
                            </Magnetic>
                            <Link href="/facilities" className={styles.secondaryBtn}>
                                Our Facilities
                            </Link>
                        </motion.div>
                    </motion.div>
                </div>

                {/* Hero Indicators */}
                <div className={styles.indicators}>
                    {heroImages.map((_: any, i: number) => (
                        <button
                            key={i}
                            onClick={() => setCurrentSlide(i)}
                            className={`${styles.indicator} ${currentSlide === i ? styles.indicatorActive : ""}`}
                        />
                    ))}
                </div>
            </section>

            {/* QUICK INFO BAR */}
            <div className={styles.quickInfo}>
                <div className={styles.infoItem}>
                    <Calendar className={styles.infoIcon} />
                    <div>
                        <span className={styles.infoLabel}>Check-In</span>
                        <span className={styles.infoValue}>From 12:00 PM</span>
                    </div>
                </div>
                <div className={styles.infoItem}>
                    <MapPin className={styles.infoIcon} />
                    <div>
                        <span className={styles.infoLabel}>Location</span>
                        <span className={styles.infoValue}>Kitui, Kenya</span>
                    </div>
                </div>
                <div className={styles.infoItem}>
                    <Shield className={styles.infoIcon} />
                    <div>
                        <span className={styles.infoLabel}>Safety</span>
                        <span className={styles.infoValue}>24/7 Security</span>
                    </div>
                </div>
            </div>

            {/* ROOMS PREVIEW SECTION */}
            <section id="accommodation" className={styles.section}>
                <div className={styles.container}>
                    <div className={styles.sectionHeader}>
                        <div className={styles.headerTitle}>
                            <span className={styles.accent}>Accommodation</span>
                            <h2>{roomsKeys.title || "Elite Suites & Cottages"}</h2>
                        </div>
                        <p className={styles.headerDesc}>
                            {roomsKeys.subtitle || "Every room is a masterpiece of design, combining luxury with the serene vibes of Kitui."}
                        </p>
                    </div>

                    <div className={styles.roomsGrid}>
                        {rooms?.map((room: any, i: number) => (
                            <motion.div
                                key={room.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                viewport={{ once: true }}
                                className={styles.roomCard}
                                data-testid="room-card"
                            >
                                <div className={styles.roomImage}>
                                    <Image
                                        src={room.image}
                                        alt={room.name}
                                        fill
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                        className={styles.actualImage}
                                    />
                                    {room.tag && <span className={styles.roomBadge}>{room.tag}</span>}
                                    <div className={styles.roomOverlay}>
                                        <button
                                            onClick={() => {
                                                setSelectedRoom(room);
                                                setIsBookingModalOpen(true);
                                            }}
                                            className={styles.roomBtn}
                                        >
                                            Reserve
                                        </button>
                                    </div>
                                </div>
                                <div className={styles.roomInfo}>
                                    <div className={styles.roomMeta}>
                                        <span className={styles.roomPrice}>{formatPrice(room.price)}<small>/night</small></span>
                                        <div className={styles.roomSpecs}>
                                            <Users size={14} /> <span>{room.capacity} Guests</span>
                                        </div>
                                    </div>
                                    <h3>{room.name}</h3>
                                    <p>{room.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className={styles.viewAllWrapper}>
                        <Link href="/rooms" className={styles.outlineBtn}>
                            View All Room Categories <ArrowUpRight size={18} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* FACILITIES BENTO GRID */}
            <section className={styles.facilitiesSection}>
                <div className={styles.container}>
                    <div className={styles.sectionHeaderCentered}>
                        <span className={styles.accent}>Venture Inside</span>
                        <h2>{facilitiesKeys.title || "World-Class Facilities"}</h2>
                    </div>

                    <div className={styles.bentoGrid}>
                        {facilities?.map((facility: any, i: number) => (
                            <motion.div
                                key={facility.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.1 }}
                                viewport={{ once: true }}
                                className={`${styles.bentoItem} ${i === 0 ? styles.bentoLarge : ""}`}
                            >
                                <div className={styles.bentoImage}>
                                    <Image
                                        src={facility.image}
                                        alt={facility.title}
                                        fill
                                        sizes={i === 0 ? "60vw" : "30vw"}
                                        className={styles.actualImage}
                                    />
                                    <div className={styles.bentoInfo}>
                                        <div className={styles.bentoIcon}>
                                            {facility.icon === "Users" && <Users size={20} />}
                                            {facility.icon === "Utensils" && <Utensils size={20} />}
                                            {facility.icon === "Waves" && <Waves size={20} />}
                                            {facility.icon === "Wine" && <Wine size={20} />}
                                        </div>
                                        <h3>{facility.title}</h3>
                                        <p>{facility.desc}</p>
                                        <Link href="/facilities" className={styles.bentoLink}>
                                            Learn More <ChevronRight size={16} />
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* TESTIMONIALS SLIDER */}
            <section className={styles.testimonialsSection}>
                <div className={styles.container}>
                    <div className={styles.testimonialsHeader}>
                        <h2>What Our Guests Say</h2>
                        <div className={styles.testimonialControls}>
                            <button className={styles.slideBtn}><ChevronLeft /></button>
                            <button className={styles.slideBtn}><ChevronRight /></button>
                        </div>
                    </div>

                    <div className={styles.testimonialGrid}>
                        {testimonials?.filter((t: any) => t.status === 'Active').map((t: any, i: number) => (
                            <motion.div
                                key={t.id}
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                viewport={{ once: true }}
                                className={styles.testimonialCard}
                            >
                                <div className={styles.stars}>
                                    {[1, 2, 3, 4, 5].map(s => <Star key={s} fill="#C9A84C" size={14} color="#C9A84C" />)}
                                </div>
                                <p className={styles.quote}>"{t.text}"</p>
                                <div className={styles.author}>
                                    <div className={styles.authorAvatar}>{t.name.charAt(0)}</div>
                                    <div className={styles.authorInfo}>
                                        <span className={styles.authorName}>{t.name}</span>
                                        <span className={styles.authorTitle}>{t.title}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className={styles.reviewCTA}>
                        <button onClick={() => setIsReviewModalOpen(true)} className={styles.outlineBtn}>
                            Share Your Experience
                        </button>
                    </div>
                </div>
            </section>

            {/* CONTACT SECTION */}
            <section id="contact" className={styles.contactSection}>
                <div className={styles.contactInner}>
                    <motion.div
                        className={styles.contactLeft}
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <span className={styles.badge}>Get In Touch</span>
                        <h2 className={styles.contactTitle}>Begin Your <br />Journey</h2>

                        <div className={styles.contactDetails}>
                            <div className={styles.contactItem}>
                                <span className={styles.contactLabel}>Reserve via Phone</span>
                                <span className={styles.contactText}><Phone size={14} /> {contactInfo?.phone}</span>
                            </div>
                            <div className={styles.contactItem}>
                                <span className={styles.contactLabel}>Corporate Inquiries</span>
                                <span className={styles.contactText}><Mail size={14} /> {contactInfo?.email}</span>
                            </div>
                            <div className={styles.contactItem}>
                                <span className={styles.contactLabel}>Visit Our Estate</span>
                                <span className={styles.contactText}><MapPin size={14} /> {contactInfo?.address}</span>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        className={styles.contactForm}
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <form onSubmit={handleContactSubmit}>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Full Name</label>
                                <input
                                    type="text"
                                    className={styles.input}
                                    placeholder="Your preferred name"
                                    required
                                    value={contactData.name}
                                    onChange={(e) => setContactData({ ...contactData, name: e.target.value })}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Email Address</label>
                                <input
                                    type="email"
                                    className={styles.input}
                                    placeholder="email@example.com"
                                    required
                                    value={contactData.email}
                                    onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Message</label>
                                <textarea
                                    className={styles.input}
                                    placeholder="How can we assist you?"
                                    required
                                    rows={4}
                                    value={contactData.message}
                                    onChange={(e) => setContactData({ ...contactData, message: e.target.value })}
                                    style={{ borderBottom: '2px solid var(--border)', resize: 'none' }}
                                />
                            </div>

                            <div style={{ marginTop: '2rem' }}>
                                <button type="submit" className={styles.primaryBtn}>
                                    Send Enquiry <MessageSquare size={18} />
                                </button>
                                {contactStatus && <p style={{ marginTop: '1rem', color: 'var(--primary)', fontSize: '0.875rem' }}>{contactStatus}</p>}
                            </div>
                        </form>
                    </motion.div>
                </div>
            </section>

            <Footer contactInfo={contactInfo} />

            {/* BOOKING MODAL */}
            <AnimatePresence>
                {isBookingModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={styles.modalOverlay}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className={styles.modal}
                        >
                            <button onClick={closeBooking} className={styles.closeBtn}><X size={24} /></button>

                            <div className={styles.modalGrid}>
                                <div className={styles.modalInfo}>
                                    <span className={styles.modalTag}>Reservation · Step {paymentStep === null ? "1" : paymentStep === "method" ? "2" : "3"} of 3</span>
                                    <h2>{selectedRoom ? `Book ${selectedRoom.name}` : "Plan Your Stay"}</h2>
                                    <p>Tell us your preferred dates and we'll handle the rest.</p>

                                    <div className={styles.modalFeatures}>
                                        <div className={styles.feature}><Check size={16} /> Instant Confirmation</div>
                                        <div className={styles.feature}><Check size={16} /> Best Rate Guaranteed</div>
                                        <div className={styles.feature}><Check size={16} /> Secure Payment</div>
                                    </div>
                                </div>

                                <div className={styles.modalForm}>
                                    {paymentStep === null ? (
                                        <form onSubmit={handleBookingSubmit}>
                                            <div className={styles.inputsGrid}>
                                                <div className={styles.inputGroup}>
                                                    <label>Full Name</label>
                                                    <input
                                                        type="text" required
                                                        placeholder="John Doe"
                                                        value={bookingData.name}
                                                        onChange={(e) => setBookingData({ ...bookingData, name: e.target.value })}
                                                    />
                                                </div>
                                                <div className={styles.inputGroup}>
                                                    <label>Email Address</label>
                                                    <input
                                                        type="email" required
                                                        placeholder="john@example.com"
                                                        value={bookingData.email}
                                                        onChange={(e) => setBookingData({ ...bookingData, email: e.target.value })}
                                                    />
                                                </div>
                                                <div className={styles.inputGroup}>
                                                    <label>Phone Number</label>
                                                    <input
                                                        type="tel" required
                                                        placeholder="+254..."
                                                        value={bookingData.phone}
                                                        onChange={(e) => setBookingData({ ...bookingData, phone: e.target.value })}
                                                    />
                                                </div>
                                                <div className={styles.inputGroup}>
                                                    <label>Guests</label>
                                                    <select
                                                        value={bookingData.guests}
                                                        onChange={(e) => setBookingData({ ...bookingData, guests: e.target.value })}
                                                    >
                                                        <option>1 Adult</option>
                                                        <option>2 Adults</option>
                                                        <option>Family (2A + 2C)</option>
                                                        <option>Group (4+)</option>
                                                    </select>
                                                </div>
                                                <div className={styles.inputGroup}>
                                                    <label>Check-In Date</label>
                                                    <input
                                                        type="date" required
                                                        value={bookingData.checkIn}
                                                        onChange={(e) => setBookingData({ ...bookingData, checkIn: e.target.value })}
                                                    />
                                                </div>
                                                <div className={styles.inputGroup}>
                                                    <label>Check-Out Date</label>
                                                    <input
                                                        type="date" required
                                                        value={bookingData.checkOut}
                                                        onChange={(e) => setBookingData({ ...bookingData, checkOut: e.target.value })}
                                                    />
                                                </div>
                                            </div>

                                            <button type="submit" className={styles.submitBtn}>
                                                Proceed to Payment <ChevronRight size={18} />
                                            </button>

                                            {bookingStatus && <p className={styles.status}>{bookingStatus}</p>}
                                        </form>
                                    ) : paymentStep === "method" ? (
                                        <div className={styles.paymentMethods}>
                                            <h3>Select Payment Method</h3>
                                            <button onClick={() => { setPaymentStep("mpesa"); setMpesaTimer(30); }} className={styles.methodBtn}>
                                                <Smartphone size={20} /> M-Pesa STK Push
                                            </button>
                                            <button onClick={() => setPaymentStep("card")} className={styles.methodBtn}>
                                                <CreditCard size={20} /> Credit/Debit Card
                                            </button>
                                        </div>
                                    ) : (
                                        <div className={styles.paymentProcessing}>
                                            {paymentStep === "mpesa" ? (
                                                <>
                                                    <Loader2 className={styles.spinner} />
                                                    <h3>Confirm on your phone</h3>
                                                    <p>We've sent an M-Pesa prompt to your phone. Enter your PIN to finalize.</p>
                                                    <div className={styles.timer}>Auto-verifying in {mpesaTimer}s...</div>
                                                </>
                                            ) : (
                                                <>
                                                    <Check className={styles.successIcon} />
                                                    <h3>Payment Successful</h3>
                                                    <p>Redirecting to your dashboard...</p>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <ReviewForm
                isOpen={isReviewModalOpen}
                onClose={() => setIsReviewModalOpen(false)}
            />
        </main>
    );
}

function Star({ size = 16, fill = "currentColor", color = "currentColor" }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
    );
}

function X({ size = 16 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
    );
}
