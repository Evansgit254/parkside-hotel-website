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

    // Apply stability settings for all environments to handle Neon cold starts and idle timeouts
    if (url && (url.startsWith("postgresql://") || url.startsWith("postgres://"))) {
        const urlParams = new URL(url.replace(/^postgres(ql)?:\/\//, "http://"));

        // Ensure connection_limit is manageable (2 for prod workers, 5 for dev)
        const limit = process.env.NODE_ENV === "production" ? "10" : "5";
        urlParams.searchParams.set("connection_limit", limit);

        // Increase connect_timeout for Neon cold starts (20s) - helps with 'Closed' errors on wake
        urlParams.searchParams.set("connect_timeout", "20");

        // Increase pool_timeout for busy builds/renders
        urlParams.searchParams.set("pool_timeout", "120");

        url = url.split("?")[0] + "?" + urlParams.searchParams.toString();
    }

    return new PrismaClient({
        datasources: url ? { db: { url } } : undefined,
        log: ["warn", "error"],
    });
}

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
