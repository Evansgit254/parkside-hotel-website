"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import styles from "../admin.module.css";
import { getSiteData, updateSiteContent, updateContactInfo } from "../../actions";
import {
    Save, Loader2, LayoutTemplate, Phone, BarChart2,
    Star, ChevronRight, CheckCircle2, AlertCircle
} from "lucide-react";

// ─── Schema ────────────────────────────────────────────────────────────────────
const contentSchema = [
    {
        key: "landing_hero",
        label: "Hero Banner",
        description: "The first thing visitors see — headline, subtitle, and CTAs.",
        icon: Star,
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
        label: "Rooms Section",
        description: "Introductory copy for the accommodation section on the homepage.",
        icon: LayoutTemplate,
        fields: [
            { name: "badge", label: "Section Badge", type: "text", default: "Curated Living" },
            { name: "title", label: "Section Title", type: "text", default: "Refined Accommodation" },
            { name: "desc", label: "Section Description", type: "textarea", default: "Each room at Parkside Villa is a sanctuary..." }
        ]
    },
    {
        key: "dining_intro",
        label: "Dining Section",
        description: "Introductory copy for the dining section on the homepage.",
        icon: LayoutTemplate,
        fields: [
            { name: "badge", label: "Section Badge", type: "text", default: "Gastronomy" },
            { name: "title", label: "Section Title", type: "text", default: "Culinary Excellence" },
            { name: "desc", label: "Section Description", type: "textarea", default: "Experience a symphony of flavors..." }
        ]
    },
    {
        key: "facilities_intro",
        label: "Facilities Section",
        description: "Introductory copy for the facilities section on the homepage.",
        icon: LayoutTemplate,
        fields: [
            { name: "badge", label: "Section Badge", type: "text", default: "Estate Features" },
            { name: "title", label: "Section Title", type: "text", default: "World-Class Amenities" },
            { name: "desc", label: "Section Description", type: "textarea", default: "Discover everything Parkside Villa has to offer." }
        ]
    },
    {
        key: "footer_about",
        label: "Footer About",
        description: "Short brand description shown in the website footer.",
        icon: LayoutTemplate,
        fields: [
            { name: "text", label: "About Description", type: "textarea", default: "Parkside Villa Kitui offers a unique blend of modern luxury and traditional Kenyan hospitality." }
        ]
    },
    {
        key: "experience_stats",
        label: "Experience Stats",
        description: "The four achievement stats shown in the homepage strip.",
        icon: BarChart2,
        fields: [
            { name: "stat1_num", label: "Stat 1 · Number", type: "text", default: "20" },
            { name: "stat1_suffix", label: "Stat 1 · Suffix", type: "text", default: "+" },
            { name: "stat1_label", label: "Stat 1 · Label", type: "text", default: "Years of Excellence" },
            { name: "stat2_num", label: "Stat 2 · Number", type: "text", default: "4" },
            { name: "stat2_suffix", label: "Stat 2 · Suffix", type: "text", default: "★" },
            { name: "stat2_label", label: "Stat 2 · Label", type: "text", default: "Star Rating" },
            { name: "stat3_num", label: "Stat 3 · Number", type: "text", default: "500" },
            { name: "stat3_suffix", label: "Stat 3 · Suffix", type: "text", default: "+" },
            { name: "stat3_label", label: "Stat 3 · Label", type: "text", default: "Events Hosted" },
            { name: "stat4_num", label: "Stat 4 · Number", type: "text", default: "98" },
            { name: "stat4_suffix", label: "Stat 4 · Suffix", type: "text", default: "%" },
            { name: "stat4_label", label: "Stat 4 · Label", type: "text", default: "Guest Satisfaction" },
        ]
    }
];

