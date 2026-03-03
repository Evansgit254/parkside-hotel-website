export const revalidate = 3600; // ISR: revalidate every hour

import { getSiteData } from "../actions";
import { Users, Utensils, Waves, Wine, Hotel, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import styles from "./facilities.module.css";
import Image from "next/image";

export default async function FacilitiesPage() {
    const data = await getSiteData();
    const facilities = data.facilities || [];
    const content = data.content || {};
    const facilitiesKeys = content?.facilities_intro || {};

    const Icons: Record<string, any> = { Users, Utensils, Waves, Wine, Hotel };

    return (
        <div className={styles.pageWrapper}>
            {/* Hero Section */}
            <section className={styles.hero}>
                <Image
                    src="https://res.cloudinary.com/dizwm3mic/image/upload/f_auto,q_auto/v1772446800/parkside-villa-media/Front_Image_Or_Background_Image/_MG_0701_pzkfbr.jpg"
                    alt="Facilities Hero"
                    fill
                    priority
                    quality={75}
                    className={styles.heroImage}
                    style={{ objectFit: 'cover' }}
                />
                <div className={styles.heroOverlay} />
                <div className={styles.heroContent}>
                    <div>
                        <span className={styles.badge}>{facilitiesKeys.badge || "World-Class Amenities"}</span>
                        <h1 className={styles.title}>{facilitiesKeys.title || "Hotel Facilities"}</h1>
                        <p className={styles.subtitle}>
                            {facilitiesKeys.desc || "Discover a world where unparalleled luxury meets every need. From state-of-the-art conference halls to our tranquil infinity pool, every detail is considered."}
                        </p>
                    </div>
                </div>
            </section>

            {/* Facilities Sections */}
            <section className={styles.facilitiesSection}>
                {facilities.map((facility: any, index: number) => {
                    const IconComponent = Icons[facility.icon] || Hotel;
                    return (
                        <div key={facility.id} className={styles.facilitySection}>
                            <div className={styles.container}>
                                <div className={styles.flexWrapper}>
                                    <div className={styles.imageContainer}>
                                        <Image
                                            src={facility.image || "/placeholder-facility.jpg"}
                                            alt={facility.title}
                                            fill
                                            quality={75}
                                            priority={index === 0}
                                            sizes="(max-width: 1024px) 100vw, 50vw"
                                            className={styles.cardImage}
                                        />
                                    </div>

                                    <div className={styles.contentContainer}>
                                        <div className={styles.iconBadge}>
                                            <IconComponent size={32} />
                                        </div>
                                        <h2 className={styles.cardTitle}>{facility.title}</h2>
                                        <p className={styles.cardDesc}>{facility.desc}</p>

                                        <div className={styles.detailsGrid}>
                                            <div>
                                                <span className={styles.detailHeading}>Key Features</span>
                                                <ul className={styles.featureList}>
                                                    {facility.features?.map((f: string, i: number) => (
                                                        <li key={i} className={styles.featureItem}>
                                                            <CheckCircle2 size={16} className={styles.checkIcon} />
                                                            {f}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <div>
                                                <span className={styles.detailHeading}>Highlights</span>
                                                <ul className={styles.highlightList}>
                                                    {facility.highlights?.map((h: string, i: number) => (
                                                        <li key={i} className={styles.highlightItem}>
                                                            <CheckCircle2 size={16} className={styles.checkIcon} />
                                                            {h}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>

                                        <Link href={`/facilities/${facility.id}`} className={styles.exploreLink}>
                                            Explore {facility.title}
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </section>
        </div>
    );
}
