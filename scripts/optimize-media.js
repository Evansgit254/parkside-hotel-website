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
    { path: 'public/PARKSIDE VILLA MEDIA/Front Image Or Background Image/3.JPG', name: 'exterior_gate' },
    { path: 'public/PARKSIDE VILLA MEDIA/Swimming Pool/20220214_124019.jpg', name: 'playground' },
    { path: 'public/PARKSIDE VILLA MEDIA/VIP LOUNGE/_MG_0761.jpg', name: 'vip_lounge_3' }
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
