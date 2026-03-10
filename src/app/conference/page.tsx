"use client";

import { getSiteData } from "../actions";
import Link from "next/link";
import SafeImage from "../components/SafeImage";
import styles from "./conference.module.css";
import { Users, ArrowRight } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useEffect, useState } from "react";

export default function ConferencePage() {
    const [halls, setHalls] = useState<any[]>([]);
    const [content, setContent] = useState<any>({});
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    });

    const yParallax = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

    useEffect(() => {
        getSiteData().then(data => {
            setHalls((data as any).conferenceHalls || []);
            setContent(data.content || {});
        });
    }, []);

    const intro = content?.conference_intro || {};

    return (
        <div className={styles.pageWrapper} ref={containerRef}>
            {/* Hero */}
            <section className={styles.hero}>
                <motion.div
                    style={{ y: yParallax, height: '100%', width: '100%', position: 'absolute', top: 0, left: 0 }}
                    initial={{ scale: 1.1, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1.2 }}
                >
                    <SafeImage
                        src={halls[0]?.image || "https://res.cloudinary.com/dizwm3mic/image/upload/f_auto,q_auto/v1772446800/parkside-villa-media/Front_Image_Or_Background_Image/_MG_0701_pzkfbr.jpg"}
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
