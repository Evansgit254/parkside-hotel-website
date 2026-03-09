const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function syncRates() {
    const officialRooms = [
        {
            slug: "executive-suites",
            name: "Executive Suites",
            desc: "Spacious living area and king-sized bed. Rate: KES 8,000 (Single) / KES 10,000 (Double) per night.",
            price: "8000",
            capacity: 2,
            tag: "Best Seller"
        },
        {
            slug: "deluxe-suites",
            name: "Deluxe Suites",
            desc: "Peaceful views focused on comfort and elegance. Rate: KES 5,000 (Single) / KES 6,500 (Double) per night.",
            price: "5000",
            capacity: 2
        },
        {
            slug: "cottages",
            name: "Cottages",
            desc: "Backyard balconies and extra privacy. Rate: KES 2,800 (Single) / KES 4,300 (Double) per night.",
            price: "2800",
            capacity: 4,
            tag: "Private"
        },
        {
            slug: "highrise-suites",
            name: "Highrise Suites",
            desc: "Panoramic views with elevated luxury. Rate: KES 2,500 (Single) / KES 4,000 (Double) per night.",
            price: "2500",
            capacity: 4
        },
        {
            slug: "premium-standard",
            name: "Premium Standard Room",
            desc: "Enhanced comfort with modern amenities. Rate: KES 2,000 (Single) / KES 3,500 (Double) per night.",
            price: "2000",
            capacity: 2,
            image: "https://res.cloudinary.com/dizwm3mic/image/upload/v1772373725/parkside-villa-media/EXTRA_PHOTOS/IMG_8556_ds9eib.jpg"
        },
        {
            slug: "standard-room",
            name: "Standard Room",
            desc: "Essential comfort for a restful stay. Rate: KES 1,700 (Single) / KES 3,200 (Double) per night.",
            price: "1700",
            capacity: 2,
            image: "https://res.cloudinary.com/dizwm3mic/image/upload/v1772373754/parkside-villa-media/EXTRA_PHOTOS/IMG_8560_vlao4a.jpg"
        }
    ];

    console.log("Starting sync of official rates...");

    for (const room of officialRooms) {
        console.log(`Syncing ${room.name}...`);
        await prisma.room.upsert({
            where: { slug: room.slug },
            update: {
                name: room.name,
                desc: room.desc,
                price: room.price,
                capacity: room.capacity,
                tag: room.tag || null,
            },
            create: {
                slug: room.slug,
                name: room.name,
                desc: room.desc,
                price: room.price,
                capacity: room.capacity,
                tag: room.tag || null,
                image: room.image || "https://res.cloudinary.com/dizwm3mic/image/upload/v1772446784/parkside-villa-media/Front_Image_Or_Background_Image/_MG_0700_msl6ip.jpg"
            }
        });
    }

    console.log("Successfully synced all rates and categories.");
}

syncRates()
    .catch(e => {
        console.error("Error syncing rates:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