const TABS = [
    { id: "page-copy", label: "Page Copy", keys: ["landing_hero", "rooms_intro", "dining_intro", "facilities_intro", "footer_about"] },
    { id: "stats", label: "Statistics", keys: ["experience_stats"] },
    { id: "contact", label: "Contact Info", keys: [] },
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

const contactFields = [
    { key: "phone", label: "Phone Number", type: "tel", placeholder: "+254 700 000000", group: "Basic" },
    { key: "email", label: "Email Address", type: "email", placeholder: "info@parksidevillakitui.com", group: "Basic" },
    { key: "whatsapp", label: "WhatsApp (international, no +)", type: "text", placeholder: "254700000000", group: "Basic" },
    { key: "address", label: "Physical Address", type: "text", placeholder: "Parkside Villa, Kitui - Kenya", group: "Basic" },
    { key: "facebook", label: "Facebook URL", type: "url", placeholder: "https://facebook.com/...", group: "Social" },
    { key: "instagram", label: "Instagram URL", type: "url", placeholder: "https://instagram.com/...", group: "Social" },
    { key: "linkedin", label: "LinkedIn URL", type: "url", placeholder: "https://linkedin.com/company/...", group: "Social" },
];

// ─── Component ─────────────────────────────────────────────────────────────────
export default function AdminContent() {
    const [content, setContent] = useState<any>({});
    const [contactData, setContactData] = useState({ ...defaultContact });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("page-copy");
    const [activeSection, setActiveSection] = useState("landing_hero");
    const [savingKey, setSavingKey] = useState<string | null>(null);
    const [savingContact, setSavingContact] = useState(false);
    const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

    useEffect(() => { loadData(); }, []);

    const showToast = (msg: string, type: "success" | "error" = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3200);
    };

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
        const res = await updateSiteContent(schemaKey, content[schemaKey] || {});
        setSavingKey(null);
        showToast("Changes saved successfully.", "success");
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
            social: { facebook: contactData.facebook, instagram: contactData.instagram, linkedin: contactData.linkedin }
        });
        setSavingContact(false);
        showToast(result.success ? "Contact information saved." : "Error saving contact info.", result.success ? "success" : "error");
    };

    if (loading) return (
        <div className={styles.loadingWrapper}>
            <Loader2 className={styles.spinner} size={36} />
            <p style={{ marginTop: '1rem', color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                Loading Content Vault
            </p>
        </div>
    );

    const currentTabSections = activeTab === "contact"
        ? []
        : contentSchema.filter(s => TABS.find(t => t.id === activeTab)?.keys.includes(s.key));

    const activeSchemaSection = contentSchema.find(s => s.key === activeSection);

    return (
        <div className={styles.container} style={{ position: 'relative' }}>

            {/* ── Toast ── */}
            {toast && (
                <div style={{
                    position: 'fixed', top: '1.5rem', right: '2rem', zIndex: 999,
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.875rem 1.25rem',
                    background: toast.type === 'success' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                    border: `1px solid ${toast.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                    backdropFilter: 'blur(12px)',
                    animation: 'fadeIn 0.25s ease',
                }}>
                    {toast.type === 'success'
                        ? <CheckCircle2 size={16} color="#10b981" />
                        : <AlertCircle size={16} color="#ef4444" />
                    }
                    <span style={{ fontSize: '0.8125rem', color: toast.type === 'success' ? '#10b981' : '#ef4444', letterSpacing: '0.02em' }}>
                        {toast.msg}
                    </span>
                </div>
            )}

            {/* ── Page Header ── */}
            <div className={styles.sectionHeader}>
                <div className={styles.sectionTitleGroup}>
                    <span className={styles.sectionEyebrow}>Brand Identity</span>
                    <h1 className={styles.sectionTitle}>Site Copy &amp; Content</h1>
                    <p className={styles.sectionSubtitle}>Manage the narrative and information across every page of Parkside Villa.</p>
                </div>
            </div>

            {/* ── Tab Bar ── */}
            <div style={{
                display: 'flex', gap: '0', marginBottom: '2rem',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}>
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => { setActiveTab(tab.id); if (tab.keys[0]) setActiveSection(tab.keys[0]); }}
                        style={{
                            padding: '0.875rem 1.75rem',
                            background: 'none', border: 'none', cursor: 'pointer',
                            fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase',
                            fontFamily: 'Inter, sans-serif', fontWeight: 500,
                            color: activeTab === tab.id ? '#C9A84C' : 'rgba(255,255,255,0.35)',
                            borderBottom: activeTab === tab.id ? '2px solid #C9A84C' : '2px solid transparent',
                            transition: 'all 0.2s ease',
                            marginBottom: '-1px',
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ── Content: Page Copy + Stats (two-panel layout) ── */}
            {activeTab !== "contact" && (
                <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '1px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.05)', minHeight: '500px' }}>

                    {/* Left: section list */}
                    <div style={{ background: '#111110', padding: '0.5rem 0' }}>
                        {currentTabSections.map(section => {
                            const Icon = section.icon;
                            const isActive = activeSection === section.key;
                            return (
                                <button
                                    key={section.key}
                                    onClick={() => setActiveSection(section.key)}
                                    style={{
                                        width: '100%', textAlign: 'left', border: 'none',
                                        padding: '0.875rem 1.25rem',
                                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                                        cursor: 'pointer',
                                        borderLeft: isActive ? '2px solid #C9A84C' : '2px solid transparent',
                                        background: isActive ? 'rgba(201,168,76,0.06)' : 'transparent',
                                        transition: 'all 0.2s ease',
                                    }}
                                >
                                    <Icon size={15} color={isActive ? '#C9A84C' : 'rgba(255,255,255,0.3)'} style={{ flexShrink: 0 }} />
                                    <span style={{
                                        fontSize: '0.8125rem', letterSpacing: '0.02em',
                                        color: isActive ? '#E8E3DA' : 'rgba(255,255,255,0.4)',
                                        fontWeight: isActive ? 500 : 400,
                                        flex: 1,
                                    }}>
                                        {section.label}
                                    </span>
                                    {isActive && <ChevronRight size={14} color="#C9A84C" />}
                                </button>
                            );
                        })}
                    </div>

                    {/* Right: active section editor */}
                    {activeSchemaSection && (
                        <div style={{ background: '#131312', padding: '2rem 2.5rem', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                            {/* Section heading */}
                            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                    <div style={{
                                        width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)',
                                    }}>
                                        <activeSchemaSection.icon size={15} color="#C9A84C" />
                                    </div>
                                    <h2 style={{
                                        fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem', fontWeight: 400,
                                        color: '#E8E3DA', margin: 0, letterSpacing: '-0.01em',
                                    }}>
                                        {activeSchemaSection.label}
                                    </h2>
                                </div>
                                <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.3)', margin: 0, lineHeight: 1.6 }}>
                                    {activeSchemaSection.description}
                                </p>
                            </div>

                            {/* Fields */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', flex: 1 }}>
                                {/* Group stat fields into pairs for experience_stats */}
                                {activeSchemaSection.key === "experience_stats" ? (
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem 2rem' }}>
                                        {[1, 2, 3, 4].map(n => (
                                            <div key={n} style={{
                                                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                                                padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.875rem',
                                            }}>
                                                <span style={{
                                                    fontSize: '0.5625rem', letterSpacing: '0.2em', textTransform: 'uppercase',
                                                    color: '#C9A84C', fontWeight: 600,
                                                }}>
                                                    Stat {n}
                                                </span>
                                                {(['num', 'suffix', 'label'] as const).map(part => {
                                                    const fieldName = `stat${n}_${part}` as string;
                                                    const field = activeSchemaSection.fields.find(f => f.name === fieldName)!;
                                                    const val = (content[activeSchemaSection.key]?.[fieldName]) ?? field.default;
                                                    return (
                                                        <div key={part}>
                                                            <label className={styles.label}>{field.label.split(' · ')[1]}</label>
                                                            <input
                                                                type="text"
                                                                className={styles.input}
                                                                value={val}
                                                                onChange={e => handleChange(activeSchemaSection.key, fieldName, e.target.value)}
                                                            />
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    activeSchemaSection.fields.map(field => {
                                        const val = (content[activeSchemaSection.key]?.[field.name]) ?? field.default;
                                        return (
                                            <div key={field.name} className={styles.formGroup}>
                                                <label className={styles.label}>{field.label}</label>
                                                {field.type === "textarea" ? (
                                                    <textarea
                                                        className={styles.input}
                                                        value={val}
                                                        onChange={e => handleChange(activeSchemaSection.key, field.name, e.target.value)}
                                                        rows={4}
                                                        style={{ resize: 'vertical', lineHeight: 1.7 }}
                                                    />
                                                ) : (
                                                    <input
                                                        type={field.type}
                                                        className={styles.input}
                                                        value={val}
                                                        onChange={e => handleChange(activeSchemaSection.key, field.name, e.target.value)}
                                                    />
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {/* Save row */}
                            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem' }}>
                                <button
                                    className={styles.addButton}
                                    onClick={() => handleSave(activeSchemaSection.key)}
                                    disabled={savingKey === activeSchemaSection.key}
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '140px', justifyContent: 'center' }}
                                >
                                    {savingKey === activeSchemaSection.key
                                        ? <><Loader2 size={14} className={styles.spinner} /> Saving…</>
                                        : <><Save size={14} /> Save Changes</>
                                    }
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ── Contact Info Tab ── */}
            {activeTab === "contact" && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    {/* Basic Info */}
                    <div style={{ background: '#131312', padding: '2rem 2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.375rem' }}>
                                <div style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)' }}>
                                    <Phone size={15} color="#C9A84C" />
                                </div>
                                <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem', fontWeight: 400, color: '#E8E3DA', margin: 0 }}>
                                    Contact Details
                                </h2>
                            </div>
                            <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.3)', margin: 0 }}>Phone, email, WhatsApp, and address.</p>
                        </div>

                        {contactFields.filter(f => f.group === 'Basic').map(field => (
                            <div key={field.key} className={styles.formGroup}>
                                <label className={styles.label}>{field.label}</label>
                                <input
                                    type={field.type}
                                    className={styles.input}
                                    value={contactData[field.key as keyof typeof contactData]}
                                    placeholder={field.placeholder}
                                    onChange={e => setContactData(prev => ({ ...prev, [field.key]: e.target.value }))}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Social Links */}
                    <div style={{ background: '#111110', padding: '2rem 2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1.25rem' }}>
                            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem', fontWeight: 400, color: '#E8E3DA', margin: '0 0 0.375rem', letterSpacing: '-0.01em' }}>
                                Social Media
                            </h2>
                            <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.3)', margin: 0 }}>Links shown in footer and contact section.</p>
                        </div>

                        {contactFields.filter(f => f.group === 'Social').map(field => (
                            <div key={field.key} className={styles.formGroup}>
                                <label className={styles.label}>{field.label}</label>
                                <input
                                    type={field.type}
                                    className={styles.input}
                                    value={contactData[field.key as keyof typeof contactData]}
                                    placeholder={field.placeholder}
                                    onChange={e => setContactData(prev => ({ ...prev, [field.key]: e.target.value }))}
                                />
                            </div>
                        ))}

                        {/* Save */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem', marginTop: 'auto' }}>
                            <button
                                className={styles.addButton}
                                onClick={handleContactSave}
                                disabled={savingContact}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '160px', justifyContent: 'center' }}
                            >
                                {savingContact
                                    ? <><Loader2 size={14} className={styles.spinner} /> Saving…</>
                                    : <><Save size={14} /> Save Contact Info</>
                                }
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
