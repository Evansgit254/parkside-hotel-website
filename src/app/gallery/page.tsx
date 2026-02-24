"use client";

import { useEffect, useState } from "react";
import { getSiteData } from "../actions";
import { motion } from "framer-motion";
import styles from "./gallery.module.css";
import Image from "next/image";

export default function GalleryPage() {
    const [images, setImages] = useState<{ url: string; category: string; caption?: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState("All");

    useEffect(() => {
        getSiteData().then(data => {
            const allImages: { url: string; category: string; caption?: string }[] = [];

            // Extract from Hero
            if (data.heroImages) {
                data.heroImages.forEach((img: string) =>
                    allImages.push({ url: img, category: "Property", caption: "Parkside Villa Architecture" })
                );
            }

            // Extract from Rooms
            if (data.rooms) {
                data.rooms.forEach((room: any) => {
                    if (room.image) allImages.push({ url: room.image, category: "Accommodation", caption: room.name });
                });
            }

            // Extract from Facilities
            if (data.facilities) {
                data.facilities.forEach((fac: any) => {
                    if (fac.image) allImages.push({ url: fac.image, category: "Facilities", caption: fac.title });
                });
            }

            setImages(allImages);
            setLoading(false);
        });
    }, []);

    const categories = ["All", "Property", "Accommodation", "Facilities"];

    const filteredImages = activeFilter === "All"
        ? images
        : images.filter(img => img.category === activeFilter);

    if (loading) return <div className={styles.loading}>Curating Gallery...</div>;

    return (
        <div className={styles.pageWrapper}>
            <section className={styles.header}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <span className={styles.badge}>Visual Experience</span>
                    <h1 className={styles.title}>The Gallery</h1>
                    <p className={styles.subtitle}>
                        A visual journey through the luxury, comfort, and elegance of Parkside Villa.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.3 }}
                    className={styles.filters}
                >
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveFilter(cat)}
                            className={`${styles.filterBtn} ${activeFilter === cat ? styles.activeFilter : ''}`}
                        >
                            {cat}
                        </button>
                    ))}
                </motion.div>
            </section>

            <section className={styles.gallerySection}>
                <motion.div
                    layout
                    className={styles.masonryGrid}
                >
                    {filteredImages.map((img, index) => (
                        <motion.div
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.5 }}
                            key={index}
                            className={styles.imageCard}
                        >
                            <div className={styles.imageWrapper}>
                                <div className={styles.imageElement} style={{ backgroundImage: `url(${img.url})` }} />
                                <div className={styles.overlay}>
                                    {img.caption && <h3 className={styles.caption}>{img.caption}</h3>}
                                    <span className={styles.catLabel}>{img.category}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </section>
        </div>
    );
}
