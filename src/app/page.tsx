import { Suspense } from "react";
import { rooms as initialRooms, facilities as initialFacilities, testimonials as initialTestimonials, contactInfo as initialContactInfo, heroImages as initialHeroImages } from "../data/site-data";
import { getPublicSiteData } from "./actions";
import HomeClient from "./components/HomeClient";
import { HeroSkeleton, CardSkeleton } from "./components/LoadingSkeleton";

export const dynamic = "force-dynamic";

async function HomeContent() {
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

function HomeFallback() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--background)' }}>
      <HeroSkeleton />
      <div style={{ padding: 'clamp(3rem, 8vw, 6rem) clamp(1.5rem, 5vw, 4rem)', maxWidth: '1300px', margin: '0 auto' }}>
        <CardSkeleton count={4} />
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<HomeFallback />}>
      <HomeContent />
    </Suspense>
  );
}
