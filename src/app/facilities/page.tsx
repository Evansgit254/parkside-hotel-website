import { Suspense } from "react";
import { getSiteData } from "../actions";
import FacilitiesClient from "./FacilitiesClient";
import { PageSkeleton } from "../components/LoadingSkeleton";

export const revalidate = 60;

async function FacilitiesContent() {
    const data = await getSiteData();
    const facilities = data.facilities || [];
    const content = data.content || {};

    return <FacilitiesClient facilities={facilities} content={content} />;
}

export default function FacilitiesPage() {
    return (
        <Suspense fallback={<PageSkeleton type="cards" />}>
            <FacilitiesContent />
        </Suspense>
    );
}
