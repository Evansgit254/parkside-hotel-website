import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log("--- STARTING SYNC AUDIT ---")

    // 1. Check Rooms
    const rooms = await prisma.room.findMany()
    console.log(`\n[ROOMS] Found ${rooms.length} rooms:`)
    rooms.forEach(r => console.log(` - ID: ${r.id} | Slug: ${r.slug} | Name: ${r.name}`))

    // 2. Check SiteContent (CMS Keys)
    const content = await prisma.siteContent.findMany()
    console.log(`\n[CMS CONTENT] Found ${content.length} keys:`)
    const keys = content.map(c => c.key)
    console.log(keys.join(", "))

    // 3. Specific Key Check for Navigation
    const navMain = content.find(c => c.key === "nav_main")
    console.log("\n[NAVIGATION - MAIN]")
    console.log(JSON.stringify(navMain?.value, null, 2))

    const navAcc = content.find(c => c.key === "nav_accommodation")
    console.log("\n[NAVIGATION - ACCOMMODATION]")
    console.log(JSON.stringify(navAcc?.value, null, 2))

    // 4. Hero Images Check
    const heros = ["rooms_hero", "facilities_hero", "dining_hero", "blog_hero"]
    console.log("\n[HERO IMAGES]")
    heros.forEach(h => {
        const found = content.find(c => c.key === h)
        console.log(` - ${h}: ${found ? "PRESENT" : "MISSING"}`)
    })

    console.log("\n--- SYNC AUDIT COMPLETE ---")
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect()
    })
