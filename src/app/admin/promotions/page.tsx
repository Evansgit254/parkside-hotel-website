"use client";

import { useState, useEffect } from "react";
import { getPromotions, addPromotion, deletePromotion } from "../../actions";
import styles from "../admin.module.css";
import { Plus, Trash2, Calendar, Tag, Percent, ArrowUpRight } from "lucide-react";

export default function PromotionsAdmin() {
    const [promotions, setPromotions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [newPromo, setNewPromo] = useState({
        title: "",
        code: "",
        discount: "",
        expiry: "",
        description: ""
    });

    useEffect(() => {
        loadPromotions();
    }, []);

    async function loadPromotions() {
        const data = await getPromotions();
        setPromotions(data);
        setLoading(false);
    }

    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        const res = await addPromotion({
            code: newPromo.code,
            discount: parseFloat(newPromo.discount) || 0,
            type: "percentage",
            validTo: newPromo.expiry || undefined,
        });
        if (res.success) {
            setPromotions([...promotions, res.promotion]);
            setNewPromo({ title: "", code: "", discount: "", expiry: "", description: "" });
            setIsAdding(false);
        } else {
            setError(res.error || "Failed to add promotion");
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Are you sure you want to delete this promotion?")) return;
        const res = await deletePromotion(id);
        if (res.success) {
            setPromotions(promotions.filter(p => p.id !== id));
        } else {
            alert(res.error || "Failed to delete promotion");
        }
    }

    if (loading) return <div className={styles.loading}>Accessing Vault...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Promotions & Offers</h1>
                    <p className={styles.subtitle}>Manage seasonal deals and exclusive guest rewards</p>
                </div>
                <button
                    className={styles.primaryBtn}
                    onClick={() => setIsAdding(true)}
                >
                    <Plus size={16} /> New Campaign
                </button>
            </div>

            {isAdding && (
                <div className={styles.formCard}>
                    <h3 className={styles.cardTitle}>Create New Campaign</h3>
                    {error && (
                        <div className={styles.error} style={{ marginBottom: '1.5rem', borderRadius: '8px' }}>
                            {error}
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className={styles.grid}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Campaign Title</label>
                            <input
                                type="text"
                                required
                                className={styles.input}
                                placeholder="e.g. Easter Special"
                                value={newPromo.title}
                                onChange={e => setNewPromo({ ...newPromo, title: e.target.value })}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Discount Code</label>
                            <input
                                type="text"
                                required
                                className={styles.input}
                                placeholder="PV-EASTER-20"
                                value={newPromo.code}
                                onChange={e => setNewPromo({ ...newPromo, code: e.target.value.toUpperCase() })}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Discount (%)</label>
                            <input
                                type="number"
                                required
                                className={styles.input}
                                placeholder="20"
                                value={newPromo.discount}
                                onChange={e => setNewPromo({ ...newPromo, discount: e.target.value })}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Expiry Date</label>
                            <input
                                type="date"
                                required
                                className={styles.input}
                                value={newPromo.expiry}
                                onChange={e => setNewPromo({ ...newPromo, expiry: e.target.value })}
                            />
                        </div>
                        <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
                            <label className={styles.label}>Short Description</label>
                            <textarea
                                className={styles.input}
                                rows={2}
                                value={newPromo.description}
                                onChange={e => setNewPromo({ ...newPromo, description: e.target.value })}
                            />
                        </div>
                        <div className={styles.formActions}>
                            <button type="button" onClick={() => setIsAdding(false)} className={styles.secondaryBtn}>Cancel</button>
                            <button type="submit" className={styles.primaryBtn}>Launch Campaign</button>
                        </div>
                    </form>
                </div>
            )}

            <div className={styles.promoGrid}>
                {promotions.map((promo) => (
                    <div key={promo.id} className={styles.promoCard}>
                        <div className={styles.promoHeader}>
                            <div className={styles.promoIcon}><Percent size={20} /></div>
                            <button
                                className={styles.deleteBtn}
                                onClick={() => handleDelete(promo.id)}
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                        <div className={styles.promoInfo}>
                            <h3 className={styles.promoTitle}>{promo.title}</h3>
                            <code className={styles.promoCode}>{promo.code}</code>
                            <p className={styles.promoDesc}>{promo.description}</p>
                        </div>
                        <div className={styles.promoFooter}>
                            <div className={styles.promoStat}>
                                <span className={styles.statLabel}>Discount</span>
                                <span className={styles.statValue}>{promo.discount}% OFF</span>
                            </div>
                            <div className={styles.promoStat}>
                                <span className={styles.statLabel}>Ends On</span>
                                <span className={styles.statValue}>{new Date(promo.expiry).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {promotions.length === 0 && !isAdding && (
                <div className={styles.emptyState}>
                    <Tag size={48} className={styles.emptyIcon} />
                    <h3>No Active Campaigns</h3>
                    <p>Drive bookings by creating seasonal offers and exclusive discount codes.</p>
                </div>
            )}
        </div>
    );
}
