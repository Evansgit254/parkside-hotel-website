"use client";

import { useState, useEffect, useRef } from "react";
import styles from "../admin.module.css";
import { getSiteData, updateRoom, createRoom, deleteRoom, uploadImage } from "../../actions";
import { Edit2, Trash2, Plus, Upload, Image as ImageIcon, X } from "lucide-react";
import AdminModal from "../../components/AdminModal";

export default function AdminRooms() {
    const [rooms, setRooms] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editForm, setEditForm] = useState<any>({ id: "", name: "", desc: "", price: "", image: "", tag: "" });
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchRooms = async () => {
        const data = await getSiteData();
        setRooms(data.rooms);
        setLoading(false);
    };

    useEffect(() => {
        fetchRooms();
    }, []);

    const handleEdit = (room: any) => {
        setEditForm({ ...room });
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setEditForm({ id: "NEW", name: "", desc: "", price: "", image: "", tag: "" });
        setIsModalOpen(true);
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            const { url } = await uploadImage(formData);
            setEditForm((prev: any) => ({ ...prev, image: url }));
        } catch (error) {
            console.error("Upload failed:", error);
            alert("Upload failed. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        if (editForm.id === "NEW") {
            const { id, ...roomData } = editForm;
            await createRoom(roomData);
        } else {
            await updateRoom(editForm.id, editForm);
        }
        await fetchRooms();
        setIsModalOpen(false);
        setIsSaving(false);
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this room?")) {
            await deleteRoom(id);
            await fetchRooms();
        }
    };

    if (loading) return <div className={styles.mainContent}>Loading...</div>;

    return (
        <>
            <div className={styles.sectionHeader}>
                <div className={styles.sectionTitleGroup}>
                    <span className={styles.sectionEyebrow}>Content Management</span>
                    <h1 className={styles.sectionTitle}>Accommodation</h1>
                    <p className={styles.sectionSubtitle}>Manage your luxury suites and room offerings</p>
                </div>
                <button onClick={handleAdd} className={styles.addButton}>
                    <Plus size={14} /> New Room
                </button>
            </div>

            <div className={styles.tableContainer}>
                <div className={styles.tableHeader} style={{ gridTemplateColumns: '100px 1fr 120px 80px' }}>
                    <div>Preview</div>
                    <div>Room Details</div>
                    <div>Price</div>
                    <div style={{ textAlign: 'right' }}>Actions</div>
                </div>

                {rooms.map((room) => (
                    <div key={room.id} className={styles.tableRow} style={{ gridTemplateColumns: '100px 1fr 120px 80px' }}>
                        <div style={{ width: '80px', height: '56px', overflow: 'hidden', background: 'rgba(255,255,255,0.03)' }}>
                            {room.image ? (
                                <img src={room.image} alt={room.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.1)' }}>
                                    <ImageIcon size={20} />
                                </div>
                            )}
                        </div>

                        <div>
                            <div style={{ fontWeight: 500, fontSize: '0.9375rem', marginBottom: '0.25rem', color: 'rgba(255,255,255,0.85)' }}>{room.name}</div>
                            <div style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.3)', lineHeight: '1.5', maxWidth: '480px' }}>{room.desc}</div>
                            {room.tag && (
                                <div style={{ marginTop: '0.5rem' }}>
                                    <span className={`${styles.badge} ${styles.badgeGold}`}>{room.tag}</span>
                                </div>
                            )}
                        </div>

                        <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.125rem', color: '#C9A84C', fontWeight: 400 }}>{room.price}</div>

                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            <button onClick={() => handleEdit(room)} className={styles.actionBtn} title="Edit">
                                <Edit2 size={14} />
                            </button>
                            <button onClick={() => handleDelete(room.id)} className={`${styles.actionBtn} ${styles.deleteBtn}`} title="Delete">
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <AdminModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editForm.id === "NEW" ? "New Room" : `Edit — ${editForm.name}`}
                onSubmit={handleSave}
                loading={isSaving}
            >
                <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Room Image</label>
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            style={{
                                width: '100%',
                                height: '200px',
                                background: 'rgba(255,255,255,0.02)',
                                border: '1px dashed rgba(255,255,255,0.1)',
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
                                        <Upload size={20} color="#fff" />
                                    </div>
                                    <button type="button" onClick={e => { e.stopPropagation(); setEditForm((p: any) => ({ ...p, image: '' })); }} style={{ position: 'absolute', top: '10px', right: '10px', width: '28px', height: '28px', background: 'rgba(220,38,38,0.9)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 20 }} title="Remove image">
                                        <X size={14} color="#fff" />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Upload size={24} color="rgba(255,255,255,0.2)" />
                                    <span style={{ color: 'rgba(255,255,255,0.3)', marginTop: '0.75rem', fontSize: '0.8125rem' }}>
                                        {isUploading ? "Uploading..." : "Click to upload room image"}
                                    </span>
                                </>
                            )}
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} accept="image/*" />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Room Name</label>
                        <input className={styles.input} placeholder="e.g. Executive Suite" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} required />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Description</label>
                        <textarea className={styles.input} style={{ minHeight: '90px', resize: 'vertical' }} placeholder="Describe the room's features..." value={editForm.desc} onChange={e => setEditForm({ ...editForm, desc: e.target.value })} required />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Price</label>
                            <input className={styles.input} placeholder="e.g. $150" value={editForm.price} onChange={e => setEditForm({ ...editForm, price: e.target.value })} required />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Tag (Optional)</label>
                            <input className={styles.input} placeholder="e.g. Best Seller" value={editForm.tag || ""} onChange={e => setEditForm({ ...editForm, tag: e.target.value })} />
                        </div>
                    </div>
                </div>
            </AdminModal>
        </>
    );
}


