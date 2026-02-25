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
                    src={post.image}
                    alt={post.title}
                    fill
                    priority
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

                        <p>
                            Nestled in the heart of Kitui, Parkside Villa stands as a beacon of luxury and refined hospitality.
                            Our journey began with a vision to create an oasis where traditional African warmth meets
                            contemporary world-class amenities.
                        </p>

                        <h3>Refining the Guest Experience</h3>
                        <p>
                            Every detail at Parkside Villa is meticulously curated to ensure our guests feel not just welcomed,
                            but truly at home. From the locally sourced materials used in our furniture to the state-of-the-art
                            technology in our executive suites, we believe that the true essence of luxury lies in the balance
                            of heritage and innovation.
                        </p>

                        <blockquote>
                            "Luxury is not just about the amenities, it's about the feeling of being somewhere where
                            every detail has been thought of with you in mind."
                        </blockquote>

                        <p>
                            As we continue to evolve, our commitment to excellence remains steadfast. Whether you are
                            visiting for business in our high-tech conference halls or seeking a peaceful retreat in our
                            lush gardens, Parkside Villa promises an experience that lingers long after you've checked out.
                        </p>
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
                                        <Image src={rPost.image} alt={rPost.title} fill className={styles.relatedImage} />
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
