import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export function isDatabaseConfigured() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) return false;

    // Check for valid protocol
    if (!connectionString.startsWith('postgresql://') &&
        !connectionString.startsWith('mysql://') &&
        !connectionString.startsWith('mongodb://') &&
        !connectionString.startsWith('file:')) {
        return false;
    }

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

    let url = process.env.DATABASE_URL || "";

    // During build, we want to limit connections per worker and increase timeout
    // Next.js often uses multiple workers (e.g. 7) which can quickly exhaust a DB pool
    if (process.env.NODE_ENV === "production" && !url.includes("connection_limit=")) {
        const separator = url.includes("?") ? "&" : "?";
        url = `${url}${separator}connection_limit=2&pool_timeout=60`;
    }

    return new PrismaClient({
        datasources: url ? { db: { url } } : undefined,
        log: ["error", "warn"],
    });
}

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
