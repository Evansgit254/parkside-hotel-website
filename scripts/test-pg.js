const { Pool } = require('pg');
require('dotenv').config();

async function test() {
    const connectionString = process.env.DATABASE_URL;
    console.log('Testing connection with string:', connectionString.split('@')[1]);

    const pool = new Pool({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('Connecting...');
        const client = await pool.connect();
        console.log('Connected! Querying...');
        const res = await client.query('SELECT current_database(), current_user');
        console.log('Result:', res.rows[0]);
        client.release();
    } catch (err) {
        console.error('Connection failed:', err);
    } finally {
        await pool.end();
    }
}

test();
