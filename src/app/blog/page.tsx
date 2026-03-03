export const revalidate = 3600;
import { getSiteData } from "../actions";
import { motion } from "framer-motion";
import { Calendar, User } from "lucide-react";
import Image from "next/image";
import styles from "./blog.module.css";
import ClientBlogGrid from "./ClientBlogGrid";

export default async function BlogPage() {
    const data = await getSiteData();
    const posts = data.blogPosts || [];
    const heroImage = "https://res.cloudinary.com/dizwm3mic/image/upload/v1772440903/parkside-villa-media/Front_Image_Or_Background_Image/IMG-20251119-WA0061_fvrbbk.jpg";

    return (
        <div className={styles.pageWrapper}>
            {/* Hero Section */}
            <section className={styles.hero}>
                <Image
                    src={heroImage}
                    alt="Blog Hero"
                    fill
                    priority
                    className={styles.heroImage}
                    style={{ objectFit: 'cover' }}
                />
                <div className={styles.heroOverlay} />
                <div className={styles.heroContent}>
                    <div>
                        <span className={styles.badge}>{data.content?.blog_intro?.badge || "Our Journal"}</span>
                        <h1 className={styles.title}>{data.content?.blog_intro?.title || "The Insider's Guide"}</h1>
                        <p className={styles.subtitle}>
                            {data.content?.blog_intro?.subtitle || "Discover design trends, architectural inspiration, and updates from Parkside Villa."}
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
