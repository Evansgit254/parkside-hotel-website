export const revalidate = 3600; // ISR: revalidate every hour

import { getSiteData } from "../actions";
import { Users, Utensils, Waves, Wine, Hotel, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import styles from "./facilities.module.css";
import Image from "next/image";

export default async function FacilitiesPage() {
    const data = await getSiteData();
    const facilities = data.facilities || [];
    const conferenceHalls = (data as any).conferenceHalls || [];
    const galleryItems = data.galleryItems || [];
    const content = data.content || {};
    const facilitiesKeys = content?.facilities_intro || {};

    const Icons: Record<string, any> = { Users, Utensils, Waves, Wine, Hotel };

    return (
        <div className={styles.pageWrapper}>
            {/* Hero Section */}
            <section className={styles.hero}>
                <Image
                    src={content?.facilities_hero?.image || "https://res.cloudinary.com/dizwm3mic/image/upload/f_auto,q_auto/v1772446800/parkside-villa-media/Front_Image_Or_Background_Image/_MG_0701_pzkfbr.jpg"}
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
                    const isConference = facility.id === "conference";

                    return (
                        <div key={facility.id} className={styles.facilitySection} id={facility.id}>
                            <div className={styles.container}>
                                <div className={styles.flexWrapper}>
                                    <div className={styles.imageContainer}>
                                        {facility.image ? (
                                            <Image
                                                src={facility.image}
                                                alt={facility.title}
                                                fill
                                                quality={75}
                                                priority={index === 0}
                                                sizes="(max-width: 1024px) 100vw, 50vw"
                                                className={styles.cardImage}
                                            />
                                        ) : (
                                            <div style={{
                                                width: '100%', height: '100%',
                                                display: 'flex', flexDirection: 'column',
                                                alignItems: 'center', justifyContent: 'center',
                                                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
                                                color: 'rgba(212, 175, 55, 0.6)',
                                                gap: '1rem'
                                            }}>
                                                <IconComponent size={64} />
                                                <span style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                                                    {facility.title}
                                                </span>
                                            </div>
                                        )}
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

                                {/* Show individual halls if it's the conference section */}
                                {isConference && conferenceHalls.length > 0 && (
                                    <div className={styles.hallsGrid}>
                                        {conferenceHalls.map((hall: any) => (
                                            <Link href={`/facilities/conference?hall=${hall.slug}`} key={hall.id} className={styles.hallCard}>
                                                <div className={styles.hallImageContainer}>
                                                    <Image
                                                        src={hall.image || "/placeholder-hall.jpg"}
                                                        alt={hall.name}
                                                        fill
                                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                        style={{ objectFit: 'cover' }}
                                                    />
                                                </div>
                                                <div className={styles.hallContent}>
                                                    <h3 className={styles.hallName}>{hall.name}</h3>
                                                    <span className={styles.hallCapacity}>Up to {hall.capacity} Guests</span>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </section>

            {/* Gallery Section */}
            {galleryItems.length > 0 && (
                <section className={styles.gallerySection}>
                    <div className={styles.container}>
                        <div className={styles.sectionHeader}>
                            <span className={styles.sectionBadge}>Gallery</span>
                            <h2 className={styles.sectionTitle}>The Full Experience</h2>
                        </div>
                        <div className={styles.galleryGrid}>
                            {galleryItems.slice(0, 8).map((item: any) => (
                                <div key={item.id} className={styles.galleryItem}>
                                    <Image
                                        src={item.url}
                                        alt={item.title || "Gallery Item"}
                                        fill
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                                        style={{ objectFit: 'cover' }}
                                    />
                                </div>
                            ))}
                        </div>
                        <div style={{ textAlign: 'center', marginTop: '4rem' }}>
                            <Link href="/gallery" className={styles.exploreLink}>
                                View Full Gallery
                            </Link>
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}
