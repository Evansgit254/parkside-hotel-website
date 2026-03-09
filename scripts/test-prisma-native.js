const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

async function test() {
    console.log('Testing native Prisma connection...');
    const prisma = new PrismaClient({
        log: ['query', 'error', 'warn'],
    });

    try {
        console.log('Connecting...');
        const count = await prisma.room.count();
        console.log('Room count:', count);
    } catch (err) {
        console.error('Connection failed:', err);
    } finally {
        await prisma.$disconnect();
    }
}

test();
