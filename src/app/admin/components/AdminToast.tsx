"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";
import styles from "../admin.module.css";

export type ToastType = "success" | "error";

interface Toast {
    id: number;
    message: string;
    type: ToastType;
}

let toastId = 0;

// Global toast trigger — can be imported and called from any admin page
let globalAddToast: ((message: string, type: ToastType) => void) | null = null;

export function showToast(message: string, type: ToastType = "success") {
    globalAddToast?.(message, type);
}

export default function AdminToast() {
    const [toasts, setToasts] = useState<Toast[]>([]);

    useEffect(() => {
        globalAddToast = (message: string, type: ToastType) => {
            const id = ++toastId;
            setToasts(prev => [...prev, { id, message, type }]);
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== id));
            }, 4000);
        };
        return () => { globalAddToast = null; };
    }, []);

    const dismiss = (id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    if (toasts.length === 0) return null;

    return (
        <div className={styles.toastContainer}>
            {toasts.map(toast => (
                <div
                    key={toast.id}
                    className={`${styles.toast} ${toast.type === "success" ? styles.toastSuccess : styles.toastError}`}
                >
                    {toast.type === "success" ? (
                        <CheckCircle2 size={18} className={styles.toastIcon} />
                    ) : (
                        <AlertCircle size={18} className={styles.toastIcon} />
                    )}
                    <span className={styles.toastMessage}>{toast.message}</span>
                    <button onClick={() => dismiss(toast.id)} className={styles.toastDismiss}>
                        <X size={14} />
                    </button>
                </div>
            ))}
        </div>
    );
}
