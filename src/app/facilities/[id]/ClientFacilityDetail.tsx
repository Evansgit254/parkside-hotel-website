"use client";

import { CheckCircle2, MapPin, Users, Calendar, ChevronLeft } from "lucide-react";
import Link from "next/link";
import styles from "./facility-detail.module.css";
import Image from "next/image";
import { motion } from "framer-motion";

export default function ClientFacilityDetail({ facility }: { facility: any }) {
    const Icons: Record<string, any> = { Users, MapPin, Calendar };
    const allImages = [facility.image, ...((facility.images as string[]) || [])].filter(Boolean);

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

            {/* Mosaic Gallery Section */}
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
                                    <button className={styles.primaryBtn}>Send Inquiry</button>
                                    <a href="#contact" className={styles.secondaryBtn} style={{ textAlign: 'center', textDecoration: 'none' }}>Contact Us</a>
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
        </div>
    );
}
