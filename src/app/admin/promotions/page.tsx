"use client";

import { useState, useEffect } from "react";
import { getPromotions, addPromotion, updatePromotion, deletePromotion } from "../../actions";
import styles from "../admin.module.css";
import { Plus, Trash2, Calendar, Tag, Percent, ArrowUpRight, Edit2, X, Save } from "lucide-react";
import { showToast } from "../components/AdminToast";
import AdminModal from "../../components/AdminModal";

export default function PromotionsAdmin() {
    const [promotions, setPromotions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [editForm, setEditForm] = useState({
        id: "",
        title: "",
        code: "",
        discount: "",
        expiry: "",
        description: ""
    });
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        loadPromotions();
    }, []);

    async function loadPromotions() {
        const data = await getPromotions();
        setPromotions(data);
        setLoading(false);
    }

    const [error, setError] = useState<string | null>(null);

    const handleEdit = (promo: any) => {
        setEditForm({
            id: promo.id,
            title: promo.title || "",
            code: promo.code || "",
            discount: promo.discount.toString(),
            expiry: promo.expiry ? new Date(promo.expiry).toISOString().split('T')[0] : "",
            description: promo.description || ""
        });
        setModalOpen(true);
    };

    const handleNew = () => {
        setEditForm({
            id: "",
            title: "",
            code: "",
            discount: "",
            expiry: "",
            description: ""
        });
        setModalOpen(true);
    };

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const promoData = {
            code: editForm.code,
            discount: parseFloat(editForm.discount) || 0,
            type: "percentage",
            validTo: editForm.expiry || undefined,
            title: editForm.title,
            description: editForm.description,
        };

        let res;
        if (editForm.id) {
            res = await updatePromotion(editForm.id, promoData);
        } else {
            res = await addPromotion(promoData);
        }

        if (res.success) {
            await loadPromotions();
            setModalOpen(false);
            setEditForm({ id: "", title: "", code: "", discount: "", expiry: "", description: "" });
            showToast(editForm.id ? "Campaign updated successfully" : "Campaign launched successfully", "success");
        } else {
            setError(res.error || "Failed to save promotion");
        }
        setLoading(false);
    }

    async function handleDelete() {
        if (!deleteId) return;
        setIsDeleting(true);
        const res = await deletePromotion(deleteId);
        if (res.success) {
            setPromotions(promotions.filter(p => p.id !== deleteId));
            setDeleteId(null);
            showToast("Promotion deleted successfully", "success");
        } else {
            showToast(res.error || "Failed to delete promotion", "error");
        }
        setIsDeleting(false);
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
                    onClick={handleNew}
                >
                    <Plus size={16} /> New Campaign
                </button>
            </div>

            {modalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent} style={{ maxWidth: '600px' }}>
                        <div className={styles.modalHeader}>
                            <div>
                                <h3 className={styles.modalTitle}>{editForm.id ? "Edit Campaign" : "Create New Campaign"}</h3>
                                <p className={styles.modalSub}>Configure seasonal rewards and exclusive estate offers.</p>
                            </div>
                            <button onClick={() => setModalOpen(false)} className={styles.modalClose}><X size={20} /></button>
                        </div>
                        {error && (
                            <div className={styles.error} style={{ margin: '1rem 2rem 0', borderRadius: '8px' }}>
                                {error}
                            </div>
                        )}
                        <form onSubmit={handleSave} className={styles.modalBody}>
                            <div className={styles.formGrid}>
                                <div className={styles.formSection}>
                                    <label className={styles.label}>Campaign Title</label>
                                    <input
                                        type="text"
                                        
                                        className={styles.input}
                                        placeholder="e.g. Easter Special"
                                        value={editForm.title}
                                        onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                                    />
                                </div>
                                <div className={styles.formSection}>
                                    <label className={styles.label}>Discount Code</label>
                                    <input
                                        type="text"
                                        
                                        className={styles.input}
                                        placeholder="PV-EASTER-20"
                                        value={editForm.code}
                                        onChange={e => setEditForm({ ...editForm, code: e.target.value.toUpperCase() })}
                                    />
                                </div>
                                <div className={styles.formSection}>
                                    <label className={styles.label}>Discount (%)</label>
                                    <input
                                        type="number"
                                        className={styles.input}
                                        placeholder="20"
                                        value={editForm.discount}
                                        onChange={e => setEditForm({ ...editForm, discount: e.target.value })}
                                    />
                                </div>
                                <div className={styles.formSection}>
                                    <label className={styles.label}>Expiry Date</label>
                                    <input
                                        type="date"
                                        
                                        className={styles.input}
                                        value={editForm.expiry}
                                        onChange={e => setEditForm({ ...editForm, expiry: e.target.value })}
                                    />
                                </div>
                                <div className={styles.formSection} style={{ gridColumn: 'span 2' }}>
                                    <label className={styles.label}>Short Description</label>
                                    <textarea
                                        className={styles.input}
                                        rows={3}
                                        value={editForm.description}
                                        onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className={styles.modalFooter}>
                                <button type="button" onClick={() => setModalOpen(false)} className={styles.secondaryBtn}>Cancel</button>
                                <button type="submit" className={styles.saveButton} disabled={loading}>
                                    <Save size={16} /> {loading ? "Saving..." : editForm.id ? "Save Changes" : "Launch Campaign"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className={styles.promoGrid}>
                {promotions.map((promo) => (
                    <div key={promo.id} className={styles.promoCard}>
                        <div className={styles.promoHeader}>
                            <div className={styles.promoIcon}><Percent size={20} /></div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                    className={styles.mediaEditBtn}
                                    style={{ background: 'rgba(201,168,76,0.1)', color: 'var(--secondary)', border: 'none', padding: '8px', cursor: 'pointer', borderRadius: '6px' }}
                                    onClick={() => handleEdit(promo)}
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    className={styles.deleteBtn}
                                    style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', padding: '8px', cursor: 'pointer', borderRadius: '6px' }}
                                    onClick={() => setDeleteId(promo.id)}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
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

            {promotions.length === 0 && !modalOpen && (
                <div className={styles.emptyState}>
                    <Tag size={48} className={styles.emptyIcon} />
                    <h3>No Active Campaigns</h3>
                    <p>Drive bookings by creating seasonal offers and exclusive discount codes.</p>
                </div>
            )}
            {/* Delete Confirmation Modal */}
            <AdminModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                title="Confirm Deletion"
                onSubmit={(e) => { e.preventDefault(); handleDelete(); }}
                loading={isDeleting}
                submitLabel="Delete Campaign"
                danger
            >
                <div style={{ padding: '1rem 0' }}>
                    <p style={{ color: '#6B7280', fontSize: '0.9375rem', lineHeight: '1.6' }}>
                        Are you sure you want to delete <strong style={{ color: '#111827' }}>{promotions.find(p => p.id === deleteId)?.title}</strong>?
                    </p>
                    <p style={{ color: '#EF4444', fontSize: '0.8125rem', marginTop: '1rem', fontWeight: 500 }}>
                        This will terminate the campaign. This action cannot be undone.
                    </p>
                </div>
            </AdminModal>
        </div>
    );
}
