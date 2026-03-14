"use client";

import SafeImage from "../components/SafeImage";
import Link from "next/link";
import styles from "./page.module.css";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef } from "react";
import { Utensils, Salad, IceCream, ChevronRight } from "lucide-react";
import { useScroll, useTransform } from "framer-motion";
import { useCurrency } from "../context/CurrencyContext";
import HeroSlider from "../components/HeroSlider";

interface MenuItem {
    name: string;
    desc: string;
    price: string;
}

interface MenuCategory {
    id: string;
    name: string;
    items: MenuItem[];
}

interface DiningClientProps {
    menuCategories: any[];
    content: any;
    diningVenues: any[];
}

const categoryIcons: Record<string, any> = {
    starters: Salad,
    mains: Utensils,
    desserts: IceCream
};

export default function DiningClient({ menuCategories, content, diningVenues }: DiningClientProps) {
    const { formatPrice } = useCurrency();
    const [activeCategory, setActiveCategory] = useState<string>("all");
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    });

    const yParallax = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

    const diningKeys = content?.dining_intro || {};

    const filteredMenu = activeCategory === "all"
        ? menuCategories
        : menuCategories.filter((cat: MenuCategory) => cat.id === activeCategory);

    const fadeInUp = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5 }
    };

    const heroImg = content?.dining_hero?.image;
    const heroImages = Array.isArray(heroImg) ? heroImg.filter(Boolean) : (heroImg ? [heroImg] : []);
    const showHero = heroImages.length > 0;

    const venueDefaults: Record<string, any> = {
        dining_vip_lounge: {
            title: "VIP Lounge",
            desc: "An exclusive sanctuary for refined tastes and private conversations.",
            image: "https://res.cloudinary.com/dizwm3mic/image/upload/v1772373676/parkside-villa-media/EXTRA_PHOTOS/IMG_8551_mbm7db.jpg"
        },
        dining_open_bar: {
            title: "Open Bar & Counter",
            desc: "A lively spot for socializing over masterfully crafted cocktails and refreshments.",
            image: "https://res.cloudinary.com/dizwm3mic/image/upload/v1772373676/parkside-villa-media/EXTRA_PHOTOS/IMG_8551_mbm7db.jpg"
        },
        dining_coffee_garden: {
            title: "Coffee Garden Suites",
            desc: "Enjoy your morning brew or evening tea in our tranquil, garden-surrounded suites.",
            image: "https://res.cloudinary.com/dizwm3mic/image/upload/v1772373676/parkside-villa-media/EXTRA_PHOTOS/IMG_8551_mbm7db.jpg"
        },
        dining_ground_restaurant: {
            title: "Ground Restaurant",
            desc: "Our signature dining space offering the finest local and international cuisines.",
            image: "https://res.cloudinary.com/dizwm3mic/image/upload/v1772373676/parkside-villa-media/EXTRA_PHOTOS/IMG_8551_mbm7db.jpg"
        },
        dining_breakfast_restaurant: {
            title: "Breakfast Restaurant",
            desc: "Start your day with a celebration of fresh flavors in our sunlit breakfast hall.",
            image: "https://res.cloudinary.com/dizwm3mic/image/upload/v1772373676/parkside-villa-media/EXTRA_PHOTOS/IMG_8551_mbm7db.jpg"
        }
    };

    const venues = [
        { key: 'dining_vip_lounge', icon: Utensils },
        { key: 'dining_open_bar', icon: Utensils },
        { key: 'dining_coffee_garden', icon: Utensils },
        { key: 'dining_ground_restaurant', icon: Utensils },
        { key: 'dining_breakfast_restaurant', icon: Utensils },
    ].map(v => {
        const dbData = content[v.key] || {};
        const fallback = venueDefaults[v.key] || {};
        return {
            ...v,
            data: {
                title: dbData.title || fallback.title,
                desc: dbData.desc || fallback.desc,
                image: dbData.image || fallback.image
            }
        };
    });

    const menuInfo = {
        eyebrow: content.dining_menu_info?.eyebrow || "Explore Our Flavors",
        title: content.dining_menu_info?.title || "Exquisite Flavor Selections",
        desc: content.dining_menu_info?.desc || "An extensive curated selection of gourmet appetizers, main courses, and artisanal desserts."
    };

    // Use DB venues if they exist, otherwise fallback to standard 5
    const dbVenues = (diningVenues && diningVenues.length > 0)
        ? diningVenues.map((v: any) => ({
            key: v.slug,
            data: {
                title: v.name,
                desc: v.desc,
                image: v.images && v.images.length > 0 ? v.images : [v.image]
            },
            slug: v.slug
        }))
        : venues.map(v => ({ ...v, slug: v.key.replace('dining_', '').replace(/_/g, '-') }));

    // Show all DB venues — if a venue has slug 'our-menu', it links to #menu instead of a detail page
    const displayVenues = dbVenues.map((v: any) => ({
        ...v,
        isAnchor: v.slug === 'our-menu'
    }));

    return (
        <main className={styles.main} ref={containerRef}>
            {showHero ? (
                <section className={styles.hero}>
                    <HeroSlider images={heroImages} fallbackImage={heroImages[0]} />
                    <div className={styles.heroOverlay} />
                    <div className={styles.heroContent}>
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <h1 className={styles.title}>{diningKeys.title || "Divine Dining at Parkside Villa"}</h1>
                            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.25rem', marginTop: '1rem' }}>
                                {diningKeys.desc || "A culinary journey through the flavors of Kitui"}
                            </p>
                        </motion.div>
                    </div>
                </section>
            ) : (
                <section className={styles.section} style={{ paddingTop: '120px', paddingBottom: '0' }}>
                    <div style={{ textAlign: 'center' }}>
                        <h1 style={{ fontSize: '3.5rem', fontFamily: 'Cormorant Garamond, serif' }}>{diningKeys.title || "Divine Dining"}</h1>
                        <p style={{ color: '#6B7280', fontSize: '1.2rem', marginTop: '1rem' }}>{diningKeys.desc || "A culinary journey through the flavors of Kitui"}</p>
                    </div>
                </section>
            )}

            {/* ── VENUES ── */}
            <section className={styles.venuesSection}>
                {displayVenues.map((venue, idx) => (
                    <motion.div
                        key={venue.key}
                        className={`${styles.venueCard} ${idx % 2 === 1 ? styles.reverse : ''}`}
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                    >
                        <div className={styles.venueGallery}>
                            <div className={styles.imageGrid}>
                                {(() => {
                                    const images = Array.isArray(venue.data.image) ? venue.data.image : [venue.data.image].filter(Boolean);
                                    if (images.length === 0) return <div className={styles.placeholderImage}>No images available</div>;

                                    return images.slice(0, 3).map((img: string, i: number) => (
                                        <div key={i} className={`${styles.imageWrapper} ${i === 0 ? styles.large : styles.small}`}>
                                            <SafeImage
                                                src={img}
                                                alt={venue.data.title || "Dining Venue"}
                                                fill
                                                priority={idx === 0 && i === 0}
                                                className={styles.image}
                                                style={{ objectFit: 'cover' }}
                                            />
                                        </div>
                                    ));
                                })()}
                            </div>
                        </div>
                        <div className={styles.venueInfo}>
                            <div className={styles.venueHeader}>
                                <span className={styles.venueNum}>0{idx + 1}</span>
                                <h2 className={styles.venueTitle}>{venue.data.title}</h2>
                            </div>
                            <p className={styles.venueDesc}>{venue.data.desc}</p>
                            <div className={styles.venueFeatures}>
                                <div className={styles.feature}>
                                    <Utensils size={16} />
                                    <span>Premium Service</span>
                                </div>
                                <div className={styles.feature}>
                                    <Utensils size={16} />
                                    <span>Chef's Choice</span>
                                </div>
                            </div>
                            <Link
                                href={(venue as any).isAnchor ? '#menu' : `/dining/${venue.slug}`}
                                className={styles.discoverBtn}
                                onClick={(e) => {
                                    if ((venue as any).isAnchor) {
                                        e.preventDefault();
                                        document.querySelector('#menu')?.scrollIntoView({ behavior: 'smooth' });
                                    }
                                }}
                            >
                                {(venue as any).isAnchor ? 'Explore Menu' : 'Discover More'}
                                <ChevronRight size={18} />
                            </Link>
                        </div>
                    </motion.div>
                ))}
            </section>

            <section className={styles.section} id="menu">
                <motion.div
                    {...fadeInUp}
                    style={{ textAlign: 'center', marginBottom: '3rem' }}
                >
                    <span className="gold-text" style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: 600 }}>{menuInfo.eyebrow || "Explore Our Flavors"}</span>
                    <h2 style={{ fontSize: '2.5rem', marginTop: '1rem' }}>{menuInfo.title || "Exquisite Flavor Selections"}</h2>
                    {menuInfo.desc && (
                        <p style={{ maxWidth: '700px', margin: '1.5rem auto 0', color: '#666', lineHeight: 1.7 }}>
                            {menuInfo.desc}
                        </p>
                    )}

                    {/* Category Filter */}
                    <div className={styles.filterBar}>
                        <button
                            className={`${styles.filterBtn} ${activeCategory === 'all' ? styles.filterActive : ''}`}
                            onClick={() => setActiveCategory('all')}
                        >
                            All
                        </button>
                        {menuCategories.map((cat: MenuCategory) => (
                            <button
                                key={cat.id}
                                className={`${styles.filterBtn} ${activeCategory === cat.id ? styles.filterActive : ''}`}
                                onClick={() => setActiveCategory(cat.id)}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </motion.div>

                <div className={styles.menuGrid}>
                    <AnimatePresence mode="wait">
                        {filteredMenu.map((category: MenuCategory) => (
                            <motion.div
                                key={category.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.4 }}
                                className={styles.category}
                            >
                                <h3 className={styles.categoryTitle}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        {categoryIcons[category.id] && (() => {
                                            const Icon = categoryIcons[category.id];
                                            return <Icon className="gold-text" size={24} />;
                                        })()}
                                        {category.name}
                                    </div>
                                </h3>
                                <div className={styles.menuList}>
                                    {Array.isArray(category.items) && category.items.map((item: MenuItem, idx: number) => (
                                        <motion.div
                                            key={item.name}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            className={styles.menuItem}
                                        >
                                            <div className={styles.itemHeader}>
                                                <span className={styles.itemName}>{item.name}</span>
                                                <span className={styles.itemPrice}>{formatPrice(item.price)}</span>
                                            </div>
                                            <p className={styles.itemDesc}>{item.desc}</p>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </section>
        </main>
    );
}
