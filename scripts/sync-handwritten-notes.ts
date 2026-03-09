import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('--- STARTING DATABASE SYNC WITH HANDWRITTEN NOTES ---')

    // 1. Update Contact Info
    console.log('Updating Contact Info...')
    await prisma.contactInfo.upsert({
        where: { id: 1 },
        update: {
            phone: "+254 701023026",
            email: "info@parksidevillakitui.com",
            address: "P.O. Box 675-90200, Kitui",
            social: {
                facebook: "https://facebook.com/parksidevillakitui",
                instagram: "https://instagram.com/parksidevillakitui",
                linkedin: "https://linkedin.com/company/parksidevillakitui",
                tiktok: "https://tiktok.com/@parksidevillakitui",
                whatsapp: "https://wa.me/254701023026"
            }
        },
        create: {
            id: 1,
            phone: "+254 701023026",
            email: "info@parksidevillakitui.com",
            address: "P.O. Box 675-90200, Kitui",
            social: {
                facebook: "https://facebook.com/parksidevillakitui",
                instagram: "https://instagram.com/parksidevillakitui",
                linkedin: "https://linkedin.com/company/parksidevillakitui",
                tiktok: "https://tiktok.com/@parksidevillakitui",
                whatsapp: "https://wa.me/254701023026"
            }
        }
    })

    // 2. Update Dining Facility Features
    console.log('Updating Dining Facility Features...')
    await prisma.facility.updateMany({
        where: { id: "dining" },
        data: {
            title: "Dining & Bars",
            features: [
                "Open Bar and Restaurant",
                "VIP Lounge",
                "Board room",
                "Coffee garden suite"
            ]
        }
    })

    // 3. Update Conference Hall Naming
    console.log('Updating Conference Hall Naming...')
    const halls = await prisma.conferenceHall.findMany()
    for (const hall of halls) {
        if (hall.name.toLowerCase().includes('masai mara')) {
            await prisma.conferenceHall.update({
                where: { id: hall.id },
                data: { name: "Maasai Mara Hall" }
            })
        }
        if (hall.name.toLowerCase().includes('nzambani') || hall.name.toLowerCase().includes('zambani')) {
            await prisma.conferenceHall.update({
                where: { id: hall.id },
                data: { name: "Nzambani Hall" }
            })
        }
    }

    console.log('--- SYNC COMPLETED SUCCESSFULLY ---')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
