"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { getSiteData, createBlogPost, updateBlogPost, deleteBlogPost, uploadImage } from "../../actions";
import styles from "../admin.module.css";
import { Plus, Trash2, Edit3, Calendar, User, Tag, ArrowUpRight, Search, Filter, Save, X, Upload, Image as ImageIcon } from "lucide-react";

export default function BlogAdmin() {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentPost, setCurrentPost] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        loadPosts();
    }, []);

    const loadPosts = async () => {
        const data = await getSiteData();
        if (data && data.blogPosts) {
            setPosts(data.blogPosts);
        }
        setLoading(false);
    };

    const handleEdit = (post: any = null) => {
        setCurrentPost(post || {
            title: "",
            excerpt: "",
            content: "",
            author: "Parkside Villa",
            category: "Lifestyle",
            image: "",
            date: new Date().toISOString().split("T")[0]
        });
        setIsEditing(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        let res;
        if (currentPost.id) {
            res = await updateBlogPost(currentPost.id, currentPost);
        } else {
            res = await createBlogPost(currentPost);
        }

        if (res.success) {
            await loadPosts();
            setIsEditing(false);
            setCurrentPost(null);
        } else {
            alert("Error saving post");
        }
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this post?")) return;
        const res = await deleteBlogPost(id);
        if (res.success) {
            setPosts(posts.filter(p => p.id !== id));
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            const { url } = await uploadImage(formData);
            setCurrentPost({ ...currentPost, image: url });
        } catch (error) {
            console.error("Upload failed", error);
            alert("Upload failed");
        } finally {
            setIsUploading(false);
        }
    };

    const filteredPosts = posts.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading && posts.length === 0) return <div className={styles.loading}>Accessing Archives...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.sectionTitleGroup}>
                    <span className={styles.sectionEyebrow}>Editorial Registry</span>
                    <h1 className={styles.sectionTitle}>Blog Management</h1>
                    <p className={styles.sectionSubtitle}>Curate and manage the hotel's stories and updates.</p>
                </div>
                <button className={styles.addButton} onClick={() => handleEdit()}>
                    <Plus size={16} /> Write New Entry
                </button>
            </div>

            <div className={styles.filtersBar}>
                <div className={styles.searchWrapper}>
                    <Search size={14} className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search articles or categories..."
                        className={styles.searchInput}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className={styles.filterGroup}>
                    <Filter size={14} />
                    <span className={styles.filterLabel}>All Categories</span>
                </div>
            </div>

            <div className={styles.tableContainer}>
                <div className={styles.tableHeader} style={{ gridTemplateColumns: '80px 1fr 150px 150px 120px' }}>
                    <div>Image</div>
                    <div>Article Title</div>
                    <div>Category</div>
                    <div>Publish Date</div>
                    <div style={{ textAlign: 'right' }}>Actions</div>
                </div>
                {filteredPosts.map((post) => (
                    <div key={post.id} className={styles.tableRow} style={{ gridTemplateColumns: '80px 1fr 150px 150px 120px' }}>
                        <div className={styles.tableThumb}>
                            <img src={post.image} alt="" className={styles.thumbImage} />
                        </div>
                        <div>
                            <div className={styles.rowTitle}>{post.title}</div>
                            <div className={styles.rowSubtitle}>{post.author}</div>
                        </div>
                        <div>
                            <span className={styles.badgeGold}>{post.category}</span>
                        </div>
                        <div className={styles.rowText}>
                            <Calendar size={12} style={{ marginRight: '6px', opacity: 0.5 }} />
                            {post.date}
                        </div>
                        <div className={styles.rowActions}>
                            <button className={styles.actionBtn} onClick={() => handleEdit(post)}><Edit3 size={14} /></button>
                            <button className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={() => handleDelete(post.id)}><Trash2 size={14} /></button>
                        </div>
                    </div>
                ))}
            </div>

            {isEditing && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent} style={{ maxWidth: '800px' }}>
                        <div className={styles.modalHeader}>
                            <div>
                                <h3 className={styles.modalTitle}>{currentPost.id ? "Edit Article" : "Compose New Entry"}</h3>
                                <p className={styles.modalSub}>Drafting for the luxury editorial collection.</p>
                            </div>
                            <button onClick={() => setIsEditing(false)} className={styles.closeBtn}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSave} className={styles.modalForm}>
                            <div className={styles.formGrid} style={{ gridTemplateColumns: '1fr 1fr' }}>
                                <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
                                    <label className={styles.label}>Article Title</label>
                                    <input
                                        type="text"
                                        required
                                        className={styles.input}
                                        value={currentPost.title}
                                        onChange={e => setCurrentPost({ ...currentPost, title: e.target.value })}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Category</label>
                                    <select
                                        className={styles.input}
                                        value={currentPost.category}
                                        onChange={e => setCurrentPost({ ...currentPost, category: e.target.value })}
                                    >
                                        <option>Lifestyle</option>
                                        <option>Dining</option>
                                        <option>Events</option>
                                        <option>News</option>
                                        <option>Wellness</option>
                                    </select>
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Publish Date</label>
                                    <input
                                        type="date"
                                        required
                                        className={styles.input}
                                        value={currentPost.date}
                                        onChange={e => setCurrentPost({ ...currentPost, date: e.target.value })}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Header Image URL</label>
                                    <div className={styles.inputWithAction}>
                                        <input
                                            type="text"
                                            className={styles.input}
                                            value={currentPost.image}
                                            onChange={e => setCurrentPost({ ...currentPost, image: e.target.value })}
                                        />
                                        <label className={styles.uploadMini}>
                                            <Upload size={14} />
                                            <input type="file" hidden onChange={handleImageUpload} accept="image/*" />
                                        </label>
                                    </div>
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Author Name</label>
                                    <input
                                        type="text"
                                        className={styles.input}
                                        value={currentPost.author}
                                        onChange={e => setCurrentPost({ ...currentPost, author: e.target.value })}
                                    />
                                </div>
                                <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
                                    <label className={styles.label}>Short Excerpt</label>
                                    <textarea
                                        className={styles.input}
                                        rows={2}
                                        value={currentPost.excerpt}
                                        onChange={e => setCurrentPost({ ...currentPost, excerpt: e.target.value })}
                                    />
                                </div>
                                <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
                                    <label className={styles.label}>Main Content (Markdown supported)</label>
                                    <textarea
                                        className={styles.input}
                                        style={{ fontFamily: 'monospace' }}
                                        rows={10}
                                        required
                                        value={currentPost.content}
                                        onChange={e => setCurrentPost({ ...currentPost, content: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className={styles.modalFooter}>
                                <button type="button" onClick={() => setIsEditing(false)} className={styles.secondaryBtn}>Cancel</button>
                                <button type="submit" className={styles.saveButton} disabled={loading}>
                                    <Save size={16} /> {loading ? "Saving..." : "Publish Article"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
