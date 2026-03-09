
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const facilities = await prisma.facility.findMany();
        const halls = await prisma.conferenceHall.findMany();
        const siteContent = await prisma.siteContent.findMany();

        console.log('--- FACILITIES ---');
        console.log(JSON.stringify(facilities, null, 2));
        console.log('--- CONFERENCE HALLS ---');
        console.log(JSON.stringify(halls, null, 2));
        console.log('--- SITE CONTENT ---');
        console.log(JSON.stringify(siteContent, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
