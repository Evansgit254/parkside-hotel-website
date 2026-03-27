"use client";

import { useState, useEffect } from "react";
import { X, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./UtilityPopup.module.css";
import { usePathname } from "next/navigation";
import { getSiteContent } from "../actions";

export default function UtilityPopup() {
    const [isVisible, setIsVisible] = useState(false);
    const [config, setConfig] = useState({
        enabled: true,
        title: "Resort Information",
        text: "Swimming Pool • VIP Lounge\nConference Rooms • Free Wi-Fi",
        phone: "+254 701 023 026"
    });
    const pathname = usePathname();

    useEffect(() => {
        const fetchConfig = async () => {
            const data = await getSiteContent('utility-popup');
            if (data && typeof data === 'object' && !Array.isArray(data)) {
                setConfig(prev => ({ ...prev, ...data as Record<string, any> }));
            }
        };
        fetchConfig();
    }, []);

    useEffect(() => {
        if (!config.enabled) return;

        // Show popup after a short delay on first visit per session
        const hasSeenPopup = sessionStorage.getItem("hasSeenUtilityPopup");
        if (!hasSeenPopup && !pathname.startsWith("/admin")) {
            const timer = setTimeout(() => {
                setIsVisible(true);
                sessionStorage.setItem("hasSeenUtilityPopup", "true");
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [pathname, config.enabled]);

    if (!isVisible || pathname.startsWith("/admin") || !config.enabled) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.9 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className={styles.popupWrapper}
            >
                <div className={styles.popupHeader}>
                    <div className={styles.popupTitle}>
                        <Info size={16} />
                        <span>{config.title}</span>
                    </div>
                    <button
                        onClick={() => setIsVisible(false)}
                        className={styles.closeButton}
                        aria-label="Close popup"
                    >
                        <X size={16} />
                    </button>
                </div>
                <div className={styles.popupBody}>
                    <p className={styles.amenities}>
                        {config.text}
                    </p>
                    <div className={styles.contactInfo}>
                        <span>For reservations & inquiries:</span>
                        <strong>{config.phone}</strong>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
