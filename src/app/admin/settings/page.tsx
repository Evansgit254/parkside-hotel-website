"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect, useRef } from "react";
import styles from "../admin.module.css";
import { getSiteData, updateContactInfo, addHeroImage, deleteHeroImage, uploadImage, getCloudinarySignature } from "../../actions";
import { Save, Phone, Mail, MapPin, MessageSquare, Facebook, Instagram, Linkedin, Plus, Trash2, Image as ImageIcon, Upload } from "lucide-react";
import { showToast } from "../components/AdminToast";

export default function AdminSettings() {
    const [contact, setContact] = useState<any>(null);
    const [heroImages, setHeroImages] = useState<string[]>([]);
    const [newImageUrl, setNewImageUrl] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchData = async () => {
        const data = await getSiteData();
        if (data && data.contactInfo) setContact(data.contactInfo);
        if (data && data.heroImages) setHeroImages(data.heroImages);
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

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
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
                await addHeroImage(result.secure_url);
                await fetchData();
                showToast("Hero image uploaded and added", "success");
            }
        } catch (error: any) {
            console.error("Upload failed:", error);
            showToast(`Upload failed: ${error.message || "Unknown error"}`, "error");
        } finally {
            setIsUploading(false);
        }
    };

    const handleDeleteImage = async (url: string) => {
        if (confirm("Remove this hero image?")) {
            const res = await deleteHeroImage(url);
            if (res.success) {
                await fetchData();
                showToast("Hero image removed successfully", "success");
            } else {
                showToast(res.error || "Failed to delete hero image", "error");
            }
        }
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
                <form onSubmit={handleSave} className={styles.card}>
                    <div style={{ marginBottom: '2.5rem' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827', marginBottom: '0.5rem' }}>Core Identity</h3>
                        <p style={{ fontSize: '0.875rem', color: '#6B7280' }}>Maintain accurate contact details for guest communication</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}><Phone size={14} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} /> Primary Phone</label>
                            <input
                                className={styles.input}
                                value={contact.phone}
                                onChange={e => setContact({ ...contact, phone: e.target.value })}
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}><Mail size={14} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} /> Primary Email</label>
                            <input
                                type="email"
                                className={styles.input}
                                value={contact.email}
                                onChange={e => setContact({ ...contact, email: e.target.value })}
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}><MessageSquare size={14} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} /> WhatsApp Business</label>
                            <input
                                className={styles.input}
                                value={contact.whatsapp}
                                onChange={e => setContact({ ...contact, whatsapp: e.target.value })}
                                placeholder="e.g. 254700000000"
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}><MapPin size={14} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} /> Physical Location</label>
                            <input
                                className={styles.input}
                                value={contact.address}
                                onChange={e => setContact({ ...contact, address: e.target.value })}
                                required
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
                            <label className={styles.label}><Instagram size={14} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} /> Instagram Feed</label>
                            <input
                                type="url"
                                className={styles.input}
                                value={contact.social?.instagram || ''}
                                onChange={e => setContact({ ...contact, social: { ...contact.social, instagram: e.target.value } })}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}><Linkedin size={14} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} /> LinkedIn Network</label>
                            <input
                                type="url"
                                className={styles.input}
                                value={contact.social?.linkedin || ''}
                                onChange={e => setContact({ ...contact, social: { ...contact.social, linkedin: e.target.value } })}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '3rem' }}>
                        <button type="submit" disabled={saving} className={styles.loginButton} style={{ width: 'auto', minWidth: '200px' }}>
                            <Save size={18} /> {saving ? "Saving Changes..." : "Commit Global Update"}
                        </button>
                    </div>
                </form>

                {/* Hero Slideshow Section */}
                <div className={styles.card}>
                    <div style={{ marginBottom: '2.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                            <ImageIcon size={20} color="var(--secondary)" />
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827', margin: 0 }}>Visual Ambiance</h3>
                        </div>
                        <p style={{ fontSize: '0.875rem', color: '#6B7280' }}>Manage the high-definition hero imagery for the home carousel</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                        {heroImages.map((url, idx) => (
                            <div key={idx} style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', aspectRatio: '16/9', border: '1px solid rgba(0,0,0,0.07)' }}>
                                <img src={url} alt={`Hero ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)', display: 'flex', alignItems: 'flex-end', padding: '1rem' }}>
                                    <span style={{ fontSize: '0.7rem', color: '#6B7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80%' }}>{url.split('/').pop()}</span>
                                    <button type="button" onClick={() => handleDeleteImage(url)} style={{ marginLeft: 'auto', padding: '0.5rem', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', cursor: 'pointer', color: '#ef4444' }} title="Remove Image">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'grid', gap: '1rem' }}>
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            style={{
                                width: '100%',
                                padding: '2.5rem',
                                background: '#F7F8FC',
                                border: '2px dashed rgba(0,0,0,0.1)',
                                borderRadius: '16px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseOver={e => e.currentTarget.style.borderColor = 'var(--secondary)'}
                            onMouseOut={e => e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)'}
                        >
                            <Upload size={32} color="var(--secondary)" />
                            <span style={{ color: '#6B7280', marginTop: '0.75rem', fontSize: '0.9375rem', fontWeight: 500 }}>
                                {isUploading ? "Uploading..." : "Click to upload a new ambiance image"}
                            </span>
                            <span style={{ color: '#6B7280', marginTop: '0.25rem', fontSize: '0.75rem' }}>
                                Recommended: 1920x1080px (16:9)
                            </span>
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                            accept="image/*"
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
        </div>
    );
}
