"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import styles from "../admin.module.css";
import { getSiteData, updateFacility, addFacility, deleteFacility } from "../../actions";
import { Edit2, Trash2, Plus, Users, Utensils, Waves, Wine, Hotel, Image as ImageIcon, X } from "lucide-react";
import AdminModal from "../../components/AdminModal";
import { showToast } from "../components/AdminToast";
import MediaUpload from "../components/MediaUpload";

export default function AdminFacilities() {
    const [facilities, setFacilities] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editForm, setEditForm] = useState<any>({ id: "", title: "", desc: "", icon: "Hotel", image: "", images: [], features: [], highlights: [] });
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchFacilities = async () => {
        const data = await getSiteData();
        setFacilities(data.facilities);
        setLoading(false);
    };

    useEffect(() => { fetchFacilities(); }, []);

    const handleAdd = () => {
        setEditForm({ id: "NEW", title: "", desc: "", icon: "Hotel", image: "", images: [], features: [], highlights: [] });
        setIsModalOpen(true);
    };

    const handleEdit = (facility: any) => {
        setEditForm({ ...facility, images: Array.isArray(facility.images) ? facility.images : [] });
        setIsModalOpen(true);
    };


    const [error, setError] = useState<string | null>(null);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);
        let res;
        const payload = {
            ...editForm,
            images: Array.isArray(editForm.images) ? editForm.images : []
        };
        if (editForm.id === "NEW") {
            const { id, ...facilityData } = payload;
            res = await addFacility(facilityData);
        } else {
            res = await updateFacility(editForm.id, payload);
        }

        if (res.success) {
            await fetchFacilities();
            setIsModalOpen(false);
            showToast(editForm.id === "NEW" ? "Facility created successfully" : "Facility updated successfully", "success");
        } else {
            setError(res.error || "Failed to save facility.");
        }
        setIsSaving(false);
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        setIsDeleting(true);
        const res = await deleteFacility(deleteId);
        if (res.success) {
            await fetchFacilities();
            setDeleteId(null);
            showToast("Facility deleted successfully", "success");
        } else {
            showToast(res.error || "Failed to delete facility.", "error");
        }
        setIsDeleting(false);
    };

    const removeImage = (index: number) => {
        setEditForm((prev: any) => ({
            ...prev,
            images: prev.images.filter((_: any, i: number) => i !== index)
        }));
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
                                    <span className={`${styles.badge} ${styles.badgeGold}`}>{facility.images?.length || 0} Photos</span>
                                </div>

                                {/* Actions */}
                                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                    <button onClick={() => handleEdit(facility)} className={styles.actionBtn} title="Edit">
                                        <Edit2 size={14} />
                                    </button>
                                    <button onClick={() => setDeleteId(facility.id)} className={`${styles.actionBtn} ${styles.deleteBtn}`} title="Delete">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Delete Confirmation Modal */}
            <AdminModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                title="Confirm Deletion"
                onSubmit={(e) => { e.preventDefault(); handleDelete(); }}
                loading={isDeleting}
                submitLabel="Delete Facility"
                danger
            >
                <div style={{ padding: '1rem 0' }}>
                    <p style={{ color: '#6B7280', fontSize: '0.9375rem', lineHeight: '1.6' }}>
                        Are you sure you want to delete <strong style={{ color: '#111827' }}>{facilities.find(f => f.id === deleteId)?.title}</strong>?
                    </p>
                    <p style={{ color: '#EF4444', fontSize: '0.8125rem', marginTop: '1rem', fontWeight: 500 }}>
                        This action cannot be undone and will remove all associated content.
                    </p>
                </div>
            </AdminModal>

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
                    <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                        <MediaUpload
                            label="Facility Main Image"
                            value={editForm.image}
                            onChange={(url) => setEditForm((prev: any) => ({ ...prev, image: url }))}
                        />
                    </div>

                    <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                        <label className={styles.label}>Facility Gallery (4+ Photos Recommended)</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                            {editForm.images?.map((url: string, idx: number) => (
                                <div key={idx} style={{ position: 'relative', height: '80px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                                    <img src={url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    <button type="button" onClick={() => removeImage(idx)} style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(220,38,38,0.9)', border: 'none', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <X size={12} color="#fff" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <MediaUpload
                            value=""
                            onChange={() => { }}
                            onFilesChange={(urls) => setEditForm((prev: any) => ({ ...prev, images: [...(prev.images || []), ...urls] }))}
                            multiple
                        />
                    </div>

                    {/* Title */}
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Facility Title</label>
                        <input className={styles.input} placeholder="e.g. Infinity Lounge" value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })} />
                    </div>

                    {/* Description */}
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Description</label>
                        <textarea className={styles.input} style={{ minHeight: '90px', resize: 'vertical' }} placeholder="What makes this facility special?..." value={editForm.desc} onChange={e => setEditForm({ ...editForm, desc: e.target.value })} />
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
                        <select className={styles.input} style={{ appearance: 'none', cursor: 'pointer' }} value={editForm.icon} onChange={e => setEditForm({ ...editForm, icon: e.target.value })} >
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
