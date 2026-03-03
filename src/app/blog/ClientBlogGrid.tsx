"use client";

import { motion } from "framer-motion";
import { Calendar, User } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import styles from "./blog.module.css";

export default function ClientBlogGrid({ posts }: { posts: any[] }) {
    const fadeInUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0 }
    };

    return (
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
                        <Image
                            src={post.image}
                            alt={post.title}
                            fill
                            className={styles.cardImage}
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
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
    );
}
