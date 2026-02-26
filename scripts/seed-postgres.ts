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
import { Pool } from "pg";

function getPrisma() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString || connectionString.includes("USER:PASSWORD")) {
        console.warn("⚠️ DATABASE_URL not configured. Seeding may fail.");
        return new PrismaClient();
    }
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    return new PrismaClient({ adapter } as any);
}

const prisma = getPrisma();

async function main() {
    const dataPath = path.join(process.cwd(), "src/data/site-data.json");
    const raw = fs.readFileSync(dataPath, "utf-8");
    const data = JSON.parse(raw);

    console.log("🌱 Seeding Parkside Villa database...\n");

    // 1. Hero Images
    console.log("→ Seeding hero images...");
    for (let i = 0; i < (data.heroImages || []).length; i++) {
        await prisma.heroImage.upsert({
            where: { url: data.heroImages[i] },
            update: {},
            create: { url: data.heroImages[i], order: i },
        });
    }
    console.log(`  ✓ ${data.heroImages?.length ?? 0} hero images`);

    // 2. Rooms
    console.log("→ Seeding rooms...");
    for (const room of data.rooms || []) {
        await prisma.room.upsert({
            where: { slug: room.id },
            update: {},
            create: {
                slug: room.id,
                name: room.name,
                desc: room.desc,
                price: room.price,
                image: room.image,
                tag: room.tag ?? null,
                capacity: room.capacity ?? 2,
            },
        });
    }
    console.log(`  ✓ ${data.rooms?.length ?? 0} rooms`);

    // 3. Facilities
    console.log("→ Seeding facilities...");
    for (const facility of data.facilities || []) {
        await prisma.facility.upsert({
            where: { id: facility.id },
            update: {},
            create: {
                id: facility.id,
                title: facility.title,
                desc: facility.desc,
                icon: facility.icon,
                image: facility.image ?? null,
                features: facility.features ?? [],
                highlights: facility.highlights ?? [],
            },
        });
    }
    console.log(`  ✓ ${data.facilities?.length ?? 0} facilities`);

    // 4. Testimonials
    console.log("→ Seeding testimonials...");
    for (const t of data.testimonials || []) {
        await prisma.testimonial.upsert({
            where: { id: t.id },
            update: {},
            create: {
                id: t.id,
                name: t.name,
                title: t.title,
                text: t.text,
                status: t.status ?? "Active",
            },
        });
    }
    console.log(`  ✓ ${data.testimonials?.length ?? 0} testimonials`);

    // 5. Menu Categories
    console.log("→ Seeding menu categories...");
    for (let i = 0; i < (data.menuCategories || []).length; i++) {
        const cat = data.menuCategories[i];
        await prisma.menuCategory.upsert({
            where: { id: cat.id },
            update: {},
            create: {
                id: cat.id,
                name: cat.name,
                items: cat.items ?? [],
                order: i,
            },
        });
    }
    console.log(`  ✓ ${data.menuCategories?.length ?? 0} menu categories`);

    // 6. Contact Info
    console.log("→ Seeding contact info...");
    if (data.contactInfo) {
        await prisma.contactInfo.upsert({
            where: { id: 1 },
            update: {},
            create: {
                id: 1,
                phone: data.contactInfo.phone ?? "",
                email: data.contactInfo.email ?? "",
                whatsapp: data.contactInfo.whatsapp ?? null,
                address: data.contactInfo.address ?? "",
                social: data.contactInfo.social ?? {},
            },
        });
        console.log("  ✓ Contact info");
    }

    // 7. Blog Posts
    console.log("→ Seeding blog posts...");
    for (const post of data.blogPosts || []) {
        await prisma.blogPost.upsert({
            where: { id: post.id },
            update: {},
            create: {
                id: post.id,
                title: post.title,
                excerpt: post.excerpt ?? "",
                content: post.content ?? "",
                date: post.date ?? new Date().toISOString().split("T")[0],
                author: post.author ?? "Parkside Villa",
                category: post.category ?? "Uncategorized",
                image: post.image ?? "",
            },
        });
    }
    console.log(`  ✓ ${data.blogPosts?.length ?? 0} blog posts`);

    // 8. Promotions
    console.log("→ Seeding promotions...");
    for (const promo of data.promotions || []) {
        await prisma.promotion.upsert({
            where: { code: promo.code },
            update: {},
            create: {
                code: promo.code,
                discount: promo.discount ?? 0,
                type: promo.type ?? "percentage",
                validFrom: promo.validFrom ? new Date(promo.validFrom) : null,
                validTo: promo.validTo ? new Date(promo.validTo) : null,
            },
        });
    }
    console.log(`  ✓ ${data.promotions?.length ?? 0} promotions`);

    // 9. Subscribers
    console.log("→ Seeding subscribers...");
    for (const email of data.subscribers || []) {
        await prisma.subscriber.upsert({
            where: { email },
            update: {},
            create: { email },
        });
    }
    console.log(`  ✓ ${data.subscribers?.length ?? 0} subscribers`);

    // 10. Users
    console.log("→ Seeding users...");
    const bcrypt = require("bcrypt");
    for (const user of data.users || []) {
        if (!user.email) continue;
        const exists = await prisma.user.findUnique({ where: { email: user.email } });
        if (!exists) {
            const hashedPassword = await bcrypt.hash(user.password ?? "changeme123", 10);
            await prisma.user.create({
                data: {
                    name: user.name ?? "Guest",
                    email: user.email,
                    password: hashedPassword,
                },
            });
        }
    }
    console.log(`  ✓ ${data.users?.length ?? 0} users`);

    console.log("\n✅ Database seeded successfully!");
}

main()
    .catch((e) => {
        console.error("❌ Seed error:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
