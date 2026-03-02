"use client";
export const dynamic = "force-dynamic";

import { rooms as initialRooms, facilities as initialFacilities, testimonials as initialTestimonials, contactInfo as initialContactInfo, heroImages as initialHeroImages } from "../data/site-data";
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
import { getSiteData, addLead } from "./actions";
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

export default function Home() {
  const router = useRouter();
  const { formatPrice } = useCurrency();
  const [siteData, setSiteData] = useState<any>({
    rooms: initialRooms,
    facilities: initialFacilities,
    testimonials: initialTestimonials,
    contactInfo: initialContactInfo,
    heroImages: initialHeroImages
  });

  useEffect(() => {
    getSiteData().then(data => { if (data) setSiteData(data); });
  }, []);

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
    roomType: "Any Room", maxPrice: 400,
    paymentMethod: "", mpesaPhone: ""
  });

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

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
        setBookingStatus(""); setIsBookingModalOpen(false); setBookingStep(1); setPaymentStep(null);
        setBookingData({ name: "", email: "", phone: "", checkIn: "", checkOut: "", guests: "2 Adults", roomType: "Any Room", maxPrice: 400, paymentMethod: "", mpesaPhone: "" });
      }, 3000);
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
      setCurrentSlide(prev => (prev + 1) % heroImages.length);
    }, 7000);
    return () => { window.removeEventListener("scroll", handleScroll); clearInterval(timer); };
  }, [heroImages.length]);

  const nextSlide = () => setCurrentSlide(prev => (prev + 1) % heroImages.length);
  const prevSlide = () => setCurrentSlide(prev => (prev - 1 + heroImages.length) % heroImages.length);


  const handleBookingSubmit = () => {
    // Scroll to accommodation section
    document.getElementById('accommodation')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <main className={styles.main}>
      <Schema data={siteData} />

      {/* ── HERO ── */}
      <section className={styles.hero}>
        <AnimatePresence>
          <motion.div
            key={currentSlide}
            initial={{ scale: 1.08, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
            className={styles.heroSlide}
          >
            <Image
              src={heroImages[currentSlide] || initialHeroImages[0]}
              alt="Parkside Villa Kitui"
              fill priority quality={90}
              className={styles.imageReveal}
              style={{ objectFit: "cover" }}
            />
          </motion.div>
        </AnimatePresence>

        <div className={styles.heroOverlay} />

        <motion.div
          className={styles.heroContent}
          initial="hidden"
          animate="visible"
          variants={stagger}
        >
          <motion.span variants={fadeUp} className={styles.badge}>
            {heroKeys.badge || "Refining Hospitality Since 2005"}
          </motion.span>

          <motion.h1 variants={fadeUp} className={styles.title}>
            {heroKeys.title || "Parkside Villa Kitui"}
          </motion.h1>

          <motion.p variants={fadeUp} className={styles.subtitle}>
            {heroKeys.subtitle || "An oasis of tranquility in the heart of Kenya. Discover luxury accommodation, world-class conference facilities, and exceptional dining."}
          </motion.p>

          <motion.div variants={fadeUp} className={styles.ctaGroup}>
            <Magnetic>
              <a href={heroKeys.cta1 || "#accommodation"} className={styles.buttonPrimary}>
                <span>Reserve Your Stay</span>
                <ArrowUpRight size={14} />
              </a>
            </Magnetic>
            <a href={heroKeys.cta2 || "#conference"} className={styles.buttonSecondary}>
              Explore Facilities
            </a>
          </motion.div>
        </motion.div>

        {/* Carousel Dots (vertical) */}
        <div className={styles.carouselControls}>
          <div className={styles.carouselDots}>
            {heroImages.map((_: any, i: number) => (
              <div
                key={`hero-dot-${i}`}
                className={`${styles.dot} ${currentSlide === i ? styles.activeDot : ""}`}
                onClick={() => setCurrentSlide(i)}
              />
            ))}
          </div>
          <button onClick={prevSlide} className={styles.carouselBtn}><ChevronLeft size={16} /></button>
          <button onClick={nextSlide} className={styles.carouselBtn}><ChevronRight size={16} /></button>
        </div>
      </section>

      {/* ── BOOKING BAR ── */}
      <div className={styles.bookingWrapper}>
        <div className={styles.bookingBar}>
          <div className={styles.bookingField}>
            <span className={styles.bookingLabel}>Check-in</span>
            <div className={styles.inputWithIcon}>
              <input
                type="date"
                className={styles.bookingInput}
                value={bookingData.checkIn}
                onChange={(e) => setBookingData({ ...bookingData, checkIn: e.target.value })}
              />
              <Calendar size={14} className={styles.inputIcon} />
            </div>
          </div>
          <div className={styles.bookingField}>
            <span className={styles.bookingLabel}>Check-out</span>
            <div className={styles.inputWithIcon}>
              <input
                type="date"
                className={styles.bookingInput}
                value={bookingData.checkOut}
                onChange={(e) => setBookingData({ ...bookingData, checkOut: e.target.value })}
              />
              <Calendar size={14} className={styles.inputIcon} />
            </div>
          </div>
          <div className={styles.bookingField}>
            <span className={styles.bookingLabel}>Guests</span>
            <select
              className={styles.bookingInput}
              value={bookingData.guests}
              onChange={(e) => setBookingData({ ...bookingData, guests: e.target.value })}
            >
              <option>2 Adults</option>
              <option>1 Adult</option>
              <option>3 Adults</option>
              <option>2 Adults, 1 Child</option>
            </select>
          </div>
          <div className={`${styles.bookingField} ${styles.priceRangeContainer}`}>
            <div className={styles.priceRangeHeader}>
              <span>Max Price</span>
              <span>{formatPrice(bookingData.maxPrice)}</span>
            </div>
            <input
              type="range"
              min="50"
              max="500"
              step="10"
              className={styles.rangeSlider}
              value={bookingData.maxPrice}
              onChange={(e) => setBookingData({ ...bookingData, maxPrice: parseInt(e.target.value) })}
            />
          </div>
          <button className={styles.bookingSubmit} onClick={handleBookingSubmit}>
            Check Availability
          </button>
        </div>
      </div>

      {/* ── ROOMS ── */}
      <section id="accommodation" className={styles.roomsSection}>
        <div className={styles.roomsIntro}>
          <motion.div
            className={styles.roomsIntroText}
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={stagger}
          >
            <motion.span variants={fadeUp} className={styles.badge}>{roomsKeys.badge || "Curated Living"}</motion.span>
            <motion.h2 variants={fadeUp} className={styles.roomsIntroTitle}>
              {roomsKeys.title || "Refined Accommodation"}
            </motion.h2>
          </motion.div>
          <motion.div
            className={styles.roomsIntroRight}
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={stagger}
          >
            <motion.p variants={fadeUp} className={styles.roomsIntroDesc}>
              {roomsKeys.desc || "Each room at Parkside Villa is a sanctuary — meticulously designed to blend contemporary elegance with the warmth of Kitui's cultural heritage."}
            </motion.p>
            <motion.a variants={fadeUp} href="/rooms" className={styles.buttonGhost}>
              View All Rooms <ArrowUpRight size={12} />
            </motion.a>
          </motion.div>
        </div>

        <div className={styles.roomGrid}>
          {rooms
            .filter((room: any) => {
              const price = typeof room.price === 'string' ? parseFloat(room.price.replace(/[^0-9.]/g, '')) : room.price;
              const matchesPrice = price <= bookingData.maxPrice;
              const matchesType = bookingData.roomType === "Any Room" || room.name.toLowerCase().includes(bookingData.roomType.toLowerCase());
              return matchesPrice && matchesType;
            })
            .slice(0, 4)
            .map((room: any, idx: number) => (
              <motion.div
                key={room.id}
                className={styles.roomCard}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.8, delay: idx * 0.1 }}
                onClick={() => router.push(`/rooms/${room.id}`)}
              >
                <Image
                  src={room.image} alt={room.name}
                  fill sizes="(max-width: 768px) 100vw, 50vw"
                  className={styles.roomImage}
                  style={{ objectFit: "cover" }}
                />
                {room.tag && <span className={styles.roomTag}>{room.tag}</span>}
                <div className={styles.roomInfo}>
                  <h3 className={styles.roomType}>{room.name}</h3>
                  <p className={styles.roomDesc}>{room.desc}</p>
                  <div className={styles.roomPrice}>
                    <span className={styles.roomPriceValue}>{formatPrice(room.price)} <small style={{ fontSize: '0.7em', opacity: 0.6, fontFamily: 'var(--font-sans)', letterSpacing: '0.1em' }}>/ NIGHT</small></span>
                    <button
                      className={styles.buttonPrimary}
                      style={{ padding: '0.6rem 1.25rem', fontSize: '0.5625rem' }}
                      onClick={(e) => { e.stopPropagation(); setSelectedRoom(room); setIsBookingModalOpen(true); }}
                    >
                      <span>Reserve</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
        </div>
      </section>

      {/* ── EXPERIENCE STATS STRIP ── */}
      <div className={styles.experienceStrip}>
        <div className={styles.experienceStripInner}>
          {[
            {
              num: content?.experience_stats?.stat1_num ?? "20",
              suffix: content?.experience_stats?.stat1_suffix ?? "+",
              label: content?.experience_stats?.stat1_label ?? "Years of Excellence"
            },
            {
              num: content?.experience_stats?.stat2_num ?? "4",
              suffix: content?.experience_stats?.stat2_suffix ?? "★",
              label: content?.experience_stats?.stat2_label ?? "Star Rating"
            },
            {
              num: content?.experience_stats?.stat3_num ?? "500",
              suffix: content?.experience_stats?.stat3_suffix ?? "+",
              label: content?.experience_stats?.stat3_label ?? "Events Hosted"
            },
            {
              num: content?.experience_stats?.stat4_num ?? "98",
              suffix: content?.experience_stats?.stat4_suffix ?? "%",
              label: content?.experience_stats?.stat4_label ?? "Guest Satisfaction"
            },
          ].map((stat, i) => (
            <motion.div
              key={`stat-${i}`}
              className={styles.experienceStat}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.1 }}
            >
              <span className={styles.experienceStatNum}>
                {stat.num}<span>{stat.suffix}</span>
              </span>
              <span className={styles.experienceStatLabel}>{stat.label}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── FACILITIES ── */}
      <section id="conference" className={styles.facilitiesSection}>
        <div className={styles.facilitiesLayout}>
          <motion.div
            className={styles.facilitiesIntro}
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={stagger}
          >
            <motion.span variants={fadeUp} className={styles.badge}>{facilitiesKeys.badge || "World-Class Services"}</motion.span>
            <motion.h2 variants={fadeUp} className={styles.facilitiesIntroTitle}>
              {facilitiesKeys.title || "Hotel Facilities"}
            </motion.h2>
            <motion.p variants={fadeUp} className={styles.facilitiesIntroDesc}>
              {facilitiesKeys.desc || "From cinematic conference halls to an immersive infinity pool, every experience at Parkside Villa is designed to exceed expectations."}
            </motion.p>
            <motion.a variants={fadeUp} href="/facilities" className={styles.buttonGhost}>
              Discover All <ArrowUpRight size={12} />
            </motion.a>
          </motion.div>

          <div className={styles.facilitiesGrid}>
            {facilities.map((facility: any, idx: number) => {
              const Icons: Record<string, any> = { Users, Utensils, Waves, Wine };
              const Icon = Icons[facility.icon] || Hotel;
              return (
                <motion.div
                  key={facility.id}
                  className={styles.facilityCard}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  onClick={() => router.push(`/facilities/${facility.id}`)}
                  style={{ cursor: "pointer" }}
                >
                  <span className={styles.facilityNum}>0{idx + 1}</span>
                  <div className={styles.facilityInfo}>
                    <h3 className={styles.facilityTitle}>{facility.title}</h3>
                    <p className={styles.facilityDesc}>{facility.desc}</p>
                  </div>
                  <Icon className={styles.facilityIcon} size={22} />
                  <ArrowUpRight className={styles.facilityArrow} size={18} />
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── BRAND QUOTE DIVIDER ── */}
      <div className={styles.brandQuote}>
        <p className={styles.brandQuoteText}>
          &ldquo;{content?.brand_quote?.text || "Luxury is the ease of supreme quality — in every detail, in every moment, in every interaction."}&rdquo;
        </p>
        <p className={styles.brandQuoteAttr}>{content?.brand_quote?.author || "— The Parkside Villa Philosophy"}</p>
      </div>

      {/* ── TESTIMONIALS ── */}
      <section className={styles.testimonialsSection}>
        <div className={styles.testimonialsInner}>
          <div className={styles.testimonialsHeader}>
            <motion.h2
              className={styles.testimonialsTitle}
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.8 }}
            >
              {content?.testimonials_intro?.title || <>What Our<br />Guests Say</>}
            </motion.h2>
            <motion.p
              className={styles.testimonialsSubtitle}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }}
            >
              {content?.testimonials_intro?.subtitle || "Real experiences from guests who have discovered the Parkside Villa difference."}
            </motion.p>
          </div>

          <div className={styles.testimonialsGrid}>
            {testimonials.map((testi: any, idx: number) => (
              <motion.div
                key={testi.id}
                className={styles.testimonialCard}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: idx * 0.15 }}
              >
                <span className={styles.quoteIcon}>&ldquo;</span>
                <p className={styles.testimonialText}>{testi.text}</p>
                <div className={styles.testimonialAuthor}>
                  <span className={styles.authorName}>{testi.name}</span>
                  <span className={styles.authorTitle}>{testi.title}</span>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            className={styles.reviewCTA}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <button onClick={() => setIsReviewModalOpen(true)} className={styles.buttonSecondary}>
              Write a Review
            </button>
          </motion.div>
        </div>
      </section>

      {/* ── REVIEW MODAL ── */}
      <AnimatePresence>
        {isReviewModalOpen && (
          <motion.div
            className={styles.modalOverlay}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsReviewModalOpen(false)}
          >
            <motion.div
              style={{ width: '100%', maxWidth: '600px', padding: '0 2rem' }}
              onClick={e => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <ReviewForm onClose={() => setIsReviewModalOpen(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── RECENTLY VIEWED ── */}
      {recentRooms.length > 0 && (
        <section className={styles.recentSection}>
          <div style={{ maxWidth: 'var(--max-width)', margin: '0 auto 2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <span className={styles.badge} style={{ marginBottom: '1rem', display: 'flex' }}>{content?.recent_rooms?.badge || "Your Interests"}</span>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 300, color: 'var(--ivory)', letterSpacing: '-0.02em' }}>{content?.recent_rooms?.title || "Continue Exploring"}</h2>
            </div>
            <a href="#accommodation" className={styles.buttonGhost}>View All Rooms <ArrowUpRight size={12} /></a>
          </div>
          <div className={styles.recentGrid}>
            {recentRooms.map((r: any) => (
              <Link href={`/rooms/${r.id}`} key={r.id} className={styles.recentItem}>
                <div className={styles.recentImgWrap}>
                  <Image src={r.image} alt={r.name} fill style={{ objectFit: "cover" }} />
                </div>
                <div className={styles.recentInfo}>
                  <span className={styles.recentName}>{r.name}</span>
                  <span className={styles.recentPrice}>{formatPrice(r.price)} / NIGHT</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── CONTACT ── */}
      <section id="contact" className={styles.contactSection}>
        <div className={styles.contactInner}>
          <motion.div
            className={styles.contactLeft}
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={stagger}
          >
            <motion.span variants={fadeUp} className={styles.badge}>{content?.contact_section?.badge || "Get In Touch"}</motion.span>
            <motion.h2 variants={fadeUp} className={styles.contactTitle}>
              {content?.contact_section?.title || <>Begin Your<br />Journey</>}
            </motion.h2>
            <motion.div variants={fadeUp} className={styles.contactDetails}>
              {[
                { label: "Address", icon: MapPin, text: contactInfo.address },
                { label: "Phone", icon: Phone, text: contactInfo.phone, link: `tel:${contactInfo.phone}` },
                { label: "Email", icon: Mail, text: contactInfo.email, link: `mailto:${contactInfo.email}` },
                { label: "Hours", icon: Calendar, text: content?.contact_section?.hours || "Reception 24/7 · Dining 06:00–23:00" },
              ].map((item: any, i: number) => (
                <div key={`contact-item-${i}`} className={styles.contactItem}>
                  <span className={styles.contactLabel}>{item.label}</span>
                  <span className={styles.contactText}>
                    {item.link
                      ? <a href={item.link} style={{ color: 'var(--secondary)' }}>{item.text}</a>
                      : item.text
                    }
                  </span>
                </div>
              ))}
            </motion.div>

            <motion.div variants={fadeUp} style={{ display: 'flex', gap: '1.5rem', paddingTop: '1rem' }}>
              {contactInfo.social?.facebook && <a href={contactInfo.social.facebook} target="_blank" rel="noreferrer" style={{ color: 'var(--text-muted)' }}><Facebook size={18} /></a>}
              {contactInfo.social?.instagram && <a href={contactInfo.social.instagram} target="_blank" rel="noreferrer" style={{ color: 'var(--text-muted)' }}><Instagram size={18} /></a>}
              {contactInfo.social?.linkedin && <a href={contactInfo.social.linkedin} target="_blank" rel="noreferrer" style={{ color: 'var(--text-muted)' }}><Linkedin size={18} /></a>}
            </motion.div>
          </motion.div>

          <motion.form
            className={styles.contactForm}
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={stagger}
            onSubmit={async (e) => {
              e.preventDefault();
              setContactStatus("Sending...");
              const fd = new FormData(e.currentTarget as HTMLFormElement);
              await addLead({
                name: (fd.get("name") as string) || "",
                email: (fd.get("email") as string) || "",
                phone: "N/A",
                date: "N/A",
                room: "General Inquiry",
                guests: (fd.get("message") as string) || "",
              });
              setContactStatus("Message sent!");
              (e.target as HTMLFormElement).reset();
              setTimeout(() => setContactStatus(""), 4000);
            }}
          >
            {[
              { name: "name", label: "Full Name", type: "text", placeholder: "Your name" },
              { name: "email", label: "Email Address", type: "email", placeholder: "your@email.com" },
            ].map(f => (
              <motion.div key={`form-group-${f.name}`} variants={fadeUp} className={styles.formGroup}>
                <label className={styles.formLabel}>{f.label}</label>
                <input name={f.name} type={f.type} className={styles.input} placeholder={f.placeholder} required />
              </motion.div>
            ))}
            <motion.div variants={fadeUp} className={styles.formGroup}>
              <label className={styles.formLabel}>Message</label>
              <textarea name="message" className={`${styles.input} ${styles.textarea}`} placeholder={content?.contact_section?.form_placeholder || "How can we assist you?"} required />
            </motion.div>
            <motion.div variants={fadeUp}>
              <Magnetic>
                <button type="submit" className={styles.buttonPrimary} disabled={!!contactStatus}>
                  <span>{contactStatus || "Send Enquiry"}</span>
                  {!contactStatus && <ArrowUpRight size={14} />}
                </button>
              </Magnetic>
            </motion.div>
          </motion.form>
        </div>
      </section>


      {/* ── BOOKING MODAL ── */}
      <AnimatePresence>
        {isBookingModalOpen && selectedRoom && (
          <motion.div
            className={styles.modalOverlay}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => { setIsBookingModalOpen(false); setBookingStep(1); }}
          >
            <motion.div
              className={styles.modalContent}
              initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              onClick={e => e.stopPropagation()}
            >
              <button className={styles.closeModal} onClick={() => { setIsBookingModalOpen(false); setBookingStep(1); }}>&times;</button>

              {/* Progress */}
              <div style={{ display: 'flex', gap: '4px', marginBottom: '2rem' }}>
                <div style={{ flex: 1, height: '2px', background: bookingStep >= 1 ? 'var(--secondary)' : 'var(--border-dark)' }} />
                <div style={{ flex: 1, height: '2px', background: bookingStep >= 2 ? 'var(--secondary)' : 'var(--border-dark)' }} />
                <div style={{ flex: 1, height: '2px', background: bookingStep >= 3 ? 'var(--secondary)' : 'var(--border-dark)' }} />
              </div>

              <span className={styles.badge} style={{ marginBottom: '1rem', display: 'flex' }}>
                Step {bookingStep} of 3
              </span>
              <h3 className={styles.modalTitle}>{selectedRoom.name}</h3>
              <p className={styles.modalSubtitle}>{formatPrice(selectedRoom.price)} · PER NIGHT</p>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (bookingStep === 1) { setBookingStep(2); return; }
                  if (bookingStep === 2) { setBookingStep(3); setPaymentStep("method"); return; }

                  if (bookingStep === 3) {
                    if (paymentStep === "method") {
                      if (bookingData.paymentMethod === "mpesa") {
                        setPaymentStep("mpesa");
                        setMpesaTimer(10); // 10 second wait for STK push
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
                    setBookingStatus("Finalizing Booking...");
                    await addLead({
                      name: bookingData.name, email: bookingData.email,
                      phone: bookingData.phone,
                      date: `${bookingData.checkIn} to ${bookingData.checkOut}`,
                      room: selectedRoom.name, guests: bookingData.guests,
                    });
                    setBookingStatus("Reservation Confirmed!");
                    setTimeout(() => {
                      setBookingStatus(""); setIsBookingModalOpen(false); setBookingStep(1); setPaymentStep(null);
                      setBookingData({ name: "", email: "", phone: "", checkIn: "", checkOut: "", guests: "2 Adults", roomType: "Any Room", maxPrice: 400, paymentMethod: "", mpesaPhone: "" });
                    }, 2500);
                  }
                }}
              >
                <AnimatePresence>
                  {bookingStep === 1 && (
                    <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        {[
                          { label: "CHECK IN", name: "checkIn", type: "date", value: bookingData.checkIn, onChange: (v: string) => setBookingData({ ...bookingData, checkIn: v }) },
                          { label: "CHECK OUT", name: "checkOut", type: "date", value: bookingData.checkOut, onChange: (v: string) => setBookingData({ ...bookingData, checkOut: v }) },
                        ].map(f => (
                          <div key={`booking-step1-${f.name}`} className={styles.formGroup}>
                            <label className={styles.formLabel}>{f.label}</label>
                            <div className={styles.inputWithIcon}>
                              <input type={f.type} required value={f.value} onChange={e => f.onChange(e.target.value)} className={styles.input} />
                              {f.type === 'date' && <Calendar size={14} className={styles.inputIcon} />}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>GUESTS</label>
                        <select value={bookingData.guests} onChange={e => setBookingData({ ...bookingData, guests: e.target.value })} className={styles.input} style={{ appearance: 'none' }}>
                          <option>1 Adult</option>
                          <option>2 Adults</option>
                          <option>2 Adults, 1 Child</option>
                          <option>2 Adults, 2 Children</option>
                          <option>Family (4+)</option>
                        </select>
                      </div>
                      <Magnetic>
                        <button type="submit" className={styles.buttonPrimary} style={{ width: '100%' }}>
                          <span>Continue</span> <ArrowUpRight size={14} />
                        </button>
                      </Magnetic>
                    </motion.div>
                  )}

                  {bookingStep === 2 && (
                    <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      {[
                        { label: "FULL NAME", name: "name", type: "text", placeholder: "Your full name", value: bookingData.name, onChange: (v: string) => setBookingData({ ...bookingData, name: v }) },
                        { label: "EMAIL ADDRESS", name: "email", type: "email", placeholder: "your@email.com", value: bookingData.email, onChange: (v: string) => setBookingData({ ...bookingData, email: v }) },
                        { label: "PHONE NUMBER", name: "phone", type: "tel", placeholder: "+254 700 000 000", value: bookingData.phone, onChange: (v: string) => setBookingData({ ...bookingData, phone: v }) },
                      ].map(f => (
                        <div key={`booking-step2-${f.name}`} className={styles.formGroup}>
                          <label className={styles.formLabel}>{f.label}</label>
                          <input type={f.type} required placeholder={f.placeholder} value={f.value} onChange={e => f.onChange(e.target.value)} className={styles.input} />
                        </div>
                      ))}
                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <button type="button" onClick={() => setBookingStep(1)} className={styles.buttonSecondary}>Back</button>
                        <Magnetic>
                          <button type="submit" className={styles.buttonPrimary} style={{ flex: 2 }}>
                            <span>Continue to Payment</span> <ArrowUpRight size={14} />
                          </button>
                        </Magnetic>
                      </div>
                    </motion.div>
                  )}

                  {bookingStep === 3 && (
                    <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      {paymentStep === "method" && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                          <p className={styles.formLabel} style={{ marginBottom: '-0.5rem' }}>SELECT PAYMENT METHOD</p>
                          <div
                            onClick={() => setBookingData({ ...bookingData, paymentMethod: 'mpesa' })}
                            className={`${styles.paymentOption} ${bookingData.paymentMethod === 'mpesa' ? styles.paymentOptionActive : ''}`}
                          >
                            <Smartphone size={20} />
                            <div style={{ flex: 1 }}>
                              <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>M-Pesa STK Push</p>
                              <p style={{ fontSize: '0.625rem', opacity: 0.6 }}>Instant payment via your Safaricom line</p>
                            </div>
                            {bookingData.paymentMethod === 'mpesa' && <Check size={16} color="var(--secondary)" />}
                          </div>

                          <div
                            onClick={() => setBookingData({ ...bookingData, paymentMethod: 'card' })}
                            className={`${styles.paymentOption} ${bookingData.paymentMethod === 'card' ? styles.paymentOptionActive : ''}`}
                          >
                            <CreditCard size={20} />
                            <div style={{ flex: 1 }}>
                              <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>Credit/Debit Card</p>
                              <p style={{ fontSize: '0.625rem', opacity: 0.6 }}>Visa, Mastercard, & American Express</p>
                            </div>
                            {bookingData.paymentMethod === 'card' && <Check size={16} color="var(--secondary)" />}
                          </div>

                          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <button type="button" onClick={() => { setBookingStep(2); setPaymentStep(null); }} className={styles.buttonSecondary}>Back</button>
                            <button type="submit" disabled={!bookingData.paymentMethod} className={styles.buttonPrimary} style={{ flex: 2 }}>
                              <span>Proceed to Pay</span> <ArrowUpRight size={14} />
                            </button>
                          </div>
                        </div>
                      )}

                      {paymentStep === "mpesa" && (
                        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                          <div style={{ marginBottom: '1.5rem', position: 'relative', display: 'inline-block' }}>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                              style={{ width: '64px', height: '64px', border: '2px solid rgba(201,168,76,0.2)', borderTop: '2px solid var(--secondary)', borderRadius: '50%' }}
                            />
                            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 600, color: 'var(--secondary)' }}>
                              {mpesaTimer}s
                            </div>
                          </div>
                          <h4 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Requesting Payment...</h4>
                          <p style={{ fontSize: '0.75rem', opacity: 0.7, maxWidth: '240px', margin: '0 auto' }}>
                            An STK push has been sent to your phone. Please enter your M-Pesa PIN to complete.
                          </p>
                          <button type="button" onClick={() => setPaymentStep("method")} className={styles.buttonSecondary} style={{ marginTop: '2rem' }}>Cancel</button>
                        </div>
                      )}

                      {paymentStep === "card" && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                          <div className={styles.formGroup}>
                            <label className={styles.formLabel}>CARD NUMBER</label>
                            <div style={{ position: 'relative' }}>
                              <input type="text" placeholder="**** **** **** 4242" className={styles.input} required />
                              <CreditCard size={14} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                            </div>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className={styles.formGroup}>
                              <label className={styles.formLabel}>EXPIRY</label>
                              <input type="text" placeholder="MM/YY" className={styles.input} required />
                            </div>
                            <div className={styles.formGroup}>
                              <label className={styles.formLabel}>CVV</label>
                              <div style={{ position: 'relative' }}>
                                <input type="password" placeholder="***" className={styles.input} required />
                                <Shield size={14} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                              </div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <button type="button" onClick={() => setPaymentStep("method")} className={styles.buttonSecondary}>Back</button>
                            <button type="submit" disabled={!!bookingStatus} className={styles.buttonPrimary} style={{ flex: 2 }}>
                              <Loader2 size={14} style={{ display: bookingStatus ? 'inline-block' : 'none', marginRight: '0.5rem' }} className={styles.spin} />
                              <span>{bookingStatus || `Pay ${formatPrice(selectedRoom.price)}`}</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {paymentStep === "success" && (
                        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                          <motion.div
                            initial={{ scale: 0 }} animate={{ scale: 1 }}
                            style={{ width: '64px', height: '64px', background: 'rgba(201,168,76,0.1)', border: '1px solid var(--secondary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'var(--secondary)' }}
                          >
                            <Check size={32} />
                          </motion.div>
                          <h4 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Payment Successful</h4>
                          <p style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                            Your transaction has been processed securely. We are finalizing your reservation now.
                          </p>
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

      {/* ── AI CONCIERGE ── */}
      <AnimatePresence>
        {isConciergeOpen && (
          <motion.div
            className={styles.conciergeOverlay}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className={styles.conciergeHeader}>
              <div className={styles.aiAvatar}>
                <span>Villa Concierge</span>
                <span className={styles.aiAvatarLabel}>● Online · Always Available</span>
              </div>
              <button className={styles.closeBtn} onClick={() => setIsConciergeOpen(false)}>&times;</button>
            </div>
            <div className={styles.conciergeBody}>
              <div className={styles.aiMessage}>
                {conciergeStep === 0 && (content.concierge_messages?.welcome || "Welcome to Parkside Villa. I'm your personal digital concierge. How may I assist you today?")}
                {conciergeStep === 1 && (content.concierge_messages?.rooms || "Our rooms range from the Deluxe Garden Room to the Presidential Executive Suite. Each is a sanctuary of comfort.")}
                {conciergeStep === 2 && (content.concierge_messages?.dining || "Our kitchen is led by experienced chefs offering both local Kenyan cuisine and international favorites. Available from 06:00 to 23:00.")}
              </div>
              <div className={styles.conciergeOptions}>
                {conciergeStep === 0 && (<>
                  <button className={styles.optionBtn} onClick={() => setConciergeStep(1)}>Book a Room</button>
                  <button className={styles.optionBtn} onClick={() => setConciergeStep(2)}>Dining & Restaurant</button>
                  <button className={styles.optionBtn} onClick={() => window.open(`https://wa.me/${contactInfo.whatsapp}`, "_blank")}>Chat on WhatsApp</button>
                </>)}
                {conciergeStep === 1 && (<>
                  <button className={styles.optionBtn} onClick={() => { document.getElementById("accommodation")?.scrollIntoView({ behavior: "smooth" }); setIsConciergeOpen(false); }}>Browse Rooms</button>
                  <button className={styles.optionBtn} onClick={() => setConciergeStep(0)}>← Back</button>
                </>)}
                {conciergeStep === 2 && (<>
                  <button className={styles.optionBtn} onClick={() => { router.push("/dining"); setIsConciergeOpen(false); }}>View Full Menu</button>
                  <button className={styles.optionBtn} onClick={() => setConciergeStep(0)}>← Back</button>
                </>)}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
        className={styles.conciergeBtn}
        onClick={() => { setIsConciergeOpen(!isConciergeOpen); setConciergeStep(0); }}
        title="Open Virtual Concierge"
      >
        <MessageSquare size={22} />
      </motion.button>
    </main>
  );
}
