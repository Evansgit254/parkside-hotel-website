const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function syncLive() {
    console.log('🔄 Starting Live Database Sync...');

    // 1. CLEAR AND SEED GALLERY
    const mediaDataPath = path.join(__dirname, '..', 'uploaded_media.json');
    if (!fs.existsSync(mediaDataPath)) {
        console.error('uploaded_media.json not found!');
        process.exit(1);
    }

    const mediaData = JSON.parse(fs.readFileSync(mediaDataPath, 'utf8'));

    console.log('🗑️ Clearing existing gallery items...');
    await prisma.galleryItem.deleteMany({});

    const galleryItems = [];
    for (const [folder, files] of Object.entries(mediaData)) {
        files.forEach((file, index) => {
            galleryItems.push({
                url: file.url,
                type: 'image',
                title: `${folder} - ${file.originalName}`,
                order: index
            });
        });
    }

    console.log(`🌱 Seeding ${galleryItems.length} gallery items...`);
    await prisma.galleryItem.createMany({
        data: galleryItems,
        skipDuplicates: true,
    });

    // 2. UPDATE HERO IMAGES
    const heroUrls = [
        "https://res.cloudinary.com/dizwm3mic/image/upload/v1772446784/parkside-villa-media/Front_Image_Or_Background_Image/_MG_0700_msl6ip.jpg",
        "https://res.cloudinary.com/dizwm3mic/image/upload/v1772446787/parkside-villa-media/Front_Image_Or_Background_Image/_MG_0698_zmv8bg.jpg",
        "https://res.cloudinary.com/dizwm3mic/image/upload/v1772446800/parkside-villa-media/Front_Image_Or_Background_Image/_MG_0701_pzkfbr.jpg",
        "https://res.cloudinary.com/dizwm3mic/image/upload/v1772446807/parkside-villa-media/Front_Image_Or_Background_Image/_MG_0703_qptc5r.jpg",
        "https://res.cloudinary.com/dizwm3mic/image/upload/v1772440903/parkside-villa-media/Front_Image_Or_Background_Image/IMG-20251119-WA0061_fvrbbk.jpg",
        "https://res.cloudinary.com/dizwm3mic/image/upload/v1772440910/parkside-villa-media/Front_Image_Or_Background_Image/IMG-20251119-WA0063_scwv0p.jpg",
        "https://res.cloudinary.com/dizwm3mic/image/upload/v1772440897/parkside-villa-media/Front_Image_Or_Background_Image/IMG-20251119-WA0049_fpldl2.jpg"
    ];
    console.log('🖼️ Updating Hero Images...');
    await prisma.heroImage.deleteMany({});
    for (const [i, url] of heroUrls.entries()) {
        await prisma.heroImage.create({ data: { url, order: i } });
    }

    // 3. UPDATE ROOMS
    const rooms = [
        {
            slug: "executive-suites", name: "Executive Suites",
            desc: "Spacious living area, king-sized bed, and premium amenities for the discerning traveler.",
            price: "150", image: "https://res.cloudinary.com/dizwm3mic/image/upload/v1772376033/parkside-villa-media/EXTRA_PHOTOS/resized_0I2A0030_wlh5hx.jpg",
            tag: "Best Seller", capacity: 2
        },
        {
            slug: "deluxe-suites", name: "Deluxe Suites",
            desc: "Peaceful views focused on comfort and elegance with modern amenities.",
            price: "120", image: "https://res.cloudinary.com/dizwm3mic/image/upload/v1772376080/parkside-villa-media/EXTRA_PHOTOS/resized_0I2A0050_xxgrnc.jpg",
            capacity: 2
        },
        {
            slug: "highrise-suites", name: "Highrise Suites",
            desc: "Panoramic views of the surroundings with elevated luxury and elegant design.",
            price: "100", image: "https://res.cloudinary.com/dizwm3mic/image/upload/v1772376103/parkside-villa-media/EXTRA_PHOTOS/resized_0I2A0054_otxvms.jpg",
            capacity: 4
        },
        {
            slug: "cottages", name: "Cottages",
            desc: "Feature backyard balconies, high-speed Wi-Fi, television, and hot showers. Designed for extra privacy and groups.",
            price: "200", image: "https://res.cloudinary.com/dizwm3mic/image/upload/v1772376067/parkside-villa-media/EXTRA_PHOTOS/resized_0I2A0041_yfxnuk.jpg",
            tag: "Private", capacity: 4
        }
    ];
    console.log('🏨 Updating Rooms...');
    for (const room of rooms) {
        await prisma.room.upsert({ where: { slug: room.slug }, update: room, create: room });
    }

    // 4. UPDATE FACILITIES
    const facilities = [
        {
            id: "conference", title: "Conference Halls", icon: "Users",
            desc: "Modern M.I.C.E facilities with high-speed internet. Amboseli, Nzambani, Syokimau, Highrise, Masai Mara, and Longonot halls.",
            image: "https://res.cloudinary.com/dizwm3mic/image/upload/v1772373676/parkside-villa-media/EXTRA_PHOTOS/IMG_8551_mbm7db.jpg",
            features: ["Amboseli & Nzambani Halls", "Syokimau & Highrise Halls", "Masai Mara & Longonot Halls"],
            highlights: ["Theatre, U-shape & Classroom setups", "Corporate meetings & Team building", "Curated environment for groups", "High-speed connectivity and support", "Weddings & private parties"]
        },
        {
            id: "dining", title: "Dining & Bars", icon: "Utensils",
            desc: "A culinary journey featuring the Main Restaurant, VIP Lounge, and Open Bar & Restaurant.",
            image: "https://res.cloudinary.com/dizwm3mic/image/upload/v1772371880/parkside-villa-media/Dining_and_Restaurant/20220322_124810_n3g83g.jpg",
            features: ["Main Restaurant", "VIP Lounge", "Open Bar & Restaurant"],
            highlights: ["International and local Kamba cuisine", "Over 50 wine selections & single malts"]
        }
    ];
    console.log('🍽️ Updating Facilities...');
    for (const f of facilities) {
        await prisma.facility.upsert({
            where: { id: f.id },
            update: { ...f, features: f.features, highlights: f.highlights },
            create: { ...f, features: f.features, highlights: f.highlights }
        });
    }

    // 5. UPDATE CONFERENCE HALLS
    const halls = [
        { slug: "amboseli-hall", name: "Amboseli Hall", desc: "A spacious and elegant hall perfect for large corporate events and seminars.", image: "https://res.cloudinary.com/dizwm3mic/image/upload/v1772443145/parkside-villa-media/CONFERENCE_HALLS_Amboseli/20210923_085742_z7vjgo.jpg", capacity: 200, setups: ["Theatre", "Classroom", "U-Shape"] },
        { slug: "nzambani-hall", name: "Nzambani Hall", desc: "Modern meeting space equipped with state-of-the-art audiovisual technology.", image: "https://res.cloudinary.com/dizwm3mic/image/upload/v1772446185/parkside-villa-media/CONFERENCE_HALLS_Nzambani/IMG_5877_keyxkh.jpg", capacity: 150, setups: ["Theatre", "Boardroom", "Classroom"] },
        { slug: "syokimau-hall", name: "Syokimau Hall", desc: "Versatile venue ideal for mid-sized conferences and workshops.", image: "https://res.cloudinary.com/dizwm3mic/image/upload/v1772446455/parkside-villa-media/CONFERENCE_HALLS_Syokimau/IMG_5910_hjhjfn.jpg", capacity: 100, setups: ["U-Shape", "Banquet", "Theatre"] },
        { slug: "highrise-hall", name: "Highrise Hall", desc: "Intimate and professional setting for executive board meetings and private discussions.", image: "https://res.cloudinary.com/dizwm3mic/image/upload/v1772445758/parkside-villa-media/CONFERENCE_HALLS_Boardroom/IMG_5847_bgjy27.jpg", capacity: 50, setups: ["Boardroom", "U-Shape"] },
        { slug: "masai-mara-hall", name: "Masai Mara Hall", desc: "Expansive and grand hall designed for major exhibitions, galas, and summits.", image: "https://res.cloudinary.com/dizwm3mic/image/upload/v1772445987/parkside-villa-media/CONFERENCE_HALLS_Masaai_Mara/IMG_5857_e4dyv9.jpg", capacity: 300, setups: ["Theatre", "Banquet", "Reception"] },
        { slug: "longonot-hall", name: "Longonot Hall", desc: "State-of-the-art boardroom with panoramic views, perfect for high-level executive meetings.", image: "https://res.cloudinary.com/dizwm3mic/image/upload/v1772445820/parkside-villa-media/CONFERENCE_HALLS_Longonot/IMG_5825_zl0idd.jpg", capacity: 30, setups: ["Boardroom"] },
    ];
    console.log('🏛️ Updating Conference Halls...');
    for (const hall of halls) {
        await prisma.conferenceHall.upsert({ where: { slug: hall.slug }, update: hall, create: hall });
    }

    // 6. UPDATE BLOG POSTS
    const blogPosts = [
        {
            id: "luxury-kitui-hospitality",
            title: "Exploring Luxury in the Heart of Kitui",
            excerpt: "Discover how Parkside Villa is redefining hospitality in the region with modern amenities and traditional charm.",
            content: "Full content here...",
            date: "Feb 24, 2026",
            author: "Admin",
            category: "Hospitality",
            image: "https://res.cloudinary.com/dizwm3mic/image/upload/v1772447077/parkside-villa-media/Swimming_Pool/20220214_123402_fzdujd.jpg"
        },
        {
            id: "green-interior-design",
            title: "Green Interior Design Inspiration",
            excerpt: "Bringing the lush gardens of Kitui inside. How we use natural elements to create a serene guest experience.",
            content: "Full content here...",
            date: "Feb 18, 2026",
            author: "Design Team",
            category: "Interior Design",
            image: "https://res.cloudinary.com/dizwm3mic/image/upload/v1772440903/parkside-villa-media/Front_Image_Or_Background_Image/IMG-20251119-WA0061_fvrbbk.jpg"
        }
    ];
    console.log('✍️ Updating Blog Posts...');
    for (const post of blogPosts) {
        await prisma.blogPost.upsert({ where: { id: post.id }, update: post, create: post });
    }

    console.log('✅ Live Database Sync Complete!');
}

syncLive()
    .catch((e) => {
        console.error('❌ Sync Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
