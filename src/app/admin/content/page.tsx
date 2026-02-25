"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import styles from "../admin.module.css";
import { getSiteData, updateSiteContent, updateContactInfo } from "../../actions";
import { Save, FileText, Loader2, LayoutTemplate, Phone, BarChart2 } from "lucide-react";

// Text/section content managed via SiteContent table
const contentSchema = [
    {
        key: "landing_hero",
        label: "Landing Page: Hero Banner",
        fields: [
            { name: "badge", label: "Hero Badge", type: "text", default: "Refining Hospitality Since 2005" },
            { name: "title", label: "Hero Title", type: "text", default: "Parkside Villa Kitui" },
            { name: "subtitle", label: "Hero Subtitle", type: "textarea", default: "An oasis of tranquility in the heart of Kenya." },
            { name: "cta1", label: "Primary Button URL", type: "text", default: "#accommodation" },
            { name: "cta2", label: "Secondary Button URL", type: "text", default: "#conference" },
        ]
    },
    {
        key: "rooms_intro",
        label: "Landing Page: Rooms Section",
        fields: [
            { name: "badge", label: "Section Badge", type: "text", default: "Curated Living" },
            { name: "title", label: "Section Title", type: "text", default: "Refined Accommodation" },
            { name: "desc", label: "Section Description", type: "textarea", default: "Each room at Parkside Villa is a sanctuary..." }
        ]
    },
    {
        key: "dining_intro",
        label: "Landing Page: Dining Section",
        fields: [
            { name: "badge", label: "Section Badge", type: "text", default: "Gastronomy" },
            { name: "title", label: "Section Title", type: "text", default: "Culinary Excellence" },
            { name: "desc", label: "Section Description", type: "textarea", default: "Experience a symphony of flavors..." }
        ]
    },
    {
        key: "facilities_intro",
        label: "Landing Page: Facilities Section",
        fields: [
            { name: "badge", label: "Section Badge", type: "text", default: "Estate Features" },
            { name: "title", label: "Section Title", type: "text", default: "World-Class Amenities" },
            { name: "desc", label: "Section Description", type: "textarea", default: "Discover everything Parkside Villa has to offer." }
        ]
    },
    {
        key: "footer_about",
        label: "Footer: About Text",
        fields: [
            { name: "text", label: "About Description", type: "textarea", default: "Parkside Villa Kitui offers a unique blend of modern luxury and traditional Kenyan hospitality." }
        ]
    },
    {
        key: "experience_stats",
        label: "Homepage: Experience Statistics",
        fields: [
            { name: "stat1_num", label: "Stat 1 — Number", type: "text", default: "20" },
            { name: "stat1_suffix", label: "Stat 1 — Suffix", type: "text", default: "+" },
            { name: "stat1_label", label: "Stat 1 — Label", type: "text", default: "Years of Excellence" },
            { name: "stat2_num", label: "Stat 2 — Number", type: "text", default: "4" },
            { name: "stat2_suffix", label: "Stat 2 — Suffix", type: "text", default: "★" },
            { name: "stat2_label", label: "Stat 2 — Label", type: "text", default: "Star Rating" },
            { name: "stat3_num", label: "Stat 3 — Number", type: "text", default: "500" },
            { name: "stat3_suffix", label: "Stat 3 — Suffix", type: "text", default: "+" },
            { name: "stat3_label", label: "Stat 3 — Label", type: "text", default: "Events Hosted" },
            { name: "stat4_num", label: "Stat 4 — Number", type: "text", default: "98" },
            { name: "stat4_suffix", label: "Stat 4 — Suffix", type: "text", default: "%" },
            { name: "stat4_label", label: "Stat 4 — Label", type: "text", default: "Guest Satisfaction" },
        ]
    }
];

const defaultContact = {
    phone: "+254 700 000000",
    email: "info@parksidevillakitui.com",
    whatsapp: "254700000000",
    address: "Parkside Villa, Kitui - Kenya",
    facebook: "https://facebook.com/parksidevillakitui",
    instagram: "https://instagram.com/parksidevillakitui",
    linkedin: "https://linkedin.com/company/parksidevillakitui",
};

