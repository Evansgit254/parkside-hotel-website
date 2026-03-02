import { PrismaClient } from "@prisma/client";

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
    ];

    return !placeholders.some(p => connectionString.includes(p));
}

function createPrismaClient() {
    if (!isDatabaseConfigured()) {
        return new PrismaClient();
    }

    return new PrismaClient({
        log: ["error", "warn"],
    });
}

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
