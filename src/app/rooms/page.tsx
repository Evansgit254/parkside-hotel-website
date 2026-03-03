import { getRoomsPageData, getSiteData } from "../actions";
import RoomsClient from "./RoomsClient";

export const revalidate = 3600; // ISR: Revalidate every hour

export default async function Rooms() {
    const { rooms } = await getRoomsPageData();
    const siteData = await getSiteData();

    return (
        <RoomsClient
            initialRooms={rooms}
            initialContent={siteData.content}
            contactInfo={siteData.contactInfo}
        />
    );
}
