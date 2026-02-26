import React from 'react';
import { Database, Wifi, ShieldAlert, CheckCircle2, XCircle, RefreshCcw } from 'lucide-react';
import { prisma, isDatabaseConfigured } from '../../lib/prisma';
import styles from '../admin/admin.module.css';

export const dynamic = 'force-dynamic';

export default async function DatabaseDiagnosticsPage() {
    const isConfigured = isDatabaseConfigured();
    let connectionStatus: 'online' | 'offline' | 'error' = 'offline';
    let latency: number | null = null;
    let error: string | null = null;
    let version: string | null = null;

    if (isConfigured) {
        const start = Date.now();
        try {
            // Perform a simple heartbeat query
            const result = await prisma.$queryRaw`SELECT version()`;
            latency = Date.now() - start;
            connectionStatus = 'online';
            version = (result as any)[0].version;
        } catch (e: any) {
            connectionStatus = 'error';
            error = e.message;
        }
    }

    return (
        <div className={styles.adminContainer} style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <header style={{ marginBottom: '3rem' }}>
                <span style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.75rem',
                    color: 'var(--secondary)',
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase'
                }}>
                    Storage Infrastructure
                </span>
                <h1 style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '3rem',
                    marginTop: '0.5rem',
                    color: 'var(--ivory)'
                }}>
                    Database Health
                </h1>
                <p style={{ color: 'var(--text-on-dark-soft)', marginTop: '0.5rem' }}>
                    Monitor connectivity and performance of the PostgreSQL backend.
                </p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                {/* Status Card */}
                <section style={{
                    background: 'var(--surface-mid)',
                    padding: '2rem',
                    borderRadius: '12px',
                    border: '1px solid var(--border-dark)',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        padding: '1rem',
                        opacity: 0.1
                    }}>
                        <Database size={80} color="var(--secondary)" />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', position: 'relative', zIndex: 1 }}>
                        <Wifi size={24} color="var(--secondary)" />
                        <h2 style={{ fontSize: '1.5rem', color: 'var(--ivory)' }}>Connectivity</h2>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                        {connectionStatus === 'online' ? (
                            <CheckCircle2 color="#84cc16" size={48} />
                        ) : (
                            <XCircle color="#ff4757" size={48} />
                        )}
                        <div>
                            <p style={{
                                fontSize: '1.25rem',
                                fontWeight: 600,
                                color: connectionStatus === 'online' ? '#84cc16' : '#ff4757',
                                margin: 0
                            }}>
                                {connectionStatus === 'online' ? 'System Online' : 'System Offline'}
                            </p>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>
                                {isConfigured ? 'Connection String Present' : 'Missing Configuration'}
                            </p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Latency</span>
                            <span style={{ color: latency && latency > 100 ? '#ffb142' : 'inherit' }}>
                                {latency !== null ? `${latency}ms` : 'N/A'}
                            </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Configured</span>
                            <span style={{ color: isConfigured ? '#84cc16' : '#ff4757' }}>{isConfigured ? 'Yes' : 'No'}</span>
                        </div>
                    </div>
                </section>

                {/* Details Card */}
                <section style={{
                    background: 'var(--surface-mid)',
                    padding: '2rem',
                    borderRadius: '12px',
                    border: '1px solid var(--border-dark)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                        <RefreshCcw size={24} color="var(--secondary)" />
                        <h2 style={{ fontSize: '1.5rem', color: 'var(--ivory)' }}>Specifications</h2>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Engine Version</span>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-on-dark-soft)', wordBreak: 'break-word' }}>
                                {version || 'Unknown or not connected'}
                            </p>
                        </div>
                    </div>
                </section>

                {/* Error Log (only if error) */}
                {error && (
                    <section style={{
                        gridColumn: '1 / -1',
                        background: 'rgba(255, 71, 87, 0.05)',
                        padding: '2rem',
                        borderRadius: '12px',
                        border: '1px solid rgba(255, 71, 87, 0.2)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                            <ShieldAlert size={24} color="#ff4757" />
                            <h2 style={{ fontSize: '1.5rem', color: '#ff4757' }}>Error Log</h2>
                        </div>
                        <pre style={{
                            whiteSpace: 'pre-wrap',
                            color: 'var(--text-on-dark-soft)',
                            fontSize: '0.875rem',
                            fontFamily: 'monospace',
                            background: 'rgba(0,0,0,0.2)',
                            padding: '1rem',
                            borderRadius: '8px'
                        }}>
                            {error}
                        </pre>
                    </section>
                )}
            </div>

            <footer style={{ marginTop: '4rem', padding: '2rem 0', borderTop: '1px solid var(--border-dark)', display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '2rem' }}>
                    <a href="/admin" style={{ color: 'var(--secondary)', fontSize: '0.875rem' }}>Dashboard</a>
                    <a href="/diag" style={{ color: 'var(--secondary)', fontSize: '0.875rem' }}>System Health</a>
                </div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    Parkside Villa Diagnostic Tool v1.0
                </span>
            </footer>
        </div>
    );
}
