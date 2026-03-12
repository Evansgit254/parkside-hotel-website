import { Suspense } from "react";
import { getSiteData } from "../actions";
import DiningClient from "./DiningClient";
import { PageSkeleton } from "../components/LoadingSkeleton";

export const dynamic = "force-dynamic";

async function DiningContent() {
    const data = await getSiteData();
    const menuCategories = data.menuCategories || [];
    const content = data.content || {};
    const diningVenues = data.diningVenues || [];

    return <DiningClient menuCategories={menuCategories} content={content} diningVenues={diningVenues} />;
}

export default function DiningPage() {
    return (
        <Suspense fallback={<PageSkeleton type="venues" />}>
            <DiningContent />
        </Suspense>
    );
}
