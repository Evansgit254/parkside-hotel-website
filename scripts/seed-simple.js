const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Starting Seed...');
    try {
        const count = await prisma.room.count();
        console.log('Current rooms:', count);

        // Add a test room
        const room = await prisma.room.upsert({
            where: { slug: 'test-room' },
            update: {},
            create: {
                slug: 'test-room',
                name: 'Test Room',
                desc: 'A test room',
                price: '100',
                image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427'
            }
        });
        console.log('Upserted test room:', room.slug);
    } catch (e) {
        console.error('Seed Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
