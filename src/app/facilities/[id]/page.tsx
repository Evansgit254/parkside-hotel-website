"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSiteData, addLead, getConferenceHalls } from "../../actions";
import styles from "../[id]/facility-detail.module.css";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Users, Utensils, Waves, Wine, Hotel, CheckCircle2, ShieldCheck, X, Send, MessageCircle } from "lucide-react";
import Link from "next/link";

export default function FacilityDetail() {
    const params = useParams();
    const router = useRouter();
    const [facility, setFacility] = useState<any>(null);
    const [conferenceHalls, setConferenceHalls] = useState<any[]>([]);
    const [contactInfo, setContactInfo] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showInquiryForm, setShowInquiryForm] = useState(false);
    const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "" });
    const [isSending, setIsSending] = useState(false);
    const [sent, setSent] = useState(false);

    useEffect(() => {
        if (!params?.id) return;

        Promise.all([
            getSiteData(),
            params.id === 'conference' ? getConferenceHalls() : Promise.resolve([])
        ]).then(([data, halls]) => {
            const found = data.facilities.find((f: any) => f.id === params.id);
            if (found) {
                setFacility(found);
            } else {
                router.push("/");
            }
            setContactInfo(data.contactInfo || null);
            if (params.id === 'conference') {
                setConferenceHalls(halls);
            }
            setLoading(false);
        });
    }, [params?.id, router]);

    const handleInquirySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSending(true);
        try {
            await addLead({
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                date: "Inquiry",
                room: facility.title,
                guests: formData.message || "General Inquiry",
            });
            setSent(true);
            setTimeout(() => {
                setShowInquiryForm(false);
                setSent(false);
                setFormData({ name: "", email: "", phone: "", message: "" });
            }, 3000);
        } catch (err) {
            alert("Failed to send inquiry. Please try again.");
        } finally {
            setIsSending(false);
        }
    };

    if (loading) return <div className={styles.loading}>Curating Excellence...</div>;
    if (!facility) return null;

    const Icons: Record<string, any> = { Users, Utensils, Waves, Wine, Hotel };
    const IconComponent = Icons[facility.icon] || Hotel;

    return (
        <div className={styles.pageWrapper}>
            {/* Inquiry Modal */}
            <AnimatePresence>
                {showInquiryForm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
                        onClick={e => { if (e.target === e.currentTarget) setShowInquiryForm(false); }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            style={{ background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '24px', padding: '3rem', width: '100%', maxWidth: '520px', position: 'relative' }}
                        >
                            <button
                                onClick={() => setShowInquiryForm(false)}
                                style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'rgba(0,0,0,0.05)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#6B7280' }}
                            >
                                <X size={18} />
                            </button>

                            {sent ? (
                                <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                                    <CheckCircle2 size={64} color="#10b981" style={{ margin: '0 auto 1.5rem' }} />
                                    <h3 style={{ fontFamily: 'var(--font-outfit)', fontSize: '1.75rem', fontWeight: 800, marginBottom: '1rem' }}>Inquiry Sent!</h3>
                                    <p style={{ color: '#6B7280' }}>Our team will be in touch with you shortly.</p>
                                </div>
                            ) : (
                                <>
                                    <h3 style={{ fontFamily: 'var(--font-outfit)', fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>Send Inquiry</h3>
                                    <p style={{ color: '#6B7280', marginBottom: '2rem' }}>Inquiring about: <strong style={{ color: 'var(--secondary)' }}>{facility.title}</strong></p>

                                    <form onSubmit={handleInquirySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                        <input
                                            required
                                            placeholder="Your Full Name"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            style={{ padding: '1rem 1.25rem', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '12px', color: '#111827', fontSize: '1rem', fontFamily: 'var(--font-sans)', outline: 'none' }}
                                        />
                                        <input
                                            required
                                            type="email"
                                            placeholder="Email Address"
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            style={{ padding: '1rem 1.25rem', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '12px', color: '#111827', fontSize: '1rem', fontFamily: 'var(--font-sans)', outline: 'none' }}
                                        />
                                        <input
                                            placeholder="Phone Number (optional)"
                                            value={formData.phone}
                                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                            style={{ padding: '1rem 1.25rem', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '12px', color: '#111827', fontSize: '1rem', fontFamily: 'var(--font-sans)', outline: 'none' }}
                                        />
                                        <textarea
                                            placeholder="Your message or requirements..."
                                            value={formData.message}
                                            onChange={e => setFormData({ ...formData, message: e.target.value })}
                                            rows={3}
                                            style={{ padding: '1rem 1.25rem', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '12px', color: '#111827', fontSize: '1rem', fontFamily: 'var(--font-sans)', outline: 'none', resize: 'vertical' }}
                                        />
                                        <button
                                            type="submit"
                                            disabled={isSending}
                                            style={{ padding: '1rem', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 800, fontSize: '1rem', cursor: isSending ? 'not-allowed' : 'pointer', opacity: isSending ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'center' }}
                                        >
                                            <Send size={18} />
                                            {isSending ? "Sending..." : "Send Inquiry"}
                                        </button>
                                    </form>
                                </>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Split Hero Section */}
            <section className={styles.hero}>
                <div className={styles.heroContent}>
                    <div className={styles.container}>
                        <Link href="/facilities" className={styles.backLink}>
                            <ChevronLeft size={20} /> Back to Facilities
                        </Link>

                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <div className={styles.iconWrapper}>
                                <IconComponent size={32} />
                            </div>
                            <h1 className={styles.title}>{facility.title}</h1>
                            <p className={styles.tagline}>Premier {facility.title.toLowerCase()} experience in Kitui</p>
                        </motion.div>
                    </div>
                </div>
                <div className={styles.heroImage} style={{ backgroundImage: `url(${facility.image})` }}>
                    <div className={styles.heroOverlay} />
                </div>
            </section>

            {/* Information Grid */}
            <section className={styles.infoSection}>
                <div className={styles.container}>
                    <div className={styles.grid}>
                        <div className={styles.mainContent}>
                            <div className={styles.descCard}>
                                <h2 className={styles.sectionHeading}>About this Facility</h2>
                                <p className={styles.description}>{facility.desc}</p>

                                {Array.isArray(facility.features) && facility.features.length > 0 && (
                                    <div className={styles.featuresGrid}>
                                        {facility.features.map((feature: string, i: number) => (
                                            <div key={i} className={styles.featureBox} id={feature.toLowerCase().replace(/[^a-z0-9]+/g, '-')}>
                                                <ShieldCheck size={24} className={styles.featureIcon} />
                                                <span className={styles.featureTitle}>{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {Array.isArray(facility.highlights) && facility.highlights.length > 0 && (
                                <div className={styles.detailsCard}>
                                    <h3 className={styles.subHeading}>Service Highlights</h3>
                                    <div className={styles.highlightsList}>
                                        {facility.highlights.map((item: string, i: number) => (
                                            <div key={i} className={styles.highlightItem} id={item.toLowerCase().replace(/[^a-z0-9]+/g, '-')}>
                                                <CheckCircle2 size={18} className={styles.checkIcon} />
                                                <span>{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {params?.id === 'conference' && conferenceHalls && conferenceHalls.length > 0 && (
                                <div style={{ marginTop: '3rem' }}>
                                    <h3 className={styles.subHeading} style={{ marginBottom: '1.5rem', fontSize: '1.75rem', color: '#111827' }}>Available Halls</h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                                        {conferenceHalls.map((hall) => (
                                            <div key={hall.id} style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column' }}>
                                                <div style={{ height: '220px', background: '#f0f0f0', position: 'relative' }}>
                                                    {hall.image && <img src={hall.image} alt={hall.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                                                    <div style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(255,255,255,0.95)', padding: '0.4rem 0.75rem', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--primary)', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                                                        <Users size={14} /> {hall.capacity} pax
                                                    </div>
                                                </div>
                                                <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                                    <h4 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-serif)', color: '#111827', marginBottom: '0.75rem', fontWeight: 700 }}>{hall.name}</h4>
                                                    <p style={{ fontSize: '0.875rem', color: '#6B7280', lineHeight: 1.6, marginBottom: '1.5rem', flex: 1 }}>{hall.desc}</p>
                                                    {hall.setups && hall.setups.length > 0 && (
                                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: 'auto' }}>
                                                            {hall.setups.map((setup: string, i: number) => (
                                                                <span key={i} style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0.3rem 0.6rem', background: 'rgba(20, 75, 54, 0.05)', color: 'var(--primary)', borderRadius: '4px', fontWeight: 600 }}>{setup}</span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className={styles.sidebar}>
                            <div className={styles.actionCard}>
                                <h3 className={styles.actionTitle}>Inquire Now</h3>
                                <p className={styles.actionDesc}>Contact our executive team for bookings and corporate arrangements.</p>

                                <div className={styles.contactButtons}>
                                    <button
                                        className={styles.primaryBtn}
                                        onClick={() => setShowInquiryForm(true)}
                                    >
                                        <Send size={18} style={{ display: 'inline', marginRight: '0.5rem' }} />
                                        Send Inquiry
                                    </button>
                                    <button
                                        className={styles.secondaryBtn}
                                        onClick={() => {
                                            const msg = `Hello, I would like to inquire about the ${facility.title} at Parkside Villa.`;
                                            const phone = contactInfo?.whatsapp || '254700000000';
                                            window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
                                        }}
                                    >
                                        <MessageCircle size={18} style={{ display: 'inline', marginRight: '0.5rem' }} />
                                        WhatsApp Us
                                    </button>
                                </div>

                                <div className={styles.statusIndicator}>
                                    <div className={styles.pulse} />
                                    <span>Available Today</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
