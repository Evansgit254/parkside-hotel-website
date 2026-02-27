const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
require('dotenv').config();

async function test() {
    console.log('--- Database Connection Test ---');
    const connectionString = process.env.DATABASE_URL;
    console.log('DATABASE_URL:', connectionString ? 'Detected' : 'MISSING');

    if (!connectionString) return;

    try {
        const pool = new Pool({ connectionString });
        console.log('Attempting pool connection...');
        const client = await pool.connect();
        console.log('Pool connected successfully!');
        client.release();

        const adapter = new PrismaPg(pool);
        const prisma = new PrismaClient({ adapter });

        console.log('Attempting Prisma query...');
        const count = await prisma.room.count();
        console.log('Prisma query success! Room count:', count);

        await prisma.$disconnect();
        await pool.end();
    } catch (err) {
        console.error('Test Failed:', err);
    }
}

test();
