"use client";

import { useEffect, useState } from "react";
import { getSiteData } from "../actions";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./gallery.module.css";
import Image from "next/image";
import { Play, X, ChevronLeft, ChevronRight } from "lucide-react";

export default function GalleryPage() {
    const [media, setMedia] = useState<{ url: string; category: string; caption?: string; type: 'image' | 'video'; thumbnail?: string }[]>([]);
    const [content, setContent] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState("All");
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

    useEffect(() => {
        getSiteData().then(data => {
            const allImages: any[] = [];

            // 1. Process Dedicated Gallery Categories and their Items
            if (data.galleryCategories) {
                data.galleryCategories.forEach((cat: any) => {
                    if (cat.items) {
                        cat.items.forEach((item: any) => {
                            allImages.push({
                                url: item.url,
                                category: cat.name,
                                caption: item.title,
                                type: item.type,
                                thumbnail: item.type === 'video' ? `https://img.youtube.com/vi/${item.url.split('v=')[1] || item.url.split('/').pop()}/0.jpg` : undefined
                            });
                        });
                    }
                });
            }

            // 2. Process Uncategorized dedicated items
            if (data.galleryItems) {
                const uncategorized = data.galleryItems.filter((i: any) => !i.categoryId);
                uncategorized.forEach((item: any) => {
                    allImages.push({
                        url: item.url,
                        category: "General",
                        caption: item.title,
                        type: item.type,
                        thumbnail: item.type === 'video' ? `https://img.youtube.com/vi/${item.url.split('v=')[1] || item.url.split('/').pop()}/0.jpg` : undefined
                    });
                });
            }

            // 3. Fallback/Auto-extracted (Property, Accommodation, Facilities)
            // Extract from Hero
            if (data.heroImages && allImages.length === 0) {
                data.heroImages.forEach((img: string) =>
                    allImages.push({ url: img, category: "Property", caption: "Parkside Villa Architecture", type: 'image' })
                );
            }

            // Extract from Rooms
            if (data.rooms && allImages.filter((m: any) => m.category === "Accommodation").length === 0) {
                data.rooms.forEach((room: any) => {
                    if (room.image) allImages.push({ url: room.image, category: "Accommodation", caption: room.name, type: 'image' });
                });
            }

            // Extract from Facilities
            if (data.facilities && allImages.filter((m: any) => m.category === "Facilities").length === 0) {
                data.facilities.forEach((fac: any) => {
                    if (fac.image) allImages.push({ url: fac.image, category: "Facilities", caption: fac.title, type: 'image' });
                });
            }

            setMedia(allImages);
            if (data.content) setContent(data.content);
            setLoading(false);
        });
    }, []);

    const categories = ["All", ...Array.from(new Set(media.map(m => m.category))).sort()];

    const filteredMedia = activeFilter === "All"
        ? media
        : media.filter(m => m.category === activeFilter);

    const imageItems = filteredMedia.filter(m => m.type === 'image');

    const openLightbox = (index: number) => {
        const item = filteredMedia[index];
        if (item.type === 'video') {
            window.open(item.url, '_blank');
            return;
        }
        // Find this item's position among image-only items
        const imgIdx = imageItems.findIndex(img => img.url === item.url);
        setLightboxIndex(imgIdx >= 0 ? imgIdx : 0);
    };

    const closeLightbox = () => setLightboxIndex(null);
    const prevImage = () => setLightboxIndex(i => i !== null ? (i - 1 + imageItems.length) % imageItems.length : null);
    const nextImage = () => setLightboxIndex(i => i !== null ? (i + 1) % imageItems.length : null);

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (lightboxIndex === null) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') prevImage();
            if (e.key === 'ArrowRight') nextImage();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [lightboxIndex, imageItems.length]);

    if (loading) return <div className={styles.loading}>Curating Gallery...</div>;

    return (
        <div className={styles.pageWrapper}>
            <section className={styles.header}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <span className={styles.badge}>{content.gallery_intro?.badge || "Visual Experience"}</span>
                    <h1 className={styles.title}>{content.gallery_intro?.title || "The Gallery"}</h1>
                    <p className={styles.subtitle}>
                        {content.gallery_intro?.subtitle || "A visual journey through the luxury, comfort, and elegance of Parkside Villa."}
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
                    <AnimatePresence>
                        {filteredMedia.map((item, index) => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.5 }}
                                key={`${item.url}-${index}`}
                                className={styles.imageCard}
                                onClick={() => openLightbox(index)}
                            >
                                <div className={styles.imageWrapper}>
                                    <Image
                                        src={((item.type === 'video' ? item.thumbnail : item.url) || '').replace('/upload/', '/upload/f_auto,q_auto:best/')}
                                        alt={item.caption || "Parkside Villa Gallery"}
                                        fill
                                        quality={100}
                                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                        className={styles.imageElement}
                                        priority={index < 6}
                                    />
                                    {item.type === 'video' && (
                                        <div className={styles.playOverlay}>
                                            <Play fill="white" size={48} />
                                        </div>
                                    )}
                                    <div className={styles.overlay}>
                                        {item.caption && <h3 className={styles.caption}>{item.caption}</h3>}
                                        <span className={styles.catLabel}>{item.category}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            </section>

            {/* Lightbox */}
            <AnimatePresence>
                {lightboxIndex !== null && imageItems[lightboxIndex] && (
                    <motion.div
                        className={styles.lightbox}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeLightbox}
                    >
                        <button className={styles.lightboxClose} onClick={closeLightbox}>
                            <X size={28} />
                        </button>

                        <button className={`${styles.lightboxNav} ${styles.lightboxPrev}`} onClick={(e) => { e.stopPropagation(); prevImage(); }}>
                            <ChevronLeft size={36} />
                        </button>

                        <motion.div
                            key={lightboxIndex}
                            className={styles.lightboxContent}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.2 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <img
                                src={imageItems[lightboxIndex].url}
                                alt={imageItems[lightboxIndex].caption || "Gallery Image"}
                                className={styles.lightboxImage}
                            />
                            <div className={styles.lightboxCaption}>
                                {imageItems[lightboxIndex].caption && <h3>{imageItems[lightboxIndex].caption}</h3>}
                                <span>{lightboxIndex + 1} / {imageItems.length}</span>
                            </div>
                        </motion.div>

                        <button className={`${styles.lightboxNav} ${styles.lightboxNext}`} onClick={(e) => { e.stopPropagation(); nextImage(); }}>
                            <ChevronRight size={36} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
