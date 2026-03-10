import { getSiteData } from "../actions";
import ConferenceClient from "./ConferenceClient";

export const dynamic = "force-dynamic";

export default async function ConferencePage() {
    const data = await getSiteData();
    const halls = (data as any).conferenceHalls || [];
    const content = data.content || {};

    return <ConferenceClient halls={halls} content={content} />;
}
