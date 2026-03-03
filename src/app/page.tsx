import { getHomePageData, getSiteData } from "./actions";
import HomeClient from "./HomeClient";

export const revalidate = 3600; // ISR: Revalidate every hour

export default async function Home() {
  const initialData = await getHomePageData();

  // We also need the full site data for the Footer and other shared components
  // that were previously expected by the old siteData structure.
  // However, mapping shared parts like contactInfo to be available.
  const fullData = await getSiteData();

  const mergedData = {
    ...initialData,
    contactInfo: fullData.contactInfo
  };

  return <HomeClient initialData={mergedData} />;
}
