import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export function isDatabaseConfigured() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) return false;

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
        return new PrismaClient();
    }

    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    return new PrismaClient({
        adapter,
        log: ["error", "warn"],
    });
}

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
