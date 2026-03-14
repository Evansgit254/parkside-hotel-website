
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
    try {
        console.log('--- ContactInfo Diagnostics ---');
        const contact = await prisma.contactInfo.findUnique({ where: { id: 1 } });
        console.log(JSON.stringify(contact, null, 2));

        console.log('\n--- DiningVenue Diagnostics ---');
        const venues = await prisma.diningVenue.findMany();
        venues.forEach(v => {
            console.log(`Venue: ${v.name}`);
            console.log(`Slug: ${v.slug}`);
            // Check if there are any hidden fields or if the name contains something weird
        });
    } catch (error) {
        console.error('Diagnostic error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

check();
