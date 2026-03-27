export const dynamic = "force-dynamic";

import { getDiningVenueBySlug, getSiteData } from "../../actions";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import SafeImage from "../../components/SafeImage";
import Link from "next/link";
import { CheckCircle2, ChevronLeft, Clock, Send, MessageCircle } from "lucide-react";
import styles from "../../conference/conference.module.css";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const venue = await getDiningVenueBySlug(slug);
    if (!venue) return { title: "Dining Venue Not Found | Parkside Villa Kitui" };
    return {
        title: `${venue.name} | Dining at Parkside Villa Kitui`,
        description: venue.desc,
        alternates: { canonical: `/dining/${slug}` },
        openGraph: { title: venue.name, description: venue.desc, images: venue.image ? [venue.image] : [] },
    };
}

import EnhancedGallery from "../../components/EnhancedGallery";

export default async function DiningVenueDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const [venue, data] = await Promise.all([
        getDiningVenueBySlug(slug),
        getSiteData()
    ]);
    if (!venue) notFound();

    const contactInfo = data.contactInfo;
    const allImages = [venue.image, ...((venue.images as string[]) || [])].filter(Boolean);

    return (
        <div className={styles.pageWrapper}>
            {/* Hero */}
            <section className={styles.detailHero}>
                {venue.image ? (
                    <SafeImage
                        src={venue.image}
                        alt={venue.name}
                        fill
                        priority
                        quality={80}
                        className={styles.heroImage}
                        style={{ objectFit: 'cover' }}
                        fallbackText={venue.name}
                    />
                ) : null}
                <div className={styles.heroOverlay} />
                <div className={styles.heroContent}>
                    <Link href="/dining" className={styles.backLink}>
                        <ChevronLeft size={18} /> Back to Dining
                    </Link>
                    <h1 className={styles.title}>{venue.name}</h1>
                    {venue.hours && (
                        <div className={styles.heroBadges}>
                            <span className={styles.capacityBadge}><Clock size={14} /> {venue.hours}</span>
                        </div>
                    )}
                </div>
            </section>

            {/* Enhanced Gallery Section */}
            <EnhancedGallery images={allImages} title={venue.name} />

            {/* Content */}
            <section className={styles.detailContent}>
                <div className={styles.container}>
                    <div className={styles.detailGrid}>
                        <div className={styles.mainColumn}>
                            <h2 className={styles.sectionHeading}>About {venue.name}</h2>
                            <p className={styles.detailDesc}>{venue.desc}</p>

                            {venue.features && (venue.features as string[]).length > 0 && (
                                <div className={styles.setupSection}>
                                    <h3 className={styles.subHeading}>Features</h3>
                                    <div className={styles.setupGrid}>
                                        {(venue.features as string[]).map((feature: string, i: number) => (
                                            <div key={i} className={styles.setupCard}>
                                                <CheckCircle2 size={18} className={styles.checkIcon} />
                                                <span>{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className={styles.sideColumn}>
                            <div className={styles.inquiryCard}>
                                <h3 className={styles.inquiryTitle}>Make a Reservation</h3>
                                <p className={styles.inquiryDesc}>Reserve your table or inquire about private dining arrangements.</p>
                                <div className={styles.inquiryActions}>
                                    <a
                                        href={`https://wa.me/${contactInfo?.whatsapp || '254701023026'}?text=${encodeURIComponent(`Hello, I'd like to make a reservation at ${venue.name} at Parkside Villa.`)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={styles.primaryBtn}
                                    >
                                        <MessageCircle size={18} /> WhatsApp Us
                                    </a>
                                    <a href={`mailto:${contactInfo?.email || 'info@parksidevillakitui.com'}?subject=Reservation: ${venue.name}`} className={styles.secondaryBtn}>
                                        <Send size={18} /> Email Inquiry
                                    </a>
                                </div>
                                {venue.hours && (
                                    <div className={styles.capacityInfo}>
                                        <Clock size={16} />
                                        <span>{venue.hours}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
