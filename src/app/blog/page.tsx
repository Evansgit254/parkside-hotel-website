export const dynamic = "force-dynamic";
import { getSiteData } from "../actions";
import { motion } from "framer-motion";
import { Calendar, User } from "lucide-react";
import Link from "next/link";
import styles from "./blog.module.css";
import ClientBlogGrid from "./ClientBlogGrid";

export default async function BlogPage() {
    const data = await getSiteData();
    const posts = data.blogPosts || [];

    return (
        <div className={styles.pageWrapper}>
            {/* Hero Section */}
            <section className={styles.hero}>
                <div className={styles.heroOverlay} />
                <div className={styles.heroContent}>
                    <div>
                        <span className={styles.badge}>Our Journal</span>
                        <h1 className={styles.title}>The Insider&apos;s Guide</h1>
                        <p className={styles.subtitle}>
                            Discover design trends, architectural inspiration, and updates from Parkside Villa.
                        </p>
                    </div>
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
