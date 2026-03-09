
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
    try {
        const contents = await prisma.siteContent.findMany();
        console.log('--- Full SiteContent Diagnostics ---');
        contents.forEach(c => {
            console.log(`Key: [${c.key}]`);
            console.log(`Value: ${JSON.stringify(c.value, null, 2)}`);
            console.log(`Length: ${JSON.stringify(c.value).length}`);
            console.log('-------------------');
        });
    } catch (error) {
        console.error('Diagnostic error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

check();
