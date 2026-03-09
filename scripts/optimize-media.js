const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const TARGET_DIR = path.join(__dirname, '..', 'public', 'hero-assets');

// Create target directory if it doesn't exist
if (!fs.existsSync(TARGET_DIR)) {
    fs.mkdirSync(TARGET_DIR, { recursive: true });
}

async function optimizeImage(sourcePath, outputName) {
    const outputPath = path.join(TARGET_DIR, outputName + '.webp');

    try {
        const image = sharp(sourcePath);
        const metadata = await image.metadata();

        console.log(`Optimizing: ${path.basename(sourcePath)} (${(fs.statSync(sourcePath).size / 1024 / 1024).toFixed(2)} MB)`);

        // Target: High Resolution, ~1MB size
        // We cap width at 3840px (4K) and use quality 75 for optimal performance
        await image
            .resize({ width: 3840, withoutEnlargement: true })
            .webp({ quality: 75, effort: 6 })
            .toFile(outputPath);

        const stats = fs.statSync(outputPath);
        console.log(`  -> Saved to: ${outputName}.webp (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
    } catch (err) {
        console.error(`  !! Error optimizing ${sourcePath}:`, err.message);
    }
}

const imagesToOptimize = [
    // Original 5
    { path: 'public/PARKSIDE VILLA MEDIA/Front Image Or Background Image/0I2A0040.JPG', name: '0I2A0040' },
    { path: 'public/PARKSIDE VILLA MEDIA/Front Image Or Background Image/0I2A0041.JPG', name: '0I2A0041' },
    { path: 'public/PARKSIDE VILLA MEDIA/Front Image Or Background Image/0I2A0042.JPG', name: '0I2A0042' },
    { path: 'public/PARKSIDE VILLA MEDIA/Front Image Or Background Image/0I2A0051.JPG', name: '0I2A0051' },
    { path: 'public/PARKSIDE VILLA MEDIA/Front Image Or Background Image/1.JPG', name: '1' },

    // Swimming Pool
    { path: 'public/PARKSIDE VILLA MEDIA/Swimming Pool/20220214_123451.jpg', name: 'pool_wide' },
    { path: 'public/PARKSIDE VILLA MEDIA/Swimming Pool/20220214_115739.jpg', name: 'pool_side' },
    { path: 'public/PARKSIDE VILLA MEDIA/Swimming Pool/WhatsApp Image 2025-10-19 at 5.15.17 PM.jpeg', name: 'pool_night' },

    // Accommodation
    { path: 'public/PARKSIDE VILLA MEDIA/Accommodation/Executive Rooms/IMG_9093.JPG', name: 'room_deluxe' },
    { path: 'public/PARKSIDE VILLA MEDIA/Accommodation/Executive Rooms/_MG_0735.jpg', name: 'room_suite' },

    // Dining
    { path: 'public/PARKSIDE VILLA MEDIA/Dining and Restaurant/IMG_8559.JPG', name: 'dining_hall' },
    { path: 'public/PARKSIDE VILLA MEDIA/Dining and Restaurant/20220607_122451.jpg', name: 'dining_setup' },

    // Conference
    { path: 'public/PARKSIDE VILLA MEDIA/Conference Halls/Syokimau/IMG_5910.JPG', name: 'conference_hall_1' },
    { path: 'public/PARKSIDE VILLA MEDIA/Conference Halls/Syokimau/IMG_5928.JPG', name: 'conference_hall_2' },

    // Bar & Lounge
    { path: 'public/PARKSIDE VILLA MEDIA/Bar/_MG_0638.jpg', name: 'bar_area' },
    { path: 'public/PARKSIDE VILLA MEDIA/VIP LOUNGE/lounge.jpg', name: 'vip_lounge' },
    { path: 'public/PARKSIDE VILLA MEDIA/VIP LOUNGE/_MG_0758.jpg', name: 'vip_lounge_detail' },

    // Extra variety
    { path: 'public/PARKSIDE VILLA MEDIA/Front Image Or Background Image/3.JPG', name: 'front_3' },
    { path: 'public/PARKSIDE VILLA MEDIA/Swimming Pool/20220214_124019.jpg', name: 'playground' },
    { path: 'public/PARKSIDE VILLA MEDIA/VIP LOUNGE/_MG_0761.jpg', name: 'vip_lounge_3' },

    // New Front & Back Expansion (March 9)
    { path: 'public/PARKSIDE VILLA MEDIA/Front Image Or Background Image/1.JPG', name: 'front_1' },
    { path: 'public/PARKSIDE VILLA MEDIA/Front Image Or Background Image/2.JPG', name: 'front_2' },
    { path: 'public/PARKSIDE VILLA MEDIA/Front Image Or Background Image/4.jpg', name: 'front_4' },
    { path: 'public/PARKSIDE VILLA MEDIA/Front Image Or Background Image/5.JPG', name: 'front_5' },
    { path: 'public/PARKSIDE VILLA MEDIA/Accommodation/High Rise/IMG_9201.JPG', name: 'back_view_1' },
    { path: 'public/PARKSIDE VILLA MEDIA/Accommodation/High Rise/IMG_9206.JPG', name: 'back_view_2' },
    { path: 'public/PARKSIDE VILLA MEDIA/Accommodation/High Rise/IMG_9207.JPG', name: 'back_view_3' },

    // Accommodation Variety (March 9)
    { path: 'public/PARKSIDE VILLA MEDIA/Accommodation/Executive Rooms/IMG_9094.JPG', name: 'room_exec_1' },
    { path: 'public/PARKSIDE VILLA MEDIA/Accommodation/Executive Rooms/IMG_9098.JPG', name: 'room_exec_2' },
    { path: 'public/PARKSIDE VILLA MEDIA/Accommodation/Executive Rooms/IMG_9101.JPG', name: 'room_exec_3' },
    { path: 'public/PARKSIDE VILLA MEDIA/Accommodation/Executive Rooms/_MG_0776.jpg', name: 'room_exec_luxury' },
    { path: 'public/PARKSIDE VILLA MEDIA/Accommodation/Deluxe Rooms/IMG_9118.JPG', name: 'room_deluxe_2' },
    { path: 'public/PARKSIDE VILLA MEDIA/Accommodation/Deluxe Rooms/IMG_9125.JPG', name: 'room_deluxe_3' },
    { path: 'public/PARKSIDE VILLA MEDIA/Accommodation/Deluxe Rooms/_MG_0803.jpg', name: 'room_deluxe_luxury' },
    { path: 'public/PARKSIDE VILLA MEDIA/Accommodation/Standard premiums/IMG_9133.JPG', name: 'room_standard_1' },
    { path: 'public/PARKSIDE VILLA MEDIA/Accommodation/Standard premiums/IMG_9134.JPG', name: 'room_standard_2' },
    { path: 'public/PARKSIDE VILLA MEDIA/Accommodation/Cottages/IMG_9155.JPG', name: 'cottage_1' },
    { path: 'public/PARKSIDE VILLA MEDIA/Accommodation/Cottages/IMG_9191.JPG', name: 'cottage_view' },

    // Facilities & Recreation (March 9)
    { path: 'public/PARKSIDE VILLA MEDIA/Swimming Pool/20220214_122732.jpg', name: 'facility_pool_1' },
    { path: 'public/PARKSIDE VILLA MEDIA/Swimming Pool/20220214_115739.jpg', name: 'facility_pool_2' },
    { path: 'public/PARKSIDE VILLA MEDIA/Pool Table/IMG_9049.JPG', name: 'facility_pool_table' },
    { path: 'public/PARKSIDE VILLA MEDIA/Play Ground/0I2A0052.JPG', name: 'facility_playground_1' },
    { path: 'public/PARKSIDE VILLA MEDIA/Swimming Pool/20220214_124019.jpg', name: 'facility_playground_2' },

    // Dining and Restaurant (March 9)
    { path: 'public/PARKSIDE VILLA MEDIA/Dining and Restaurant/IMG_8562.JPG', name: 'facility_dining_1' },
    { path: 'public/PARKSIDE VILLA MEDIA/Eateries and drinks/nyam chom.jpg', name: 'food_nyama_choma' },
    { path: 'public/PARKSIDE VILLA MEDIA/Eateries and drinks/breakfast.jpg', name: 'food_breakfast' },
    { path: 'public/PARKSIDE VILLA MEDIA/Eateries and drinks/chicken.jpg', name: 'food_chicken' },
    { path: 'public/PARKSIDE VILLA MEDIA/Eateries and drinks/juice.jpg', name: 'food_juice' },
    { path: 'public/PARKSIDE VILLA MEDIA/Eateries and drinks/IMG_9253.JPG', name: 'dining_luxury_1' },
    { path: 'public/PARKSIDE VILLA MEDIA/Eateries and drinks/IMG_9271.JPG', name: 'dining_luxury_2' },

    // Bar and Lounge (March 9)
    { path: 'public/PARKSIDE VILLA MEDIA/Bar/_MG_0638.jpg', name: 'bar_1' },
    { path: 'public/PARKSIDE VILLA MEDIA/Bar/_MG_3163.jpg', name: 'bar_2' },
    { path: 'public/PARKSIDE VILLA MEDIA/Bar/_MG_3166.jpg', name: 'bar_3' },
    { path: 'public/PARKSIDE VILLA MEDIA/VIP LOUNGE/lounge.jpg', name: 'lounge_1' },
    { path: 'public/PARKSIDE VILLA MEDIA/VIP LOUNGE/_MG_0762.jpg', name: 'lounge_luxury' },

    // Events and Conferences (March 9)
    { path: 'public/PARKSIDE VILLA MEDIA/Conference Halls/Syokimau/IMG_5914.JPG', name: 'conference_1' },
    { path: 'public/PARKSIDE VILLA MEDIA/Events/IMG-20251021-WA0131.jpg', name: 'event_wedding_1' },
    { path: 'public/PARKSIDE VILLA MEDIA/Events/IMG-20251021-WA0183.jpg', name: 'event_wedding_2' },
    { path: 'public/PARKSIDE VILLA MEDIA/Events/IMG-20251021-WA0187.jpg', name: 'event_decor' }
];

async function run() {
    console.log('--- Starting Media Optimization ---');
    for (const img of imagesToOptimize) {
        const fullPath = path.join(__dirname, '..', img.path);
        if (fs.existsSync(fullPath)) {
            await optimizeImage(fullPath, img.name);
        } else {
            console.warn(`  !! Source not found: ${img.path}`);
        }
    }
    console.log('--- Optimization Complete ---');
}

run();
