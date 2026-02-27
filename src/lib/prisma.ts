import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as dotenv from "dotenv";

dotenv.config();

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

export function isDatabaseConfigured() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) return false;

    // Check for common placeholders
    const placeholders = [
        "USER:PASSWORD",
        "localhost/placeholder",
        "HOST:PORT",
        "YOUR_CONNECTION_STRING",
        "@HOST:",
        ":5432/"
    ];

    return !placeholders.some(p => connectionString.includes(p));
}

function createPrismaClient() {
    if (!isDatabaseConfigured()) {
        console.warn("⚠️ DATABASE_URL is not configured or using placeholder values. Prisma queries will fallback to static data in server actions.");
        // We still return a client so imports don't break, but actions will avoid calling it
        const pool = new Pool({ connectionString: "postgresql://localhost/placeholder" });
        const adapter = new PrismaPg(pool);
        return new PrismaClient({ adapter } as any);
    }

    const connectionString = process.env.DATABASE_URL;

    // For Neon/Vercel, we often need to ensure the pool handles the connection string correctly
    const pool = new Pool({
        connectionString,
        max: 1 // Keep it low for serverless/pooled environments
    });

    const adapter = new PrismaPg(pool);
    return new PrismaClient({ adapter } as any);
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
