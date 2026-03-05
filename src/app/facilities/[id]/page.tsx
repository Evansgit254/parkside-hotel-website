export const revalidate = 3600;

import { getSiteData } from "../../actions";
import { CheckCircle2, MapPin, Users, Utensils, Waves, Wine, Hotel, Calendar, ChevronLeft, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import styles from "../../rooms/rooms.module.css"; // High-end rooms & facilities styles
import Image from "next/image";
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const data = await getSiteData();
    const facility = data.facilities?.find((f: any) => f.id === id);
    return {
        title: facility ? `${facility.title} | Facilities | Parkside Villa Kitui` : "Facility Detail",
        description: facility?.desc || "Experience luxury at Parkside Villa Kitui."
    };
}

export default async function FacilityDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const data = await getSiteData();
    const facility = data.facilities?.find((f: any) => f.id === id);

    if (!facility) {
        return (
            <div className={styles.detailContainer} style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Facility Not Found</h1>
                    <Link href="/facilities" className={styles.backLink}>
                        <ChevronLeft size={16} /> Back to Facilities
                    </Link>
                </div>
            </div>
        );
    }

    const Icons: Record<string, any> = { Users, Utensils, Waves, Wine, Hotel };
    const IconComponent = Icons[facility.icon] || Hotel;
    const allImages = [facility.image, ...((facility.images as string[]) || [])].filter(Boolean);

    return (
        <div className={styles.detailWrapper}>
            {/* Hero Section */}
            <section className={styles.detailHeroSection}>
                <Image
                    src={facility.image || "/placeholder-facility.jpg"}
                    alt={facility.title}
                    fill
                    priority
                    className={styles.detailHeroImage}
                    style={{ objectFit: 'cover' }}
                />
                <div className={styles.detailHeroOverlay} />
                <div className={styles.detailHeroContent}>
                    <div className={styles.detailHeroBadge}>
                        <IconComponent size={14} />
                        <span>Premier Guest Service</span>
                    </div>
                    <h1 className={styles.detailTitle}>{facility.title}</h1>
                </div>
            </section>

            {/* Mosaic Gallery */}
            <section className={styles.gallerySection}>
                <div className={styles.container}>
                    <div className={styles.mosaicGallery}>
                        {/* Featured Image */}
                        <div className={styles.mosaicItem}>
                            <Image
                                src={allImages[0] || "/placeholder-facility.jpg"}
                                alt={`${facility.title} - Featured`}
                                fill
                                priority
                                sizes="(max-width: 768px) 100vw, 50vw"
                                className={styles.galleryImage}
                                style={{ objectFit: 'cover' }}
                            />
                        </div>

                        {/* Grid Images */}
                        {allImages.slice(1, 5).map((img, idx) => (
                            <div key={idx} className={styles.mosaicItem}>
                                <Image
                                    src={img}
                                    alt={`${facility.title} - Highlight ${idx + 1}`}
                                    fill
                                    sizes="(max-width: 768px) 50vw, 25vw"
                                    className={styles.galleryImage}
                                    style={{ objectFit: 'cover' }}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <div className={styles.detailContentGrid}>
                {/* Main Content */}
                <div className={styles.detailMainColumn}>
                    <nav className={styles.breadcrumb}>
                        <Link href="/facilities">Facilities</Link>
                        <span>/</span>
                        <span className={styles.current}>{facility.title}</span>
                    </nav>

                    <div className={styles.detailIntro}>
                        <h2 className={styles.sectionTitle}>Overview</h2>
                        <div className={styles.richText}>
                            <p>{facility.desc}</p>
                        </div>
                    </div>

                    <div className={styles.featuresSection}>
                        <h2 className={styles.sectionTitle}>Key Features & Amenities</h2>
                        <div className={styles.featuresGrid}>
                            {facility.features?.map((feature: string, idx: number) => (
                                <div key={idx} className={styles.featureItem}>
                                    <CheckCircle2 size={18} className={styles.featureIcon} />
                                    <span>{feature}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {facility.highlights && facility.highlights.length > 0 && (
                        <div className={styles.highlightsSection}>
                            <h2 className={styles.sectionTitle}>Service Highlights</h2>
                            <div className={styles.highlightsGrid}>
                                {facility.highlights.map((highlight: string, idx: number) => (
                                    <div key={idx} className={styles.highlightCard}>
                                        <div className={styles.highlightDot} />
                                        <p>{highlight}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar Inquiry */}
                <aside className={styles.detailSidebar}>
                    <div className={styles.inquiryCard}>
                        <div className={styles.inquiryHeader}>
                            <h3>Experience {facility.title}</h3>
                            <p>Book your stay or inquire about our premium services.</p>
                        </div>
                        <form className={styles.inquiryForm}>
                            <div className={styles.formGroup}>
                                <label>Your Name</label>
                                <input type="text" placeholder="John Doe" />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Email Address</label>
                                <input type="email" placeholder="john@example.com" />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Date of Visit</label>
                                <input type="date" />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Inquiry Details</label>
                                <textarea placeholder="How can we assist you?"></textarea>
                            </div>
                            <button type="submit" className={styles.submitBtn}>
                                Send Inquiry
                            </button>
                        </form>
                        <p className={styles.formNotice}>
                            <Calendar size={12} />
                            Average response time: 2 hours
                        </p>
                    </div>
                </aside>
            </div>
        </div>
    );
}
