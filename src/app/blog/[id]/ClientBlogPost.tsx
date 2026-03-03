"use client";

import { motion } from "framer-motion";
import { Calendar, User, ChevronLeft, Share2, Facebook, Twitter, Link as LinkIcon, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import styles from "./blog-post.module.css";
import { useRouter } from "next/navigation";

export default function ClientBlogPost({ post, relatedPosts }: { post: any, relatedPosts: any[] }) {
    const router = useRouter();

    return (
        <main className={styles.pageWrapper}>
            {/* PROGRESS BAR */}
            <motion.div
                className={styles.progressBar}
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
            />

            {/* HERO SECTION */}
            <section className={styles.hero}>
                <Image
                    src={post.image.replace('/upload/', '/upload/f_auto,q_auto:best/')}
                    alt={post.title}
                    fill
                    priority
                    quality={100}
                    sizes="100vw"
                    className={styles.heroImage}
                />
                <div className={styles.heroOverlay} />
                <div className={styles.heroContent}>
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <Link href="/blog" className={styles.backLink}>
                            <ChevronLeft size={16} /> Back to Journal
                        </Link>
                        <span className={styles.categoryBadge}>{post.category}</span>
                        <h1 className={styles.title}>{post.title}</h1>
                        <div className={styles.metaData}>
                            <div className={styles.metaItem}>
                                <Calendar size={18} />
                                <span>{post.date}</span>
                            </div>
                            <div className={styles.metaItem}>
                                <User size={18} />
                                <span>{post.author}</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* CONTENT SECTION */}
            <div className={styles.contentGrid}>
                <article className={styles.article}>
                    <div className={styles.postBody}>
                        <p className={styles.lead}>{post.excerpt}</p>

                        {post.content ? (
                            post.content.split('\n').filter((p: string) => p.trim()).map((paragraph: string, i: number) => (
                                <p key={i}>{paragraph}</p>
                            ))
                        ) : (
                            <p style={{ color: 'var(--foreground-soft)', fontStyle: 'italic' }}>
                                Full article content coming soon. Check back for updates.
                            </p>
                        )}
                    </div>

                    {/* SHARE SECTION */}
                    <div className={styles.shareSection}>
                        <span className={styles.shareLabel}>Share the story</span>
                        <div className={styles.shareButtons}>
                            <button className={styles.shareBtn}><Facebook size={18} /></button>
                            <button className={styles.shareBtn}><Twitter size={18} /></button>
                            <button className={styles.shareBtn}><LinkIcon size={18} /></button>
                        </div>
                    </div>
                </article>

                {/* SIDEBAR */}
                <aside className={styles.sidebar}>
                    <div className={styles.sidebarSection}>
                        <h4 className={styles.sidebarTitle}>Related Stories</h4>
                        <div className={styles.relatedGrid}>
                            {relatedPosts.map((rPost: any) => (
                                <Link key={rPost.id} href={`/blog/${rPost.id}`} className={styles.relatedCard}>
                                    <div className={styles.relatedImageWrapper}>
                                        <Image
                                            src={rPost.image.replace('/upload/', '/upload/f_auto,q_auto:best/')}
                                            alt={rPost.title}
                                            fill
                                            quality={100}
                                            sizes="(max-width: 768px) 100vw, 300px"
                                            className={styles.relatedImage}
                                        />
                                    </div>
                                    <h5 className={styles.relatedTitle}>{rPost.title}</h5>
                                    <span className={styles.relatedDate}>{rPost.date}</span>
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className={styles.subscribeCard}>
                        <h4>Join the Pulse</h4>
                        <p>Get exclusive updates and refined inspiration delivered to your inbox.</p>
                        <form onSubmit={(e) => { e.preventDefault(); alert("Welcome to the inner circle."); }}>
                            <input type="email" placeholder="Email Address" required className={styles.sidebarInput} />
                            <button type="submit" className={styles.sidebarButton}>Subscribe</button>
                        </form>
                    </div>
                </aside>
            </div>

            {/* FOOTER CTA */}
            <section className={styles.nextPostCTA}>
                <div className={styles.ctaContent}>
                    <span>Next Post</span>
                    <h2>Exploring Architectural Harmony</h2>
                    <Link href="/blog" className={styles.ctaLink}>
                        Read Next <ArrowRight size={20} />
                    </Link>
                </div>
            </section>
        </main>
    );
}
