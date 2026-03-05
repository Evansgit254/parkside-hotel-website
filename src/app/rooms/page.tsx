"use client";

import { getSiteData } from "../actions";
import SafeImage from "../components/SafeImage";
import styles from "./rooms.module.css";
import RoomsContent from "./RoomsContent";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useEffect, useState } from "react";

export default function RoomsPage() {
    const [rooms, setRooms] = useState<any[]>([]);
    const [content, setContent] = useState<any>({});
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    });

    const yParallax = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

    useEffect(() => {
        getSiteData().then(data => {
            setRooms(data.rooms || []);
            setContent(data.content || {});
        });
    }, []);

    const roomsKeys = content?.rooms_intro || {};

    return (
        <main className={styles.pageWrapper} ref={containerRef}>
            {/* HERO SECTION - Server Rendered for Speed */}
            <section className={styles.hero}>
                <motion.div
                    style={{ y: yParallax, height: '100%', width: '100%', position: 'absolute', top: 0, left: 0 }}
                    initial={{ scale: 1.1, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1.2 }}
                >
                    <SafeImage
                        src={content?.rooms_hero?.image || "https://res.cloudinary.com/dizwm3mic/image/upload/v1772446787/parkside-villa-media/Front_Image_Or_Background_Image/_MG_0698_zmv8bg.jpg"}
                        alt="Rooms Hero"
                        fill
                        priority
                        quality={90}
                        sizes="100vw"
                        className={styles.heroImage}
                        style={{ objectFit: 'cover' }}
                        fallbackText="Our Luxury Collection"
                    />
                </motion.div>
                <div className={styles.heroOverlay} />
                <div className={styles.heroContent}>
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <span className={styles.badge}>{roomsKeys.badge || "Our Collection"}</span>
                        <h1 className={styles.title}>{roomsKeys.title || "Luxury Reimagined"}</h1>
                        <p className={styles.subtitle}>
                            {roomsKeys.desc || "A curated selection of sanctuaries designed for ultimate comfort and cultural elegance."}
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Interactive Content - Client Side for filtering and booking */}
            <RoomsContent initialRooms={rooms} content={content} />
        </main>
    );
}
