import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const prisma = new PrismaClient();

async function main() {
    const categories = await prisma.menuCategory.findMany({
        orderBy: { order: 'asc' }
    });
    console.log(`Found ${categories.length} categories:`);
    categories.forEach(c => console.log(`- ${c.name} (ID: ${c.id}, Order: ${c.order})`));
}

main().finally(() => prisma.$disconnect());
