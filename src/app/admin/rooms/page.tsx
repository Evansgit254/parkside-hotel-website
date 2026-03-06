"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import styles from "../admin.module.css";
import { getSiteData, updateRoom, createRoom, deleteRoom } from "../../actions";
import { Edit2, Trash2, Plus, Image as ImageIcon, X } from "lucide-react";
import AdminModal from "../../components/AdminModal";
import { useCurrency } from "../../context/CurrencyContext";
import { showToast } from "../components/AdminToast";
import MediaUpload from "../components/MediaUpload";

export default function AdminRooms() {
    const { formatPrice } = useCurrency();
    const [rooms, setRooms] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editForm, setEditForm] = useState<any>({ id: "", name: "", desc: "", price: "", image: "", images: [], amenities: [], tag: "", capacity: 2 });
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const fetchRooms = async () => {
        const data = await getSiteData();
        setRooms(data.rooms);
        setLoading(false);
    };

    useEffect(() => {
        fetchRooms();
    }, []);

    const handleEdit = (room: any) => {
        setEditForm({
            ...room,
            images: Array.isArray(room.images) ? room.images : [],
            amenities: Array.isArray(room.amenities) ? room.amenities : [],
            capacity: room.capacity || 2
        });
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setEditForm({ id: "NEW", name: "", desc: "", price: "", image: "", images: [], amenities: [], tag: "", capacity: 2 });
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
            images: Array.isArray(editForm.images) ? editForm.images : [],
            amenities: Array.isArray(editForm.amenities) ? editForm.amenities : [],
            capacity: parseInt(editForm.capacity) || 2
        };
        if (editForm.id === "NEW") {
            const { id, ...roomData } = payload;
            res = await createRoom(roomData);
        } else {
            res = await updateRoom(editForm.id, payload);
        }

        if (res.success) {
            await fetchRooms();
            setIsModalOpen(false);
            showToast(editForm.id === "NEW" ? "Room created successfully" : "Room updated successfully", "success");
        } else {
            setError(res.error || "Failed to save room details.");
        }
        setIsSaving(false);
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this room?")) {
            const res = await deleteRoom(id);
            if (res.success) {
                await fetchRooms();
                showToast("Room deleted successfully", "success");
            } else {
                showToast(res.error || "Failed to delete room.", "error");
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
                        <div style={{ width: '80px', height: '56px', overflow: 'hidden', background: '#F7F8FC' }}>
                            {room.image ? (
                                <img src={room.image} alt={room.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280' }}>
                                    <ImageIcon size={20} />
                                </div>
                            )}
                        </div>

                        <div>
                            <div style={{ fontWeight: 500, fontSize: '0.9375rem', marginBottom: '0.25rem', color: '#6B7280' }}>{room.name}</div>
                            <div style={{ fontSize: '0.8125rem', color: '#6B7280', lineHeight: '1.5', maxWidth: '480px' }}>{room.desc}</div>
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                {room.tag && <span className={`${styles.badge} ${styles.badgeGold}`}>{room.tag}</span>}
                                <span className={`${styles.badge} ${styles.badgeGold}`}>{room.images?.length || 0} Photos</span>
                            </div>
                        </div>

                        <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.125rem', color: '#C9A84C', fontWeight: 400 }}>{formatPrice(room.price)}</div>

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
                error={error}
            >
                <div className={styles.formGrid}>
                    <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                        <MediaUpload
                            label="Room Main Image"
                            value={editForm.image}
                            onChange={(url) => setEditForm((prev: any) => ({ ...prev, image: url }))}
                        />
                    </div>

                    <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                        <label className={styles.label}>Room Gallery (4+ Photos Recommended)</label>
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

                    <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                        <label className={styles.label}>Room Name</label>
                        <input className={styles.input} placeholder="e.g. Executive Suite" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} required />
                    </div>

                    <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                        <label className={styles.label}>Description</label>
                        <textarea className={styles.input} style={{ minHeight: '90px', resize: 'vertical' }} placeholder="Describe the room's unique features..." value={editForm.desc} onChange={e => setEditForm({ ...editForm, desc: e.target.value })} required />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Price</label>
                            <input className={styles.input} placeholder="e.g. $150" value={editForm.price} onChange={e => setEditForm({ ...editForm, price: e.target.value })} required />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Max Guests (Capacity)</label>
                            <input type="number" min="1" className={styles.input} placeholder="e.g. 2" value={editForm.capacity} onChange={e => setEditForm({ ...editForm, capacity: e.target.value })} required />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Tag (Optional)</label>
                            <input className={styles.input} placeholder="e.g. Best Seller" value={editForm.tag || ""} onChange={e => setEditForm({ ...editForm, tag: e.target.value })} />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Amenities (Comma separated)</label>
                            <input
                                className={styles.input}
                                placeholder="WiFi, AC, TV"
                                value={Array.isArray(editForm.amenities) ? editForm.amenities.join(", ") : ""}
                                onChange={e => setEditForm({ ...editForm, amenities: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
                            />
                        </div>
                    </div>
                </div>
            </AdminModal>
        </>
    );
}


