"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import styles from "./gallery.module.css";

interface EnhancedGalleryProps {
    images: string[];
    title?: string;
}

export default function EnhancedGallery({ images, title }: EnhancedGalleryProps) {
    const [index, setIndex] = useState<number | null>(null);
    if (!images || images.length === 0) return null;

    const displayImages = images.slice(0, 5);
    const remainingCount = images.length - 5;

    const nextImage = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (index !== null) setIndex((index + 1) % images.length);
    };

    const prevImage = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (index !== null) setIndex((index - 1 + images.length) % images.length);
    };

    return (
        <section className={styles.gallerySection}>
            <div className={styles.container}>
                <div className={styles.mosaicGallery}>
                    {displayImages.map((src, i) => (
                        <div
                            key={i}
                            className={styles.mosaicItem}
                            onClick={() => setIndex(i)}
                        >
                            <Image
                                src={src}
                                alt={`${title || "Gallery"} ${i + 1}`}
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                className={styles.galleryImage}
                                style={{ objectFit: 'cover' }}
                            />
                            {i === 4 && remainingCount > 0 && (
                                <div className={styles.overlay}>
                                    <span className={styles.overlayCount}>+{remainingCount}</span>
                                    <span className={styles.overlayText}>View All</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Lightbox */}
            <AnimatePresence>
                {index !== null && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={styles.lightboxOverlay}
                        onClick={() => setIndex(null)}
                    >
                        <button className={styles.closeBtn} onClick={() => setIndex(null)}>
                            <X size={32} />
                        </button>

                        <div className={styles.lightboxContent} onClick={e => e.stopPropagation()}>
                            <motion.div
                                key={index}
                                initial={{ x: 50, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -50, opacity: 0 }}
                                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                style={{ position: 'relative', width: '100%', height: '100%' }}
                            >
                                <Image
                                    src={images[index]}
                                    alt="Full view"
                                    fill
                                    className={styles.lightboxImage}
                                    priority
                                />
                            </motion.div>

                            {images.length > 1 && (
                                <>
                                    <button className={`${styles.navBtn} ${styles.prevBtn}`} onClick={prevImage}>
                                        <ChevronLeft size={24} />
                                    </button>
                                    <button className={`${styles.navBtn} ${styles.nextBtn}`} onClick={nextImage}>
                                        <ChevronRight size={24} />
                                    </button>
                                </>
                            )}

                            <div className={styles.counter}>
                                {index + 1} / {images.length}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}
