"use client";

import { getSiteData } from "../actions";
import { Users, Utensils, Waves, Wine, Hotel, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import styles from "../rooms/rooms.module.css"; // Using the finalized high-end vertical list styles
import SafeImage from "../components/SafeImage";
import HeroSlider from "../components/HeroSlider";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useEffect, useState } from "react";

export default function FacilitiesPage() {
    const [facilities, setFacilities] = useState<any[]>([]);
    const [content, setContent] = useState<any>({});
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    });

    const yParallax = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

    useEffect(() => {
        getSiteData().then(data => {
            setFacilities(data.facilities || []);
            setContent(data.content || {});
        });
    }, []);

    const facilitiesIntro = content?.facilities_intro || {};
    const Icons: Record<string, any> = { Users, Utensils, Waves, Wine, Hotel };

    return (
        <div className={styles.listingWrapper} ref={containerRef}>
            {/* Hero Section */}
            <section className={styles.heroSection}>
                <motion.div
                    style={{ y: yParallax, height: '100%', width: '100%', position: 'absolute', top: 0, left: 0 }}
                    initial={{ scale: 1.1, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1.2 }}
                >
                    <HeroSlider
                        images={Array.isArray(content?.facilities_hero?.image) ? content.facilities_hero.image : [content?.facilities_hero?.image].filter(Boolean)}
                        fallbackImage="https://res.cloudinary.com/dizwm3mic/image/upload/f_auto,q_auto/v1772446800/parkside-villa-media/Front_Image_Or_Background_Image/_MG_0701_pzkfbr.jpg"
                    />
                </motion.div>
                <div className={styles.heroOverlay} />
                <div className={styles.heroContent}>
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <span className={styles.heroBadge}>{facilitiesIntro.badge || "World-Class Amenities"}</span>
                        <h1 className={styles.heroTitle}>{facilitiesIntro.title || "Premium Hotel Facilities"}</h1>
                        <p className={styles.heroSubtitle}>
                            {facilitiesIntro.desc || "Experience a blend of luxury and convenience with our top-tier facilities designed for your comfort."}
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Vertical List of Facilities */}
            <section className={styles.listSection}>
                <div className={styles.listContainer}>
                    {facilities.map((facility: any, index: number) => {
                        const IconComponent = Icons[facility.icon] || Hotel;
                        const isEven = index % 2 === 1;

                        return (
                            <div key={facility.id} className={`${styles.listItem} ${isEven ? styles.itemReverse : ""}`}>
                                <div className={styles.itemImageWrapper}>
                                    <SafeImage
                                        src={facility.image}
                                        alt={facility.title}
                                        fill
                                        sizes="(max-width: 1024px) 100vw, 50vw"
                                        className={styles.itemImage}
                                        style={{ objectFit: 'cover' }}
                                        fallbackText="Amenity details coming soon"
                                    />
                                    <div className={styles.imageOverlay} />
                                    <div className={styles.itemTagBadge}>
                                        <IconComponent size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                                        <span>Luxury Amenity</span>
                                    </div>
                                </div>

                                <div className={styles.itemContent}>
                                    <div className={styles.contentHeader}>
                                        <div className={styles.priceTag}>
                                            <span className={styles.priceAmount}>Premier</span>
                                            <span className={styles.pricePeriod}>Experience</span>
                                        </div>
                                        <h2 className={styles.itemTitle}>{facility.title}</h2>
                                    </div>
                                    <p className={styles.itemDesc}>{facility.desc}</p>

                                    <div className={styles.amenityRow}>
                                        {facility.features?.slice(0, 3).map((f: string, i: number) => (
                                            <div key={i} className={styles.amenityItem}>
                                                <CheckCircle2 size={12} color="#d4af37" />
                                                {f}
                                            </div>
                                        ))}
                                    </div>

                                    <div className={styles.actionGroup}>
                                        <Link href={`/facilities/${facility.id}`} className={styles.primaryLink}>
                                            Explore Details
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>
        </div>
    );
}

