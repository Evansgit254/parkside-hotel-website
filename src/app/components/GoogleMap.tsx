"use client";

import styles from "./GoogleMap.module.css";
import { motion } from "framer-motion";

export default function GoogleMap() {
    // Parkside Villa Kitui exact location embed URL
    const mapUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15951.365313936458!2d38.001!3d-1.37!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x18242967f0000001%3A0x633d9c7370707c63!2sParkside%20Villa%20Kitui!5e0!3m2!1sen!2ske!4v1700000000000!5m2!1sen!2ske";

    return (
        <section className={styles.mapSection}>
            <div className={styles.mapContainer}>
                <motion.div
                    className={styles.mapWrapper}
                    initial={{ opacity: 0, scale: 0.98 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                >
                    <iframe
                        src={mapUrl}
                        width="100%"
                        height="450"
                        style={{ border: 0 }}
                        allowFullScreen={true}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Parkside Villa Kitui Location"
                        className={styles.mapFrame}
                    />
                </motion.div>

                <div className={styles.mapInfo}>
                    <div className={styles.infoBadge}>Find Us</div>
                    <h3 className={styles.infoTitle}>Mbusyani Rd, Kitui Town</h3>
                    <p className={styles.infoDesc}>
                        Conveniently located in a serene environment, yet accessible to the heart of Kitui.
                    </p>
                </div>
            </div>
        </section>
    );
}
