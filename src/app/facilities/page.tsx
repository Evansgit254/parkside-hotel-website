"use client";

import { useEffect, useState } from "react";
import { getSiteData } from "../actions";
import { motion } from "framer-motion";
import { Users, Utensils, Waves, Wine, Hotel, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import styles from "./facilities.module.css";
import Image from "next/image";

export default function FacilitiesPage() {
    const [facilities, setFacilities] = useState<any[]>([]);
    const [content, setContent] = useState<any>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getSiteData().then(data => {
            setFacilities(data.facilities || []);
            if (data && data.content) setContent(data.content);
            setLoading(false);
        });
    }, []);

    const facilitiesKeys = content?.facilities_intro || {};

    const fadeIn = {
        hidden: { opacity: 0, y: 40 },
        visible: { opacity: 1, y: 0 }
    };

    if (loading) return <div className={styles.loading}>Curating Excellence...</div>;

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

                                        <div className={styles.detailsGrid}>
                                            <div>
                                                <span className={styles.detailHeading}>Key Features</span>
                                                <ul className={styles.featureList}>
                                                    {facility.features?.map((f: string, i: number) => (
                                                        <li key={i} className={styles.featureItem}>
                                                            <CheckCircle2 size={16} className={styles.checkIcon} />
                                                            {f}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <div>
                                                <span className={styles.detailHeading}>Highlights</span>
                                                <ul className={styles.highlightList}>
                                                    {facility.highlights?.map((h: string, i: number) => (
                                                        <li key={i} className={styles.highlightItem}>
                                                            <CheckCircle2 size={16} className={styles.checkIcon} />
                                                            {h}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>

                                        <Link href={`/facilities/${facility.id}`} className={styles.exploreLink}>
                                            Explore {facility.title}
                                        </Link>
                                    </motion.div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </section>
        </div>
    );
}