export default function AdminContent() {
    const [content, setContent] = useState<any>({});
    const [contactData, setContactData] = useState({ ...defaultContact });
    const [loading, setLoading] = useState(true);
    const [savingKey, setSavingKey] = useState<string | null>(null);
    const [savingContact, setSavingContact] = useState(false);
    const [contactMsg, setContactMsg] = useState("");

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        const data = await getSiteData();
        if (data?.content) setContent(data.content);
        if (data?.contactInfo) {
            const ci = data.contactInfo;
            const social = (ci.social as any) || {};
            setContactData({
                phone: ci.phone || defaultContact.phone,
                email: ci.email || defaultContact.email,
                whatsapp: ci.whatsapp || defaultContact.whatsapp,
                address: ci.address || defaultContact.address,
                facebook: social.facebook || defaultContact.facebook,
                instagram: social.instagram || defaultContact.instagram,
                linkedin: social.linkedin || defaultContact.linkedin,
            });
        }

        setLoading(false);
    };

    const handleSave = async (schemaKey: string) => {
        setSavingKey(schemaKey);
        await updateSiteContent(schemaKey, content[schemaKey] || {});
        setSavingKey(null);
        alert("Content saved successfully!");
    };

    const handleChange = (schemaKey: string, fieldName: string, value: string) => {
        setContent((prev: any) => ({
            ...prev,
            [schemaKey]: { ...(prev[schemaKey] || {}), [fieldName]: value }
        }));
    };

    const handleContactSave = async () => {
        setSavingContact(true);
        const result = await updateContactInfo({
            phone: contactData.phone,
            email: contactData.email,
            whatsapp: contactData.whatsapp,
            address: contactData.address,
            social: {
                facebook: contactData.facebook,
                instagram: contactData.instagram,
                linkedin: contactData.linkedin,
            }
        });
        setSavingContact(false);
        setContactMsg(result.success ? "Contact info saved!" : "Save failed. Please try again.");
        setTimeout(() => setContactMsg(""), 3000);
    };

    if (loading) return (
        <div className={styles.loadingWrapper}>
            <Loader2 className={styles.spinner} size={40} />
            <p>Accessing Royal Vault...</p>
        </div>
    );

    return (
        <div className={styles.container}>
            <div className={styles.sectionHeader}>
                <div className={styles.sectionTitleGroup}>
                    <span className={styles.sectionEyebrow}>Brand Identity</span>
                    <h1 className={styles.sectionTitle}>Site Copy &amp; Content</h1>
                    <p className={styles.sectionSubtitle}>Manage the textual narrative and static copy across Parkside Villa.</p>
                </div>
            </div>

            <div className={styles.contentSectionsGrid}>
                {/* ── Standard CMS sections ── */}
                {contentSchema.map((section) => (
                    <div key={section.key} className={styles.contentSectionCard}>
                        <div className={styles.contentSectionHeader}>
                            {section.key === "experience_stats"
                                ? <BarChart2 size={20} className={styles.contentSectionIcon} />
                                : <LayoutTemplate size={20} className={styles.contentSectionIcon} />
                            }
                            <h3>{section.label}</h3>
                        </div>
                        <div className={styles.contentSectionBody}>
                            {section.fields.map(field => {
                                const val = (content[section.key] && content[section.key][field.name]) ?? field.default;
                                return (
                                    <div key={field.name} className={styles.formGroup}>
                                        <label className={styles.label}>{field.label}</label>
                                        {field.type === "textarea" ? (
                                            <textarea
                                                className={styles.textarea}
                                                value={val}
                                                onChange={(e) => handleChange(section.key, field.name, e.target.value)}
                                                rows={3}
                                            />
                                        ) : (
                                            <input
                                                type={field.type}
                                                className={styles.input}
                                                value={val}
                                                onChange={(e) => handleChange(section.key, field.name, e.target.value)}
                                            />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        <div className={styles.contentSectionFooter}>
                            <button
                                className={styles.saveButton}
                                onClick={() => handleSave(section.key)}
                                disabled={savingKey === section.key}
                            >
                                {savingKey === section.key ? <Loader2 size={16} className={styles.spinner} /> : <Save size={16} />}
                                {savingKey === section.key ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </div>
                ))}

                {/* ── Contact Information ── */}
                <div className={styles.contentSectionCard}>
                    <div className={styles.contentSectionHeader}>
                        <Phone size={20} className={styles.contentSectionIcon} />
                        <h3>Contact Information</h3>
                    </div>
                    <div className={styles.contentSectionBody}>
                        {[
                            { key: "phone", label: "Phone Number", type: "tel", placeholder: "+254 700 000000" },
                            { key: "email", label: "Email Address", type: "email", placeholder: "info@parksidevillakitui.com" },
                            { key: "whatsapp", label: "WhatsApp Number (international, no +)", type: "text", placeholder: "254700000000" },
                            { key: "address", label: "Physical Address", type: "text", placeholder: "Parkside Villa, Kitui - Kenya" },
                            { key: "facebook", label: "Facebook URL", type: "url", placeholder: "https://facebook.com/..." },
                            { key: "instagram", label: "Instagram URL", type: "url", placeholder: "https://instagram.com/..." },
                            { key: "linkedin", label: "LinkedIn URL", type: "url", placeholder: "https://linkedin.com/company/..." },
                        ].map(field => (
                            <div key={field.key} className={styles.formGroup}>
                                <label className={styles.label}>{field.label}</label>
                                <input
                                    type={field.type}
                                    className={styles.input}
                                    value={contactData[field.key as keyof typeof contactData]}
                                    placeholder={field.placeholder}
                                    onChange={(e) => setContactData(prev => ({ ...prev, [field.key]: e.target.value }))}
                                />
                            </div>
                        ))}
                    </div>
                    <div className={styles.contentSectionFooter}>
                        {contactMsg && (
                            <span style={{ fontSize: '0.8rem', color: contactMsg.includes("saved") ? 'var(--gold)' : '#e57373', marginRight: '1rem' }}>
                                {contactMsg}
                            </span>
                        )}
                        <button
                            className={styles.saveButton}
                            onClick={handleContactSave}
                            disabled={savingContact}
                        >
                            {savingContact ? <Loader2 size={16} className={styles.spinner} /> : <Save size={16} />}
                            {savingContact ? "Saving..." : "Save Contact Info"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
