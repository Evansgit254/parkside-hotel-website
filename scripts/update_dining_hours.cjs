const { PrismaClient } = require('@prisma/client');

async function main() {
    const prisma = new PrismaClient();
    try {
        // Update contact_section hours
        const contactSection = await prisma.siteContent.findUnique({
            where: { key: 'contact_section' }
        });

        if (contactSection) {
            const value = contactSection.value;
            value.hours = "Reception 24/7 · Dining 24/7";
            await prisma.siteContent.update({
                where: { key: 'contact_section' },
                data: { value }
            });
            console.log("Updated contact_section hours in database.");
        }

        // Update concierge_messages dining message
        const conciergeMessages = await prisma.siteContent.findUnique({
            where: { key: 'concierge_messages' }
        });

        if (conciergeMessages) {
            const value = conciergeMessages.value;
            if (value.dining) {
                value.dining = value.dining.replace("Available from 06:00 to 23:00.", "Available 24/7.");
                await prisma.siteContent.update({
                    where: { key: 'concierge_messages' },
                    data: { value }
                });
                console.log("Updated concierge_messages dining message in database.");
            }
        }

    } catch (e) {
        console.error("Error updating database:", e.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
