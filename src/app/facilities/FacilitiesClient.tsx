"use client";

import { motion } from "framer-motion";
import { Users, Utensils, Waves, Wine, Hotel, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import styles from "./facilities.module.css";
import Footer from "../components/Footer";

interface FacilitiesClientProps {
    initialFacilities: any[];
    initialContent: any;
    contactInfo: any;
}

export default function FacilitiesClient({ initialFacilities, initialContent, contactInfo }: FacilitiesClientProps) {
    const facilities = initialFacilities;
    const content = initialContent || {};
    const facilitiesKeys = content?.facilities_intro || {};

    const Icons: Record<string, any> = { Users, Utensils, Waves, Wine, Hotel };

    return (
        <div className={styles.pageWrapper}>
            {/* Hero Section */}
            <section className={styles.hero}>
                <Image
                    src="https://res.cloudinary.com/dizwm3mic/image/upload/v1772446800/parkside-villa-media/Front_Image_Or_Background_Image/_MG_0701_pzkfbr.jpg"
                    alt="Facilities Hero"
                    fill
                    priority
                    quality={100}
                    className={styles.heroImage}
                    style={{ objectFit: 'cover' }}
                />
                <div className={styles.heroOverlay} />
                <div className={styles.heroContent}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1 }}
                    >
                        <span className={styles.badge}>{facilitiesKeys.badge || "World-Class Amenities"}</span>
                        <h1 className={styles.title}>{facilitiesKeys.title || "Hotel Facilities"}</h1>
                        <p className={styles.subtitle}>
                            {facilitiesKeys.desc || "Discover a world where unparalleled luxury meets every need. From state-of-the-art conference halls to our tranquil infinity pool, every detail is considered."}
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Facilities Sections */}
            <section className={styles.facilitiesSection}>
                {facilities.map((facility, index) => {
                    const IconComponent = Icons[facility.icon] || Hotel;
                    return (
                        <div key={facility.id} className={styles.facilitySection}>
                            <div className={styles.container}>
                                <div className={styles.flexWrapper}>
                                    <motion.div
                                        className={styles.imageContainer}
                                        initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true, margin: "-100px" }}
                                        transition={{ duration: 0.8 }}
                                    >
                                        <Image
                                            src={facility.image}
                                            alt={facility.title}
                                            fill
                                            quality={100}
                                            priority={index === 0}
                                            sizes="(max-width: 1024px) 100vw, 50vw"
                                            className={styles.cardImage}
                                        />
                                    </motion.div>

                                    <motion.div
                                        className={styles.contentContainer}
                                        initial={{ opacity: 0, y: 30 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.6, delay: 0.2 }}
                                    >
                                        <div className={styles.iconBadge}>
                                            <IconComponent size={32} />
                                        </div>
                                        <h2 className={styles.cardTitle}>{facility.title}</h2>
                                        <p className={styles.cardDesc}>{facility.desc}</p>

                                        <div className={styles.featuresList}>
                                            {facility.features?.map((feat: string, i: number) => (
                                                <div key={i} className={styles.featureItem}>
                                                    <CheckCircle2 size={18} className={styles.featureIcon} />
                                                    <span>{feat}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <div className={styles.highlights}>
                                            {facility.highlights?.map((high: string, i: number) => (
                                                <span key={i} className={styles.highlightTag}>{high}</span>
                                            ))}
                                        </div>
                                    </motion.div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </section>

            <Footer contactInfo={contactInfo} />
        </div>
    );
}
