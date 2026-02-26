"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../admin.module.css";
import { motion } from "framer-motion";
import { Lock, Mail, ChevronRight, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { loginAdmin } from "../../actions";

export default function AdminLogin() {
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const res = await loginAdmin(email, password);
            if (res.success) {
                router.push("/admin");
                // The server action handles the cookie now
            } else {
                setError(res.message || "Invalid credentials");
                setIsLoading(false);
            }
        } catch (err) {
            setError("A system error occurred. Please try again later.");
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.loginWrapper}>
            <div className={styles.loginBackground}>
                <div className={styles.blob}></div>
                <div className={styles.blob2}></div>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className={styles.loginCard}
            >
                <span className={styles.loginBrand}>Parkside Villa</span>
                <span className={styles.loginRole}>Estate Management Console</span>

                <div style={{ display: 'inline-flex', padding: '0.875rem', background: 'rgba(201,168,76,0.08)', color: '#C9A84C', marginBottom: '2rem', border: '1px solid rgba(201,168,76,0.15)' }}>
                    <ShieldCheck size={28} />
                </div>
                <h1 className={styles.loginTitle}>Secure Access</h1>
                <p className={styles.loginSubtitle}>Authorized personnel only</p>


                {error && (
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={styles.error}
                    >
                        {error}
                    </motion.div>
                )}

                <form className={styles.loginForm} onSubmit={handleLogin}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>
                            <Mail size={14} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} /> Official Email
                        </label>
                        <input
                            type="email"
                            className={styles.input}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@parksidevilla.com"
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>
                            <Lock size={14} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} /> Access Password
                        </label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? "text" : "password"}
                                className={styles.input}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '1rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    color: '#9CA3AF',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '0.25rem'
                                }}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button type="submit" disabled={isLoading} className={styles.loginButton} style={{ marginTop: '1rem' }}>
                        {isLoading ? "Authenticating..." : (
                            <>
                                Enter Dashboard <ChevronRight size={18} />
                            </>
                        )}
                    </button>
                </form>

                <div style={{ marginTop: '3rem', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.75rem', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        PARKSIDE VILLA &copy; 2025
                    </p>
                </div>
            </motion.div>
        </div>
    );
}

