"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { getSiteData, getGalleryItems, addGalleryItem, deleteGalleryItem, uploadImage, updateGalleryOrder } from "../../actions";
import styles from "../admin.module.css";
import { Plus, Trash2, Image as ImageIcon, Video, Upload, Grid, List, Save, X, ExternalLink, Move } from "lucide-react";

export default function GalleryAdmin() {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [newItem, setNewItem] = useState({ url: "", type: "image", title: "" });
    const [isUploading, setIsUploading] = useState(false);
    const [activeTab, setActiveTab] = useState<"image" | "video">("image");

    useEffect(() => {
        loadItems();
    }, []);

    const loadItems = async () => {
        // First try to get from dedicated GalleryItem table
        const galleryItems = await getGalleryItems();
        if (galleryItems && galleryItems.length > 0) {
            setItems(galleryItems);
        } else {
            // Fallback: check site data if we haven't migrated yet
            const data = await getSiteData();
            if (data && data.galleryVideos) {
                // This is a temporary measure during transition
                setItems(data.galleryVideos.map((v: any, i: number) => ({
                    id: `legacy-${i}`,
                    url: v.url,
                    type: "video",
                    title: v.title,
                    order: i
                })));
            }
        }
        setLoading(false);
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItem.url) return;

        setLoading(true);
        const res = await addGalleryItem(newItem);
        if (res.success) {
            await loadItems();
            setIsAdding(false);
            setNewItem({ url: "", type: "image", title: "" });
        }
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Remove this item from the gallery?")) return;
        const res = await deleteGalleryItem(id);
        if (res.success) {
            setItems(items.filter(item => item.id !== id));
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            const { url } = await uploadImage(formData);
            setNewItem({ ...newItem, url, type: "image" });
        } catch (error) {
            console.error("Upload failed", error);
        } finally {
            setIsUploading(false);
        }
    };

    const filteredItems = items.filter(item => item.type === activeTab);

    if (loading && items.length === 0) return <div className={styles.loading}>Opening Vault...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.sectionTitleGroup}>
                    <span className={styles.sectionEyebrow}>Visual Collection</span>
                    <h1 className={styles.sectionTitle}>Gallery Management</h1>
                    <p className={styles.sectionSubtitle}>Manage the visual storytelling assets across the estate.</p>
                </div>
                <button className={styles.addButton} onClick={() => setIsAdding(true)}>
                    <Plus size={16} /> Add Media
                </button>
            </div>

            <div className={styles.tabsContainer}>
                <button
                    className={`${styles.tab} ${activeTab === 'image' ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab('image')}
                >
                    <ImageIcon size={16} /> Photography
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'video' ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab('video')}
                >
                    <Video size={16} /> Cinematography
                </button>
            </div>

            <div className={styles.galleryGrid}>
                {filteredItems.map((item) => (
                    <div key={item.id} className={styles.mediaCard}>
                        {item.type === 'image' ? (
                            <div className={styles.mediaPreview}>
                                <img src={item.url} alt="" />
                            </div>
                        ) : (
                            <div className={styles.mediaPreview}>
                                <div className={styles.videoOverlay}>
                                    <Video size={32} />
                                </div>
                                <img src={`https://img.youtube.com/vi/${item.url.split('v=')[1] || item.url.split('/').pop()}/0.jpg`} alt="" />
                            </div>
                        )}
                        <div className={styles.mediaInfo}>
                            <div className={styles.mediaTitle}>{item.title || "Untitled Media"}</div>
                            <div className={styles.mediaUrl}>{item.url}</div>
                            <div className={styles.mediaActions}>
                                <button className={styles.deleteBtn} onClick={() => handleDelete(item.id)}>
                                    <Trash2 size={14} />
                                </button>
                                <a href={item.url} target="_blank" className={styles.externalBtn}>
                                    <ExternalLink size={14} />
                                </a>
                            </div>
                        </div>
                    </div>
                ))}

                {filteredItems.length === 0 && (
                    <div className={styles.emptyState}>
                        <ImageIcon size={48} className={styles.emptyIcon} />
                        <h3>No Media Found</h3>
                        <p>Begin curated your visual collection by adding high-resolution content.</p>
                    </div>
                )}
            </div>

            {isAdding && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <div>
                                <h3 className={styles.modalTitle}>Add Curated Media</h3>
                                <p className={styles.modalSub}>Incorporate new visual elements into your gallery.</p>
                            </div>
                            <button onClick={() => setIsAdding(false)} className={styles.closeBtn}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleAdd} className={styles.modalForm}>
                            <div className={styles.formGrid}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Media Type</label>
                                    <div className={styles.typeSelector}>
                                        <button
                                            type="button"
                                            className={`${styles.typeBtn} ${newItem.type === 'image' ? styles.typeBtnActive : ''}`}
                                            onClick={() => setNewItem({ ...newItem, type: 'image' })}
                                        >
                                            <ImageIcon size={14} /> Image
                                        </button>
                                        <button
                                            type="button"
                                            className={`${styles.typeBtn} ${newItem.type === 'video' ? styles.typeBtnActive : ''}`}
                                            onClick={() => setNewItem({ ...newItem, type: 'video' })}
                                        >
                                            <Video size={14} /> Video
                                        </button>
                                    </div>
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Resource Title</label>
                                    <input
                                        type="text"
                                        className={styles.input}
                                        placeholder="e.g. Sunset over the Infinity Pool"
                                        value={newItem.title}
                                        onChange={e => setNewItem({ ...newItem, title: e.target.value })}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>{newItem.type === 'image' ? 'Image Resource' : 'Video URL (YouTube/Vimeo)'}</label>
                                    <div className={styles.inputWithAction}>
                                        <input
                                            type="text"
                                            required
                                            className={styles.input}
                                            placeholder={newItem.type === 'image' ? "https://..." : "https://youtube.com/watch?v=..."}
                                            value={newItem.url}
                                            onChange={e => setNewItem({ ...newItem, url: e.target.value })}
                                        />
                                        {newItem.type === 'image' && (
                                            <label className={styles.uploadMini}>
                                                <Upload size={14} />
                                                <input type="file" hidden onChange={handleFileUpload} accept="image/*" />
                                            </label>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className={styles.modalFooter}>
                                <button type="button" onClick={() => setIsAdding(false)} className={styles.secondaryBtn}>Cancel</button>
                                <button type="submit" className={styles.saveButton} disabled={loading}>
                                    <Save size={16} /> {loading ? "Adding..." : "Add to Gallery"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
