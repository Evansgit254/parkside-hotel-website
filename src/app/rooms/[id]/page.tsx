import { getSiteData } from "../../actions";
import { notFound } from "next/navigation";
import ClientRoomDetail from "./ClientRoomDetail";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const data = await getSiteData();
    const room = (data.rooms || []).find((r: any) => r.id === id);

    if (!room) return { title: "Room Not Found | Parkside Villa Kitui" };

    return {
        title: `${room.name} | Luxury Stay in Kitui`,
        description: room.desc,
        openGraph: {
            title: room.name,
            description: room.desc,
            images: [room.image],
        },
    };
}

export default async function RoomDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const data = await getSiteData();
    const room = (data.rooms || []).find((r: any) => r.id === id);

    if (!room) {
        notFound();
    }

    return <ClientRoomDetail room={room} />;
}
