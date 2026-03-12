import { Suspense } from "react";
import { getSiteData } from "../actions";
import RoomsClient from "./RoomsClient";
import { PageSkeleton } from "../components/LoadingSkeleton";

export const dynamic = "force-dynamic";

async function RoomsContent() {
    const data = await getSiteData();
    const rooms = data.rooms || [];
    const content = data.content || {};

    return <RoomsClient rooms={rooms} content={content} />;
}

export default function RoomsPage() {
    return (
        <Suspense fallback={<PageSkeleton type="cards" />}>
            <RoomsContent />
        </Suspense>
    );
}
