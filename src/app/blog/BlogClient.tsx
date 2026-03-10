"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import SafeImage from "../components/SafeImage";
import styles from "./blog.module.css";
import ClientBlogGrid from "./ClientBlogGrid";
import { useRef } from "react";

interface BlogClientProps {
    posts: any[];
    content: any;
}

export default function BlogClient({ posts, content }: BlogClientProps) {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    });

    const yParallax = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

    const heroImage = content?.blog_hero?.image || "https://res.cloudinary.com/dizwm3mic/image/upload/v1772440903/parkside-villa-media/Front_Image_Or_Background_Image/IMG-20251119-WA0061_fvrbbk.jpg";

    return (
        <div className={styles.pageWrapper} ref={containerRef}>
            {/* Hero Section */}
            <section className={styles.hero}>
                <motion.div
                    style={{ y: yParallax, height: '100%', width: '100%', position: 'absolute', top: 0, left: 0 }}
                    initial={{ scale: 1.1, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1.2 }}
                >
                    <SafeImage
                        src={heroImage}
                        alt="Blog Hero"
                        fill
                        priority
                        quality={90}
                        className={styles.heroImage}
                        style={{ objectFit: 'cover' }}
                        fallbackText="Our Journal"
                    />
                </motion.div>
                <div className={styles.heroOverlay} />
                <div className={styles.heroContent}>
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <span className={styles.badge}>{content?.blog_intro?.badge || "Our Journal"}</span>
                        <h1 className={styles.title}>{content?.blog_intro?.title || "The Insider's Guide"}</h1>
                        <p className={styles.subtitle}>
                            {content?.blog_intro?.subtitle || "Discover design trends, architectural inspiration, and updates from Parkside Villa."}
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Blog Grid */}
            <section className={styles.blogSection}>
                <div className={styles.container}>
                    <ClientBlogGrid posts={posts} />
                </div>
            </section>
        </div>
    );
}
