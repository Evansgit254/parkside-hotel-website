import { rooms as initialRooms, facilities as initialFacilities, testimonials as initialTestimonials, contactInfo as initialContactInfo, heroImages as initialHeroImages } from "../data/site-data";
import { getPublicSiteData } from "./actions";
import HomeClient from "./components/HomeClient";

export const dynamic = "force-dynamic";

export default async function Home() {
  const data = await getPublicSiteData();

  const siteData = data || {
    rooms: initialRooms,
    facilities: initialFacilities,
    testimonials: initialTestimonials,
    contactInfo: initialContactInfo,
    heroImages: initialHeroImages
  };

  return (
    <HomeClient
      siteData={siteData}
      initialHeroImages={initialHeroImages}
    />
  );
}
