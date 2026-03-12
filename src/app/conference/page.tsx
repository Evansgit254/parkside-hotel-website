import { Suspense } from "react";
import { getSiteData } from "../actions";
import ConferenceClient from "./ConferenceClient";
import { PageSkeleton } from "../components/LoadingSkeleton";

export const dynamic = "force-dynamic";

async function ConferenceContent() {
    const data = await getSiteData();
    const halls = data.conferenceHalls || [];
    const content = data.content || {};

    return <ConferenceClient halls={halls} content={content} />;
}

export default function ConferencePage() {
    return (
        <Suspense fallback={<PageSkeleton type="cards" />}>
            <ConferenceContent />
        </Suspense>
    );
}
