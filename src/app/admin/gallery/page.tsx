"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { getSiteData, getGalleryItems, addGalleryItem, addGalleryItems, deleteGalleryItem, uploadImage, updateGalleryOrder, updateGalleryItem, getGalleryCategories, addGalleryCategory, updateGalleryCategory, deleteGalleryCategory } from "../../actions";
import styles from "../admin.module.css";
import { Plus, Trash2, Edit2, Image as ImageIcon, Video, Upload, Grid, List, Save, X, ExternalLink, Move, Loader2 } from "lucide-react";
import { GalleryItem, GalleryCategory } from "@prisma/client";

import MediaUpload from "../components/MediaUpload";
import { showToast } from "../components/AdminToast";

export default function GalleryAdmin() {
    const [items, setItems] = useState<GalleryItem[]>([]);
    const [categories, setCategories] = useState<GalleryCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [editForm, setEditForm] = useState({ id: "", url: "", type: "image", title: "", categoryId: "" });
    const [categoryForm, setCategoryForm] = useState({ id: "", name: "" });
    const [activeTab, setActiveTab] = useState<"image" | "video">("image");

    useEffect(() => {
        loadItems();
    }, []);

    const loadItems = async () => {
        setLoading(true);
        const [galleryItems, galleryCats] = await Promise.all([
            getGalleryItems(),
            getGalleryCategories()
        ]);
        if (galleryItems) setItems(galleryItems as any);
        if (galleryCats) setCategories(galleryCats);
        setLoading(false);
    };

    const [error, setError] = useState<string | null>(null);

    const handleEdit = (item: any) => {
        setEditForm({ id: item.id, url: item.url, type: item.type, title: item.title || "", categoryId: item.categoryId || "" });
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setEditForm({ id: "", url: "", type: "image", title: "", categoryId: "" });
        setIsModalOpen(true);
    };

    const handleFilesChange = async (urls: string[]) => {
        setLoading(true);
        const res = await addGalleryItems(urls.map(url => ({
            url,
            type: editForm.type,
            categoryId: editForm.categoryId || undefined,
            title: ""
        })));

        if (res.success) {
            await loadItems();
            setIsModalOpen(false);
            showToast(`Successfully curated ${urls.length} assets`, "success");
        } else {
            setError(res.error || "Failed to bulk add items.");
        }
        setLoading(false);
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
            setEditForm({ id: "", url: "", type: "image", title: "", categoryId: "" });
            showToast(editForm.id ? "Gallery item updated successfully" : "Gallery item added successfully", "success");
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
            showToast("Gallery item removed successfully", "success");
        } else {
            showToast(res.error || "Failed to delete item.", "error");
        }
    };

    const handleCategorySave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!categoryForm.name) return;
        setLoading(true);
        let res;
        if (categoryForm.id) {
            res = await updateGalleryCategory(categoryForm.id, { name: categoryForm.name });
        } else {
            res = await addGalleryCategory({ name: categoryForm.name });
        }
        if (res.success) {
            await loadItems();
            setCategoryForm({ id: "", name: "" });
            showToast(categoryForm.id ? "Category updated" : "Category added", "success");
        } else {
            showToast(res.error || "Failed to save category", "error");
        }
        setLoading(false);
    };

    const handleCategoryDelete = async (id: string) => {
        if (!confirm("Delete this category? Items will be moved to 'Uncategorized'.")) return;
        setLoading(true);
        const res = await deleteGalleryCategory(id);
        if (res.success) {
            await loadItems();
            showToast("Category deleted", "success");
        } else {
            showToast(res.error || "Failed to delete category", "error");
        }
        setLoading(false);
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
                <div className={styles.adminActionGroup} style={{ display: 'flex', gap: '10px' }}>
                    <button className={styles.secondaryBtn} onClick={() => setIsCategoryModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Grid size={16} /> Manage Categories
                    </button>
                    <button className={styles.addButton} onClick={handleAdd}>
                        <Plus size={16} /> Curate Asset
                    </button>
                </div>
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
                            <div className={styles.mediaMetaRow} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                                <span className={styles.categoryBadge} style={{ fontSize: '10px', background: 'rgba(201,168,76,0.1)', color: '#C9A84C', padding: '2px 6px', borderRadius: '4px' }}>
                                    {(item as any).category?.name || "Uncategorized"}
                                </span>
                                <p className={styles.luxuryMediaUrl} style={{ margin: 0 }}>{item.url.substring(0, 30)}...</p>
                            </div>
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

                                <div className={styles.formSection}>
                                    <label className={styles.label}>Category</label>
                                    <select
                                        className={styles.select}
                                        value={editForm.categoryId}
                                        onChange={e => setEditForm(prev => ({ ...prev, categoryId: e.target.value }))}
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
                                    >
                                        <option value="">Uncategorized</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <MediaUpload
                                    label="Visual Asset Source"
                                    value={editForm.url}
                                    onChange={(url) => setEditForm(prev => ({ ...prev, url }))}
                                    onFilesChange={handleFilesChange}
                                    multiple={!editForm.id}
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

            {isCategoryModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent} style={{ maxWidth: '600px' }}>
                        <div className={styles.modalHeader}>
                            <div>
                                <h3 className={styles.modalTitle}>Manage Vision Categories</h3>
                                <p className={styles.modalSub}>Organize your estate visuals into logical curated groups.</p>
                            </div>
                            <button onClick={() => { setIsCategoryModalOpen(false); setCategoryForm({ id: "", name: "" }); }} className={styles.modalClose}><X size={20} /></button>
                        </div>

                        <div className={styles.modalBody}>
                            <form onSubmit={handleCategorySave} style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
                                <input
                                    type="text"
                                    className={styles.input}
                                    placeholder="e.g. Royal Suites"
                                    value={categoryForm.name}
                                    onChange={e => setCategoryForm({ ...categoryForm, name: e.target.value })}
                                />
                                <button type="submit" className={styles.saveButton} disabled={loading || !categoryForm.name}>
                                    {categoryForm.id ? "Update" : "Add"}
                                </button>
                                {categoryForm.id && (
                                    <button type="button" className={styles.secondaryBtn} onClick={() => setCategoryForm({ id: "", name: "" })}>Cancel</button>
                                )}
                            </form>

                            <div className={styles.categoryList} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {categories.length === 0 && (
                                    <p style={{ textAlign: 'center', opacity: 0.5, padding: '20px' }}>No custom categories defined.</p>
                                )}
                                {categories.map(cat => (
                                    <div key={cat.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                                        <div>
                                            <span style={{ fontWeight: 600 }}>{cat.name}</span>
                                            <span style={{ marginLeft: '10px', fontSize: '12px', opacity: 0.5 }}>{(cat as any)._count?.items || 0} Assets</span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button className={styles.actionIcon} onClick={() => setCategoryForm({ id: cat.id, name: cat.name })}><Edit2 size={14} /></button>
                                            <button className={styles.actionIcon} style={{ color: '#ef4444' }} onClick={() => handleCategoryDelete(cat.id)}><Trash2 size={14} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className={styles.modalFooter}>
                            <button type="button" onClick={() => setIsCategoryModalOpen(false)} className={styles.secondaryBtn} style={{ width: '100%' }}>Close Manager</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
