const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    // Seed Longonot Hall
    const existing = await prisma.conferenceHall.findUnique({ where: { slug: 'longonot-hall' } });
    if (!existing) {
        await prisma.conferenceHall.create({
            data: {
                slug: 'longonot-hall',
                name: 'Longonot Hall',
                desc: 'A versatile conference space perfect for medium-sized corporate meetings, team building events, and intimate conferences. Named after the iconic Mt. Longonot, this hall offers a commanding atmosphere for productive gatherings.',
                image: '',
                images: [],
                capacity: 80,
                setups: ['Theater', 'Boardroom', 'Classroom', 'U-Shape'],
            }
        });
        console.log('✅ Longonot Hall created');
    } else {
        console.log('⏭️  Longonot Hall already exists');
    }

    // Seed Dining Venues
    const venues = [
        {
            slug: 'vip-lounge',
            name: 'VIP Lounge',
            desc: 'An exclusive private lounge for distinguished guests, offering premium beverages and personalized service in an intimate, luxurious setting.',
            image: '',
            images: [],
            features: ['Premium Drinks Selection', 'Private Seating', 'Personalized Service', 'Ambient Lighting'],
            hours: 'Open Daily: 10:00 AM - 11:00 PM',
        },
        {
            slug: 'open-bar-restaurant',
            name: 'Open Bar & Restaurant',
            desc: 'Our signature dining experience featuring an open-air bar and restaurant with a diverse menu of local and international cuisine, complemented by an extensive selection of fine wines and spirits.',
            image: '',
            images: [],
            features: ['Al Fresco Dining', 'Live Music Nights', 'Craft Cocktails', 'International Cuisine'],
            hours: 'Open Daily: 7:00 AM - 11:00 PM',
        },
    ];

    for (const venue of venues) {
        const exists = await prisma.diningVenue.findUnique({ where: { slug: venue.slug } });
        if (!exists) {
            await prisma.diningVenue.create({ data: venue });
            console.log(`✅ ${venue.name} created`);
        } else {
            console.log(`⏭️  ${venue.name} already exists`);
        }
    }

    console.log('\n🎉 Seeding complete!');
}

main()
    .catch(e => { console.error(e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
