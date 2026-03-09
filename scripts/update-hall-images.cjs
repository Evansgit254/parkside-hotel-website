const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log('--- UPDATING CONFERENCE HALL IMAGES ---')

    const updates = [
        { name: 'Amboseli Hall', image: '/PARKSIDE VILLA MEDIA/Conference Halls/Amboseli/IMG_5940.JPG' },
        { name: 'Nzambani Hall', image: '/PARKSIDE VILLA MEDIA/Conference Halls/Nzambani/IMG_5902.JPG' },
        { name: 'Syokimau Hall', image: '/PARKSIDE VILLA MEDIA/Conference Halls/Syokimau/IMG_5910.JPG' },
        { name: 'Maasai Mara Hall', image: '/PARKSIDE VILLA MEDIA/Conference Halls/Masaai Mara/20220322_132804.jpg' },
        { name: 'Highrise Hall', image: '/PARKSIDE VILLA MEDIA/Conference Halls/Boardroom/IMG_5848.JPG' },
        { name: 'Longonot Hall', image: '/PARKSIDE VILLA MEDIA/Conference Halls/Longonot/IMG_5825.JPG' },
    ]

    for (const update of updates) {
        const hall = await prisma.conferenceHall.findFirst({
            where: { name: { contains: update.name.replace(' Hall', '') } }
        })

        if (hall) {
            console.log(`Updating ${hall.name} with unique image...`)
            await prisma.conferenceHall.update({
                where: { id: hall.id },
                data: { image: update.image }
            })
        } else {
            console.warn(`Could not find hall: ${update.name}`)
        }
    }

    console.log('--- UPDATE COMPLETED ---')
}

main().catch(console.error).finally(() => prisma.$disconnect())
