"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import styles from "../admin.module.css";
import { getSiteData, updateSiteContent, updateContactInfo, uploadImage, getCloudinarySignature } from "../../actions";
import { useRouter, useSearchParams } from "next/navigation";
import { showToast } from "../components/AdminToast";
import {
    Save, Loader2, LayoutTemplate, Phone, BarChart2,
    Star, ChevronRight, CheckCircle2, AlertCircle, Upload, Cloud,
    Image as ImageIcon, AlertTriangle, X, Utensils
} from "lucide-react";
import MediaUpload from "../components/MediaUpload";

// ─── Schema ────────────────────────────────────────────────────────────────────
const contentSchema = [
    {
        key: "landing_hero",
        label: "Landing Page Hero Sliders",
        description: "Manage up to 4 sliding images for the main landing page hero section.",
        icon: Star,
        fields: [
            { name: "image", label: "Hero Background Images", type: "image-list", default: "https://res.cloudinary.com/dizwm3mic/image/upload/v1772446784/parkside-villa-media/Front_Image_Or_Background_Image/_MG_0700_msl6ip.jpg" },
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
    },
    {
        key: "brand_quote",
        label: "Brand Quote",
        description: "The centered quote shown on the homepage divider.",
        icon: LayoutTemplate,
        fields: [
            { name: "text", label: "Quote Text", type: "textarea", default: "Luxury is the ease of supreme quality — in every detail, in every moment, in every interaction." },
            { name: "author", label: "Author / Philosophy", type: "text", default: "— The Parkside Villa Philosophy" }
        ]
    },
    {
        key: "testimonials_intro",
        label: "Testimonials Intro",
        description: "Heading and subtitle for the guest reviews section.",
        icon: Star,
        fields: [
            { name: "title", label: "Section Title", type: "text", default: "What Our Guests Say" },
            { name: "subtitle", label: "Section Subtitle", type: "textarea", default: "Real experiences from guests who have discovered the Parkside Villa difference." }
        ]
    },
    {
        key: "gallery_intro",
        label: "Gallery Page Intro",
        description: "Heading and subtitle for the main Gallery page.",
        icon: Star,
        fields: [
            { name: "badge", label: "Page Badge", type: "text", default: "Visual Experience" },
            { name: "title", label: "Page Title", type: "text", default: "Visual Gallery" },
            { name: "subtitle", label: "Page Subtitle", type: "textarea", default: "A visual journey through the estate, capturing moments of luxury and tranquility." }
        ]
    },
    {
        key: "blog_intro",
        label: "Blog Page Intro",
        description: "Heading and subtitle for the Editorial / Blog page.",
        icon: Star,
        fields: [
            { name: "badge", label: "Page Badge", type: "text", default: "Our Journal" },
            { name: "title", label: "Page Title", type: "text", default: "Editorial" },
            { name: "subtitle", label: "Page Subtitle", type: "textarea", default: "Stories, insights, and updates from the heart of Parkside Villa." }
        ]
    },
    {
        key: "rooms_hero",
        label: "Rooms Hero Images",
        description: "Manage sliding background images for the Rooms page hero banner.",
        icon: LayoutTemplate,
        fields: [
            { name: "image", label: "Hero Images (Add multiple)", type: "image-list", default: "https://res.cloudinary.com/dizwm3mic/image/upload/v1772446787/parkside-villa-media/Front_Image_Or_Background_Image/_MG_0698_zmv8bg.jpg" }
        ]
    },
    {
        key: "conference_hero",
        label: "Conference Hero Images",
        description: "Manage sliding background images for the Conference page hero banner.",
        icon: LayoutTemplate,
        fields: [
            { name: "image", label: "Hero Images (Add multiple)", type: "image-list", default: "https://res.cloudinary.com/dizwm3mic/image/upload/v1772373676/parkside-villa-media/EXTRA_PHOTOS/IMG_8551_mbm7db.jpg" }
        ]
    },
    {
        key: "facilities_hero",
        label: "Facilities Hero Images",
        description: "Manage sliding background images for the Facilities page hero banner.",
        icon: LayoutTemplate,
        fields: [
            { name: "image", label: "Hero Images (Add multiple)", type: "image-list", default: "https://res.cloudinary.com/dizwm3mic/image/upload/f_auto,q_auto/v1772446800/parkside-villa-media/Front_Image_Or_Background_Image/_MG_0701_pzkfbr.jpg" }
        ]
    },
    {
        key: "dining_hero",
        label: "Dining Hero Images",
        description: "Manage sliding background images for the Dining page hero banner.",
        icon: LayoutTemplate,
        fields: [
            { name: "image", label: "Hero Images (Add multiple)", type: "image-list", default: "https://res.cloudinary.com/dizwm3mic/image/upload/v1772446807/parkside-villa-media/Front_Image_Or_Background_Image/_MG_0703_qptc5r.jpg" }
        ]
    },
    {
        key: "dining_vip_lounge",
        label: "VIP Lounge",
        description: "Configure the luxury VIP lounge section of our dining experience.",
        icon: Utensils,
        fields: [
            { name: "title", label: "Category Title", type: "text", default: "VIP Lounge" },
            { name: "desc", label: "Description", type: "textarea", default: "An exclusive sanctuary for refined tastes and private conversations." },
            { name: "image", label: "Gallery Images", type: "image-list", default: "https://res.cloudinary.com/dizwm3mic/image/upload/v1772373676/parkside-villa-media/EXTRA_PHOTOS/IMG_8551_mbm7db.jpg" }
        ]
    },
    {
        key: "dining_open_bar",
        label: "Open Bar & Counter",
        description: "Configure the vibrant open bar and service counter area.",
        icon: Utensils,
        fields: [
            { name: "title", label: "Category Title", type: "text", default: "Open Bar & Counter" },
            { name: "desc", label: "Description", type: "textarea", default: "A lively spot for socializing over masterfully crafted cocktails and refreshments." },
            { name: "image", label: "Gallery Images", type: "image-list", default: "https://res.cloudinary.com/dizwm3mic/image/upload/v1772373676/parkside-villa-media/EXTRA_PHOTOS/IMG_8551_mbm7db.jpg" }
        ]
    },
    {
        key: "dining_coffee_garden",
        label: "Coffee Garden Suites",
        description: "Configure the serene coffee garden suites among our lush greenery.",
        icon: Utensils,
        fields: [
            { name: "title", label: "Category Title", type: "text", default: "Coffee Garden Suites" },
            { name: "desc", label: "Description", type: "textarea", default: "Enjoy your morning brew or evening tea in our tranquil, garden-surrounded suites." },
            { name: "image", label: "Gallery Images", type: "image-list", default: "https://res.cloudinary.com/dizwm3mic/image/upload/v1772373676/parkside-villa-media/EXTRA_PHOTOS/IMG_8551_mbm7db.jpg" }
        ]
    },
    {
        key: "dining_ground_restaurant",
        label: "Ground Restaurant",
        description: "Configure our main ground-floor restaurant experience.",
        icon: Utensils,
        fields: [
            { name: "title", label: "Category Title", type: "text", default: "Ground Restaurant" },
            { name: "desc", label: "Description", type: "textarea", default: "Our signature dining space offering the finest local and international cuisines." },
            { name: "image", label: "Gallery Images", type: "image-list", default: "https://res.cloudinary.com/dizwm3mic/image/upload/v1772373676/parkside-villa-media/EXTRA_PHOTOS/IMG_8551_mbm7db.jpg" }
        ]
    },
    {
        key: "dining_breakfast_restaurant",
        label: "Breakfast Restaurant",
        description: "Configure the dedicated space for our gourmet breakfast service.",
        icon: Utensils,
        fields: [
            { name: "title", label: "Category Title", type: "text", default: "Breakfast Restaurant" },
            { name: "desc", label: "Description", type: "textarea", default: "Start your day with a celebration of fresh flavors in our sunlit breakfast hall." },
            { name: "image", label: "Gallery Images", type: "image-list", default: "https://res.cloudinary.com/dizwm3mic/image/upload/v1772373676/parkside-villa-media/EXTRA_PHOTOS/IMG_8551_mbm7db.jpg" }
        ]
    },
    {
        key: "dining_menu_info",
        label: "Menu Overview",
        description: "Control titles and copy for the full menu section.",
        icon: Utensils,
        fields: [
            { name: "title", label: "Category Title", type: "text", default: "Our Menu" },
            { name: "desc", label: "Description", type: "textarea", default: "An extensive curated selection of gourmet appetizers, main courses, and artisanal desserts." },
            { name: "image", label: "Menu Gallery Images", type: "image-list", default: "https://res.cloudinary.com/dizwm3mic/image/upload/v1772373676/parkside-villa-media/EXTRA_PHOTOS/IMG_8551_mbm7db.jpg" }
        ]
    },
    {
        key: "blog_hero",
        label: "Blog Hero Images",
        description: "Manage sliding background images for the Blog page hero banner.",
        icon: LayoutTemplate,
        fields: [
            { name: "image", label: "Hero Images (Add multiple)", type: "image-list", default: "https://res.cloudinary.com/dizwm3mic/image/upload/v1772440903/parkside-villa-media/Front_Image_Or_Background_Image/IMG-20251119-WA0061_fvrbbk.jpg" }
        ]
    },
    {
        key: "recent_rooms",
        label: "Recently Viewed",
        description: "Copy for the section showing recently visited rooms.",
        icon: Star,
        fields: [
            { name: "badge", label: "Section Badge", type: "text", default: "Your Interests" },
            { name: "title", label: "Section Title", type: "text", default: "Continue Exploring" }
        ]
    },
    {
        key: "contact_section",
        label: "Contact Section",
        description: "Heading and contact details for the landing page form.",
        icon: Star,
        fields: [
            { name: "badge", label: "Section Badge", type: "text", default: "Get In Touch" },
            { name: "title", label: "Section Title", type: "text", default: "Begin Your Journey" },
            { name: "hours", label: "Opening Hours", type: "text", default: "Reception 24/7 · Dining 24/7" },
            { name: "form_placeholder", label: "Form Placeholder", type: "text", default: "How can we assist you?" }
        ]
    },
    {
        key: "footer_titles",
        label: "Footer Columns",
        description: "Titles for the columns in the website footer.",
        icon: LayoutTemplate,
        fields: [
            { name: "col1", label: "Column 1 Title", type: "text", default: "Quick Links" },
            { name: "col2", label: "Column 2 Title", type: "text", default: "Our Pillars" },
            { name: "col3", label: "Column 3 Title", type: "text", default: "Visit Us" }
        ]
    },
    {
        key: "footer_links",
        label: "Footer Links (Quick Links)",
        description: "Links shown under the first footer column.",
        icon: LayoutTemplate,
        fields: [
            { name: "link1_label", label: "Link 1 Label", type: "text", default: "Accommodation" },
            { name: "link1_url", label: "Link 1 URL", type: "text", default: "/#accommodation" },
            { name: "link2_label", label: "Link 2 Label", type: "text", default: "Conference" },
            { name: "link2_url", label: "Link 2 URL", type: "text", default: "/#conference" },
            { name: "link3_label", label: "Link 3 Label", type: "text", default: "Facilities" },
            { name: "link3_url", label: "Link 3 URL", type: "text", default: "/facilities" },
            { name: "link4_label", label: "Link 4 Label", type: "text", default: "Dining" },
            { name: "link4_url", label: "Link 4 URL", type: "text", default: "/dining" },
            { name: "link5_label", label: "Link 5 Label", type: "text", default: "Gallery" },
            { name: "link5_url", label: "Link 5 URL", type: "text", default: "/gallery" },
            { name: "link6_label", label: "Link 6 Label", type: "text", default: "Blog" },
            { name: "link6_url", label: "Link 6 URL", type: "text", default: "/blog" },
            { name: "link7_label", label: "Link 7 Label", type: "text", default: "Contact Us" },
            { name: "link7_url", label: "Link 7 URL", type: "text", default: "/#contact" }
        ]
    },
    {
        key: "footer_pillars",
        label: "Footer Links (Our Pillars)",
        description: "Links shown under the second footer column.",
        icon: LayoutTemplate,
        fields: [
            { name: "link1_label", label: "Link 1 Label", type: "text", default: "Luxury Rooms" },
            { name: "link1_url", label: "Link 1 URL", type: "text", default: "/#accommodation" },
            { name: "link2_label", label: "Link 2 Label", type: "text", default: "Event Space" },
            { name: "link2_url", label: "Link 2 URL", type: "text", default: "/#conference" },
            { name: "link3_label", label: "Link 3 Label", type: "text", default: "Gourmet Food" },
            { name: "link3_url", label: "Link 3 URL", type: "text", default: "/dining" },
            { name: "link4_label", label: "Link 4 Label", type: "text", default: "Garden Oasis" },
            { name: "link4_url", label: "Link 4 URL", type: "text", default: "/#accommodation" }
        ]
    },
    {
        key: "dining_menu",
        label: "Dining Menu Section",
        description: "Titles for the full menu section on the Dining page.",
        icon: Star,
        fields: [
            { name: "eyebrow", label: "Section Eyebrow", type: "text", default: "Explore Our Flavors" },
            { name: "title", label: "Section Title", type: "text", default: "Exquisite Flavor Selections" }
        ]
    },
    {
        key: "concierge_messages",
        label: "Concierge Bot",
        description: "The responses provided by the virtual concierge assistant.",
        icon: Star,
        fields: [
            { name: "welcome", label: "Step 0: Welcome Message", type: "textarea", default: "Welcome to Parkside Villa. I'm your personal digital concierge. How may I assist you today?" },
            { name: "rooms", label: "Step 1: Accommodation Message", type: "textarea", default: "Our rooms range from the Deluxe Garden Room to the Presidential Executive Suite. Each is a sanctuary of comfort." },
            { name: "dining", label: "Step 2: Dining Message", type: "textarea", default: "Our kitchen is led by experienced chefs offering both local Kenyan cuisine and international favorites. Available 24/7." }
        ]
    },
    {
        key: "seo_metadata",
        label: "SEO Metadata",
        description: "Global search engine optimization settings for the entire website.",
        icon: Star,
        fields: [
            { name: "title", label: "Site Title", type: "text", default: "Parkside Villa Kitui | Best Hotel & Conference in Kitui" },
            { name: "description", label: "Site Description", type: "textarea", default: "Experience world-class hospitality at Parkside Villa Kitui. Luxury rooms, fine dining, and premier conference facilities designed for comfort and productivity in Kitui, Kenya." },
            { name: "keywords", label: "Keywords (comma separated)", type: "textarea", default: "Kitui hotel, Parkside Villa Kitui, accommodation in Kitui, conference facilities Kitui, best hotel Kitui, luxury hotel Kitui, Kenya, places to stay in Kitui" }
        ]
    },
    {
        key: "nav_main",
        label: "Main Navigation Labels",
        description: "The primary labels shown in the top navigation bar.",
        icon: LayoutTemplate,
        fields: [
            { name: "home", label: "Home Label", type: "text", default: "Home" },
            { name: "rooms", label: "Accommodation Label", type: "text", default: "Accommodation" },
            { name: "conference", label: "Conference Label", type: "text", default: "Conference" },
            { name: "facilities", label: "Facilities Label", type: "text", default: "Facilities" },
            { name: "gallery", label: "Gallery Label", type: "text", default: "Gallery" },
            { name: "blog", label: "Blog Label", type: "text", default: "Blog" },
            { name: "dining", label: "Dining Label", type: "text", default: "Dining" },
            { name: "contact", label: "Contact Label", type: "text", default: "Contact" },
        ]
    },
    {
        key: "nav_accommodation",
        label: "Accommodation Dropdown",
        description: "Manage the room types listed in the navigation menu.",
        icon: Star,
        fields: [
            { name: "item1", label: "Item 1: Executive", type: "text", default: "Executive suites" },
            { name: "item2", label: "Item 2: Deluxe", type: "text", default: "Deluxe suites" },
            { name: "item3", label: "Item 3: Highrise", type: "text", default: "Highrise suites" },
            { name: "item4", label: "Item 4: Cottages", type: "text", default: "Cottages" },
            { name: "item5", label: "Item 5: Premium", type: "text", default: "Standard premium" },
            { name: "item6", label: "Item 6: View All", type: "text", default: "All Accommodations" },
        ]
    }
];

const TABS = [
    { id: "hero-images", label: "Hero Images", keys: ["landing_hero", "rooms_hero", "conference_hero", "facilities_hero", "dining_hero", "blog_hero"] },
    { id: "navigation", label: "Navigation", keys: ["nav_main", "nav_accommodation"] },
    { id: "page-intros", label: "Page Intros", keys: ["rooms_intro", "dining_intro", "facilities_intro", "gallery_intro", "blog_intro", "recent_rooms", "brand_quote", "testimonials_intro", "dining_menu"] },
    { id: "footer", label: "Footer", keys: ["footer_about", "footer_titles", "footer_links", "footer_pillars"] },
    { id: "dining-page", label: "Dining Page", keys: ["dining_vip_lounge", "dining_open_bar", "dining_coffee_garden", "dining_ground_restaurant", "dining_breakfast_restaurant", "dining_menu_info"] },
    { id: "stats", label: "Statistics", keys: ["experience_stats"] },
    { id: "concierge", label: "Concierge", keys: ["concierge_messages"] },
    { id: "seo", label: "SEO", keys: ["seo_metadata"] },
    { id: "contact", label: "Contact Info", keys: [] },
];

const defaultContact = {
    phone: "+254 701 023 026",
    email: "info@parksidevillakitui.com",
    whatsapp: "254701023026",
    address: "Parkside Villa, Kitui - Kenya",
    facebook: "https://facebook.com/parksidevillakitui",
    instagram: "https://instagram.com/parksidevillakitui",
    linkedin: "https://linkedin.com/company/parksidevillakitui",
};

const contactFields = [
    { key: "phone", label: "Phone Number", type: "tel", placeholder: "+254 701 023 026", group: "Basic" },
    { key: "email", label: "Email Address", type: "email", placeholder: "info@parksidevillakitui.com", group: "Basic" },
    { key: "whatsapp", label: "WhatsApp (international, no +)", type: "text", placeholder: "254701023026", group: "Basic" },
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
    const [activeTab, setActiveTab] = useState("hero-images");
    const [activeSection, setActiveSection] = useState("landing_hero");
    const [savingKey, setSavingKey] = useState<string | null>(null);
    const [savingContact, setSavingContact] = useState(false);
    const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
    const searchParams = useSearchParams();
    const tabParam = searchParams.get("tab");

    useEffect(() => { loadData(); }, []);

    // Sync activeTab with URL param if it exists
    useEffect(() => {
        if (tabParam && TABS.find(t => t.id === tabParam)) {
            setActiveTab(tabParam);
            // Also set activeSection to first key of that tab if current section isn't in that tab
            const tab = TABS.find(t => t.id === tabParam);
            if (tab && tab.keys[0]) {
                setActiveSection(tab.keys[0]);
            }
        }
    }, [tabParam]);

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

    const handleChange = (schemaKey: string, fieldName: string, value: string | string[]) => {
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
            <p style={{ marginTop: '1rem', color: '#6B7280', fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
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
                borderBottom: '1px solid rgba(0,0,0,0.07)',
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
                            color: activeTab === tab.id ? '#144B36' : '#6B7280',
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
                <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '1px', background: '#F7F8FC', border: '1px solid rgba(0,0,0,0.07)', minHeight: '500px' }}>

                    {/* Left: section list */}
                    <div style={{ background: '#F7F8FC', padding: '0.5rem 0', borderRight: '1px solid rgba(0,0,0,0.07)' }}>
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
                                        borderLeft: isActive ? '3px solid #144B36' : '3px solid transparent',
                                        background: isActive ? 'rgba(20,75,54,0.06)' : 'transparent',
                                        transition: 'all 0.2s ease',
                                    }}
                                >
                                    <Icon size={15} color={isActive ? '#144B36' : '#6B7280'} style={{ flexShrink: 0 }} />
                                    <span style={{
                                        fontSize: '0.8125rem', letterSpacing: '0.02em',
                                        color: isActive ? '#111827' : '#6B7280',
                                        fontWeight: isActive ? 500 : 400,
                                        flex: 1,
                                    }}>
                                        {section.label}
                                    </span>
                                    {isActive && <ChevronRight size={14} color="#144B36" />}
                                </button>
                            );
                        })}
                    </div>

                    {/* Right: active section editor */}
                    {activeSchemaSection && (
                        <div style={{ background: '#FFFFFF', padding: '2rem 2.5rem', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                            {/* Section heading */}
                            <div style={{ borderBottom: '1px solid rgba(0,0,0,0.07)', paddingBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                    <div style={{
                                        width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        background: 'rgba(20,75,54,0.08)', border: '1px solid rgba(20,75,54,0.15)', borderRadius: '8px',
                                    }}>
                                        <activeSchemaSection.icon size={15} color="#144B36" />
                                    </div>
                                    <h2 style={{
                                        fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem', fontWeight: 700,
                                        color: '#111827', margin: 0, letterSpacing: '-0.01em',
                                    }}>
                                        {activeSchemaSection.label}
                                    </h2>
                                </div>
                                <p style={{ fontSize: '0.8125rem', color: '#6B7280', margin: 0, lineHeight: 1.6 }}>
                                    {activeSchemaSection.description}
                                </p>
                            </div>

                            {/* Fields */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', flex: 1 }}>
                                {/* Group stat fields into pairs for experience_stats */}
                                {activeSchemaSection.key === "experience_stats" ? (
                                    <div className={styles.formRow} style={{ gap: '1.5rem 2rem' }}>
                                        {[1, 2, 3, 4].map(n => (
                                            <div key={n} style={{
                                                background: '#F7F8FC', border: '1px solid rgba(0,0,0,0.07)',
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
                                        const isImage = field.name.toLocaleLowerCase().includes("image") || field.label.toLocaleLowerCase().includes("image");

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
                                                ) : field.type === "image-list" ? (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                        {Array.isArray(val) && val.length > 0 && (
                                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '1rem', marginBottom: '0.5rem' }}>
                                                                {val.map((url, idx) => (
                                                                    <div key={idx} style={{ position: 'relative', height: '80px', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.07)' }}>
                                                                        <img src={url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                const updated = val.filter((_, i) => i !== idx);
                                                                                handleChange(activeSchemaSection.key, field.name, updated);
                                                                            }}
                                                                            style={{
                                                                                position: 'absolute', top: '4px', right: '4px',
                                                                                background: 'rgba(239, 68, 68, 0.9)', border: 'none', borderRadius: '50%',
                                                                                width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                                cursor: 'pointer'
                                                                            }}
                                                                        >
                                                                            <X size={12} color="#fff" />
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                        <MediaUpload
                                                            value=""
                                                            onChange={() => { }}
                                                            onFilesChange={(urls) => {
                                                                const existing = Array.isArray(val) ? val : (val ? [val] : []);
                                                                const filtered = [...existing, ...urls].filter(Boolean);
                                                                handleChange(activeSchemaSection.key, field.name, filtered);
                                                            }}
                                                            multiple
                                                        />
                                                    </div>
                                                ) : isImage ? (
                                                    <MediaUpload
                                                        value={val}
                                                        onChange={(newVal) => handleChange(activeSchemaSection.key, field.name, newVal)}
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
                            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid rgba(0,0,0,0.07)', paddingTop: '1.5rem' }}>
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
                <div className={styles.formRow} style={{ gap: '1px', background: '#F7F8FC', border: '1px solid rgba(0,0,0,0.07)' }}>
                    {/* Basic Info */}
                    <div style={{ background: '#FFFFFF', padding: '2rem 2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ borderBottom: '1px solid rgba(0,0,0,0.07)', paddingBottom: '1.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.375rem' }}>
                                <div style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)' }}>
                                    <Phone size={15} color="#C9A84C" />
                                </div>
                                <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem', fontWeight: 700, color: '#111827', margin: 0 }}>
                                    Contact Details
                                </h2>
                            </div>
                            <p style={{ fontSize: '0.8125rem', color: '#6B7280', margin: 0 }}>Phone, email, WhatsApp, and address.</p>
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
                    <div style={{ background: '#F7F8FC', padding: '2rem 2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', borderLeft: '1px solid rgba(0,0,0,0.07)' }}>
                        <div style={{ borderBottom: '1px solid rgba(0,0,0,0.07)', paddingBottom: '1.25rem' }}>
                            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem', fontWeight: 700, color: '#111827', margin: '0 0 0.375rem', letterSpacing: '-0.01em' }}>
                                Social Media
                            </h2>
                            <p style={{ fontSize: '0.8125rem', color: '#6B7280', margin: 0 }}>Links shown in footer and contact section.</p>
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
                        <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid rgba(0,0,0,0.07)', paddingTop: '1.5rem', marginTop: 'auto' }}>
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
