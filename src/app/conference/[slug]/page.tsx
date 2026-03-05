export const dynamic = "force-dynamic";

import { getConferenceHallBySlug, getSiteData, getConferenceHalls } from "../../actions";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import SafeImage from "../../components/SafeImage";
import Link from "next/link";
import { Users, CheckCircle2, ChevronLeft, Send, MessageCircle } from "lucide-react";
import styles from "../conference.module.css";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const hall = await getConferenceHallBySlug(slug);
    if (!hall) return { title: "Conference Hall Not Found | Parkside Villa Kitui" };
    return {
        title: `${hall.name} | Conference at Parkside Villa Kitui`,
        description: hall.desc,
        openGraph: { title: hall.name, description: hall.desc, images: hall.image ? [hall.image] : [] },
    };
}

export default async function ConferenceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const [hall, data] = await Promise.all([
        getConferenceHallBySlug(slug),
        getSiteData()
    ]);
    if (!hall) notFound();

    const contactInfo = data.contactInfo;
    const allImages = [hall.image, ...((hall.images as string[]) || [])].filter(Boolean);

    return (
        <div className={styles.pageWrapper}>
            {/* Hero with main image */}
            <section className={styles.detailHero}>
                {hall.image ? (
                    <SafeImage
                        src={hall.image}
                        alt={hall.name}
                        fill
                        priority
                        quality={80}
                        className={styles.heroImage}
                        style={{ objectFit: 'cover' }}
                        fallbackText={hall.name}
                    />
                ) : null}
                <div className={styles.heroOverlay} />
                <div className={styles.heroContent}>
                    <Link href="/conference" className={styles.backLink}>
                        <ChevronLeft size={18} /> All Conference Halls
                    </Link>
                    <h1 className={styles.title}>{hall.name}</h1>
                    <div className={styles.heroBadges}>
                        <span className={styles.capacityBadge}><Users size={14} /> {hall.capacity} guests</span>
                    </div>
                </div>
            </section>

            {/* Mosaic Gallery */}
            <section className={styles.gallerySection}>
                <div className={styles.container}>
                    <div className={styles.mosaicGallery}>
                        {/* Main Large Image (Index 0) */}
                        <div className={styles.mosaicItem}>
                            <SafeImage
                                src={allImages[0]}
                                alt={`${hall.name} - Featured`}
                                fill
                                priority
                                sizes="(max-width: 768px) 100vw, 50vw"
                                className={styles.galleryImage}
                                style={{ objectFit: 'cover' }}
                                fallbackText="Venue highlights"
                            />
                        </div>

                        {/* Secondary Images (Index 1-4) */}
                        {allImages.slice(1, 5).map((img, idx) => (
                            <div key={idx} className={styles.mosaicItem}>
                                <SafeImage
                                    src={img}
                                    alt={`${hall.name} - View ${idx + 2}`}
                                    fill
                                    sizes="(max-width: 768px) 50vw, 25vw"
                                    className={styles.galleryImage}
                                    style={{ objectFit: 'cover' }}
                                    fallbackText="Meeting space"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Content */}
            <section className={styles.detailContent}>
                <div className={styles.container}>
                    <div className={styles.detailGrid}>
                        <div className={styles.mainColumn}>
                            <h2 className={styles.sectionHeading}>About {hall.name}</h2>
                            <p className={styles.detailDesc}>{hall.desc}</p>

                            {hall.setups && (hall.setups as string[]).length > 0 && (
                                <div className={styles.setupSection}>
                                    <h3 className={styles.subHeading}>Available Setups</h3>
                                    <div className={styles.setupGrid}>
                                        {(hall.setups as string[]).map((setup: string, i: number) => (
                                            <div key={i} className={styles.setupCard}>
                                                <CheckCircle2 size={18} className={styles.checkIcon} />
                                                <span>{setup}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className={styles.sideColumn}>
                            <div className={styles.inquiryCard}>
                                <h3 className={styles.inquiryTitle}>Book This Venue</h3>
                                <p className={styles.inquiryDesc}>Contact our events team for availability and corporate packages.</p>
                                <div className={styles.inquiryActions}>
                                    <a
                                        href={`https://wa.me/${contactInfo?.whatsapp || '254700000000'}?text=${encodeURIComponent(`Hello, I'd like to inquire about booking ${hall.name} at Parkside Villa.`)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={styles.primaryBtn}
                                    >
                                        <MessageCircle size={18} /> WhatsApp Us
                                    </a>
                                    <a href={`mailto:${contactInfo?.email || 'concierge@parksidevillakitui.com'}?subject=Inquiry: ${hall.name}`} className={styles.secondaryBtn}>
                                        <Send size={18} /> Email Inquiry
                                    </a>
                                </div>
                                <div className={styles.capacityInfo}>
                                    <Users size={16} />
                                    <span>Up to <strong>{hall.capacity}</strong> guests</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
