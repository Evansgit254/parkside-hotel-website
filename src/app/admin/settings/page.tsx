"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import styles from "../admin.module.css";
import { getSiteData, updateContactInfo, addHeroImage, deleteHeroImage, updateSiteContent } from "../../actions";
import { Save, Phone, Mail, MapPin, MessageSquare, Facebook, Instagram, PlaySquare, Plus, Trash2, Image as ImageIcon } from "lucide-react";
import { showToast } from "../components/AdminToast";
import MediaUpload from "../components/MediaUpload";
import AdminModal from "../../components/AdminModal";

export default function AdminSettings() {
    const [contact, setContact] = useState<any>(null);
    const [heroImages, setHeroImages] = useState<string[]>([]);
    const [newImageUrl, setNewImageUrl] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleteUrl, setDeleteUrl] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [popup, setPopup] = useState({
        enabled: false,
        title: "Resort Information",
        text: "Swimming Pool • VIP Lounge • Conference Rooms • Free Wi-Fi",
        phone: "+254 701 023 026"
    });
    const [savingPopup, setSavingPopup] = useState(false);

    const fetchData = async () => {
        const data = await getSiteData();
        if (data && data.contactInfo) setContact(data.contactInfo);
        if (data && data.heroImages) setHeroImages(data.heroImages);
        if (data && data.content && data.content['utility-popup']) {
            setPopup({ ...popup, ...data.content['utility-popup'] });
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        const res = await updateContactInfo(contact);
        if (res.success) {
            await fetchData();
            showToast("Contact information saved successfully", "success");
        } else {
            showToast(res.error || "Failed to update contact info", "error");
        }
        setSaving(false);
    };

    const handleAddImage = async () => {
        if (!newImageUrl.trim()) return;
        const res = await addHeroImage(newImageUrl.trim());
        if (res.success) {
            setNewImageUrl("");
            await fetchData();
            showToast("Hero image added successfully", "success");
        } else {
            showToast(res.error || "Failed to add hero image", "error");
        }
    };

    const handleDeleteImage = async () => {
        if (!deleteUrl) return;
        setIsDeleting(true);
        const res = await deleteHeroImage(deleteUrl);
        if (res.success) {
            await fetchData();
            setDeleteUrl(null);
            showToast("Hero image removed successfully", "success");
        } else {
            showToast(res.error || "Failed to delete hero image", "error");
        }
        setIsDeleting(false);
    };

    const handleUpdatePopup = async (newPopup: any) => {
        setSavingPopup(true);
        const res = await updateSiteContent('utility-popup', newPopup);
        if (res.success) {
            setPopup(newPopup);
            showToast("Pop-up configuration updated", "success");
        } else {
            showToast("Failed to update pop-up", "error");
        }
        setSavingPopup(false);
    };

    if (loading) return <div className={styles.mainContent}>Loading...</div>;

    return (
        <div className={styles.mainContent}>
            <div className={styles.sectionHeader}>
                <div>
                    <h1 className={styles.sectionTitle}>Global Settings</h1>
                    <p style={{ color: '#6B7280', marginTop: '0.5rem' }}>Configure your hotel's presence and core identity</p>
                </div>
            </div>

            <div style={{ display: 'grid', gap: '3rem' }}>
                {/* Contact Information Section */}
                <form noValidate onSubmit={handleSave} className={styles.card}>
                    <div style={{ marginBottom: '2.5rem' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827', marginBottom: '0.5rem' }}>Core Identity</h3>
                        <p style={{ fontSize: '0.875rem', color: '#6B7280' }}>Maintain accurate contact details for guest communication</p>
                    </div>

                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}><Phone size={14} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} /> Primary Phone</label>
                            <input
                                className={styles.input}
                                value={contact.phone}
                                onChange={e => setContact({ ...contact, phone: e.target.value })}
                                
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}><Mail size={14} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} /> Primary Email</label>
                            <input
                                type="email"
                                className={styles.input}
                                value={contact.email}
                                onChange={e => setContact({ ...contact, email: e.target.value })}
                                
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}><MessageSquare size={14} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} /> WhatsApp Business</label>
                            <input
                                className={styles.input}
                                value={contact.whatsapp}
                                onChange={e => setContact({ ...contact, whatsapp: e.target.value })}
                                placeholder="e.g. 254700000000"
                                
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}><MapPin size={14} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} /> Physical Location</label>
                            <input
                                className={styles.input}
                                value={contact.address}
                                onChange={e => setContact({ ...contact, address: e.target.value })}
                                
                            />
                        </div>
                    </div>

                    <div style={{ marginTop: '3rem', marginBottom: '1.5rem', borderTop: '1px solid rgba(0,0,0,0.07)', paddingTop: '2.5rem' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827', marginBottom: '0.5rem' }}>Social Eminence</h3>
                        <p style={{ fontSize: '0.875rem', color: '#6B7280' }}>Links to your premium social media profiles</p>
                    </div>

                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}><Facebook size={14} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} /> Facebook Profile</label>
                            <input
                                type="url"
                                className={styles.input}
                                value={contact.social?.facebook || ''}
                                onChange={e => setContact({ ...contact, social: { ...contact.social, facebook: e.target.value } })}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}><PlaySquare size={14} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} /> TikTok URL</label>
                            <input
                                type="url"
                                className={styles.input}
                                value={contact.social?.tiktok || ''}
                                onChange={e => setContact({ ...contact, social: { ...contact.social, tiktok: e.target.value } })}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '3rem' }}>
                        <button type="submit" disabled={saving} className={styles.loginButton} style={{ width: 'auto', minWidth: '200px' }}>
                            <Save size={18} /> {saving ? "Saving Changes..." : "Commit Global Update"}
                        </button>
                    </div>
                </form>

                {/* Engagement & Alerts Section */}
                <div className={styles.card}>
                    <div style={{ marginBottom: '2.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                            <MessageSquare size={20} color="var(--secondary)" />
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827', margin: 0 }}>Engagement & Alerts</h3>
                        </div>
                        <p style={{ fontSize: '0.875rem', color: '#6B7280' }}>Manage the site-wide utility pop-up and informational modals</p>
                    </div>

                    <div style={{ padding: '2rem', background: '#F9FAFB', borderRadius: '16px', border: '1px solid #E5E7EB' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                            <div>
                                <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Utility Information Pop-up</h4>
                                <p style={{ fontSize: '0.8125rem', color: '#6B7280', margin: '0.25rem 0 0' }}>This pop-up appears after a 3-second delay on the first visit of each session.</p>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <label className={styles.label} style={{ margin: 0 }}>Active</label>
                                <button
                                    onClick={() => handleUpdatePopup({ ...popup, enabled: !popup.enabled })}
                                    style={{
                                        width: '48px',
                                        height: '24px',
                                        borderRadius: '100px',
                                        background: popup.enabled ? 'var(--admin-green)' : '#D1D5DB',
                                        border: 'none',
                                        position: 'relative',
                                        cursor: 'pointer',
                                        transition: 'background 0.3s'
                                    }}
                                >
                                    <div style={{
                                        width: '18px',
                                        height: '18px',
                                        borderRadius: '50%',
                                        background: '#fff',
                                        position: 'absolute',
                                        top: '3px',
                                        left: popup.enabled ? '27px' : '3px',
                                        transition: 'left 0.3s'
                                    }} />
                                </button>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gap: '1.5rem', opacity: popup.enabled ? 1 : 0.6, pointerEvents: popup.enabled ? 'auto' : 'none' }}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Pop-up Title</label>
                                <input
                                    className={styles.input}
                                    value={popup.title}
                                    onChange={e => setPopup({ ...popup, title: e.target.value })}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Highlights (Bullet points separated by dots)</label>
                                <input
                                    className={styles.input}
                                    value={popup.text}
                                    onChange={e => setPopup({ ...popup, text: e.target.value })}
                                    placeholder="e.g. Swimming Pool • VIP Lounge • Conference Rooms"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Contact Detail (Phone/WhatsApp)</label>
                                <input
                                    className={styles.input}
                                    value={popup.phone}
                                    onChange={e => setPopup({ ...popup, phone: e.target.value })}
                                />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <button
                                    onClick={() => handleUpdatePopup(popup)}
                                    disabled={savingPopup}
                                    className={styles.loginButton}
                                    style={{ width: 'auto', background: 'var(--secondary)', color: 'white' }}
                                >
                                    {savingPopup ? "Saving..." : "Save Pop-up Config"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Hero Slideshow Section */}
                <div className={styles.card}>
                    <div style={{ marginBottom: '2.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                            <ImageIcon size={20} color="var(--secondary)" />
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827', margin: 0 }}>Website Hero Slideshow</h3>
                        </div>
                        <p style={{ fontSize: '0.875rem', color: '#6B7280' }}>Manage the high-definition hero imagery for the home page landing carousel</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                        {heroImages.map((url, idx) => (
                            <div key={idx} style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', aspectRatio: '16/9', border: '1px solid rgba(0,0,0,0.07)' }}>
                                <img src={url} alt={`Hero ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)', display: 'flex', alignItems: 'flex-end', padding: '1rem' }}>
                                    <span style={{ fontSize: '0.7rem', color: '#6B7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80%' }}>{url.split('/').pop()}</span>
                                    <button type="button" onClick={() => setDeleteUrl(url)} style={{ marginLeft: 'auto', padding: '0.5rem', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', cursor: 'pointer', color: '#ef4444' }} title="Remove Image">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'grid', gap: '1rem' }}>
                        <MediaUpload
                            value=""
                            onChange={() => { }}
                            onFilesChange={async (urls) => {
                                for (const url of urls) {
                                    await addHeroImage(url);
                                }
                                await fetchData();
                                showToast("Hero image(s) added", "success");
                            }}
                            multiple
                            label="Upload New Gallery Asset"
                        />

                        <div style={{ display: 'flex', gap: '1rem', background: '#F7F8FC', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.07)' }}>
                            <input
                                type="url"
                                className={styles.input}
                                placeholder="Entrust a new high-resolution image URL..."
                                value={newImageUrl}
                                onChange={e => setNewImageUrl(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddImage())}
                            />
                            <button type="button" onClick={handleAddImage} className={styles.loginButton} style={{ width: 'auto', whiteSpace: 'nowrap' }}>
                                <Plus size={18} /> Add Ambiance
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {/* Delete Confirmation Modal */}
            <AdminModal
                isOpen={!!deleteUrl}
                onClose={() => setDeleteUrl(null)}
                title="Confirm Deletion"
                onSubmit={(e) => { e.preventDefault(); handleDeleteImage(); }}
                loading={isDeleting}
                submitLabel="Remove Hero Image"
                danger
            >
                <div style={{ padding: '1rem 0' }}>
                    <p style={{ color: '#6B7280', fontSize: '0.9375rem', lineHeight: '1.6' }}>
                        Are you sure you want to remove this hero image?
                    </p>
                    <p style={{ color: '#EF4444', fontSize: '0.8125rem', marginTop: '1rem', fontWeight: 500 }}>
                        This will remove the image from the homepage rotation.
                    </p>
                </div>
            </AdminModal>
        </div>
    );
}
