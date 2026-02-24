"use client";

import { useEffect, useState } from "react";
import { getSiteData } from "../actions";
import { motion } from "framer-motion";
import { Calendar, User } from "lucide-react";
import Link from "next/link";
import styles from "./blog.module.css";

export default function BlogPage() {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getSiteData().then(data => {
            setPosts(data.blogPosts || []);
            setLoading(false);
        });
    }, []);

    const fadeInUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0 }
    };

    if (loading) return <div className={styles.loading}>Curating Insights...</div>;

    return (
        <div className={styles.pageWrapper}>
            {/* Hero Section */}
            <section className={styles.hero}>
                <div className={styles.heroOverlay} />
                <div className={styles.heroContent}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className={styles.badge}>Our Journal</span>
                        <h1 className={styles.title}>The Insider&apos;s Guide</h1>
                        <p className={styles.subtitle}>
                            Discover design trends, architectural inspiration, and updates from Parkside Villa.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Blog Grid */}
            <section className={styles.blogSection}>
                <div className={styles.container}>
                    <div className={styles.grid}>
                        {posts.map((post, index) => (
                            <motion.article
                                key={post.id}
                                variants={fadeInUp}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                className={styles.blogCard}
                            >
                                <div className={styles.imageWrapper}>
                                    <div className={styles.cardImage} style={{ backgroundImage: `url(${post.image})` }} />
                                    <div className={styles.categoryBadge}>{post.category}</div>
                                </div>

                                <div className={styles.cardContent}>
                                    <div className={styles.metaData}>
                                        <div className={styles.metaItem}>
                                            <Calendar size={14} />
                                            <span>{post.date}</span>
                                        </div>
                                        <div className={styles.metaItem}>
                                            <User size={14} />
                                            <span>{post.author}</span>
                                        </div>
                                    </div>

                                    <h3 className={styles.cardTitle}>
                                        <Link href={`/blog/${post.id}`}>{post.title}</Link>
                                    </h3>

                                    <p className={styles.cardExcerpt}>{post.excerpt}</p>

                                    <Link href={`/blog/${post.id}`} className={styles.readMore}>
                                        Continue Reading →
                                    </Link>
                                </div>
                            </motion.article>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
