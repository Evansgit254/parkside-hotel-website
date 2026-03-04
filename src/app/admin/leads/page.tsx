"use client";
export const dynamic = "force-dynamic";

import styles from "../admin.module.css";
import { Mail, Phone, Calendar, Clock, CheckCircle, Trash2, BedDouble, User, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import { getSiteData, updateLeadStatus, deleteLead } from "../../actions";
import { showToast } from "../components/AdminToast";

export default function AdminLeads() {
    const [leads, setLeads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchLeads = async () => {
        const data = await getSiteData();
        if (data && data.leads) setLeads(data.leads);
        setLoading(false);
    };

    useEffect(() => { fetchLeads(); }, []);

    const handleStatusChange = async (id: number, status: string) => {
        const res = await updateLeadStatus(id, status);
        if (res.success) {
            await fetchLeads();
            showToast(`Enquiry status updated to ${status}`, "success");
        } else {
            showToast(res.error || "Failed to update status", "error");
        }
    };

    const handleDelete = async (id: number) => {
        setIsDeleting(true);
        const res = await deleteLead(id);
        if (res.success) {
            setConfirmDeleteId(null);
            await fetchLeads();
            showToast("Enquiry removed successfully", "success");
        } else {
            showToast(res.error || "Failed to delete enquiry", "error");
        }
        setIsDeleting(false);
    };

    const statusColors: Record<string, string> = {
        Confirmed: styles.badgeSuccess,
        Cancelled: "badge-error",
        Pending: styles.badgePending,
    };

    if (loading) return <div style={{ padding: "3rem", color: "#6B7280", fontSize: "0.875rem" }}>Loading enquiries...</div>;

    return (
        <>
            <div className={styles.sectionHeader}>
                <div className={styles.sectionTitleGroup}>
                    <span className={styles.sectionEyebrow}>Guest Relations</span>
                    <h1 className={styles.sectionTitle}>Enquiries & Reservations</h1>
                    <p className={styles.sectionSubtitle}>Monitor and manage guest booking requests</p>
                </div>

                {/* Live count */}
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.5rem', fontWeight: 400, color: '#E8E3DA', lineHeight: 1 }}>{leads.length}</div>
                    <div style={{ fontSize: '0.5625rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#6B7280', marginTop: '0.25rem' }}>Total Enquiries</div>
                </div>
            </div>

            <div className={styles.tableContainer}>
                <div className={styles.tableHeader} style={{ gridTemplateColumns: '1fr 1fr 130px 90px 90px' }}>
                    <div>Guest</div>
                    <div>Booking Details</div>
                    <div>Status</div>
                    <div>Received</div>
                    <div style={{ textAlign: 'right' }}>Actions</div>
                </div>

                {leads.length === 0 ? (
                    <div style={{ padding: '5rem 2rem', textAlign: 'center', color: '#6B7280', fontSize: '0.875rem', letterSpacing: '0.05em' }}>
                        No pending enquiries at this time.
                    </div>
                ) : (
                    leads.map((lead) => {
                        const statusBadgeClass = lead.status === 'Confirmed'
                            ? styles.badgeSuccess
                            : lead.status === 'Cancelled'
                                ? ''
                                : styles.badgePending;

                        const statusStyle = lead.status === 'Cancelled'
                            ? { background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.15)' }
                            : {};

                        return (
                            <div key={lead.id}>
                                <div className={styles.tableRow} style={{ gridTemplateColumns: '1fr 1fr 130px 90px 90px' }}>

                                    {/* Guest info */}
                                    <div style={{ display: 'flex', gap: '0.875rem', alignItems: 'flex-start' }}>
                                        <div style={{ width: '36px', height: '36px', background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C9A84C', flexShrink: 0 }}>
                                            <User size={16} />
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 500, fontSize: '0.9375rem', color: '#6B7280', marginBottom: '0.35rem' }}>{lead.name}</div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#6B7280' }}>
                                                    <Mail size={11} /> {lead.email}
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#6B7280' }}>
                                                    <Phone size={11} /> {lead.phone}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Booking details */}
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#C9A84C', marginBottom: '0.35rem' }}>
                                            <BedDouble size={14} /> {lead.room}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#6B7280' }}>
                                            <Calendar size={11} /> {lead.date}
                                        </div>
                                        {lead.guests && (
                                            <div style={{ fontSize: '0.6875rem', color: '#6B7280', marginTop: '0.2rem', letterSpacing: '0.05em' }}>{lead.guests}</div>
                                        )}
                                    </div>

                                    {/* Status dropdown */}
                                    <div>
                                        <select
                                            value={lead.status}
                                            onChange={e => handleStatusChange(lead.id, e.target.value)}
                                            style={{
                                                padding: '0.35rem 0.625rem',
                                                fontSize: '0.5625rem',
                                                letterSpacing: '0.15em',
                                                textTransform: 'uppercase',
                                                fontWeight: 500,
                                                width: 'auto',
                                                background: lead.status === 'Confirmed'
                                                    ? 'rgba(16,185,129,0.08)'
                                                    : lead.status === 'Cancelled'
                                                        ? 'rgba(239,68,68,0.08)'
                                                        : 'rgba(245,158,11,0.08)',
                                                color: lead.status === 'Confirmed'
                                                    ? '#10b981'
                                                    : lead.status === 'Cancelled'
                                                        ? '#ef4444'
                                                        : '#f59e0b',
                                                border: `1px solid ${lead.status === 'Confirmed' ? 'rgba(16,185,129,0.2)' : lead.status === 'Cancelled' ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)'}`,
                                                outline: 'none',
                                                cursor: 'pointer',
                                                fontFamily: 'inherit',
                                                appearance: 'none',
                                            }}
                                        >
                                            <option value="Pending">Pending</option>
                                            <option value="Confirmed">Confirmed</option>
                                            <option value="Cancelled">Cancelled</option>
                                        </select>
                                    </div>

                                    {/* Received time */}
                                    <div style={{ fontSize: '0.6875rem', color: '#6B7280', display: 'flex', alignItems: 'flex-start', gap: '0.375rem' }}>
                                        <Clock size={11} style={{ marginTop: '1px', flexShrink: 0 }} /> {lead.time}
                                    </div>

                                    {/* Action buttons */}
                                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                        <button onClick={() => handleStatusChange(lead.id, 'Confirmed')} className={styles.actionBtn} title="Confirm" style={{ color: '#10b981' }}>
                                            <CheckCircle size={14} />
                                        </button>
                                        <button
                                            onClick={() => setConfirmDeleteId(confirmDeleteId === lead.id ? null : lead.id)}
                                            className={`${styles.actionBtn} ${styles.deleteBtn}`}
                                            title="Delete"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>

                                {/* Inline delete confirmation */}
                                {confirmDeleteId === lead.id && (
                                    <div style={{
                                        background: 'rgba(239,68,68,0.05)',
                                        borderTop: '1px solid rgba(239,68,68,0.15)',
                                        borderBottom: '1px solid rgba(239,68,68,0.08)',
                                        padding: '1rem 2rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        gap: '1rem'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8125rem', color: '#6B7280' }}>
                                            <AlertTriangle size={15} color="#ef4444" />
                                            Remove enquiry from <strong style={{ color: '#6B7280' }}>&nbsp;{lead.name}</strong>? This cannot be undone.
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                                            <button onClick={() => setConfirmDeleteId(null)} className={styles.actionBtn} style={{ padding: '0.5rem 1rem', width: 'auto' }}>
                                                Cancel
                                            </button>
                                            <button
                                                onClick={() => handleDelete(lead.id)}
                                                disabled={isDeleting}
                                                style={{
                                                    padding: '0.5rem 1rem',
                                                    background: '#ef4444',
                                                    border: 'none',
                                                    color: '#111827',
                                                    cursor: 'pointer',
                                                    fontSize: '0.625rem',
                                                    letterSpacing: '0.15em',
                                                    textTransform: 'uppercase',
                                                    fontWeight: 600,
                                                    opacity: isDeleting ? 0.6 : 1,
                                                    fontFamily: 'inherit',
                                                }}
                                            >
                                                {isDeleting ? 'Removing...' : 'Confirm Delete'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </>
    );
}
