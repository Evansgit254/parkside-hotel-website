
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config();

async function run() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL not found');
    process.exit(1);
  }

  const pool = new Pool({ connectionString, ssl: true });

  try {
    const social = {
      facebook: "https://www.facebook.com/ParksideVilla/",
      instagram: "https://www.instagram.com/kituiparksidevilla/",
      tiktok: "https://www.tiktok.com/@parkside.villa.kitui",
      whatsapp: "https://wa.me/254701023026"
    };

    console.log('Force updating social links in DB...');
    await pool.query(
      'UPDATE "ContactInfo" SET social = $1 WHERE id = 1',
      [JSON.stringify(social)]
    );
    console.log('SUCCESS: Social links updated.');
  } catch (err: any) {
    console.error('ERROR:', err.message);
  } finally {
    await pool.end();
  }
}

run();
