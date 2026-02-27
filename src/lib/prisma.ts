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
    const connectionString = process.env.DATABASE_URL;
    const isConfigured = isDatabaseConfigured();

    console.log(`[Prisma] Connection state: ${connectionString ? 'detected' : 'MISSING'}`);
    console.log(`[Prisma] isDatabaseConfigured: ${isConfigured}`);

    if (!isConfigured || !connectionString) {
        console.warn("⚠️ DATABASE_URL not configured. Falling back to static data.");
        const fallbackPool = new Pool({
            connectionString: "postgresql://localhost/no_db",
            password: "none"
        });
        const adapter = new PrismaPg(fallbackPool);
        return new PrismaClient({ adapter } as any);
    }

    // Robust Pool initialization for Neon/SCRAM
    try {
        const url = new URL(connectionString);
        const poolConfig: any = {
            user: url.username,
            password: decodeURIComponent(url.password),
            host: url.hostname,
            port: url.port ? parseInt(url.port) : 5432,
            database: url.pathname.slice(1),
            max: 1,
            ssl: connectionString.includes('sslmode=verify-full')
                ? { rejectUnauthorized: true }
                : connectionString.includes('sslmode=require') || connectionString.includes('sslmode=true')
                    ? { rejectUnauthorized: false }
                    : false
        };

        console.log(`[Prisma] Manual parse success for host: ${poolConfig.host}`);

        const pool = new Pool(poolConfig);
        const adapter = new PrismaPg(pool);
        return new PrismaClient({ adapter } as any);
    } catch (parseError) {
        console.error("[Prisma] Failed to manually parse connection string:", parseError);
        // Fallback to driver parsing if manual fails
        const pool = new Pool({ connectionString, max: 1 });
        const adapter = new PrismaPg(pool);
        return new PrismaClient({ adapter } as any);
    }
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
