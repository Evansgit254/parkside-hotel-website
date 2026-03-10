const { PrismaClient } = require('@prisma/client');

async function main() {
    const prisma = new PrismaClient();
    try {
        const contactInfo = await prisma.contactInfo.findUnique({ where: { id: 1 } });
        if (contactInfo) {
            console.log("Current phone:", contactInfo.phone);
            const updated = await prisma.contactInfo.update({
                where: { id: 1 },
                data: {
                    phone: "+254 701 023 026",
                    whatsapp: "254701023026",
                }
            });
            console.log("Updated phone:", updated.phone);
            console.log("SUCCESS: Contact info updated in database.");
        } else {
            console.log("No contact info found with id=1");
        }
    } catch (e) {
        console.error("Error:", e.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
