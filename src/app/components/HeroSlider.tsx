"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import SafeImage from "./SafeImage";
import styles from "../page.module.css"; // Reusing styles from page.module.css for consistency

interface HeroSliderProps {
    images: string[];
    fallbackImage?: string;
    interval?: number;
    showControls?: boolean;
}

export default function HeroSlider({
    images,
    fallbackImage,
    interval = 7000,
    showControls = true
}: HeroSliderProps) {
    const [currentSlide, setCurrentSlide] = useState(0);
    const validImages = images.length > 0 ? images : [fallbackImage];

    useEffect(() => {
        if (validImages.length <= 1) return;

        const timer = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % validImages.length);
        }, interval);
        return () => clearInterval(timer);
    }, [validImages.length, interval]);

    const nextSlide = () => setCurrentSlide(prev => (prev + 1) % validImages.length);
    const prevSlide = () => setCurrentSlide(prev => (prev - 1 + validImages.length) % validImages.length);

    return (
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden' }}>
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentSlide}
                    initial={{ scale: currentSlide % 2 === 0 ? 1.0 : 1.15, opacity: 0 }}
                    animate={{ scale: currentSlide % 2 === 0 ? 1.15 : 1.0, opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ 
                        opacity: { duration: 1.4, ease: [0.16, 1, 0.3, 1] },
                        scale: { duration: 10, ease: "linear" }
                    }}
                    style={{ position: 'absolute', inset: 0 }}
                >
                    <SafeImage
                        src={validImages[currentSlide]}
                        alt="Parkside Villa Hero"
                        fill
                        priority
                        quality={90}
                        sizes="100vw"
                        className={styles.imageReveal}
                        style={{ objectFit: "cover" }}
                        fallbackText="Welcome to Parkside Villa"
                    />
                </motion.div>
            </AnimatePresence>

            {validImages.length > 1 && showControls && (
                <div className={styles.carouselControls}>
                    <div className={styles.carouselDots}>
                        {validImages.map((_: any, i: number) => (
                            <button
                                key={`hero-dot-${i}`}
                                type="button"
                                className={`${styles.dot} ${currentSlide === i ? styles.activeDot : ""}`}
                                onClick={() => setCurrentSlide(i)}
                                aria-label={`Go to slide ${i + 1}`}
                            />
                        ))}
                    </div>
                    <button onClick={prevSlide} className={styles.carouselBtn} aria-label="Previous slide">
                        <ChevronLeft size={16} />
                    </button>
                    <button onClick={nextSlide} className={styles.carouselBtn} aria-label="Next slide">
                        <ChevronRight size={16} />
                    </button>
                </div>
            )}
        </div>
    );
}
