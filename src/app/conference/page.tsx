export const revalidate = 3600;

import { getSiteData } from "../actions";
import Link from "next/link";
import SafeImage from "../components/SafeImage";
import styles from "./conference.module.css";
import { Users, ArrowRight } from "lucide-react";

export default async function ConferencePage() {
    const data = await getSiteData();
    const halls = (data as any).conferenceHalls || [];
    const content = data.content || {};
    const intro = content?.conference_intro || {};

    return (
        <div className={styles.pageWrapper}>
            {/* Hero */}
            <section className={styles.hero}>
                <SafeImage
                    src={halls[0]?.image || "https://res.cloudinary.com/dizwm3mic/image/upload/f_auto,q_auto/v1772446800/parkside-villa-media/Front_Image_Or_Background_Image/_MG_0701_pzkfbr.jpg"}
                    alt="Conference Facilities"
                    fill
                    priority
                    quality={90}
                    className={styles.heroImage}
                    style={{ objectFit: 'cover' }}
                    fallbackText="Our Premium Venues"
                />
                <div className={styles.heroOverlay} />
                <div className={styles.heroContent}>
                    <span className={styles.badge}>{intro.badge || "World-Class Venues"}</span>
                    <h1 className={styles.title}>{intro.title || "Conference & Events"}</h1>
                    <p className={styles.subtitle}>
                        {intro.desc || "State-of-the-art conference halls designed for productive meetings, corporate events, and unforgettable celebrations."}
                    </p>
                </div>
            </section>

            {/* Vertical Listing */}
            <section className={styles.listSection}>
                <div className={styles.container}>
                    {halls.map((hall: any, index: number) => (
                        <Link href={`/conference/${hall.slug}`} key={hall.id} className={styles.listItem}>
                            <div className={styles.listImageWrapper}>
                                {hall.image ? (
                                    <SafeImage
                                        src={hall.image}
                                        alt={hall.name}
                                        fill
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                        quality={90}
                                        priority={index < 2}
                                        className={styles.listImage}
                                        style={{ objectFit: 'cover' }}
                                        fallbackText="Venue image coming soon"
                                    />
                                ) : (
                                    <div className={styles.placeholderImage}>
                                        <Users size={48} />
                                    </div>
                                )}
                                <div className={styles.capacityBadge}>
                                    <Users size={14} /> {hall.capacity} guests
                                </div>
                            </div>
                            <div className={styles.listContent}>
                                <h2 className={styles.listName}>{hall.name}</h2>
                                <p className={styles.listDesc}>{hall.desc}</p>
                                {hall.setups && hall.setups.length > 0 && (
                                    <div className={styles.setupTags}>
                                        {hall.setups.map((setup: string, i: number) => (
                                            <span key={i} className={styles.setupTag}>{setup}</span>
                                        ))}
                                    </div>
                                )}
                                <span className={styles.viewDetails}>
                                    View Details <ArrowRight size={16} />
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
}
