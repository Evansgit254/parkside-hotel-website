import React from 'react';
import { Server, Activity, Cpu, HardDrive, ShieldCheck, Clock } from 'lucide-react';
import styles from '../admin/admin.module.css';

export const dynamic = 'force-dynamic';

export default async function DiagnosticsPage() {
    const nodeVersion = process.version;
    const platform = process.platform;
    const arch = process.arch;
    const memoryUsage = process.memoryUsage();
    const uptime = process.uptime();

    const formatUptime = (seconds: number) => {
        const days = Math.floor(seconds / (3600 * 24));
        const hours = Math.floor((seconds % (3600 * 24)) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${days}d ${hours}h ${minutes}m`;
    };

    const formatBytes = (bytes: number) => {
        return (bytes / 1024 / 1024).toFixed(2) + ' MB';
    };

    const envVars = [
        { name: 'DATABASE_URL', exists: !!process.env.DATABASE_URL },
        { name: 'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME', exists: !!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME },
        { name: 'ADMIN_EMAIL', exists: !!process.env.ADMIN_EMAIL },
        { name: 'NODE_ENV', exists: !!process.env.NODE_ENV, value: process.env.NODE_ENV },
    ];

    return (
        <div className={styles.adminContainer} style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <header style={{ marginBottom: '3rem' }}>
                <span style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.75rem',
                    color: 'var(--primary)',
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase'
                }}>
                    System Monitoring
                </span>
                <h1 style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '3rem',
                    marginTop: '0.5rem',
                    color: 'var(--primary)'
                }}>
                    Diagnostics
                </h1>
                <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                    Units metrics and health.
                    Comprehensive overview of system health and environment metrics.
                </p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                {/* Environment Info */}
                <section style={{
                    background: 'var(--white)',
                    padding: '2rem',
                    borderRadius: '12px',
                    border: '1px solid var(--border)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                        <Server size={24} color="var(--primary)" />
                        <h2 style={{ fontSize: '1.5rem', color: 'var(--primary)' }}>Environment</h2>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Node Version</span>
                            <code style={{ color: 'var(--primary)' }}>{nodeVersion}</code>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Platform</span>
                            <span style={{ textTransform: 'capitalize' }}>{platform} ({arch})</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Uptime</span>
                            <span>{formatUptime(uptime)}</span>
                        </div>
                    </div>
                </section>

                {/* Resource Usage */}
                <section style={{
                    background: 'var(--white)',
                    padding: '2rem',
                    borderRadius: '12px',
                    border: '1px solid var(--border)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                        <Activity size={24} color="var(--primary)" />
                        <h2 style={{ fontSize: '1.5rem', color: 'var(--primary)' }}>Resources</h2>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)' }}>RSS</span>
                            <span>{formatBytes(memoryUsage.rss)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Heap Total</span>
                            <span>{formatBytes(memoryUsage.heapTotal)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Heap Used</span>
                            <span style={{ color: memoryUsage.heapUsed > 200 * 1024 * 1024 ? '#ff6b6b' : 'inherit' }}>
                                {formatBytes(memoryUsage.heapUsed)}
                            </span>
                        </div>
                    </div>
                </section>

                {/* Configuration Check */}
                <section style={{
                    background: 'var(--white)',
                    padding: '2rem',
                    borderRadius: '12px',
                    border: '1px solid var(--border)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                        <ShieldCheck size={24} color="var(--primary)" />
                        <h2 style={{ fontSize: '1.5rem', color: 'var(--primary)' }}>Variables</h2>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {envVars.map((env) => (
                            <div key={env.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{env.name}</span>
                                <span style={{
                                    padding: '2px 8px',
                                    borderRadius: '4px',
                                    fontSize: '0.75rem',
                                    background: env.exists ? 'rgba(56, 176, 0, 0.1)' : 'rgba(255, 71, 87, 0.1)',
                                    color: env.exists ? '#84cc16' : '#ff4757',
                                    border: `1px solid ${env.exists ? '#84cc1644' : '#ff475744'}`
                                }}>
                                    {env.exists ? (env.value || 'Set') : 'Missing'}
                                </span>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            <footer style={{ marginTop: '4rem', padding: '2rem 0', borderTop: '1px solid var(--border-dark)', display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '2rem' }}>
                    <a href="/admin" style={{ color: 'var(--primary)', fontSize: '0.875rem' }}>Dashboard</a>
                    <a href="/diag-db" style={{ color: 'var(--primary)', fontSize: '0.875rem' }}>DB Health</a>
                </div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    Parkside Villa Diagnostic Tool v1.0
                </span>
            </footer>
        </div>
    );
}
