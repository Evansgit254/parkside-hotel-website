export const revalidate = 3600;

import { getSiteData } from "../actions";
import { Users, Utensils, Waves, Wine, Hotel, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import styles from "../rooms/rooms.module.css"; // Using the finalized high-end vertical list styles
import SafeImage from "../components/SafeImage";

export default async function FacilitiesPage() {
    const data = await getSiteData();
    const facilities = data.facilities || [];
    const content = data.content || {};
    const facilitiesIntro = content?.facilities_intro || {};

    const Icons: Record<string, any> = { Users, Utensils, Waves, Wine, Hotel };

    return (
        <div className={styles.listingWrapper}>
            {/* Hero Section */}
            <section className={styles.heroSection}>
                <SafeImage
                    src={content?.facilities_hero?.image || "https://res.cloudinary.com/dizwm3mic/image/upload/f_auto,q_auto/v1772446800/parkside-villa-media/Front_Image_Or_Background_Image/_MG_0701_pzkfbr.jpg"}
                    alt="Facilities Hero"
                    fill
                    priority
                    quality={90}
                    className={styles.heroBgImage}
                    style={{ objectFit: 'cover' }}
                    fallbackText="Luxury Facilities"
                />
                <div className={styles.heroOverlay} />
                <div className={styles.heroContent}>
                    <span className={styles.heroBadge}>{facilitiesIntro.badge || "World-Class Amenities"}</span>
                    <h1 className={styles.heroTitle}>{facilitiesIntro.title || "Premium Hotel Facilities"}</h1>
                    <p className={styles.heroSubtitle}>
                        {facilitiesIntro.desc || "Experience a blend of luxury and convenience with our top-tier facilities designed for your comfort."}
                    </p>
                </div>
            </section>

            {/* Vertical List of Facilities */}
            <section className={styles.listSection}>
                <div className={styles.listContainer}>
                    {facilities.map((facility: any, index: number) => {
                        const IconComponent = Icons[facility.icon] || Hotel;
                        const isEven = index % 2 === 1;

                        return (
                            <div key={facility.id} className={`${styles.listItem} ${isEven ? styles.itemReverse : ""}`}>
                                <div className={styles.itemImageWrapper}>
                                    <SafeImage
                                        src={facility.image}
                                        alt={facility.title}
                                        fill
                                        sizes="(max-width: 1024px) 100vw, 50vw"
                                        className={styles.itemImage}
                                        style={{ objectFit: 'cover' }}
                                        fallbackText="Amenity details coming soon"
                                    />
                                    <div className={styles.imageOverlay} />
                                    <div className={styles.itemTagBadge}>
                                        <IconComponent size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                                        <span>Luxury Amenity</span>
                                    </div>
                                </div>

                                <div className={styles.itemContent}>
                                    <div className={styles.contentHeader}>
                                        <div className={styles.priceTag}>
                                            <span className={styles.priceAmount}>Premier</span>
                                            <span className={styles.pricePeriod}>Experience</span>
                                        </div>
                                        <h2 className={styles.itemTitle}>{facility.title}</h2>
                                    </div>
                                    <p className={styles.itemDesc}>{facility.desc}</p>

                                    <div className={styles.amenityRow}>
                                        {facility.features?.slice(0, 3).map((f: string, i: number) => (
                                            <div key={i} className={styles.amenityItem}>
                                                <CheckCircle2 size={12} color="#d4af37" />
                                                {f}
                                            </div>
                                        ))}
                                    </div>

                                    <div className={styles.actionGroup}>
                                        <Link href={`/facilities/${facility.id}`} className={styles.primaryLink}>
                                            Explore Details
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>
        </div>
    );
}

