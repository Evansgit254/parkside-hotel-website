"use client";

import Link from "next/link";
import { Facebook, Instagram, Linkedin } from "lucide-react";
import styles from "../page.module.css";
import { useState, useEffect } from "react";
import { getSiteData } from "../actions";

export default function Footer() {
    const [contactInfo, setContactInfo] = useState<any>(null);

    useEffect(() => {
        getSiteData().then(data => {
            if (data && data.contactInfo) setContactInfo(data.contactInfo);
        });
    }, []);

    if (!contactInfo) return null;

    return (
        <footer className={styles.footer}>
            <div className={styles.contentContainer}>
                <div className={styles.footerGrid}>
                    <div className={styles.footerBrand}>
                        <div className={styles.logo}>PARKSIDE VILLA</div>
                        <p className={styles.footerDesc}>
                            Kitui's premier luxury destination. Experience the perfect blend of traditional African hospitality
                            and modern world-class comfort.
                        </p>
                        <div className={styles.ctaGroup} style={{ justifyContent: 'flex-start' }}>
                            <a href={contactInfo.social.facebook} target="_blank"><Facebook size={20} /></a>
                            <a href={contactInfo.social.instagram} target="_blank"><Instagram size={20} /></a>
                            <a href={contactInfo.social.linkedin} target="_blank"><Linkedin size={20} /></a>
                        </div>
                    </div>

                    <div>
                        <h4 className={styles.footerTitle}>Quick Links</h4>
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
                        <h4 className={styles.footerTitle}>Our Pillars</h4>
                        <div className={styles.footerLinks}>
                            <a href="/#accommodation">Luxury Rooms</a>
                            <a href="/#conference">Event Space</a>
                            <Link href="/dining">Gourmet Food</Link>
                            <a href="/#accommodation">Garden Oasis</a>
                        </div>
                    </div>

                    <div>
                        <h4 className={styles.footerTitle}>Visit Us</h4>
                        <div className={styles.footerLinks}>
                            <span style={{ color: '#fff' }}>Parkside Villa, Kitui</span>
                            <span>P.O. Box 1234-90200</span>
                            <span>Kitui, Kenya</span>
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
