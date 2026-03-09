import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const content = await prisma.siteContent.findMany()
    console.log('--- SITE CONTENT DUMP ---')
    content.forEach(row => {
        console.log(`Key: ${row.key}`)
        console.log(`Value: ${JSON.stringify(row.value, null, 2)}`)
        console.log('---')
    })
}

main().catch(console.error).finally(() => prisma.$disconnect())
