"use client";

import { useState, useEffect } from "react";
import { X, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./UtilityPopup.module.css";

export default function UtilityPopup() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Show popup after a short delay on first visit per session
        const hasSeenPopup = sessionStorage.getItem("hasSeenUtilityPopup");
        if (!hasSeenPopup) {
            const timer = setTimeout(() => {
                setIsVisible(true);
                sessionStorage.setItem("hasSeenUtilityPopup", "true");
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, []);

    if (!isVisible) return null;

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
                        <span>Resort Information</span>
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
                        Swimming Pool • VIP Lounge<br />Conference Rooms • Free Wi-Fi
                    </p>
                    <div className={styles.contactInfo}>
                        <span>For reservations & inquiries:</span>
                        <strong>+254 701 023026</strong>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
