"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { getSiteData, createBlogPost, updateBlogPost, deleteBlogPost } from "../../actions";
import styles from "../admin.module.css";
import { Plus, Trash2, Edit3, Calendar, User, Search, Filter, Save, X } from "lucide-react";
import { BlogPost } from "@prisma/client";
import { showToast } from "../components/AdminToast";
import MediaUpload from "../components/MediaUpload";
import AdminModal from "../../components/AdminModal";

export default function BlogAdmin() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentPost, setCurrentPost] = useState<Partial<BlogPost> | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All Categories");
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

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

    const handleEdit = (post: BlogPost | null = null) => {
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

    const [error, setError] = useState<string | null>(null);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        let res;
        if (currentPost?.id) {
            res = await updateBlogPost(currentPost.id, currentPost);
        } else {
            res = await createBlogPost(currentPost as any);
        }

        if (res.success) {
            await loadPosts();
            setIsEditing(false);
            setCurrentPost(null);
            showToast(currentPost?.id ? "Blog post updated successfully" : "Blog post published successfully", "success");
        } else {
            setError(res.error || "Error saving post");
        }
        setLoading(false);
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        setIsDeleting(true);
        const res = await deleteBlogPost(deleteId);
        if (res.success) {
            setPosts(posts.filter(p => p.id !== deleteId));
            setDeleteId(null);
            showToast("Blog post deleted successfully", "success");
        } else {
            showToast(res.error || "Failed to delete post", "error");
        }
        setIsDeleting(false);
    };

    const filteredPosts = posts.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.category.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === "All Categories" || p.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const categories = ["All Categories", ...Array.from(new Set(posts.map(p => p.category)))];

    const stats = {
        total: posts.length,
        latest: posts.length > 0 ? posts[0].date : "None",
        categories: Array.from(new Set(posts.map(p => p.category))).length,
        drafts: 0 // Placeholder until draft state is implemented
    };

    if (loading && posts.length === 0) return <div className={styles.loading}>Accessing Archives...</div>;

    return (
        <div className={styles.pageContent}>
            <div className={styles.sectionHeader}>
                <div className={styles.sectionTitleGroup}>
                    <span className={styles.sectionEyebrow}>Editorial Registry</span>
                    <h1 className={styles.sectionTitle}>Blog Management</h1>
                    <p className={styles.sectionSubtitle}>Curate and manage the hotel's luxury stories and updates.</p>
                </div>
                <button className={styles.addButton} onClick={() => handleEdit()}>
                    <Plus size={16} /> Write New Entry
                </button>
            </div>

            <div className={styles.editorialStats}>
                <div className={styles.editorialStatCard}>
                    <div className={styles.editorialStatAccent} />
                    <span className={styles.editorialStatLabel}>Total Articles</span>
                    <span className={styles.editorialStatValue}>{stats.total}</span>
                </div>
                <div className={styles.editorialStatCard}>
                    <div className={styles.editorialStatAccent} />
                    <span className={styles.editorialStatLabel}>Categories</span>
                    <span className={styles.editorialStatValue}>{stats.categories}</span>
                </div>
                <div className={styles.editorialStatCard}>
                    <div className={styles.editorialStatAccent} />
                    <span className={styles.editorialStatLabel}>Latest Activity</span>
                    <span className={styles.editorialStatValue} style={{ fontSize: '1.25rem' }}>{stats.latest}</span>
                </div>
                <div className={styles.editorialStatCard}>
                    <div className={styles.editorialStatAccent} />
                    <span className={styles.editorialStatLabel}>Editorial Status</span>
                    <span className={styles.editorialStatValue} style={{ fontSize: '1.25rem' }}>System Live</span>
                </div>
            </div>

            <div className={styles.editorialFilters}>
                <div className={styles.editorialSearch}>
                    <Search size={16} className={styles.editorialSearchIcon} />
                    <input
                        type="text"
                        placeholder="Search archives by title or category..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className={styles.filterContainer}>
                    <div
                        className={`${styles.filterGroup} ${isFilterOpen ? styles.filterActive : ""}`}
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                    >
                        <Filter size={14} />
                        <span className={styles.filterLabel}>{selectedCategory}</span>
                    </div>

                    {isFilterOpen && (
                        <div className={styles.filterDropdown}>
                            {categories.map(cat => (
                                <div
                                    key={cat}
                                    className={`${styles.filterOption} ${selectedCategory === cat ? styles.optionActive : ""}`}
                                    onClick={() => {
                                        setSelectedCategory(cat);
                                        setIsFilterOpen(false);
                                    }}
                                >
                                    {cat}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className={styles.editorialRegistry}>
                {filteredPosts.map((post) => (
                    <div key={post.id} className={styles.articleCard}>
                        <div className={styles.articleThumb}>
                            <img src={post.image} alt="" />
                        </div>
                        <div className={styles.articleMain}>
                            <span className={styles.articleCategory}>{post.category}</span>
                            <h3 className={styles.articleTitle}>{post.title}</h3>
                            <div className={styles.articleMeta}>
                                <span><User size={12} style={{ marginRight: '4px' }} /> {post.author}</span>
                                <span><Calendar size={12} style={{ marginRight: '4px' }} /> {post.date}</span>
                            </div>
                        </div>
                        <div className={styles.articleActions}>
                            <button className={styles.actionBtn} onClick={() => handleEdit(post)} title="Edit Article">
                                <Edit3 size={16} />
                            </button>
                            <button className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={() => setDeleteId(post.id)} title="Delete Article">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}

                {filteredPosts.length === 0 && (
                    <div className={styles.emptyState}>
                        <Search size={40} style={{ opacity: 0.1, marginBottom: '1rem' }} />
                        <p>No articles found matching your criteria.</p>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            <AdminModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                title="Confirm Deletion"
                onSubmit={(e) => { e.preventDefault(); handleDelete(); }}
                loading={isDeleting}
                submitLabel="Delete Article"
                danger
            >
                <div style={{ padding: '1rem 0' }}>
                    <p style={{ color: '#6B7280', fontSize: '0.9375rem', lineHeight: '1.6' }}>
                        Are you sure you want to delete <strong style={{ color: '#111827' }}>{posts.find(p => p.id === deleteId)?.title}</strong>?
                    </p>
                    <p style={{ color: '#EF4444', fontSize: '0.8125rem', marginTop: '1rem', fontWeight: 500 }}>
                        This action cannot be undone and will remove the article from the public registry.
                    </p>
                </div>
            </AdminModal>

            {isEditing && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent} style={{ maxWidth: '1100px' }}>
                        <div className={styles.modalHeader}>
                            <div>
                                <h3 className={styles.modalTitle}>{currentPost?.id ? "Refine Article" : "Compose New Entry"}</h3>
                                <p className={styles.modalSub}>Drafting for the luxury editorial collection.</p>
                            </div>
                            <button onClick={() => setIsEditing(false)} className={styles.closeBtn}><X size={24} /></button>
                        </div>

                        {error && (
                            <div className={styles.error} style={{ margin: '1rem 2rem 0', borderRadius: '8px' }}>
                                {error}
                            </div>
                        )}

                        <form noValidate onSubmit={handleSave} className={styles.modalBody}>
                            <div className={styles.editorialComposer}>
                                <div className={styles.composerMain}>
                                    <div className={styles.composerField}>
                                        <label className={styles.composerLabel}>Article Headline</label>
                                        <input
                                            type="text"
                                            
                                            placeholder="Enter a captivating title..."
                                            className={styles.composerInput}
                                            value={currentPost?.title || ""}
                                            onChange={e => setCurrentPost(prev => ({ ...prev, title: e.target.value }))}
                                        />
                                    </div>

                                    <div className={styles.composerField}>
                                        <label className={styles.composerLabel}>Narrative Content</label>
                                        <textarea
                                            placeholder="Tell the story of Parkside Villa..."
                                            className={`${styles.composerInput} ${styles.composerTextarea}`}
                                            
                                            value={currentPost?.content || ""}
                                            onChange={e => setCurrentPost(prev => ({ ...prev, content: e.target.value }))}
                                        />
                                    </div>
                                </div>

                                <div className={styles.composerSidebar}>
                                    <div className={styles.composerField}>
                                        <MediaUpload
                                            label="Header Atmosphere"
                                            value={currentPost?.image || ""}
                                            onChange={(url) => setCurrentPost(prev => ({ ...prev, image: url }))}
                                        />
                                    </div>

                                    <div className={styles.composerField}>
                                        <label className={styles.composerLabel}>Editorial Meta</label>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            <select
                                                className={styles.composerInput}
                                                style={{ padding: '0.75rem' }}
                                                value={currentPost?.category || "Lifestyle"}
                                                onChange={e => setCurrentPost(prev => ({ ...prev, category: e.target.value }))}
                                            >
                                                <option>Lifestyle</option>
                                                <option>Dining</option>
                                                <option>Events</option>
                                                <option>News</option>
                                                <option>Wellness</option>
                                            </select>

                                            <input
                                                type="date"
                                                className={styles.composerInput}
                                                style={{ padding: '0.75rem' }}
                                                value={currentPost?.date || ""}
                                                onChange={e => setCurrentPost(prev => ({ ...prev, date: e.target.value }))}
                                            />

                                            <input
                                                type="text"
                                                placeholder="Author Name"
                                                className={styles.composerInput}
                                                style={{ padding: '0.75rem' }}
                                                value={currentPost?.author || ""}
                                                onChange={e => setCurrentPost(prev => ({ ...prev, author: e.target.value }))}
                                            />
                                        </div>
                                    </div>

                                    <div className={styles.composerField}>
                                        <label className={styles.composerLabel}>Abstract</label>
                                        <textarea
                                            placeholder="A brief summary for the registry..."
                                            className={styles.composerInput}
                                            rows={4}
                                            value={currentPost?.excerpt || ""}
                                            onChange={e => setCurrentPost(prev => ({ ...prev, excerpt: e.target.value }))}
                                        />
                                    </div>

                                    <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <button type="submit" className={styles.saveButton} style={{ width: '100%' }} disabled={loading}>
                                            <Save size={16} /> {loading ? "Publishing..." : "Publish Article"}
                                        </button>
                                        <button type="button" onClick={() => setIsEditing(false)} className={styles.secondaryBtn} style={{ width: '100%', justifyContent: 'center' }}>
                                            Cancel Draft
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
