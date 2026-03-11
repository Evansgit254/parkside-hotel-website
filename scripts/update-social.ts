import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    try {
        const updated = await prisma.contactInfo.upsert({
            where: { id: 1 },
            update: {
                social: {
                    facebook: "https://www.facebook.com/ParksideVilla/",
                    instagram: "https://www.instagram.com/kituiparksidevilla/",
                    linkedin: "https://linkedin.com/company/parksidevillakitui",
                    tiktok: "https://www.tiktok.com/@parkside.villa.kitui",
                    whatsapp: "https://wa.me/254701023026"
                }
            },
            create: {
                id: 1,
                phone: "+254 701 023 026",
                email: "info@parksidevillakitui.com",
                address: "Parkside Villa, Kitui - Kenya",
                social: {
                    facebook: "https://www.facebook.com/ParksideVilla/",
                    instagram: "https://www.instagram.com/kituiparksidevilla/",
                    linkedin: "https://linkedin.com/company/parksidevillakitui",
                    tiktok: "https://www.tiktok.com/@parkside.villa.kitui",
                    whatsapp: "https://wa.me/254701023026"
                }
            }
        });
        console.log('Successfully updated contact info social links:', updated.social);
    } catch (error) {
        console.error('Error updating contact info:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
