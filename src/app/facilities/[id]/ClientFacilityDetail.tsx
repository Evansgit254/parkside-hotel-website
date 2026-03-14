"use client";

import { CheckCircle2, MapPin, Users, Calendar, ChevronLeft, X, ArrowUpRight, Send, Mail, Phone, Check } from "lucide-react";
import Link from "next/link";
import styles from "./facility-detail.module.css";
import EnhancedGallery from "../../components/EnhancedGallery";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { addLead } from "../../actions";

export default function ClientFacilityDetail({ facility }: { facility: any }) {
    const Icons: Record<string, any> = { Users, MapPin, Calendar };
    const allImages = [facility.image, ...((facility.images as string[]) || [])].filter(Boolean);
    const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
    const [inquiryStatus, setInquiryStatus] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInquirySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setInquiryStatus("Sending...");
        const fd = new FormData(e.currentTarget);
        try {
            await addLead({
                name: (fd.get("name") as string) || "",
                email: (fd.get("email") as string) || "",
                phone: (fd.get("phone") as string) || "N/A",
                date: "N/A",
                room: `Inquiry: ${facility.title}`,
                guests: (fd.get("message") as string) || "",
            });
            setInquiryStatus("Message sent!");
            setTimeout(() => {
                setIsInquiryModalOpen(false);
                setInquiryStatus("");
            }, 3000);
        } catch (err) {
            setInquiryStatus("Error sending message");
            setTimeout(() => setInquiryStatus(""), 3000);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.pageWrapper}>
            {/* Hero Section */}
            <section className={styles.hero}>
                <Image
                    src={facility.image && facility.image.trim() !== "" ? facility.image : "/hero-assets/pool_wide.webp"}
                    alt={facility.title || "Facility Detail"}
                    fill
                    priority
                    className={styles.heroImage}
                    style={{ objectFit: 'cover' }}
                />
                <div className={styles.heroOverlay} />
                <div className={styles.container}>
                    <Link href="/facilities" className={styles.backLink}>
                        <ChevronLeft size={20} /> Back to Facilities
                    </Link>
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className={styles.heroContent}
                    >
                        <h1 className={styles.title}>{facility.title}</h1>
                    </motion.div>
                </div>
            </section>

            {/* Enhanced Gallery Section */}
            <EnhancedGallery images={allImages} title={facility.title} />

            {/* Content Section */}
            <section className={styles.infoSection}>
                <div className={styles.container}>
                    <div className={styles.grid}>
                        <div className={styles.mainInfo}>
                            <div className={styles.descCard}>
                                <h2 className={styles.sectionHeading}>Overview</h2>
                                <p className={styles.description}>{facility.desc}</p>
                            </div>

                            <div className={styles.featuresGrid}>
                                {facility.features?.map((feature: string, idx: number) => (
                                    <div key={idx} className={styles.featureBox}>
                                        <CheckCircle2 size={24} className={styles.featureIcon} />
                                        <span className={styles.featureTitle}>{feature}</span>
                                    </div>
                                ))}
                            </div>

                            {facility.highlights && facility.highlights.length > 0 && (
                                <div className={styles.detailsCard} style={{ marginTop: '4rem' }}>
                                    <h3 className={styles.subHeading}>Service Highlights</h3>
                                    <div className={styles.highlightsList}>
                                        {facility.highlights.map((highlight: string, idx: number) => (
                                            <div key={idx} className={styles.highlightItem}>
                                                <div className={styles.checkIcon}>
                                                    <CheckCircle2 size={18} />
                                                </div>
                                                <span>{highlight}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <aside className={styles.sidebar}>
                            <div className={styles.actionCard}>
                                <h3 className={styles.actionTitle}>Experience {facility.title}</h3>
                                <p className={styles.actionDesc}>Inquire about our premium services or book your exclusive experience.</p>
                                <div className={styles.contactButtons}>
                                    <button onClick={() => setIsInquiryModalOpen(true)} className={styles.primaryBtn}>Send Inquiry</button>
                                    <Link href="/#contact" className={styles.secondaryBtn} style={{ textAlign: 'center', textDecoration: 'none' }}>Contact Us</Link>
                                </div>
                                <div className={styles.statusIndicator}>
                                    <div className={styles.pulse} />
                                    <span>Reception available 24/7</span>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </section>

            {/* Inquiry Modal */}
            <AnimatePresence>
                {isInquiryModalOpen && (
                    <motion.div
                        className={styles.modalOverlay}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsInquiryModalOpen(false)}
                    >
                        <motion.div
                            className={styles.modalContent}
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <button className={styles.closeModal} onClick={() => setIsInquiryModalOpen(false)}>&times;</button>

                            {inquiryStatus === "Message sent!" ? (
                                <div className={styles.successState}>
                                    <div className={styles.successIcon}>
                                        <Check size={32} />
                                    </div>
                                    <h3 className={styles.modalTitle}>Inquiry Sent</h3>
                                    <p className={styles.modalSubtitle}>Thank you for your interest. Our team will get back to you shortly.</p>
                                    <button onClick={() => setIsInquiryModalOpen(false)} className={styles.primaryBtn} style={{ width: '100%' }}>Close</button>
                                </div>
                            ) : (
                                <>
                                    <h3 className={styles.modalTitle}>Inquire: {facility.title}</h3>
                                    <p className={styles.modalSubtitle}>Tell us about your requirements and we'll craft the perfect experience for you.</p>

                                    <form onSubmit={handleInquirySubmit} className={styles.form}>
                                        <div className={styles.formGrid}>
                                            <div className={styles.formGroup}>
                                                <label className={styles.formLabel}>Full Name</label>
                                                <input type="text" name="name" required className={styles.input} placeholder="John Doe" />
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label className={styles.formLabel}>Phone Number</label>
                                                <input type="tel" name="phone" required className={styles.input} placeholder="+254..." />
                                            </div>
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label className={styles.formLabel}>Email Address</label>
                                            <input type="email" name="email" required className={styles.input} placeholder="john@example.com" />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label className={styles.formLabel}>Your Message</label>
                                            <textarea name="message" required className={`${styles.input} ${styles.textarea}`} placeholder="How can we help you today?" />
                                        </div>
                                        <button type="submit" disabled={isSubmitting} className={styles.primaryBtn}>
                                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                                                {isSubmitting ? "Sending..." : <>Send Inquiry <Send size={18} /></>}
                                            </span>
                                        </button>
                                    </form>
                                </>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
