// @ts-nocheck
/**
 * seed-postgres.ts
 * 
 * One-time script to migrate all data from site-data.json into PostgreSQL.
 * 
 * Usage:
 *   1. Set DATABASE_URL in .env.local
 *   2. Run: npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/seed-postgres.ts
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool, Client } from "pg";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        throw new Error("DATABASE_URL is not set");
    }

    console.log("🔌 Connecting to production database via pg...");
    const pool = new Pool({ connectionString, ssl: true });

    const dataPath = path.join(process.cwd(), "src/data/site-data.json");
    const raw = fs.readFileSync(dataPath, "utf-8");
    const data = JSON.parse(raw);

    console.log("🌱 Seeding Parkside Villa database...\n");

    try {
        // 1. Hero Images
        console.log("→ Seeding hero images...");
        for (let i = 0; i < (data.heroImages || []).length; i++) {
            await pool.query(
                'INSERT INTO "HeroImage" (url, "order") VALUES ($1, $2) ON CONFLICT (url) DO UPDATE SET "order" = $2',
                [data.heroImages[i], i]
            );
        }
        console.log(`  ✓ ${data.heroImages?.length ?? 0} hero images`);

        // 2. Rooms
        console.log("→ Seeding rooms...");
        for (const room of data.rooms || []) {
            await pool.query(
                'INSERT INTO "Room" (id, slug, name, "desc", price, image, tag, capacity) VALUES ($1, $1, $2, $3, $4, $5, $6, $7) ON CONFLICT (slug) DO UPDATE SET name = $2, "desc" = $3, price = $4, image = $5, tag = $6, capacity = $7',
                [room.id, room.name, room.desc, room.price, room.image, room.tag ?? null, room.capacity ?? 2]
            );
        }
        console.log(`  ✓ ${data.rooms?.length ?? 0} rooms`);

        // 3. Facilities
        console.log("→ Seeding facilities...");
        for (const facility of data.facilities || []) {
            await pool.query(
                'INSERT INTO "Facility" (id, title, "desc", icon, image, features, highlights) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (id) DO UPDATE SET title = $2, "desc" = $3, icon = $4, image = $5, features = $6, highlights = $7',
                [
                    facility.id,
                    facility.title,
                    facility.desc,
                    facility.icon,
                    facility.image ?? null,
                    JSON.stringify(facility.features || []),
                    JSON.stringify(facility.highlights || [])
                ]
            );
        }
        console.log(`  ✓ ${data.facilities?.length ?? 0} facilities`);

        // 4. Testimonials
        console.log("→ Seeding testimonials...");
        for (const t of data.testimonials || []) {
            await pool.query(
                'INSERT INTO "Testimonial" (id, name, title, text, status) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO UPDATE SET name = $2, title = $3, text = $4, status = $5',
                [t.id, t.name, t.title, t.text, t.status ?? "Active"]
            );
        }
        console.log(`  ✓ ${data.testimonials?.length ?? 0} testimonials`);

        // 5. Menu Categories
        console.log("→ Seeding menu categories...");
        for (let i = 0; i < (data.menuCategories || []).length; i++) {
            const cat = data.menuCategories[i];
            await pool.query(
                'INSERT INTO "MenuCategory" (id, name, items, "order") VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO UPDATE SET name = $2, items = $3, "order" = $4',
                [cat.id, cat.name, JSON.stringify(cat.items || []), i]
            );
        }
        console.log(`  ✓ ${data.menuCategories?.length ?? 0} menu categories`);

        // 6. Contact Info
        console.log("→ Seeding contact info...");
        if (data.contactInfo) {
            await pool.query(
                'INSERT INTO "ContactInfo" (id, phone, email, whatsapp, address, social) VALUES (1, $1, $2, $3, $4, $5) ON CONFLICT (id) DO UPDATE SET phone = $1, email = $2, whatsapp = $3, address = $4, social = $5',
                [
                    data.contactInfo.phone ?? "",
                    data.contactInfo.email ?? "",
                    data.contactInfo.whatsapp ?? null,
                    data.contactInfo.address ?? "",
                    JSON.stringify(data.contactInfo.social ?? {})
                ]
            );
            console.log("  ✓ Contact info");
        }

        // 7. Blog Posts
        console.log("→ Seeding blog posts...");
        for (const post of data.blogPosts || []) {
            await pool.query(
                'INSERT INTO "BlogPost" (id, title, excerpt, content, date, author, category, image) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (id) DO UPDATE SET title = $2, excerpt = $3, content = $4, date = $5, author = $6, category = $7, image = $8',
                [post.id, post.title, post.excerpt ?? "", post.content ?? "", post.date ?? new Date().toISOString().split("T")[0], post.author ?? "Parkside Villa", post.category ?? "Uncategorized", post.image ?? ""]
            );
        }
        console.log(`  ✓ ${data.blogPosts?.length ?? 0} blog posts`);

        console.log("\n✅ Database seeded successfully via raw SQL!");
    } catch (err) {
        console.error("❌ Seed error:", err);
    } finally {
        await pool.end();
    }
}

main().catch(console.error);
