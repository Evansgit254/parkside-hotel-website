import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    if (process.env.NODE_ENV === 'production' && !process.env.SEED_SECRET) {
        return NextResponse.json({ error: "Unauthorized endpoint in production" }, { status: 401 });
    }
    const authHeader = request.headers.get('authorization');
    if (process.env.SEED_SECRET && authHeader !== `Bearer ${process.env.SEED_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log('🚀 Starting API Seed...');

    try {
        // 2. HERO IMAGES
        const heroImages = [
            "https://res.cloudinary.com/dizwm3mic/image/upload/v1772373650/parkside-villa-media/EXTRA_PHOTOS/IMG_8543_xxgwxl.jpg",
            "https://res.cloudinary.com/dizwm3mic/image/upload/v1772373714/parkside-villa-media/EXTRA_PHOTOS/IMG_8555_u1zu5r.jpg",
            "https://res.cloudinary.com/dizwm3mic/image/upload/v1772373779/parkside-villa-media/EXTRA_PHOTOS/IMG_8564_o4vaky.jpg"
        ];
        for (const [i, url] of heroImages.entries()) {
            await prisma.heroImage.upsert({
                where: { url },
                update: { order: i },
                create: { url, order: i }
            });
        }

        // 3. ROOMS
        const rooms = [
            {
                id: "executive-suites", slug: "executive-suites", name: "Executive Suites",
                desc: "Spacious living area, king-sized bed, and premium amenities for the discerning traveler.",
                price: "150", image: "https://res.cloudinary.com/dizwm3mic/image/upload/v1772376033/parkside-villa-media/EXTRA_PHOTOS/resized_0I2A0030_wlh5hx.jpg",
                tag: "Best Seller", capacity: 2
            },
            {
                id: "deluxe-suites", slug: "deluxe-suites", name: "Deluxe Suites",
                desc: "Peaceful views focused on comfort and elegance with modern amenities.",
                price: "120", image: "https://res.cloudinary.com/dizwm3mic/image/upload/v1772376080/parkside-villa-media/EXTRA_PHOTOS/resized_0I2A0050_xxgrnc.jpg",
                capacity: 2
            },
            {
                id: "highrise-suites", slug: "highrise-suites", name: "Highrise Suites",
                desc: "Panoramic views of the surroundings with elevated luxury and elegant design.",
                price: "100", image: "https://res.cloudinary.com/dizwm3mic/image/upload/v1772376103/parkside-villa-media/EXTRA_PHOTOS/resized_0I2A0054_otxvms.jpg",
                capacity: 4
            },
            {
                id: "cottages", slug: "cottages", name: "Cottages",
                desc: "Feature backyard balconies, high-speed Wi-Fi, television, and hot showers. Designed for extra privacy and groups.",
                price: "200", image: "https://res.cloudinary.com/dizwm3mic/image/upload/v1772376067/parkside-villa-media/EXTRA_PHOTOS/resized_0I2A0041_yfxnuk.jpg",
                tag: "Private", capacity: 4
            }
        ];
        for (const room of rooms) {
            await prisma.room.upsert({ where: { slug: room.slug }, update: room, create: room });
        }

        // 4. FACILITIES
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
        for (const f of facilities) {
            await prisma.facility.upsert({
                where: { id: f.id },
                update: { ...f, features: f.features as any, highlights: f.highlights as any },
                create: { ...f, features: f.features as any, highlights: f.highlights as any }
            });
        }

        // 5. TESTIMONIALS (Small set)
        await prisma.testimonial.deleteMany({ where: { name: "David Musyoka" } });
        await prisma.testimonial.create({
            data: { name: "David Musyoka", title: "Business Traveler", text: "The Executive Suite was beyond my expectations.", status: "Active" }
        });

        // 6. DINING MENU
        await prisma.menuCategory.upsert({
            where: { id: "starters" },
            update: { name: "Starters", order: 1, items: [{ name: "Villa House Salad", price: "12" }] as any },
            create: { id: "starters", name: "Starters", order: 1, items: [{ name: "Villa House Salad", price: "12" }] as any }
        });

        // 7. SITE CONTENT
        await prisma.siteContent.upsert({
            where: { key: "landing_hero" },
            update: { value: { title: "Parkside Villa Kitui", subtitle: "An oasis of tranquility in the heart of Kenya." } as any },
            create: { key: "landing_hero", value: { title: "Parkside Villa Kitui", subtitle: "An oasis of tranquility" } as any }
        });

        // 8. GALLERY
        await prisma.galleryItem.deleteMany({ where: { title: { in: ["Luxury Entrance", "Poolside Zen", "Virtual Tour"] } } });
        await prisma.galleryItem.createMany({
            data: [
                { url: "https://res.cloudinary.com/dizwm3mic/image/upload/v1772373733/parkside-villa-media/EXTRA_PHOTOS/IMG_8557_ntfhqq.jpg", type: "image", title: "Luxury Entrance", order: 1 },
                { url: "https://res.cloudinary.com/dizwm3mic/image/upload/v1772447162/parkside-villa-media/Swimming_Pool/IMG-20251119-WA0051_lwmtna.jpg", type: "image", title: "Poolside Zen", order: 2 },
                { url: "https://www.youtube.com/embed/dQw4w9WgXcQ", type: "video", title: "Virtual Tour", order: 3 }
            ]
        });

        // 9. PROMOTIONS
        await prisma.promotion.upsert({
            where: { code: "SUMMER20" },
            update: { discount: 20, type: "percentage", validTo: new Date("2026-08-31") },
            create: { code: "SUMMER20", discount: 20, type: "percentage", validTo: new Date("2026-08-31") }
        });

        // 10. CONFERENCE HALLS
        const halls = [
            { slug: "amboseli-hall", name: "Amboseli Hall", desc: "A spacious and elegant hall perfect for large corporate events and seminars.", image: "https://res.cloudinary.com/dizwm3mic/image/upload/v1772439542/parkside-villa-media/CONFERENCE_HALLS/Amboseli/20220609_111719_fngqzv.jpg", capacity: 200, setups: ["Theatre", "Classroom", "U-Shape"] },
            { slug: "nzambani-hall", name: "Nzambani Hall", desc: "Modern meeting space equipped with state-of-the-art audiovisual technology.", image: "https://res.cloudinary.com/dizwm3mic/image/upload/v1772439736/parkside-villa-media/CONFERENCE_HALLS/Nzambani/20220609_111815_tqvq8y.jpg", capacity: 150, setups: ["Theatre", "Boardroom", "Classroom"] },
            { slug: "syokimau-hall", name: "Syokimau Hall", desc: "Versatile venue ideal for mid-sized conferences and workshops.", image: "https://res.cloudinary.com/dizwm3mic/image/upload/v1772441052/parkside-villa-media/CONFERENCE_HALLS/Syokimau/20220609_112028_u8v4q1.jpg", capacity: 100, setups: ["U-Shape", "Banquet", "Theatre"] },
            { slug: "highrise-hall", name: "Highrise Hall", desc: "Intimate and professional setting for executive board meetings and private discussions.", image: "https://res.cloudinary.com/dizwm3mic/image/upload/v1772440842/parkside-villa-media/CONFERENCE_HALLS/Highrise/20220609_111956_v5h8u1.jpg", capacity: 50, setups: ["Boardroom", "U-Shape"] },
            { slug: "masai-mara-hall", name: "Masai Mara Hall", desc: "Expansive and grand hall designed for major exhibitions, galas, and summits.", image: "https://res.cloudinary.com/dizwm3mic/image/upload/v1772440262/parkside-villa-media/CONFERENCE_HALLS/Masaai_Mara/20220609_112342_z8p5c1.jpg", capacity: 300, setups: ["Theatre", "Banquet", "Reception"] },
            { slug: "longonot-hall", name: "Longonot Hall", desc: "State-of-the-art boardroom with panoramic views, perfect for high-level executive meetings.", image: "/images/conference/longonot.png", capacity: 30, setups: ["Boardroom"] },
        ];

        for (const hall of halls) {
            await prisma.conferenceHall.upsert({
                where: { slug: hall.slug },
                update: { ...hall, setups: hall.setups as any },
                create: { ...hall, setups: hall.setups as any }
            });
        }

        return NextResponse.json({ success: true, message: "Seed completed!" });
    } catch (error: any) {
        console.error('API Seed Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
