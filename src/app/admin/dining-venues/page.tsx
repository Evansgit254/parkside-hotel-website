"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect, useRef } from "react";
import styles from "../admin.module.css";
import { getDiningVenues, createDiningVenue, updateDiningVenue, deleteDiningVenue, getCloudinarySignature } from "../../actions";
import { Edit2, Trash2, Plus, Upload, Image as ImageIcon, X, Wine, Clock, List } from "lucide-react";
import AdminModal from "../../components/AdminModal";
import { showToast } from "../components/AdminToast";

export default function AdminDiningVenues() {
    const [venues, setVenues] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editForm, setEditForm] = useState<any>({ id: "", name: "", desc: "", image: "", images: [], features: [], hours: "" });
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const multiFileInputRef = useRef<HTMLInputElement>(null);

    const fetchVenues = async () => {
        const data = await getDiningVenues();
        setVenues(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchVenues();
    }, []);

    const handleEdit = (venue: any) => {
        setEditForm({ ...venue, features: Array.isArray(venue.features) ? venue.features : [] });
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setEditForm({ id: "NEW", name: "", desc: "", image: "", images: [], features: [], hours: "" });
        setIsModalOpen(true);
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, isMulti = false) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setIsUploading(true);
        try {
            const uploadedUrls: string[] = [];
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const sigData = await getCloudinarySignature();
                if (!sigData.success || !sigData.signature) {
                    throw new Error(sigData.error || "Failed to get signature");
                }

                const formData = new FormData();
                formData.append("file", file);
                formData.append("api_key", sigData.apiKey || "");
                formData.append("timestamp", String(sigData.timestamp));
                formData.append("signature", sigData.signature);
                formData.append("folder", sigData.folder || "parkside_villa");

                const uploadUrl = `https://api.cloudinary.com/v1_1/${sigData.cloudName}/image/upload`;
                const response = await fetch(uploadUrl, { method: "POST", body: formData });

                if (!response.ok) {
                    const errResult = await response.json();
                    throw new Error(errResult.error?.message || "Upload failed");
                }

                const result = await response.json();
                if (result.secure_url) {
                    uploadedUrls.push(result.secure_url);
                }
            }

            if (isMulti) {
                setEditForm((prev: any) => ({ ...prev, images: [...(prev.images || []), ...uploadedUrls] }));
            } else {
                setEditForm((prev: any) => ({ ...prev, image: uploadedUrls[0] }));
            }
            showToast("Upload successful", "success");
        } catch (error: any) {
            console.error("Upload failed:", error);
            showToast(`Upload failed: ${error.message || "Unknown error"}`, "error");
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
        const payload = {
            ...editForm,
            features: Array.isArray(editForm.features) ? editForm.features : []
        };

        if (editForm.id === "NEW") {
            const { id, ...createData } = payload;
            res = await createDiningVenue(createData);
        } else {
            res = await updateDiningVenue(editForm.id, payload);
        }

        if (res.success) {
            await fetchVenues();
            setIsModalOpen(false);
            showToast(editForm.id === "NEW" ? "Dining venue created successfully" : "Dining venue updated successfully", "success");
        } else {
            setError(res.error || "Failed to save dining venue details.");
        }
        setIsSaving(false);
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this dining venue?")) {
            const res = await deleteDiningVenue(id);
            if (res.success) {
                await fetchVenues();
                showToast("Dining venue deleted successfully", "success");
            } else {
                showToast(res.error || "Failed to delete dining venue.", "error");
            }
        }
    };

    const removeImage = (index: number) => {
        setEditForm((prev: any) => ({
            ...prev,
            images: prev.images.filter((_: any, i: number) => i !== index)
        }));
    };

    if (loading) return <div className={styles.mainContent}>Loading...</div>;

    return (
        <>
            <div className={styles.sectionHeader}>
                <div className={styles.sectionTitleGroup}>
                    <span className={styles.sectionEyebrow}>Dining Management</span>
                    <h1 className={styles.sectionTitle}>Dining Venues</h1>
                    <p className={styles.sectionSubtitle}>Manage VIP Lounges, Bars, and Restaurants</p>
                </div>
                <button onClick={handleAdd} className={styles.addButton}>
                    <Plus size={14} /> New Venue
                </button>
            </div>

            <div className={styles.tableContainer}>
                <div className={styles.tableHeader} style={{ gridTemplateColumns: '120px 1fr 150px 80px' }}>
                    <div>Preview</div>
                    <div>Venue Details</div>
                    <div style={{ textAlign: 'center' }}>Hours</div>
                    <div style={{ textAlign: 'right' }}>Actions</div>
                </div>

                {venues.map((venue) => (
                    <div key={venue.id} className={styles.tableRow} style={{ gridTemplateColumns: '120px 1fr 150px 80px' }}>
                        <div style={{ width: '100px', height: '70px', overflow: 'hidden', background: '#F7F8FC', borderRadius: '8px' }}>
                            {venue.image ? (
                                <img src={venue.image} alt={venue.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280' }}>
                                    <Wine size={20} />
                                </div>
                            )}
                        </div>

                        <div>
                            <div style={{ fontWeight: 600, fontSize: '1.05rem', marginBottom: '0.35rem', color: '#111827' }}>{venue.name}</div>
                            <div style={{ fontSize: '0.85rem', color: '#6B7280', lineHeight: '1.5', maxWidth: '500px' }}>{venue.desc}</div>
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', background: 'rgba(0,0,0,0.05)', borderRadius: '4px' }}>
                                    {venue.images?.length || 0} Gallery Photos
                                </span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#6B7280', fontSize: '0.85rem' }}>
                            <Clock size={16} />
                            {venue.hours || "Not set"}
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                            <button onClick={() => handleEdit(venue)} className={styles.actionBtn} title="Edit">
                                <Edit2 size={16} />
                            </button>
                            <button onClick={() => handleDelete(venue.id)} className={`${styles.actionBtn} ${styles.deleteBtn}`} title="Delete">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}
                {venues.length === 0 && (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#6B7280' }}>No dining venues found.</div>
                )}
            </div>

            <AdminModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editForm.id === "NEW" ? "New Dining Venue" : `Edit — ${editForm.name}`}
                onSubmit={handleSave}
                loading={isSaving}
                error={error}
            >
                <div className={styles.formGrid}>
                    <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                        <label className={styles.label}>Main Cover Image</label>
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            style={{
                                width: '100%',
                                height: '200px',
                                background: '#F7F8FC',
                                border: '1px dashed rgba(0,0,0,0.15)',
                                borderRadius: '8px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                overflow: 'hidden',
                                position: 'relative'
                            }}
                        >
                            {editForm.image ? (
                                <>
                                    <img src={editForm.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    <button type="button" onClick={e => { e.stopPropagation(); setEditForm((p: any) => ({ ...p, image: '' })); }} style={{ position: 'absolute', top: '10px', right: '10px', width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(220,38,38,0.9)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 20 }}>
                                        <X size={16} color="#fff" />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Upload size={28} color="rgba(0,0,0,0.25)" />
                                    <span style={{ color: '#6B7280', marginTop: '1rem', fontSize: '0.875rem' }}>Upload venue photo</span>
                                </>
                            )}
                        </div>
                        <input type="file" ref={fileInputRef} onChange={e => handleFileChange(e, false)} style={{ display: 'none' }} accept="image/*" />
                    </div>

                    <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                        <label className={styles.label}>Venue Gallery (4+ Photos Recommended)</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                            {editForm.images?.map((url: string, idx: number) => (
                                <div key={idx} style={{ position: 'relative', height: '80px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                                    <img src={url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    <button type="button" onClick={() => removeImage(idx)} style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(220,38,38,0.9)', border: 'none', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <X size={12} color="#fff" />
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => multiFileInputRef.current?.click()}
                                style={{
                                    height: '80px',
                                    border: '1px dashed var(--border)',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: '#fff',
                                    cursor: 'pointer'
                                }}
                            >
                                <Plus size={20} color="#6B7280" />
                                <span style={{ fontSize: '0.65rem', color: '#6B7280', marginTop: '0.25rem' }}>Add More</span>
                            </button>
                        </div>
                        <input type="file" ref={multiFileInputRef} onChange={e => handleFileChange(e, true)} style={{ display: 'none' }} accept="image/*" multiple />
                    </div>

                    <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                        <label className={styles.label}>Venue Name</label>
                        <input className={styles.input} placeholder="e.g. VIP Lounge" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} required />
                    </div>

                    <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                        <label className={styles.label}>Description</label>
                        <textarea className={styles.input} style={{ minHeight: '80px' }} placeholder="Describe the atmosphere, offerings..." value={editForm.desc} onChange={e => setEditForm({ ...editForm, desc: e.target.value })} required />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Operating Hours</label>
                        <div style={{ position: 'relative' }}>
                            <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#6B7280' }}>
                                <Clock size={16} />
                            </div>
                            <input className={styles.input} style={{ paddingLeft: '2.5rem' }} placeholder="e.g. 7:00 AM - 11:00 PM" value={editForm.hours} onChange={e => setEditForm({ ...editForm, hours: e.target.value })} />
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Features (Comma separated)</label>
                        <div style={{ position: 'relative' }}>
                            <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#6B7280' }}>
                                <List size={16} />
                            </div>
                            <input
                                className={styles.input}
                                style={{ paddingLeft: '2.5rem' }}
                                placeholder="Al Fresco, Live Music, Cocktails"
                                value={Array.isArray(editForm.features) ? editForm.features.join(", ") : ""}
                                onChange={e => setEditForm({ ...editForm, features: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
                            />
                        </div>
                    </div>
                </div>
            </AdminModal>
        </>
    );
}
