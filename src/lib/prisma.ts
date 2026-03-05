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

    // During build or production, we MUST limit connections per worker and increase timeout
    // Next.js uses multiple workers (e.g. 7-10) which can quickly exhaust Neon's free tier (10-20 connections total)
    if (process.env.NODE_ENV === "production") {
        const urlParams = new URL(url.replace("postgresql://", "http://")); // dummy protocol for URL parser

        // Ensure connection_limit is low (2) for each worker
        urlParams.searchParams.set("connection_limit", "2");

        // Increase connect_timeout for Neon cold starts (15s)
        urlParams.searchParams.set("connect_timeout", "15");

        // Increase pool_timeout for busy builds
        urlParams.searchParams.set("pool_timeout", "60");

        url = url.split("?")[0] + "?" + urlParams.searchParams.toString();
    }

    return new PrismaClient({
        datasources: url ? { db: { url } } : undefined,
        log: ["warn", "error"],
    });
}

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
