"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { getSiteData } from "../actions";
import { motion } from "framer-motion";
import { Users, Utensils, Waves, Wine, Hotel } from "lucide-react";
import Link from "next/link";
import styles from "./facilities.module.css";
import Image from "next/image"; // Next.js image component for optimization

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

    const fadeInUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0 }
    };

    if (loading) return <div className={styles.loading}>Curating Excellence...</div>;

    const Icons: Record<string, any> = { Users, Utensils, Waves, Wine, Hotel };

    return (
        <div className={styles.pageWrapper}>
            {/* Hero Section */}
            <section className={styles.hero}>
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

            {/* Facilities Grid */}
            <section className={styles.facilitiesSection}>
                <div className={styles.container}>
                    <div className={styles.grid}>
                        {facilities.map((facility, index) => {
                            const IconComponent = Icons[facility.icon] || Hotel;
                            return (
                                <motion.div
                                    key={facility.id}
                                    variants={fadeInUp}
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true, margin: "-50px" }}
                                    transition={{ duration: 0.6, delay: index * 0.1 }}
                                    className={styles.facilityCard}
                                >
                                    <div className={styles.imageWrapper}>
                                        {facility.image ? (
                                            <div className={styles.cardImage} style={{ backgroundImage: `url(${facility.image})` }} />
                                        ) : (
                                            <div className={styles.placeholderImage}>
                                                <IconComponent size={64} className={styles.placeholderIcon} />
                                            </div>
                                        )}
                                        <div className={styles.imageOverlay} />
                                    </div>

                                    <div className={styles.cardContent}>
                                        <div className={styles.iconBadge}>
                                            <IconComponent size={24} />
                                        </div>
                                        <h3 className={styles.cardTitle}>{facility.title}</h3>
                                        <p className={styles.cardDesc}>{facility.desc}</p>

                                        <Link href={`/facilities/${facility.id}`} className={styles.exploreLink}>
                                            <span>Explore Facility</span>
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <line x1="5" y1="12" x2="19" y2="12"></line>
                                                <polyline points="12 5 19 12 12 19"></polyline>
                                            </svg>
                                        </Link>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>
        </div>
    );
}
