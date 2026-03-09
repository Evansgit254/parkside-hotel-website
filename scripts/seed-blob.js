// scripts/seed-blob.js
// Run this ONCE after Vercel Blob is set up to upload your initial data.
// Usage: node scripts/seed-blob.js

require('dotenv').config({ path: '.env.local' });
const { put } = require('@vercel/blob');
const fs = require('fs');
const path = require('path');

async function seed() {
    const dataPath = path.join(__dirname, '../src/data/site-data.json');
    const data = fs.readFileSync(dataPath, 'utf-8');

    const result = await put('site-data.json', data, {
        access: 'public',
        addRandomSuffix: false
    });

    console.log('✅ Data seeded to Vercel Blob!');
    console.log('📍 Blob URL:', result.url);
}

seed().catch(err => {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
});
