"use client";

import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "../admin/admin.module.css";
import { ReactNode } from "react";

interface AdminModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    onSubmit: (e: React.FormEvent) => void;
    submitLabel?: string;
    loading?: boolean;
    error?: string | null;
}

export default function AdminModal({
    isOpen,
    onClose,
    title,
    children,
    onSubmit,
    submitLabel = "Save Changes",
    loading = false,
    error = null
}: AdminModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={styles.modalOverlay}
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        onClick={e => e.stopPropagation()}
                        className={styles.modalContent}
                    >
                        <button onClick={onClose} className={styles.modalClose}>
                            <X size={20} />
                        </button>

                        <div className={styles.modalHeader}>
                            <h2 className={styles.modalTitle}>{title}</h2>
                        </div>

                        {error && (
                            <div className={styles.error} style={{ margin: '0 2rem 1rem', borderRadius: '8px' }}>
                                {error}
                            </div>
                        )}

                        <form onSubmit={onSubmit} style={{ padding: '0 2rem 2rem' }}>
                            {children}

                            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className={styles.actionBtn}
                                    style={{ padding: '0.625rem 1.25rem', width: 'auto' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={styles.saveButton}
                                >
                                    {loading ? "Processing..." : submitLabel}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
