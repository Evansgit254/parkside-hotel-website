"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect, useRef } from "react";
import styles from "../admin.module.css";
import { getConferenceHalls, createConferenceHall, updateConferenceHall, deleteConferenceHall, uploadImage } from "../../actions";
import { Edit2, Trash2, Plus, Upload, Image as ImageIcon, X, Users, Layout } from "lucide-react";
import AdminModal from "../../components/AdminModal";

export default function AdminConference() {
    const [halls, setHalls] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editForm, setEditForm] = useState<any>({ id: "", name: "", desc: "", image: "", capacity: 50, setups: [] });
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchHalls = async () => {
        const data = await getConferenceHalls();
        setHalls(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchHalls();
    }, []);

    const handleEdit = (hall: any) => {
        setEditForm({ ...hall });
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setEditForm({ id: "NEW", name: "", desc: "", image: "", capacity: 50, setups: [] });
        setIsModalOpen(true);
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            const res = await uploadImage(formData);
            if (res.success && res.url) {
                setEditForm((prev: any) => ({ ...prev, image: res.url }));
            } else {
                alert(res.error || "Upload failed. Please try again.");
            }
        } catch (error) {
            console.error("Upload failed:", error);
            alert("An unexpected error occurred during upload.");
        } finally {
            setIsUploading(false);
        }
    };

    const [error, setError] = useState<string | null>(null);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);

        let res;
        // Ensure capacity is a number and setups is an array (even if empty for now)
        const payload = {
            ...editForm,
            capacity: parseInt(editForm.capacity) || 50,
            setups: Array.isArray(editForm.setups) ? editForm.setups : []
        };

        if (editForm.id === "NEW") {
            const { id, ...createData } = payload;
            res = await createConferenceHall(createData);
        } else {
            res = await updateConferenceHall(editForm.id, payload);
        }

        if (res.success) {
            await fetchHalls();
            setIsModalOpen(false);
        } else {
            setError(res.error || "Failed to save conference hall details.");
        }
        setIsSaving(false);
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this conference hall?")) {
            const res = await deleteConferenceHall(id);
            if (res.success) {
                await fetchHalls();
            } else {
                alert(res.error || "Failed to delete conference hall.");
            }
        }
    };

    if (loading) return <div className={styles.mainContent}>Loading...</div>;

    return (
        <>
            <div className={styles.sectionHeader}>
                <div className={styles.sectionTitleGroup}>
                    <span className={styles.sectionEyebrow}>Facility Management</span>
                    <h1 className={styles.sectionTitle}>Conference Halls</h1>
                    <p className={styles.sectionSubtitle}>Manage individual M.I.C.E. halls, capacities, and settings</p>
                </div>
                <button onClick={handleAdd} className={styles.addButton}>
                    <Plus size={14} /> New Hall
                </button>
            </div>

            <div className={styles.tableContainer}>
                <div className={styles.tableHeader} style={{ gridTemplateColumns: '120px 1fr 120px 80px' }}>
                    <div>Preview</div>
                    <div>Hall Details</div>
                    <div style={{ textAlign: 'center' }}>Capacity</div>
                    <div style={{ textAlign: 'right' }}>Actions</div>
                </div>

                {halls.map((hall) => (
                    <div key={hall.id} className={styles.tableRow} style={{ gridTemplateColumns: '120px 1fr 120px 80px' }}>
                        <div style={{ width: '100px', height: '70px', overflow: 'hidden', background: '#F7F8FC', borderRadius: '8px' }}>
                            {hall.image ? (
                                <img src={hall.image} alt={hall.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280' }}>
                                    <ImageIcon size={20} />
                                </div>
                            )}
                        </div>

                        <div>
                            <div style={{ fontWeight: 600, fontSize: '1.05rem', marginBottom: '0.35rem', color: '#111827' }}>{hall.name}</div>
                            <div style={{ fontSize: '0.85rem', color: '#6B7280', lineHeight: '1.5', maxWidth: '500px' }}>{hall.desc}</div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--secondary)', fontWeight: 600 }}>
                            <Users size={16} />
                            {hall.capacity} pax
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                            <button onClick={() => handleEdit(hall)} className={styles.actionBtn} title="Edit">
                                <Edit2 size={16} />
                            </button>
                            <button onClick={() => handleDelete(hall.id)} className={`${styles.actionBtn} ${styles.deleteBtn}`} title="Delete">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}
                {halls.length === 0 && (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#6B7280' }}>No conference halls found. Add your first hall to get started.</div>
                )}
            </div>

            <AdminModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editForm.id === "NEW" ? "New Conference Hall" : `Edit — ${editForm.name}`}
                onSubmit={handleSave}
                loading={isSaving}
                error={error}
            >
                <div className={styles.formGrid}>
                    <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                        <label className={styles.label}>Hall Cover Image</label>
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            style={{
                                width: '100%',
                                height: '220px',
                                background: '#F7F8FC',
                                border: '1px dashed rgba(0,0,0,0.15)',
                                borderRadius: '8px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                overflow: 'hidden',
                                position: 'relative',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            {editForm.image ? (
                                <>
                                    <img src={editForm.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s ease' }} onMouseOver={e => e.currentTarget.style.opacity = '1'} onMouseOut={e => e.currentTarget.style.opacity = '0'}>
                                        <Upload size={24} color="#fff" />
                                    </div>
                                    <button type="button" onClick={e => { e.stopPropagation(); setEditForm((p: any) => ({ ...p, image: '' })); }} style={{ position: 'absolute', top: '10px', right: '10px', width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(220,38,38,0.9)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 20 }} title="Remove image">
                                        <X size={16} color="#fff" />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Upload size={28} color="rgba(0,0,0,0.25)" />
                                    <span style={{ color: '#6B7280', marginTop: '1rem', fontSize: '0.875rem', fontWeight: 500 }}>
                                        {isUploading ? "Uploading image..." : "Click to upload hall photo"}
                                    </span>
                                </>
                            )}
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} accept="image/*" />
                    </div>

                    <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                        <label className={styles.label}>Hall Name</label>
                        <input className={styles.input} placeholder="e.g. Amboseli Hall" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} required />
                    </div>

                    <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                        <label className={styles.label}>Description & Features</label>
                        <textarea className={styles.input} style={{ minHeight: '100px', resize: 'vertical' }} placeholder="Detail the hall's features (projectors, AC, lighting, etc.)..." value={editForm.desc} onChange={e => setEditForm({ ...editForm, desc: e.target.value })} required />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Maximum Capacity (Guests)</label>
                        <div style={{ position: 'relative' }}>
                            <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary)' }}>
                                <Users size={16} />
                            </div>
                            <input type="number" min="1" className={styles.input} style={{ paddingLeft: '2.5rem' }} placeholder="e.g. 100" value={editForm.capacity} onChange={e => setEditForm({ ...editForm, capacity: parseInt(e.target.value) || 0 })} required />
                        </div>
                    </div>
                </div>
            </AdminModal>
        </>
    );
}
