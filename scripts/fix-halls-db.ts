import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateHalls() {
    console.log("🚀 Starting Conference Hall migration...");

    try {
        // 1. Get current halls
        const halls = await prisma.conferenceHall.findMany();

        // Helper to find specific halls
        const findHall = (namePart: string) => halls.find(h => h.name.includes(namePart));

        const amboseliNzambani = findHall("Amboseli & Nzambani");
        const syokimauHighrise = findHall("Syokimau & Highrise");

        // 2. Separate Amboseli & Nzambani
        if (amboseliNzambani) {
            console.log("→ Splitting Amboseli & Nzambani...");
            // Update the existing one to be just Amboseli
            await prisma.conferenceHall.update({
                where: { id: amboseliNzambani.id },
                data: {
                    name: "Amboseli Hall",
                    slug: "amboseli-hall"
                }
            });
            // Create Nzambani
            await prisma.conferenceHall.create({
                data: {
                    name: "Nzambani Hall",
                    slug: "nzambani-hall",
                    desc: amboseliNzambani.desc,
                    image: amboseliNzambani.image,
                    capacity: amboseliNzambani.capacity,
                    setups: amboseliNzambani.setups || []
                }
            });
        }

        // 3. Separate Syokimau & Highrise
        if (syokimauHighrise) {
            console.log("→ Splitting Syokimau & Highrise...");
            // Update the existing one to be just Syokimau
            await prisma.conferenceHall.update({
                where: { id: syokimauHighrise.id },
                data: {
                    name: "Syokimau Hall",
                    slug: "syokimau-hall"
                }
            });
            // Create Highrise
            await prisma.conferenceHall.create({
                data: {
                    name: "Highrise Hall",
                    slug: "highrise-hall",
                    desc: syokimauHighrise.desc,
                    image: syokimauHighrise.image,
                    capacity: syokimauHighrise.capacity,
                    setups: syokimauHighrise.setups || []
                }
            });
        }

        // 4. Add Longonot Hall if it doesn't exist
        const longonot = findHall("Longonot");
        if (!longonot) {
            console.log("→ Adding Longonot Hall...");
            await prisma.conferenceHall.create({
                data: {
                    name: "Longonot Hall",
                    slug: "longonot-hall",
                    desc: "A premium M.I.C.E facility designed for high-level corporate engagements and team orientations.",
                    image: "https://res.cloudinary.com/dizwm3mic/image/upload/v1772373676/parkside-villa-media/EXTRA_PHOTOS/IMG_8551_mbm7db.jpg",
                    capacity: 80,
                    setups: ["Theatre", "Classroom", "U-Shape"]
                }
            });
        }

        // 5. Clean up names of existing halls if they don't have "Hall"
        const remainingHalls = await prisma.conferenceHall.findMany();
        for (const hall of remainingHalls) {
            if (!hall.name.endsWith("Hall")) {
                console.log(`→ Appending 'Hall' to ${hall.name}...`);
                await prisma.conferenceHall.update({
                    where: { id: hall.id },
                    data: { name: `${hall.name} Hall` }
                });
            }
        }

        console.log("✅ Migration complete!");
    } catch (error) {
        console.error("❌ Migration failed:", error);
    } finally {
        await prisma.$disconnect();
    }
}

migrateHalls();
