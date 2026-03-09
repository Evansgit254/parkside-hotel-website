
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function resetMediaPaths() {
    console.log("🔄 Resetting media paths in database...");

    try {
        // 1. Clear Gallery
        await prisma.galleryItem.deleteMany({});
        console.log("✅ Deleted all gallery items.");

        // 2. Clear HeroImage model
        await prisma.heroImage.deleteMany({});
        console.log("✅ Deleted all hero images.");

        // 3. Clear Room images
        await prisma.room.updateMany({ data: { image: "", images: [] } });
        console.log("✅ Reset all room images.");

        // 4. Clear Facility images
        await prisma.facility.updateMany({ data: { image: "", images: [] } });
        console.log("✅ Reset all facility images.");

        // 5. Clear ConferenceHall images
        await prisma.conferenceHall.updateMany({ data: { image: "", images: [] } });
        console.log("✅ Reset all conference hall images.");

        // 6. Clear DiningVenue images
        await prisma.diningVenue.updateMany({ data: { image: "", images: [] } });
        console.log("✅ Reset all dining venue images.");

        // 7. Clear BlogPost images
        await prisma.blogPost.updateMany({ data: { image: "" } });
        console.log("✅ Reset all blog post images.");

        // 8. Clear SiteContent sliders
        const siteContent = await prisma.siteContent.findMany();
        for (const item of siteContent) {
            const value = item.value as any;
            let needsUpdate = false;

            ['rooms_hero', 'facilities_hero', 'dining_hero', 'blog_hero', 'landing_hero'].forEach(key => {
                if (value && value[key] && (value[key].image || value[key].images)) {
                    if (value[key].image) value[key].image = [];
                    if (value[key].images) value[key].images = [];
                    needsUpdate = true;
                }
            });

            if (needsUpdate) {
                await prisma.siteContent.update({
                    where: { key: item.key },
                    data: { value: value }
                });
            }
        }
        console.log("✅ Reset hero sliders in SiteContent.");

        console.log("\n✨ Database media reset complete. You can now start fresh uploads.");
    } catch (error) {
        console.error("❌ Reset failed:", error);
    } finally {
        await prisma.$disconnect();
    }
}

resetMediaPaths();
