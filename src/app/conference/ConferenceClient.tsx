"use client";

import Link from "next/link";
import SafeImage from "../components/SafeImage";
import styles from "./conference.module.css";
import { Users, ArrowRight } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

interface ConferenceClientProps {
    halls: any[];
    content: any;
}

export default function ConferenceClient({ halls, content }: ConferenceClientProps) {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    });

    const yParallax = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

    const intro = content?.conference_intro || {};
    // Read from conference_hero first, fall back to facilities_hero for backward compat, then first hall image
    const conferenceHeroImages = content?.conference_hero?.image;
    const facilitiesHeroImages = content?.facilities_hero?.image;
    const heroImageRaw = Array.isArray(conferenceHeroImages) ? conferenceHeroImages[0]
        : conferenceHeroImages
        ?? (Array.isArray(facilitiesHeroImages) ? facilitiesHeroImages[0] : facilitiesHeroImages)
        ?? halls[0]?.image;
    const heroImage = heroImageRaw;
    const showHero = !!heroImage;

    return (
        <div className={styles.pageWrapper} ref={containerRef}>
            {/* Hero */}
            {showHero ? (
                <section className={styles.hero}>
                    <motion.div
                        style={{ y: yParallax, height: '100%', width: '100%', position: 'absolute', top: 0, left: 0 }}
                        initial={{ scale: 1.1, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 1.2 }}
                    >
                        <SafeImage
                            src={heroImage}
                            alt="Conference Facilities"
                            fill
                            priority
                            quality={90}
                            className={styles.heroImage}
                            style={{ objectFit: 'cover' }}
                            fallbackText="Our Premium Venues"
                        />
                    </motion.div>
                    <div className={styles.heroOverlay} />
                    <div className={styles.heroContent}>
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <span className={styles.badge}>{intro.badge || "World-Class Venues"}</span>
                            <h1 className={styles.title}>{intro.title || "Conference & Events"}</h1>
                            <p className={styles.subtitle}>
                                {intro.desc || "State-of-the-art conference halls designed for productive meetings, corporate events, and unforgettable celebrations."}
                            </p>
                        </motion.div>
                    </div>
                </section>
            ) : (
                <section className={styles.simpleHeader} style={{ paddingTop: '120px', paddingBottom: '40px', textAlign: 'center', background: '#fff' }}>
                    <div className={styles.container}>
                        <h1 style={{ fontSize: '3.5rem', fontFamily: 'Cormorant Garamond, serif', color: '#144B36' }}>{intro.title || "Conference & Events"}</h1>
                        <p style={{ color: '#6B7280', fontSize: '1.2rem', marginTop: '1rem', maxWidth: '800px', margin: '1rem auto 0' }}>{intro.desc || "State-of-the-art conference halls designed for productive meetings."}</p>
                    </div>
                </section>
            )}

            {/* Vertical Listing */}
            <section className={styles.listSection}>
                <div className={styles.container}>
                    {halls.map((hall: any, index: number) => (
                        <Link href={`/conference/${hall.slug}`} key={hall.id} className={styles.listItem}>
                            <div className={styles.listImageWrapper}>
                                {hall.image ? (
                                    <SafeImage
                                        src={hall.image}
                                        alt={hall.name}
                                        fill
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                        quality={90}
                                        priority={index < 2}
                                        className={styles.listImage}
                                        style={{ objectFit: 'cover' }}
                                        fallbackText="Venue image coming soon"
                                    />
                                ) : (
                                    <div className={styles.placeholderImage}>
                                        <Users size={48} />
                                    </div>
                                )}
                                {hall.capacity > 0 && (
                                    <div className={styles.capacityBadge}>
                                        <Users size={14} /> {hall.capacity} guests
                                    </div>
                                )}
                            </div>
                            <div className={styles.listContent}>
                                <h2 className={styles.listName}>{hall.name}</h2>
                                <p className={styles.listDesc}>{hall.desc}</p>
                                {hall.setups && hall.setups.length > 0 && (
                                    <div className={styles.setupTags}>
                                        {hall.setups.map((setup: string, i: number) => (
                                            <span key={i} className={styles.setupTag}>{setup}</span>
                                        ))}
                                    </div>
                                )}
                                <span className={styles.viewDetails}>
                                    View Details <ArrowRight size={16} />
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
}
