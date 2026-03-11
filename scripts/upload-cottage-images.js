const cloudinary = require('cloudinary').v2;
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

// Configure Cloudinary from CLOUDINARY_URL env var
// CLOUDINARY_URL format: cloudinary://API_KEY:API_SECRET@CLOUD_NAME
const cloudUrl = process.env.CLOUDINARY_URL;
if (cloudUrl) {
    const match = cloudUrl.match(/cloudinary:\/\/(\d+):([^@]+)@(.+)/);
    if (match) {
        cloudinary.config({
            cloud_name: match[3],
            api_key: match[1],
            api_secret: match[2]
        });
    }
}

const prisma = new PrismaClient();

const imagePaths = [
    '/home/evans/.gemini/antigravity/brain/b22114be-da8d-4e1b-9fc0-0ea3d239fbb3/media__1773256586834.jpg',
    '/home/evans/.gemini/antigravity/brain/b22114be-da8d-4e1b-9fc0-0ea3d239fbb3/media__1773256587332.jpg',
    '/home/evans/.gemini/antigravity/brain/b22114be-da8d-4e1b-9fc0-0ea3d239fbb3/media__1773256587507.jpg',
];

async function main() {
    console.log('📸 Uploading cottage images to Cloudinary...');

    const uploadedUrls = [];
    for (let i = 0; i < imagePaths.length; i++) {
        const result = await cloudinary.uploader.upload(imagePaths[i], {
            folder: 'parkside-villa-media/Cottages',
            resource_type: 'image'
        });
        console.log(`  ✓ Uploaded image ${i + 1}: ${result.secure_url}`);
        uploadedUrls.push(result.secure_url);
    }

    console.log('\n🔄 Updating cottages room in database...');

    // Use the bedroom (canopy bed) as the main image, and all 3 as gallery
    const mainImage = uploadedUrls[2]; // bedroom with canopy bed

    const updated = await prisma.room.update({
        where: { slug: 'cottages' },
        data: {
            image: mainImage,
            images: uploadedUrls
        }
    });

    console.log(`  ✓ Updated room: ${updated.name}`);
    console.log(`    Main image: ${mainImage}`);
    console.log(`    Gallery images: ${uploadedUrls.length}`);
    console.log('\n✅ Done!');
}

main()
    .catch(e => {
        console.error('Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
