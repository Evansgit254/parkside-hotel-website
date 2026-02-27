"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { getSiteData, getGalleryItems, addGalleryItem, deleteGalleryItem, uploadImage, updateGalleryOrder } from "../../actions";
import styles from "../admin.module.css";
import { Plus, Trash2, Edit2, Image as ImageIcon, Video, Upload, Grid, List, Save, X, ExternalLink, Move, Loader2 } from "lucide-react";
import { GalleryItem } from "@prisma/client";

import MediaUpload from "../components/MediaUpload";

export default function GalleryAdmin() {
    const [items, setItems] = useState<GalleryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editForm, setEditForm] = useState({ id: "", url: "", type: "image", title: "" });
    const [activeTab, setActiveTab] = useState<"image" | "video">("image");

    useEffect(() => {
        loadItems();
    }, []);

    const loadItems = async () => {
        const galleryItems = await getGalleryItems();
        if (galleryItems) {
            setItems(galleryItems);
        }
        setLoading(false);
    };

    const [error, setError] = useState<string | null>(null);

    const handleEdit = (item: GalleryItem) => {
        setEditForm({ id: item.id, url: item.url, type: item.type, title: item.title || "" });
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setEditForm({ id: "", url: "", type: "image", title: "" });
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editForm.url) return;

        setLoading(true);
        setError(null);

        let res;
        if (editForm.id) {
            res = await updateGalleryItem(editForm.id, editForm);
        } else {
            res = await addGalleryItem(editForm);
        }

        if (res.success) {
            await loadItems();
            setIsModalOpen(false);
            setEditForm({ id: "", url: "", type: "image", title: "" });
        } else {
            setError(res.error || "Failed to save item.");
        }
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Remove this item from the gallery?")) return;
        const res = await deleteGalleryItem(id);
        if (res.success) {
            setItems(items.filter(item => item.id !== id));
        } else {
            alert(res.error || "Failed to delete item.");
        }
    };

    const filteredItems = items.filter(item => item.type === activeTab);

    if (loading && items.length === 0) return (
        <div className={styles.loadingWrapper}>
            <Loader2 className={styles.spinner} size={40} />
            <p>Accessing Royal Vault...</p>
        </div>
    );

    return (
        <div className={styles.container}>
            <div className={styles.sectionHeader}>
                <div className={styles.sectionTitleGroup}>
                    <span className={styles.sectionEyebrow}>Estate Visuals</span>
                    <h1 className={styles.sectionTitle}>Gallery Collection</h1>
                    <p className={styles.sectionSubtitle}>Manage the luxury storytelling assets of Parkside Villa.</p>
                </div>
                <button className={styles.addButton} onClick={handleAdd}>
                    <Plus size={16} /> Curate Asset
                </button>
            </div>

            <div className={styles.mediaTabsWrapper}>
                <button
                    className={`${styles.mediaTab} ${activeTab === 'image' ? styles.mediaTabActive : ''}`}
                    onClick={() => setActiveTab('image')}
                >
                    <ImageIcon size={16} /> Photography
                </button>
                <button
                    className={`${styles.mediaTab} ${activeTab === 'video' ? styles.mediaTabActive : ''}`}
                    onClick={() => setActiveTab('video')}
                >
                    <Video size={16} /> Cinematography
                </button>
            </div>

            <div className={styles.luxuryGrid}>
                {filteredItems.map((item) => (
                    <div key={item.id} className={styles.luxuryMediaCard}>
                        <div className={styles.mediaPreview}>
                            {item.type === 'image' ? (
                                <img src={item.url} alt="" />
                            ) : (
                                <>
                                    <div className={styles.videoPlayOverlay}><Video size={24} /></div>
                                    <img src={`https://img.youtube.com/vi/${item.url.split('v=')[1] || item.url.split('/').pop()}/0.jpg`} alt="" />
                                </>
                            )}
                            <div className={styles.mediaMetaOverlay}>
                                <button className={styles.mediaEditBtn} style={{ background: 'rgba(201,168,76,0.9)', color: '#000', border: 'none', padding: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => handleEdit(item)}>
                                    <Edit2 size={13} />
                                </button>
                                <button className={styles.mediaDeleteBtn} onClick={() => handleDelete(item.id)}>
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                        <div className={styles.luxuryMediaInfo}>
                            <h4 className={styles.luxuryMediaTitle}>{item.title || "Untitled Masterpiece"}</h4>
                            <p className={styles.luxuryMediaUrl}>{item.url}</p>
                        </div>
                    </div>
                ))}

                {filteredItems.length === 0 && (
                    <div className={styles.emptyGalleryState}>
                        <div className={styles.emptyIconCircle}>
                            <ImageIcon size={32} />
                        </div>
                        <h3>The Gallery is Empty</h3>
                        <p>No curated {activeTab}s have been added to this collection yet.</p>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <div>
                                <h3 className={styles.modalTitle}>{editForm.id ? "Edit Curated Asset" : "Curate New Asset"}</h3>
                                <p className={styles.modalSub}>Integrate professional imagery or cinematography into the estate gallery.</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className={styles.modalClose}><X size={20} /></button>
                        </div>
                        {error && (
                            <div className={styles.error} style={{ margin: '1rem 2rem 0', borderRadius: '8px' }}>
                                {error}
                            </div>
                        )}
                        <form onSubmit={handleSave} className={styles.modalBody}>
                            <div className={styles.formGrid}>
                                <div className={styles.formSection}>
                                    <label className={styles.label}>Resource Title</label>
                                    <input
                                        type="text"
                                        className={styles.input}
                                        placeholder="e.g. Presidential Suite - Night View"
                                        value={editForm.title}
                                        onChange={e => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                                    />
                                </div>

                                <MediaUpload
                                    label="Visual Asset Source"
                                    value={editForm.url}
                                    onChange={(url) => setEditForm(prev => ({ ...prev, url }))}
                                    placeholder={editForm.type === 'image' ? "https://..." : "https://youtube.com/watch?v=..."}
                                />

                                <div className={styles.formSection}>
                                    <label className={styles.label}>Resource Environment</label>
                                    <div className={styles.compactTypeSelector}>
                                        <button
                                            type="button"
                                            className={`${styles.typeBtn} ${editForm.type === 'image' ? styles.typeBtnActive : ''}`}
                                            onClick={() => setEditForm({ ...editForm, type: 'image' })}
                                        >
                                            <ImageIcon size={14} /> Photography
                                        </button>
                                        <button
                                            type="button"
                                            className={`${styles.typeBtn} ${editForm.type === 'video' ? styles.typeBtnActive : ''}`}
                                            onClick={() => setEditForm({ ...editForm, type: 'video' })}
                                        >
                                            <Video size={14} /> Cinematography
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className={styles.modalFooter}>
                                <button type="button" onClick={() => setIsModalOpen(false)} className={styles.secondaryBtn}>Back</button>
                                <button type="submit" className={styles.saveButton} disabled={loading || !editForm.url}>
                                    <Save size={16} /> {loading ? "Saving..." : editForm.id ? "Save Changes" : "Add to Collection"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
