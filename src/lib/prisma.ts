import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

function createPrismaClient() {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
        // During build time / no DB configured — return a client that will throw on actual queries
        console.warn("DATABASE_URL not set. Prisma client may fail at query time.");
        const pool = new Pool({ connectionString: "postgresql://localhost/placeholder" });
        const adapter = new PrismaPg(pool);
        return new PrismaClient({ adapter } as any);
    }

    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    return new PrismaClient({ adapter } as any);
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
