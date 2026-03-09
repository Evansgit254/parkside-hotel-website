import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log("--- STARTING CMS SEEDING ---")

    // 1. Fix Room Slug
    const premiumRoom = await prisma.room.findFirst({
        where: { name: { contains: "Premium Standard", mode: 'insensitive' } }
    })
    if (premiumRoom) {
        await prisma.room.update({
            where: { id: premiumRoom.id },
            data: {
                slug: 'standard-premium',
                name: 'Standard Premium Room'
            }
        })
        console.log("Updated Premium Standard Room slug to 'standard-premium'")
    }

    // 2. Seed SiteContent Keys (if missing)
    const keysToSeed = [
        {
            key: "nav_main",
            value: {
                home: "Home",
                rooms: "Accommodation",
                conference: "Conference",
                facilities: "Facilities",
                gallery: "Gallery",
                blog: "Blog",
                dining: "Dining",
                contact: "Contact"
            }
        },
        {
            key: "nav_accommodation",
            value: {
                item1: "Executive Suites",
                item2: "Deluxe Suites",
                item3: "Highrise Suites",
                item4: "Cottages",
                item5: "Standard Premium",
                item6: "All Accommodations"
            }
        },
        {
            key: "rooms_hero",
            value: { image: "https://res.cloudinary.com/dizwm3mic/image/upload/v1772446787/parkside-villa-media/Front_Image_Or_Background_Image/_MG_0698_zmv8bg.jpg" }
        },
        {
            key: "facilities_hero",
            value: { image: "https://res.cloudinary.com/dizwm3mic/image/upload/f_auto,q_auto/v1772446800/parkside-villa-media/Front_Image_Or_Background_Image/_MG_0701_pzkfbr.jpg" }
        },
        {
            key: "dining_hero",
            value: { image: "https://res.cloudinary.com/dizwm3mic/image/upload/v1772446807/parkside-villa-media/Front_Image_Or_Background_Image/_MG_0703_qptc5r.jpg" }
        },
        {
            key: "blog_hero",
            value: { image: "https://res.cloudinary.com/dizwm3mic/image/upload/v1772440903/parkside-villa-media/Front_Image_Or_Background_Image/IMG-20251119-WA0061_fvrbbk.jpg" }
        },
        {
            key: "rooms_intro",
            value: { badge: "Our Collection", title: "Luxury Reimagined", desc: "A curated selection of sanctuaries designed for ultimate comfort and cultural elegance." }
        },
        {
            key: "facilities_intro",
            value: { badge: "World-Class Amenities", title: "Hotel Facilities", desc: "Discover a world where unparalleled luxury meets every need." }
        },
        {
            key: "dining_intro",
            value: { title: "Divine Dining at Parkside Villa", desc: "A culinary journey through the flavors of Kitui" }
        },
        {
            key: "blog_intro",
            value: { badge: "Our Journal", title: "The Insider's Guide", subtitle: "Discover design trends, architectural inspiration, and updates from Parkside Villa." }
        }
    ]

    for (const item of keysToSeed) {
        await prisma.siteContent.upsert({
            where: { key: item.key },
            update: {}, // Don't overwrite if exists
            create: item
        })
        console.log(`Ensured key: ${item.key}`)
    }

    console.log("--- CMS SEEDING COMPLETE ---")
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect()
    })
