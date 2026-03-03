import { getFacilitiesPageData, getSiteData } from "../actions";
import FacilitiesClient from "./FacilitiesClient";

export const revalidate = 3600; // ISR: Revalidate every hour

export default async function Facilities() {
    const { facilities } = await getFacilitiesPageData();
    const siteData = await getSiteData();

    return (
        <FacilitiesClient
            initialFacilities={facilities}
            initialContent={siteData.content}
            contactInfo={siteData.contactInfo}
        />
    );
}
