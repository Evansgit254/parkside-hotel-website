"use client";
export const dynamic = "force-dynamic";

import Image from "next/image";
import styles from "./page.module.css";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { menuCategories as initialMenu } from "../../data/site-data";
import { getSiteData } from "../actions";
import { ChevronLeft, Utensils, Salad, IceCream } from "lucide-react";
import { useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
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

export default function Dining() {
    const { formatPrice } = useCurrency();
    const [menuCategories, setMenuCategories] = useState<any[]>(initialMenu);
    const [content, setContent] = useState<any>({});

    useEffect(() => {
        getSiteData().then(data => {
            if (data && data.menuCategories) setMenuCategories(data.menuCategories);
            if (data && data.content) setContent(data.content);
        });
    }, []);

    const diningKeys = content?.dining_intro || {};

    const [activeCategory, setActiveCategory] = useState<string>("all");
    const [isScrolled, setIsScrolled] = useState(false);
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    });

    const yParallax = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

    const categoryIcons: Record<string, any> = {
        starters: Salad,
        mains: Utensils,
        desserts: IceCream
    };

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const filteredMenu = activeCategory === "all"
        ? menuCategories
        : menuCategories.filter((cat: MenuCategory) => cat.id === activeCategory);

    const fadeInUp = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5 }
    };

    return (
        <main className={styles.main} ref={containerRef}>

            <section className={styles.hero}>
                <motion.img
                    style={{ y: yParallax }}
                    initial={{ scale: 1.1, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1.2 }}
                    src="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=2070"
                    alt="Fine Dining"
                    className={styles.heroImage}
                />
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
                                    {category.items.map((item: MenuItem, idx: number) => (
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

