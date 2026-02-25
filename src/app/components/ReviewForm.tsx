"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Send, X, CheckCircle2 } from "lucide-react";
import { submitPublicReview } from "../actions";
import styles from "./review.module.css";

export default function ReviewForm({ onClose }: { onClose?: () => void }) {
    const [step, setStep] = useState(1);
    const [rating, setRating] = useState(5);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [formData, setFormData] = useState({ name: "", title: "", text: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsSubmitting(true);
        const res = await submitPublicReview({
            name: formData.name,
            title: formData.title || `${rating}/5 Stars`,
            text: formData.text,
        });
        if (res.success) {
            setStep(2);
        }
        setIsSubmitting(false);
    }

    return (
        <div className={styles.formCard}>
            {onClose && (
                <button onClick={onClose} className={styles.closeBtn}>
                    <X size={20} />
                </button>
            )}

            <AnimatePresence mode="wait">
                {step === 1 ? (
                    <motion.div
                        key="form"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        <div className={styles.formHeader}>
                            <h3 className={styles.formTitle}>Share Your Experience</h3>
                            <p className={styles.formSubtitle}>Your feedback helps us maintain our standards of excellence.</p>
                        </div>

                        <form onSubmit={handleSubmit} className={styles.form}>
                            <div className={styles.ratingGroup}>
                                <label className={styles.label}>Rate Your Stay</label>
                                <div className={styles.stars}>
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <button
                                            key={s}
                                            type="button"
                                            onMouseEnter={() => setHoveredRating(s)}
                                            onMouseLeave={() => setHoveredRating(0)}
                                            onClick={() => setRating(s)}
                                            className={styles.starBtn}
                                        >
                                            <Star
                                                size={24}
                                                fill={(hoveredRating || rating) >= s ? "#d4af37" : "transparent"}
                                                color={(hoveredRating || rating) >= s ? "#d4af37" : "rgba(255,255,255,0.2)"}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className={styles.grid}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        className={styles.input}
                                        placeholder="John Doe"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Tagline</label>
                                    <input
                                        type="text"
                                        className={styles.input}
                                        placeholder="e.g. Unforgettable Stay"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Your Review</label>
                                <textarea
                                    required
                                    className={styles.input}
                                    rows={4}
                                    placeholder="Tell us about your time at Parkside Villa..."
                                    value={formData.text}
                                    onChange={e => setFormData({ ...formData, text: e.target.value })}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={styles.submitBtn}
                            >
                                {isSubmitting ? "Submitting..." : (
                                    <>
                                        Submit Review <Send size={16} />
                                    </>
                                )}
                            </button>
                        </form>
                    </motion.div>
                ) : (
                    <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={styles.successState}
                    >
                        <div className={styles.successIcon}>
                            <CheckCircle2 size={48} />
                        </div>
                        <h3 className={styles.formTitle}>Thank You!</h3>
                        <p className={styles.formSubtitle}>Your review has been submitted for moderation. It will be live on our site shortly.</p>
                        {onClose && (
                            <button onClick={onClose} className={styles.submitBtn}>
                                Close
                            </button>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
