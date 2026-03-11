import { getSiteData } from "../actions";
import DiningClient from "./DiningClient";

export const dynamic = "force-dynamic";

export default async function DiningPage() {
    const data = await getSiteData();
    const menuCategories = data.menuCategories || [];
    const content = data.content || {};
    const diningVenues = data.diningVenues || [];

    return <DiningClient menuCategories={menuCategories} content={content} diningVenues={diningVenues} />;
}
