"use client";

import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Linkedin, MessageCircle, PlaySquare } from "lucide-react";
import styles from "../page.module.css";
import { useState } from "react";
import { subscribeNewsletter } from "../actions";

interface FooterProps {
    contactInfo?: any;
    content?: any;
}

export default function Footer({ contactInfo: initialContactInfo, content: initialContent }: FooterProps) {
    const [contactInfo] = useState<any>(initialContactInfo);
    const [content] = useState<any>(initialContent || {});

    if (!contactInfo) return null;

    return (
        <footer className={styles.footer}>
            <div className={styles.contentContainer}>
                <div className={styles.footerGrid}>
                    <div className={styles.footerBrand} style={{ gridColumn: 'span 2' }}>
                        <div className={styles.footerLogo}>
                            <Image src="/logo.png" alt="Kitui Parkside Hotels" width={240} height={82} />
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
                            {contactInfo.social?.linkedin && <a href={contactInfo.social.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><Linkedin size={20} /></a>}
                            {contactInfo.social?.whatsapp && <a href={contactInfo.social.whatsapp} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><MessageCircle size={20} /></a>}
                            {contactInfo.social?.tiktok && <a href={contactInfo.social.tiktok} target="_blank" rel="noopener noreferrer" aria-label="TikTok"><PlaySquare size={20} /></a>}
                        </div>
                    </div>

                    <div>
                        <h4 className={styles.footerTitle}>{content.footer_titles?.col1 || "Quick Links"}</h4>
                        <div className={styles.footerLinks}>
                            <a href="/#accommodation">Accommodation</a>
                            <a href="/#conference">Conference</a>
                            <Link href="/facilities">Facilities</Link>
                            <Link href="/dining">Dining</Link>
                            <Link href="/gallery">Gallery</Link>
                            <Link href="/blog">Blog</Link>
                            <a href="/#contact">Contact Us</a>
                        </div>
                    </div>

                    <div>
                        <h4 className={styles.footerTitle}>{content.footer_titles?.col2 || "Our Pillars"}</h4>
                        <div className={styles.footerLinks}>
                            <a href="/#accommodation">Luxury Rooms</a>
                            <a href="/#conference">Event Space</a>
                            <Link href="/dining">Gourmet Food</Link>
                            <a href="/#accommodation">Garden Oasis</a>
                        </div>
                    </div>

                    <div>
                        <h4 className={styles.footerTitle}>{content.footer_titles?.col3 || "Visit Us"}</h4>
                        <div className={styles.footerLinks}>
                            <span style={{ color: 'var(--text-secondary)' }}>{contactInfo.address || "Parkside Villa, Kitui"}</span>
                        </div>
                    </div>
                </div>
                <div className={styles.footerBottom}>
                    <p>&copy; {new Date().getFullYear()} Parkside Villa Kitui. All Rights Reserved. | <Link href="/admin" style={{ color: 'inherit', textDecoration: 'none', opacity: 0.6 }}>Admin Login</Link></p>
                </div>
            </div>
        </footer>
    );
}
