import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as dotenv from "dotenv";

dotenv.config();

async function testUpdate() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        console.error("❌ DATABASE_URL is not set");
        return;
    }

    console.log("🔌 Connecting to database...");
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter } as any);

    try {
        console.log("🧐 Fetching first menu category...");
        const category = await prisma.menuCategory.findFirst();

        if (!category) {
            console.log("ℹ️ No categories found to test update.");
            return;
        }

        console.log(`📝 Attempting to update category: ${category.name} (${category.id})...`);

        const res = await prisma.menuCategory.update({
            where: { id: category.id },
            data: {
                name: category.name + " (Test Update)",
                items: category.items || []
            }
        });

        console.log("✅ Update successful!");

        // Revert change
        console.log("🔄 Reverting change...");
        await prisma.menuCategory.update({
            where: { id: category.id },
            data: { name: category.name }
        });
        console.log("✅ Revert successful!");

    } catch (error: any) {
        console.error("❌ Database test failed!");
        console.error("Error Name:", error.name);
        console.error("Error Message:", error.message);
        if (error.code) console.error("Error Code:", error.code);
        if (error.meta) console.error("Error Meta:", JSON.stringify(error.meta, null, 2));
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}

testUpdate();
