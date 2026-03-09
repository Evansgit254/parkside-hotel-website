const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function seedMedia() {
    const mediaDataPath = path.join(__dirname, '..', 'uploaded_media.json');
    if (!fs.existsSync(mediaDataPath)) {
        console.error('uploaded_media.json not found!');
        process.exit(1);
    }

    const mediaData = JSON.parse(fs.readFileSync(mediaDataPath, 'utf8'));

    console.log('Clearing existing gallery items...');
    await prisma.galleryItem.deleteMany({});

    const galleryItems = [];

    for (const [folder, files] of Object.entries(mediaData)) {
        // Map folder names to more readable titles/categories if needed
        files.forEach((file, index) => {
            galleryItems.push({
                url: file.url,
                type: 'image', // We'll update this if we have videos in the future
                title: `${folder} - ${file.originalName}`,
                order: index
            });
        });
    }

    console.log(`Seeding ${galleryItems.length} gallery items...`);

    // Use createMany for efficiency if supported, or loop
    // PostgreSQL supports createMany
    await prisma.galleryItem.createMany({
        data: galleryItems,
        skipDuplicates: true,
    });

    console.log('Seeding complete!');
}

seedMedia()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
