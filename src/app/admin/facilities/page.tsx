"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect, useRef } from "react";
import styles from "../admin.module.css";
import { getSiteData, updateFacility, addFacility, deleteFacility, uploadImage } from "../../actions";
import { Edit2, Trash2, Plus, Users, Utensils, Waves, Wine, Hotel, Upload, Image as ImageIcon, X } from "lucide-react";
import AdminModal from "../../components/AdminModal";

export default function AdminFacilities() {
    const [facilities, setFacilities] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editForm, setEditForm] = useState<any>({ id: "", title: "", desc: "", icon: "Hotel", image: "", features: [], highlights: [] });
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchFacilities = async () => {
        const data = await getSiteData();
        setFacilities(data.facilities);
        setLoading(false);
    };

    useEffect(() => { fetchFacilities(); }, []);

    const handleAdd = () => {
        setEditForm({ id: "NEW", title: "", desc: "", icon: "Hotel", image: "", features: [], highlights: [] });
        setIsModalOpen(true);
    };

    const handleEdit = (facility: any) => {
        setEditForm({ ...facility });
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
        if (editForm.id === "NEW") {
            const { id, ...facilityData } = editForm;
            res = await addFacility(facilityData);
        } else {
            res = await updateFacility(editForm.id, editForm);
        }

        if (res.success) {
            await fetchFacilities();
            setIsModalOpen(false);
        } else {
            setError(res.error || "Failed to save facility.");
        }
        setIsSaving(false);
    };

    const handleDelete = async (id: string) => {
        if (confirm("Delete this facility? This cannot be undone.")) {
            const res = await deleteFacility(id);
            if (res.success) {
                await fetchFacilities();
            } else {
                alert(res.error || "Failed to delete facility.");
            }
        }
    };

    const Icons: Record<string, any> = { Users, Utensils, Waves, Wine, Hotel };

    if (loading) return <div style={{ padding: "3rem", color: "#6B7280", fontSize: "0.875rem" }}>Loading facilities...</div>;

    return (
        <>
            <div className={styles.sectionHeader}>
                <div className={styles.sectionTitleGroup}>
                    <span className={styles.sectionEyebrow}>Content Management</span>
                    <h1 className={styles.sectionTitle}>Facilities</h1>
                    <p className={styles.sectionSubtitle}>Manage your premium hotel and guest services</p>
                </div>
                <button onClick={handleAdd} className={styles.addButton}>
                    <Plus size={14} /> New Facility
                </button>
            </div>

            <div className={styles.tableContainer}>
                <div className={styles.tableHeader} style={{ gridTemplateColumns: '100px 1fr auto 120px' }}>
                    <div>Preview</div>
                    <div>Details</div>
                    <div>Meta</div>
                    <div style={{ textAlign: 'right' }}>Actions</div>
                </div>

                {facilities.length === 0 ? (
                    <div style={{ padding: '4rem 2rem', textAlign: 'center', color: '#6B7280', fontSize: '0.875rem', letterSpacing: '0.05em' }}>
                        No facilities added yet.
                    </div>
                ) : (
                    facilities.map((facility) => {
                        const IconComponent = Icons[facility.icon] || Hotel;
                        return (
                            <div key={facility.id} className={styles.tableRow} style={{ gridTemplateColumns: '100px 1fr auto 120px' }}>

                                {/* Image thumbnail with icon overlay */}
                                <div style={{ position: 'relative', width: '80px', height: '56px', overflow: 'hidden', background: '#F7F8FC' }}>
                                    {facility.image ? (
                                        <img src={facility.image} alt={facility.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280' }}>
                                            <ImageIcon size={20} />
                                        </div>
                                    )}
                                    <div style={{ position: 'absolute', top: '4px', left: '4px', width: '22px', height: '22px', background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C9A84C' }}>
                                        <IconComponent size={11} />
                                    </div>
                                </div>

                                {/* Title + description */}
                                <div>
                                    <div style={{ fontWeight: 500, fontSize: '0.9375rem', color: '#6B7280', marginBottom: '0.25rem' }}>{facility.title}</div>
                                    <div style={{ fontSize: '0.8125rem', color: '#6B7280', lineHeight: '1.5', maxWidth: '500px' }}>{facility.desc}</div>
                                </div>

                                {/* Meta badges */}
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <span className={`${styles.badge} ${styles.badgeGold}`}>{facility.features?.length || 0} Features</span>
                                    <span className={`${styles.badge} ${styles.badgePending}`}>{facility.highlights?.length || 0} Highlights</span>
                                </div>

                                {/* Actions */}
                                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                    <button onClick={() => handleEdit(facility)} className={styles.actionBtn} title="Edit">
                                        <Edit2 size={14} />
                                    </button>
                                    <button onClick={() => handleDelete(facility.id)} className={`${styles.actionBtn} ${styles.deleteBtn}`} title="Delete">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <AdminModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editForm.id === "NEW" ? "New Facility" : `Edit — ${editForm.title}`}
                onSubmit={handleSave}
                loading={isSaving}
                error={error}
            >
                <div className={styles.formGrid}>
                    {/* Image Upload */}
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Facility Image</label>
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            style={{
                                width: '100%', height: '180px',
                                background: '#F7F8FC',
                                border: '1px dashed rgba(0,0,0,0.12)',
                                display: 'flex', flexDirection: 'column',
                                alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', overflow: 'hidden', position: 'relative',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            {editForm.image ? (
                                <>
                                    <img src={editForm.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }} onMouseOver={e => e.currentTarget.style.opacity = '1'} onMouseOut={e => e.currentTarget.style.opacity = '0'}>
                                        <Upload size={20} color="#fff" />
                                    </div>
                                    <button type="button" onClick={e => { e.stopPropagation(); setEditForm((p: any) => ({ ...p, image: '' })); }} style={{ position: 'absolute', top: '10px', right: '10px', width: '28px', height: '28px', background: 'rgba(220,38,38,0.9)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 20 }}>
                                        <X size={14} color="#fff" />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Upload size={24} color="rgba(0,0,0,0.25)" />
                                    <span style={{ color: '#6B7280', marginTop: '0.75rem', fontSize: '0.8125rem' }}>
                                        {isUploading ? "Uploading..." : "Click to upload facility image"}
                                    </span>
                                </>
                            )}
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} accept="image/*" />
                    </div>

                    {/* Title */}
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Facility Title</label>
                        <input className={styles.input} placeholder="e.g. Infinity Lounge" value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })} required />
                    </div>

                    {/* Description */}
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Description</label>
                        <textarea className={styles.input} style={{ minHeight: '90px', resize: 'vertical' }} placeholder="What makes this facility special?..." value={editForm.desc} onChange={e => setEditForm({ ...editForm, desc: e.target.value })} required />
                    </div>

                    {/* Features */}
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Features (one per line)</label>
                        <textarea className={styles.input} style={{ minHeight: '80px', resize: 'vertical' }} placeholder={"24/7 Access\nWorld-class Service"} value={editForm.features?.join('\n') || ''} onChange={e => setEditForm({ ...editForm, features: e.target.value.split('\n') })} />
                    </div>

                    {/* Highlights */}
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Service Highlights (one per line)</label>
                        <textarea className={styles.input} style={{ minHeight: '90px', resize: 'vertical' }} placeholder={"Bespoke guest relations\nPremium infrastructure"} value={editForm.highlights?.join('\n') || ''} onChange={e => setEditForm({ ...editForm, highlights: e.target.value.split('\n') })} />
                    </div>

                    {/* Icon picker */}
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Icon</label>
                        <select className={styles.input} style={{ appearance: 'none', cursor: 'pointer' }} value={editForm.icon} onChange={e => setEditForm({ ...editForm, icon: e.target.value })} required>
                            <option value="Hotel">Hotel / General</option>
                            <option value="Users">Users / Conference</option>
                            <option value="Utensils">Utensils / Dining</option>
                            <option value="Waves">Waves / Pool & Wellness</option>
                            <option value="Wine">Wine / Bar & Lounge</option>
                        </select>
                    </div>
                </div>
            </AdminModal>
        </>
    );
}
