import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ASSET_BASE = '/hero-assets/';

async function main() {
    console.log('🚀 Starting CMS Media Population...');

    // 1. Hero Images
    console.log('→ Updating Hero Sliders...');
    const heroAssets = [
        'front_1.webp', 'front_2.webp', 'front_3.webp',
        'front_4.webp', 'front_5.webp', 'pool_night.webp'
    ];

    // Clear existing heroes and add new ones for a fresh high-res look
    await prisma.heroImage.deleteMany({});
    for (let i = 0; i < heroAssets.length; i++) {
        await prisma.heroImage.create({
            data: {
                url: ASSET_BASE + heroAssets[i],
                order: i
            }
        });
    }

    // 2. Rooms
    console.log('→ Updating Room Categories...');
    // Executive Rooms
    await prisma.room.updateMany({
        where: { slug: { contains: 'executive' } },
        data: {
            image: ASSET_BASE + 'room_exec_luxury.webp',
            images: [
                ASSET_BASE + 'room_exec_1.webp',
                ASSET_BASE + 'room_exec_2.webp',
                ASSET_BASE + 'room_exec_3.webp',
                ASSET_BASE + 'room_suite.webp'
            ]
        }
    });

    // Deluxe Rooms
    await prisma.room.updateMany({
        where: { slug: { contains: 'deluxe' } },
        data: {
            image: ASSET_BASE + 'room_deluxe_luxury.webp',
            images: [
                ASSET_BASE + 'room_deluxe.webp',
                ASSET_BASE + 'room_deluxe_2.webp',
                ASSET_BASE + 'room_deluxe_3.webp'
            ]
        }
    });

    // Standard Rooms
    await prisma.room.updateMany({
        where: { slug: { contains: 'standard' } },
        data: {
            image: ASSET_BASE + 'room_standard_1.webp',
            images: [
                ASSET_BASE + 'room_standard_2.webp'
            ]
        }
    });

    // Cottages
    await prisma.room.updateMany({
        where: { slug: { contains: 'cottage' } },
        data: {
            image: ASSET_BASE + 'cottage_1.webp',
            images: [
                ASSET_BASE + 'cottage_view.webp'
            ]
        }
    });

    // 3. Facilities
    console.log('→ Updating Facilities...');
    // Pool
    await prisma.facility.updateMany({
        where: { title: { contains: 'Pool' } },
        data: {
            image: ASSET_BASE + 'pool_wide.webp',
            images: [
                ASSET_BASE + 'facility_pool_1.webp',
                ASSET_BASE + 'facility_pool_2.webp',
                ASSET_BASE + 'pool_side.webp'
            ]
        }
    });

    // Playground
    await prisma.facility.updateMany({
        where: { title: { contains: 'Play' } },
        data: {
            image: ASSET_BASE + 'facility_playground_1.webp',
            images: [
                ASSET_BASE + 'facility_playground_2.webp'
            ]
        }
    });

    // 4. Dining & Bar
    console.log('→ Updating Dining Venues...');
    // VIP Lounge
    await prisma.diningVenue.updateMany({
        where: { slug: 'vip-lounge' },
        data: {
            image: ASSET_BASE + 'lounge_luxury.webp',
            images: [
                ASSET_BASE + 'lounge_1.webp',
                ASSET_BASE + 'vip_lounge.webp',
                ASSET_BASE + 'vip_lounge_detail.webp',
                ASSET_BASE + 'vip_lounge_3.webp'
            ]
        }
    });

    // Open Bar & Restaurant
    await prisma.diningVenue.updateMany({
        where: { slug: 'open-bar-restaurant' },
        data: {
            image: ASSET_BASE + 'dining_hall.webp',
            images: [
                ASSET_BASE + 'dining_setup.webp',
                ASSET_BASE + 'dining_luxury_1.webp',
                ASSET_BASE + 'dining_luxury_2.webp',
                ASSET_BASE + 'facility_dining_1.webp',
                ASSET_BASE + 'food_nyama_choma.webp',
                ASSET_BASE + 'food_breakfast.webp',
                ASSET_BASE + 'food_chicken.webp'
            ]
        }
    });

    // 5. Conferences
    console.log('→ Updating Conference Halls...');
    await prisma.conferenceHall.updateMany({
        data: {
            image: ASSET_BASE + 'conference_hall_1.webp',
            images: [
                ASSET_BASE + 'conference_hall_2.webp',
                ASSET_BASE + 'conference_1.webp',
                ASSET_BASE + 'facility_conference_1.webp'
            ]
        }
    });

    console.log('✅ CMS Media Population Complete!');
}

main()
    .catch(e => { console.error(e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
