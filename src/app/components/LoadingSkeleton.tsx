"use client";

import styles from "./LoadingSkeleton.module.css";

export function HeroSkeleton() {
    return (
        <div className={styles.heroSkeleton}>
            <div className={styles.heroContent}>
                <div className={styles.skeletonLine} style={{ width: '60%', height: '3rem' }} />
                <div className={styles.skeletonLine} style={{ width: '40%', height: '1.2rem', marginTop: '1rem' }} />
            </div>
        </div>
    );
}

export function CardSkeleton({ count = 3 }: { count?: number }) {
    return (
        <div className={styles.cardGrid}>
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className={styles.card}>
                    <div className={styles.cardImage} />
                    <div className={styles.cardBody}>
                        <div className={styles.skeletonLine} style={{ width: '70%', height: '1.2rem' }} />
                        <div className={styles.skeletonLine} style={{ width: '90%', height: '0.9rem', marginTop: '0.75rem' }} />
                        <div className={styles.skeletonLine} style={{ width: '50%', height: '0.9rem', marginTop: '0.5rem' }} />
                    </div>
                </div>
            ))}
        </div>
    );
}

export function VenueSkeleton({ count = 3 }: { count?: number }) {
    return (
        <div className={styles.venueList}>
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className={`${styles.venueCard} ${i % 2 === 1 ? styles.reverse : ''}`}>
                    <div className={styles.venueImage} />
                    <div className={styles.venueInfo}>
                        <div className={styles.skeletonLine} style={{ width: '30%', height: '0.8rem' }} />
                        <div className={styles.skeletonLine} style={{ width: '60%', height: '2rem', marginTop: '0.5rem' }} />
                        <div className={styles.skeletonLine} style={{ width: '80%', height: '0.9rem', marginTop: '1rem' }} />
                        <div className={styles.skeletonLine} style={{ width: '30%', height: '2.5rem', marginTop: '1.5rem', borderRadius: '8px' }} />
                    </div>
                </div>
            ))}
        </div>
    );
}

export function PageSkeleton({ type = "cards" }: { type?: "cards" | "venues" | "grid" }) {
    return (
        <main className={styles.main}>
            <HeroSkeleton />
            <section className={styles.section}>
                {type === "venues" ? <VenueSkeleton count={3} /> : <CardSkeleton count={type === "grid" ? 6 : 4} />}
            </section>
        </main>
    );
}
