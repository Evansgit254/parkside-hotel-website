import { getSiteData } from "../../actions";
import ClientFacilityDetail from "./ClientFacilityDetail";
import { Metadata } from 'next';
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const data = await getSiteData();
    const facility = data.facilities?.find((f: any) => f.id === id);
    return {
        title: facility ? `${facility.title} | Facilities | Parkside Villa Kitui` : "Facility Detail",
        description: facility?.desc || "Experience luxury at Parkside Villa Kitui."
    };
}

export default async function FacilityDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const data = await getSiteData();
    const facility = data.facilities?.find((f: any) => f.id === id);

    if (!facility) {
        return (
            <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9fa' }}>
                <div style={{ textAlign: 'center' }}>
                    <h1 style={{ fontSize: '2rem', marginBottom: '1rem', fontFamily: 'var(--font-serif)' }}>Facility Not Found</h1>
                    <Link href="/facilities" style={{ color: 'var(--primary)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                        <ChevronLeft size={16} /> Back to Facilities
                    </Link>
                </div>
            </div>
        );
    }

    return <ClientFacilityDetail facility={facility} />;
}
