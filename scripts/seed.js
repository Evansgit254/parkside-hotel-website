const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Starting Master Seed (Native Mode)...');

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
            highlights: ["International and local Kamba cuisine", "Over 50 wine selections & single malts", "Traditional English afternoon teas", "Signature indoor barbeque", "24-hour room service"]
        },
        {
            id: "pool", title: "Swimming Pool & Gardens", icon: "Waves",
            desc: "Relax in our central swimming pool or unwind in the lush gardens and kids zone.",
            image: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&q=80&w=2070",
            features: ["Swimming Pool", "Kids Zone", "Lush Gardens"],
            highlights: ["Dedicated children's activities area", "Extensive relaxation gardens", "Poolside service and bar", "Ample and secure parking space", "Pool Tables for recreation"]
        }
    ];
    for (const facility of facilities) {
        await prisma.facility.upsert({ where: { id: facility.id }, update: facility, create: facility });
    }

    // 5. TESTIMONIALS
    const testimonials = [
        { name: "David Musyoka", title: "Business Traveler", text: "The Executive Suite was beyond my expectations. The blend of modern comfort with the serene Kitui atmosphere made my business trip feel like a vacation.", status: "Active" },
        { name: "Sarah Wanjiku", title: "Event Coordinator", text: "Best conference facilities in the region. The staff were professional, and the food was absolutely divine. Highly recommend for corporate events.", status: "Active" }
    ];
    for (const t of testimonials) {
        await prisma.testimonial.create({ data: t });
    }

    // 6. DINING MENU
    const categories = [
        {
            id: "starters", name: "Starters", order: 1,
            items: [
                { name: "Villa House Salad", desc: "Fresh organic greens, cherry tomatoes, cucumbers, and avocado with lemon vinaigrette.", price: "12" },
                { name: "Creamy Garden Soup", desc: "Seasonal vegetables blended with fresh cream and herbs, served with garlic bread.", price: "10" }
            ]
        },
        {
            id: "mains", name: "Main Course", order: 2,
            items: [
                { name: "Pan-Seared Tilapia", desc: "Local tilapia fillet with coconut ginger sauce, steamed rice, and sautéed greens.", price: "25" }
            ]
        }
    ];
    for (const cat of categories) {
        await prisma.menuCategory.upsert({ where: { id: cat.id }, update: cat, create: cat });
    }

    // 7. BLOG POSTS
    const posts = [
        {
            id: "luxury-kitui-hospitality", title: "Exploring Luxury in the Heart of Kitui",
            excerpt: "Discover how Parkside Villa is redefining hospitality in the region with modern amenities and traditional charm.",
            content: "Full content here...", date: "2026-02-24", author: "Admin", category: "Hospitality",
            image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&q=80&w=1000"
        }
    ];
    for (const post of posts) {
        await prisma.blogPost.upsert({ where: { id: post.id }, update: post, create: post });
    }

    // 8. GALLERY
    const galleryItems = [
        { url: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1000", type: "image", title: "Luxury Entrance", order: 1 },
        { url: "https://www.youtube.com/embed/dQw4w9WgXcQ", type: "video", title: "Virtual Tour", order: 2 }
    ];
    for (const item of galleryItems) {
        await prisma.galleryItem.create({ data: item });
    }

    // 9. PROMOTIONS
    const promotions = [
        { code: "SUMMER20", discount: 20, type: "percentage", title: "Summer Special", description: "Enjoy 20% off all bookings this summer!", validTo: new Date("2026-08-31") }
    ];
    for (const p of promotions) {
        await prisma.promotion.upsert({ where: { code: p.code }, update: p, create: p });
    }

    // 10. CONTACT INFO
    await prisma.contactInfo.upsert({
        where: { id: 1 },
        update: {
            phone: "+254 700 000000", email: "info@parksidevillakitui.com", address: "Parkside Villa, Kitui - Kenya",
            social: { facebook: "https://facebook.com/parksidevillakitui", instagram: "https://instagram.com/parksidevillakitui" }
        },
        create: {
            id: 1, phone: "+254 700 000000", email: "info@parksidevillakitui.com", address: "Parkside Villa, Kitui - Kenya",
            social: { facebook: "https://facebook.com/parksidevillakitui", instagram: "https://instagram.com/parksidevillakitui" }
        }
    });

    // 11. SITE CONTENT (CMS)
    const siteContent = [
        {
            key: "landing_hero",
            value: {
                badge: "Refining Hospitality Since 2005", title: "Parkside Villa Kitui",
                subtitle: "An oasis of tranquility in the heart of Kenya. Discover luxury accommodation, world-class conference facilities, and exceptional dining.",
                cta1: "#accommodation", cta2: "#conference"
            }
        },
        {
            key: "brand_quote",
            value: { text: "Luxury is the ease of supreme quality — in every detail, in every moment, in every interaction.", author: "— The Parkside Villa Philosophy" }
        }
    ];
    for (const cnt of siteContent) {
        await prisma.siteContent.upsert({ where: { key: cnt.key }, update: { value: cnt.value }, create: { key: cnt.key, value: cnt.value } });
    }

    console.log('✅ Master Seed Completed!');
}

main()
    .catch((e) => { console.error('❌ Seed Failed:', e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
