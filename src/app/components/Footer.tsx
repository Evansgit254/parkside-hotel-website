"use client";

import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, MessageCircle, PlaySquare } from "lucide-react";
import styles from "../page.module.css";
import { useState, useEffect } from "react";
import { getPublicSiteData, subscribeNewsletter } from "../actions";

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
                            {contactInfo.social?.whatsapp && <a href={contactInfo.social.whatsapp} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><MessageCircle size={20} /></a>}
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
                </div>
            </div>
        </footer>
    );
}
