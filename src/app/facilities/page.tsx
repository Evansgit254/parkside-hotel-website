import { getSiteData } from "../actions";
import FacilitiesClient from "./FacilitiesClient";

export const dynamic = "force-dynamic";

export default async function FacilitiesPage() {
    const data = await getSiteData();
    const facilities = data.facilities || [];
    const content = data.content || {};

    return <FacilitiesClient facilities={facilities} content={content} />;
}
