// @ts-nocheck
import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

const venues = [
    {
        slug: "vip-lounge",
        name: "VIP lounge",
        desc: "An exclusive sanctuary for refined tastes and private conversations, offering a premium selection of spirits and a discreet atmosphere.",
        image: "https://res.cloudinary.com/dizwm3mic/image/upload/v1772371880/parkside-villa-media/Dining_and_Restaurant/20220322_124810_n3g83g.jpg",
        hours: "10:00 AM - 12:00 AM"
    },
    {
        slug: "open-bar-and-counter",
        name: "Open bar and counter",
        desc: "A lively spot for socializing over masterfully crafted cocktails and refreshments, perfect for an evening unwind.",
        image: "https://res.cloudinary.com/dizwm3mic/image/upload/v1772371880/parkside-villa-media/Dining_and_Restaurant/20220322_124810_n3g83g.jpg",
        hours: "11:00 AM - 11:00 PM"
    },
    {
        slug: "coffee-garden-suites",
        name: "Coffee garden suites",
        desc: "Enjoy your morning brew or evening tea in our tranquil, garden-surrounded suites, where nature meets comfort.",
        image: "https://res.cloudinary.com/dizwm3mic/image/upload/v1772373676/parkside-villa-media/EXTRA_PHOTOS/IMG_8551_mbm7db.jpg",
        hours: "6:00 AM - 10:00 PM"
    },
    {
        slug: "ground-restaurant",
        name: "Ground restaurant",
        desc: "Our signature dining space offering the finest local and international cuisines in an elegant setting.",
        image: "https://res.cloudinary.com/dizwm3mic/image/upload/v1772371880/parkside-villa-media/Dining_and_Restaurant/20220322_124810_n3g83g.jpg",
        hours: "7:00 AM - 10:00 PM"
    },
    {
        slug: "breakfast-restaurant",
        name: "Breakfast restaurant",
        desc: "Start your day with a celebration of fresh flavors in our sunlit breakfast hall, featuring a wide array of local delicacies.",
        image: "https://res.cloudinary.com/dizwm3mic/image/upload/v1772371880/parkside-villa-media/Dining_and_Restaurant/20220322_124810_n3g83g.jpg",
        hours: "6:00 AM - 10:30 AM"
    }
];

async function main() {
    console.log("🧹 Cleaning up Dining Venues...");

    // Delete all existing venues to start fresh
    const deletedCount = await prisma.diningVenue.deleteMany({});
    console.log(`  ✓ Deleted ${deletedCount.count} existing venues`);

    console.log("🌱 Syncing new Dining Venues...");
    for (const venue of venues) {
        await prisma.diningVenue.create({
            data: {
                slug: venue.slug,
                name: venue.name,
                desc: venue.desc,
                image: venue.image,
                hours: venue.hours
            }
        });
        console.log(`  ✓ ${venue.name}`);
    }
    console.log("✅ Cleanup and sync complete!");
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
