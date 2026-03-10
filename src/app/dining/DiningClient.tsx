"use client";

import SafeImage from "../components/SafeImage";
import styles from "./page.module.css";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { Utensils, Salad, IceCream } from "lucide-react";
import { useScroll, useTransform } from "framer-motion";
import { useCurrency } from "../context/CurrencyContext";

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
    menuCategories: MenuCategory[];
    content: any;
}

const categoryIcons: Record<string, any> = {
    starters: Salad,
    mains: Utensils,
    desserts: IceCream
};

export default function DiningClient({ menuCategories, content }: DiningClientProps) {
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
    const resolvedHeroImg = Array.isArray(heroImg) ? heroImg[0] : heroImg;
    const showHero = !!resolvedHeroImg;

    return (
        <main className={styles.main} ref={containerRef}>
            {showHero ? (
                <section className={styles.hero}>
                    <motion.div
                        style={{ y: yParallax, height: '100%', width: '100%', position: 'absolute', top: 0, left: 0 }}
                        initial={{ scale: 1.1, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 1.2 }}
                    >
                        <SafeImage
                            src={resolvedHeroImg}
                            alt="Fine Dining"
                            fill
                            priority
                            quality={90}
                            className={styles.heroImage}
                            style={{ objectFit: 'cover' }}
                            fallbackText="Our Culinary Haven"
                        />
                    </motion.div>
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

            <section className={styles.section} id="menu">
                <motion.div
                    {...fadeInUp}
                    style={{ textAlign: 'center', marginBottom: '3rem' }}
                >
                    <span className="gold-text" style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: 600 }}>{content.dining_menu?.eyebrow || "Explore Our Flavors"}</span>
                    <h2 style={{ fontSize: '2.5rem', marginTop: '1rem' }}>{content.dining_menu?.title || "Exquisite Flavor Selections"}</h2>

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
