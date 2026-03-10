import { getSiteData } from "../actions";
import DiningClient from "./DiningClient";

export const dynamic = "force-dynamic";

export default async function DiningPage() {
    const data = await getSiteData();
    const menuCategories = data.menuCategories || [];
    const content = data.content || {};

    return <DiningClient menuCategories={menuCategories} content={content} />;
}
