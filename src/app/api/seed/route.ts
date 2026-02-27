import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    console.log('🚀 Starting API Seed...');

    try {
        // 2. HERO IMAGES
        const heroImages = [
            "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&q=80&w=2080",
            "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&q=80&w=2070",
            "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=2070"
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
                price: "150", image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=2024",
                tag: "Best Seller", capacity: 2
            },
            {
                id: "deluxe-suites", slug: "deluxe-suites", name: "Deluxe Suites",
                desc: "Peaceful views focused on comfort and elegance with modern amenities.",
                price: "120", image: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&q=80&w=2074",
                capacity: 2
            },
            {
                id: "highrise-suites", slug: "highrise-suites", name: "Highrise Suites",
                desc: "Panoramic views of the surroundings with elevated luxury and elegant design.",
                price: "100", image: "https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&q=80&w=2074",
                capacity: 4
            },
            {
                id: "cottages", slug: "cottages", name: "Cottages",
                desc: "Feature backyard balconies, high-speed Wi-Fi, television, and hot showers. Designed for extra privacy and groups.",
                price: "200", image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=2070",
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
                desc: "Modern M.I.C.E facilities with high-speed internet. Amboseli, Nzambani, Syokimau, Highrise, and Masai Mara halls.",
                image: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&q=80&w=2069",
                features: ["Amboseli & Nzambani Halls", "Syokimau & Highrise Halls", "Masai Mara Hall"],
                highlights: ["Theatre, U-shape & Classroom setups", "Corporate meetings & Team building", "Curated environment for groups", "High-speed connectivity and support", "Weddings & private parties"]
            },
            {
                id: "dining", title: "Dining & Bars", icon: "Utensils",
                desc: "A culinary journey featuring the Main Restaurant, VIP Lounge, and Open Bar & Restaurant.",
                image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=2070",
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
                { url: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1000", type: "image", title: "Luxury Entrance", order: 1 },
                { url: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&q=80&w=1000", type: "image", title: "Poolside Zen", order: 2 },
                { url: "https://www.youtube.com/embed/dQw4w9WgXcQ", type: "video", title: "Virtual Tour", order: 3 }
            ]
        });

        // 9. PROMOTIONS
        await prisma.promotion.upsert({
            where: { code: "SUMMER20" },
            update: { discount: 20, type: "percentage", validTo: new Date("2026-08-31") },
            create: { code: "SUMMER20", discount: 20, type: "percentage", validTo: new Date("2026-08-31") }
        });

        return NextResponse.json({ success: true, message: "Seed completed!" });
    } catch (error: any) {
        console.error('API Seed Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
