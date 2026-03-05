export const revalidate = 3600;

import { getSiteData } from "../../actions";
import { CheckCircle2, Wifi, Wind, Tv, Utensils, Coffee, Info, Calendar, ChevronLeft, Star, Users } from "lucide-react";
import Link from "next/link";
import styles from "../../rooms/rooms.module.css"; // High-end rooms & facilities styles
import SafeImage from "../../components/SafeImage";
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const data = await getSiteData();
    const room = data.rooms?.find((r: any) => r.id === id);
    return {
        title: room ? `${room.name} | Accommodation | Parkside Villa Kitui` : "Room Detail",
        description: room?.desc || "Luxury suites and cottages at Parkside Villa Kitui."
    };
}

export default async function RoomDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const data = await getSiteData();
    const room = data.rooms?.find((r: any) => r.id === id);

    if (!room) {
        return (
            <div className={styles.detailContainer} style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Room Not Found</h1>
                    <Link href="/rooms" className={styles.backLink}>
                        <ChevronLeft size={16} /> Back to Accommodation
                    </Link>
                </div>
            </div>
        );
    }

    const allImages = [room.image, ...((room.images as string[]) || [])].filter(Boolean);
    const price = typeof room.price === 'string' ? room.price : `KES ${room.price}`;

    return (
        <div className={styles.detailWrapper}>
            {/* Hero Section */}
            <section className={styles.detailHeroSection}>
                <SafeImage
                    src={room.image}
                    alt={room.name}
                    fill
                    priority
                    className={styles.detailHeroImage}
                    style={{ objectFit: 'cover' }}
                    fallbackText={room.name}
                />
                <div className={styles.detailHeroOverlay} />
                <div className={styles.detailHeroContent}>
                    <div className={styles.detailHeroBadge}>
                        <Star size={14} />
                        <span>{room.tag || "Luxury Sanctuary"}</span>
                    </div>
                    <h1 className={styles.detailTitle}>{room.name}</h1>
                    <p className={styles.detailPrice}>{price} <small>/ night</small></p>
                </div>
            </section>

            {/* Mosaic Gallery */}
            <section className={styles.gallerySection}>
                <div className={styles.container}>
                    <div className={styles.mosaicGallery}>
                        {/* Featured Image */}
                        <div className={styles.mosaicItem}>
                            <SafeImage
                                src={allImages[0]}
                                alt={`${room.name} - Featured`}
                                fill
                                priority
                                sizes="(max-width: 768px) 100vw, 50vw"
                                className={styles.galleryImage}
                                style={{ objectFit: 'cover' }}
                                fallbackText="Luxury Sanctuary"
                            />
                        </div>

                        {/* Grid Images */}
                        {allImages.slice(1, 5).map((img, idx) => (
                            <div key={idx} className={styles.mosaicItem}>
                                <SafeImage
                                    src={img}
                                    alt={`${room.name} - Room Corner ${idx + 1}`}
                                    fill
                                    sizes="(max-width: 768px) 50vw, 25vw"
                                    className={styles.galleryImage}
                                    style={{ objectFit: 'cover' }}
                                    fallbackText="Room detail"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <div className={styles.detailContentGrid}>
                {/* Main Content */}
                <div className={styles.detailMainColumn}>
                    <nav className={styles.breadcrumb}>
                        <Link href="/rooms">Accommodation</Link>
                        <span>/</span>
                        <span className={styles.current}>{room.name}</span>
                    </nav>

                    <div className={styles.detailIntro}>
                        <h2 className={styles.sectionTitle}>The Space</h2>
                        <div className={styles.richText}>
                            <p>{room.desc}</p>
                        </div>
                    </div>

                    <div className={styles.amenitiesSection}>
                        <h2 className={styles.sectionTitle}>Amenities & Features</h2>
                        <div className={styles.featuresGrid}>
                            {Array.isArray(room.amenities) && room.amenities.length > 0 ? (
                                room.amenities.map((amenity: string, idx: number) => (
                                    <div key={idx} className={styles.featureItem}>
                                        <CheckCircle2 size={18} className={styles.featureIcon} />
                                        <span>{amenity}</span>
                                    </div>
                                ))
                            ) : (
                                <>
                                    <div className={styles.featureItem}><Wifi size={18} className={styles.featureIcon} /> <span>High-Speed WiFi</span></div>
                                    <div className={styles.featureItem}><Wind size={18} className={styles.featureIcon} /> <span>Air Conditioning</span></div>
                                    <div className={styles.featureItem}><Tv size={18} className={styles.featureIcon} /> <span>Smart TV with Satellite</span></div>
                                    <div className={styles.featureItem}><Utensils size={18} className={styles.featureIcon} /> <span>Room Service</span></div>
                                    <div className={styles.featureItem}><Coffee size={18} className={styles.featureIcon} /> <span>Tea & Coffee Maker</span></div>
                                    <div className={styles.featureItem}><CheckCircle2 size={18} className={styles.featureIcon} /> <span>Premium Bedding</span></div>
                                </>
                            )}
                        </div>
                    </div>

                    <div className={styles.highlightsSection}>
                        <h2 className={styles.sectionTitle}>Stay Information</h2>
                        <div className={styles.infoCards}>
                            <div className={styles.infoCard}>
                                <Users size={20} className={styles.infoIcon} />
                                <div>
                                    <h4>Capacity</h4>
                                    <p>Up to {room.capacity || 2} Guests</p>
                                </div>
                            </div>
                            <div className={styles.infoCard}>
                                <Info size={20} className={styles.infoIcon} />
                                <div>
                                    <h4>Check-in / Check-out</h4>
                                    <p>Check-in: 2:00 PM | Check-out: 11:00 AM</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Booking */}
                <aside className={styles.detailSidebar}>
                    <div className={styles.inquiryCard}>
                        <div className={styles.inquiryHeader}>
                            <h3>Reserve {room.name}</h3>
                            <p>Select your dates to check availability and book your sanctuary.</p>
                        </div>
                        <form className={styles.inquiryForm}>
                            <div className={styles.formGrid}>
                                <div className={styles.formGroup}>
                                    <label>Check In</label>
                                    <input type="date" required />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Check Out</label>
                                    <input type="date" required />
                                </div>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Guests</label>
                                <select>
                                    {Array.from({ length: room.capacity || 2 }, (_, i) => i + 1).map(num => (
                                        <option key={num}>{num} Adult{num > 1 ? 's' : ''}</option>
                                    ))}
                                    {room.capacity > 1 && <option>{room.capacity} Adults, 1 Child</option>}
                                </select>
                            </div>
                            <button type="submit" className={styles.submitBtn}>
                                Request Booking
                            </button>
                        </form>
                        <p className={styles.formNotice}>
                            <Calendar size={12} />
                            Secured via M-Pesa or Card
                        </p>
                    </div>
                </aside>
            </div>
        </div>
    );
}
