import { getSiteData } from "../actions";
import RoomsClient from "./RoomsClient";

export const dynamic = "force-dynamic";

export default async function RoomsPage() {
    const data = await getSiteData();
    const rooms = data.rooms || [];
    const content = data.content || {};

    return <RoomsClient rooms={rooms} content={content} />;
}
