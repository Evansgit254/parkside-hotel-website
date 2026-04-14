"use client";

import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, MessageCircle, PlaySquare } from "lucide-react";
import styles from "../page.module.css";
import { useState, useEffect } from "react";
import { getPublicSiteData, subscribeNewsletter } from "../actions";

const WhatsAppIcon = ({ size = 20 }: { size?: number }) => (
    <svg 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="currentColor" 
        style={{ display: 'inline-block', verticalAlign: 'middle' }}
    >
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
    </svg>
);

const TikTokIcon = ({ size = 20 }: { size?: number }) => (
    <svg 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="currentColor" 
        style={{ display: 'inline-block', verticalAlign: 'middle' }}
    >
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.89-.6-4.13-1.46-.12 3.53-.02 7.07-.02 10.6 0 1.25-.26 2.58-1 3.65-1.12 1.63-3.15 2.45-5.07 2.22-2.12-.13-4.1-1.57-4.82-3.6-.82-2.11-.23-4.71 1.48-6.18 1.14-.99 2.68-1.44 4.19-1.3l.02 4.02c-.89-.11-1.85.11-2.48.78-.65.7-.75 2.05-.05 2.77.65.71 1.83.7 2.41.02.41-.47.46-1.13.46-1.74-.01-4.77-.01-9.53-.01-14.3.01-1.14.04-2.29-.02-3.44z"/>
    </svg>
);

export default function Footer() {
    const [contactInfo, setContactInfo] = useState<any>(null);
    const [content, setContent] = useState<any>({});

    useEffect(() => {
        getPublicSiteData().then(data => {
            if (data && data.contactInfo) setContactInfo(data.contactInfo);
            if (data && data.content) setContent(data.content);
        });
    }, []);

    if (!contactInfo) return null;

    return (
        <footer className={styles.footer}>
            <div className={styles.contentContainer}>
                <div className={styles.footerGrid}>
                    <div className={styles.footerBrand} style={{ gridColumn: 'span 2' }}>
                        <div className={styles.footerLogo}>
                            <Image src="/logo_kitui_white.png" alt="Kitui Parkside Hotels" width={240} height={82} />
                        </div>
                        <p className={styles.footerDesc} style={{ maxWidth: '100%' }}>
                            {content.footer_about?.text || "Kitui's premier luxury destination. Stay updated on our exclusive offers and upcoming events by subscribing to our newsletter."}
                        </p>

                        <form className={styles.newsletterForm} onSubmit={async (e) => {
                            e.preventDefault();
                            const emailInput = (e.target as any).querySelector('input');
                            const email = emailInput.value;
                            if (!email) return;
                            emailInput.disabled = true;
                            const result = await subscribeNewsletter(email);
                            if (result.success) {
                                const msg = result.alreadyExists
                                    ? 'You are already subscribed to our newsletter!'
                                    : 'Thank you! You have successfully joined our exclusive circle.';
                                alert(msg);
                                emailInput.value = '';
                            } else {
                                alert('We encountered an error. Please check your email and try again.');
                            }
                            emailInput.disabled = false;
                        }}>
                            <input type="email" placeholder="Enter your email address" className={styles.newsletterInput} required />
                            <button type="submit" className={styles.newsletterBtn}>Subscribe</button>
                        </form>

                        <div className={styles.footerSocial}>
                            {contactInfo.social?.facebook && <a href={contactInfo.social.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook"><Facebook size={20} /></a>}
                            {contactInfo.social?.instagram && <a href={contactInfo.social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram"><Instagram size={20} /></a>}
                            {contactInfo.social?.whatsapp && <a href={contactInfo.social.whatsapp} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><WhatsAppIcon size={20} /></a>}
                            {contactInfo.social?.tiktok && <a href={contactInfo.social.tiktok} target="_blank" rel="noopener noreferrer" aria-label="TikTok"><TikTokIcon size={20} /></a>}
                        </div>
                    </div>

                    <div>
                        <h4 className={styles.footerTitle}>{content.footer_titles?.col1 || "Quick Links"}</h4>
                        <div className={styles.footerLinks}>
                            <a href={content.footer_links?.link1_url || "/#accommodation"}>{content.footer_links?.link1_label || "Accommodation"}</a>
                            <a href={content.footer_links?.link2_url || "/#conference"}>{content.footer_links?.link2_label || "Conference"}</a>
                            <Link href={content.footer_links?.link3_url || "/facilities"}>{content.footer_links?.link3_label || "Facilities"}</Link>
                            <Link href={content.footer_links?.link4_url || "/dining"}>{content.footer_links?.link4_label || "Dining"}</Link>
                            <Link href={content.footer_links?.link5_url || "/gallery"}>{content.footer_links?.link5_label || "Gallery"}</Link>
                            <Link href={content.footer_links?.link6_url || "/blog"}>{content.footer_links?.link6_label || "Blog"}</Link>
                            <a href={content.footer_links?.link7_url || "/#contact"}>{content.footer_links?.link7_label || "Contact Us"}</a>
                        </div>
                    </div>

                    <div>
                        <h4 className={styles.footerTitle}>{content.footer_titles?.col2 || "Our Pillars"}</h4>
                        <div className={styles.footerLinks}>
                            <a href={content.footer_pillars?.link1_url || "/#accommodation"}>{content.footer_pillars?.link1_label || "Luxury Rooms"}</a>
                            <a href={content.footer_pillars?.link2_url || "/#conference"}>{content.footer_pillars?.link2_label || "Event Space"}</a>
                            <Link href={content.footer_pillars?.link3_url || "/dining"}>{content.footer_pillars?.link3_label || "Gourmet Food"}</Link>
                            <a href={content.footer_pillars?.link4_url || "/#accommodation"}>{content.footer_pillars?.link4_label || "Garden Oasis"}</a>
                        </div>
                    </div>

                    <div>
                        <h4 className={styles.footerTitle}>{content.footer_titles?.col3 || "Visit Us"}</h4>
                        <div className={styles.footerLinks}>
                            <span style={{ color: '#FFFFFF', opacity: 0.9 }}>{contactInfo.address || "Parkside Villa, Kitui"}</span>
                        </div>
                    </div>
                </div>
                <div className={styles.footerBottom}>
                    <p>&copy; {new Date().getFullYear()} Parkside Villa Kitui. All Rights Reserved. | <Link href="/admin" className={styles.footerAdminLink}>Admin Login</Link></p>
                    <p className={styles.footerCredit}>
                        Website designed &amp; developed by{' '}
                        <a
                            href="https://wa.me/254703840886"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.footerCreditLink}
                            title="Chat on WhatsApp"
                        >
                            Evans Mumo
                        </a>
                        {' · '}
                        <a
                            href="mailto:evansdev86@gmail.com"
                            className={styles.footerCreditLink}
                            title="Send an Email"
                        >
                            evansdev86@gmail.com
                        </a>
                        {' · '}
                        <a
                            href="https://wa.me/254703840886"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.footerCreditLink}
                            title="WhatsApp"
                        >
                            +254 703 840 886
                        </a>
                    </p>
                </div>
            </div>
        </footer>
    );
}
