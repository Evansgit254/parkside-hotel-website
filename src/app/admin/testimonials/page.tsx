"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import styles from "../admin.module.css";
import { getSiteData, updateTestimonial, deleteTestimonial, addTestimonial } from "../../actions";
import { Edit2, Trash2, Plus, Star, Quote, CheckCircle2 } from "lucide-react";
import AdminModal from "../../components/AdminModal";
import { showToast } from "../components/AdminToast";

export default function AdminTestimonials() {
    const [testimonials, setTestimonials] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editForm, setEditForm] = useState<any>({ id: "", name: "", title: "", text: "", isNew: false });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        getSiteData().then(data => {
            if (data && data.testimonials) setTestimonials(data.testimonials);
            setLoading(false);
        });
    }, []);

    const handleEdit = (testi: any) => {
        setEditForm({ ...testi, isNew: false });
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setEditForm({ id: "NEW", name: "", title: "", text: "", isNew: true });
        setIsModalOpen(true);
    };

    const [error, setError] = useState<string | null>(null);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);
        try {
            let res;
            if (editForm.isNew) {
                const { id, isNew, ...rest } = editForm;
                res = await addTestimonial(rest);
            } else {
                res = await updateTestimonial(editForm.id, editForm);
            }

            if (res?.success) {
                const data = await getSiteData();
                setTestimonials(data.testimonials);
                setIsModalOpen(false);
                showToast(editForm.isNew ? "Testimonial added successfully" : "Testimonial updated successfully", "success");
            } else {
                setError(res?.error || "Failed to save testimonial.");
            }
        } catch (err) {
            setError("An unexpected error occurred.");
        }
        setIsSaving(false);
    };

    const handleDelete = async (id: number | string) => {
        if (confirm("Are you sure you want to delete this testimonial?")) {
            const res = await deleteTestimonial(id as number);
            if (res?.success) {
                const data = await getSiteData();
                setTestimonials(data.testimonials);
                showToast("Testimonial deleted successfully", "success");
            } else {
                showToast(res?.error || "Failed to delete testimonial.", "error");
            }
        }
    };

    if (loading) return <div className={styles.mainContent}>Loading...</div>;

    return (
        <div className={styles.mainContent}>
            <div className={styles.sectionHeader}>
                <div>
                    <h1 className={styles.sectionTitle}>Testimonials</h1>
                    <p style={{ color: '#6B7280', marginTop: '0.5rem' }}>Curate the voices of your satisfied guests</p>
                </div>
                <button onClick={handleAdd} className={styles.addButton}>
                    <Plus size={18} /> Add Review
                </button>
            </div>

            <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))' }}>
                {testimonials.map((testi) => (
                    <div key={testi.id} className={styles.card} style={{
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'relative',
                        overflow: 'hidden',
                        border: testi.status === 'Pending' ? '1px solid var(--secondary)' : undefined
                    }}>
                        {testi.status === 'Pending' && (
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                background: 'var(--secondary)',
                                color: '#000',
                                fontSize: '0.65rem',
                                fontWeight: 800,
                                textAlign: 'center',
                                padding: '2px 0',
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em'
                            }}>
                                Pending Approval
                            </div>
                        )}
                        <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', opacity: 0.05, color: '#111827' }}>
                            <Quote size={80} />
                        </div>

                        <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '1.5rem', color: 'var(--secondary)', marginTop: testi.status === 'Pending' ? '1rem' : 0 }}>
                            {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                        </div>

                        <div style={{ flex: 1 }}>
                            <p style={{ fontSize: '1rem', color: '#6B7280', fontStyle: 'italic', lineHeight: '1.7', marginBottom: '2rem' }}>
                                "{testi.text}"
                            </p>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid rgba(0,0,0,0.07)', paddingTop: '1.5rem' }}>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#111827' }}>{testi.name}</div>
                                <div style={{ fontSize: '0.8125rem', color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '0.25rem' }}>{testi.title}</div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                {testi.status === 'Pending' && (
                                    <button
                                        onClick={async () => {
                                            const res = await updateTestimonial(testi.id, { ...testi, status: 'Active' });
                                            if (res?.success) {
                                                const data = await getSiteData();
                                                setTestimonials(data.testimonials);
                                                showToast("Testimonial approved", "success");
                                            } else {
                                                showToast("Failed to approve testimonial.", "error");
                                            }
                                        }}
                                        className={styles.actionBtn}
                                        style={{ color: '#4ade80' }}
                                        title="Approve"
                                    >
                                        <CheckCircle2 size={16} />
                                    </button>
                                )}
                                <button onClick={() => handleEdit(testi)} className={styles.actionBtn} title="Edit">
                                    <Edit2 size={16} />
                                </button>
                                <button onClick={() => handleDelete(testi.id)} className={`${styles.actionBtn} ${styles.deleteBtn}`} title="Delete">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <AdminModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editForm.isNew ? "Add Guest Review" : `Edit Review from ${editForm.name}`}
                onSubmit={handleSave}
                loading={isSaving}
                error={error}
            >
                <div className={styles.formGroup}>
                    <label className={styles.label}>Review Text</label>
                    <textarea
                        className={styles.input}
                        style={{ minHeight: '120px' }}
                        placeholder="Paste the guest's feedback here..."
                        value={editForm.text}
                        onChange={e => setEditForm({ ...editForm, text: e.target.value })}
                        required
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Guest Name</label>
                        <input
                            className={styles.input}
                            placeholder="e.g. Sarah J. Johnson"
                            value={editForm.name}
                            onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Guest Title / Origin</label>
                        <input
                            className={styles.input}
                            placeholder="e.g. Business Traveler"
                            value={editForm.title}
                            onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                            required
                        />
                    </div>
                </div>
            </AdminModal>
        </div>
    );
}

