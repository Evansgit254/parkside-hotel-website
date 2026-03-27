import { getSiteData } from "../../actions";
import ClientRoomDetail from "./ClientRoomDetail";
import { Metadata } from 'next';
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import styles from "./room-detail.module.css";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const data = await getSiteData();
    const room = data.rooms?.find((r: any) => r.id === id);
    return {
        title: room ? `${room.name} | Accommodation | Parkside Villa Kitui` : "Room Detail",
        description: room?.desc || "Luxury suites and cottages at Parkside Villa Kitui.",
        alternates: { canonical: `/rooms/${id}` },
        openGraph: room?.image ? {
            images: Array.isArray(room.image) ? room.image.map((url: string) => ({ url })) : [{ url: room.image }]
        } : undefined
    };
}

export default async function RoomDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const data = await getSiteData();
    const room = data.rooms?.find((r: any) => r.id === id);

    if (!room) {
        return (
            <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9fa' }}>
                <div style={{ textAlign: 'center' }}>
                    <h1 style={{ fontSize: '2rem', marginBottom: '1rem', fontFamily: 'var(--font-serif)' }}>Room Not Found</h1>
                    <Link href="/rooms" style={{ color: 'var(--primary)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                        <ChevronLeft size={16} /> Back to Accommodation
                    </Link>
                </div>
            </div>
        );
    }

    return <ClientRoomDetail room={room} contactInfo={data.contactInfo} />;
}
