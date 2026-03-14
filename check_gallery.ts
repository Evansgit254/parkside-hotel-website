import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const heroImages = await prisma.heroImage.findMany()
  const galleryItems = await prisma.galleryItem.findMany({
    include: { category: true }
  })
  
  console.log('--- Hero Images ---')
  console.log(JSON.stringify(heroImages, null, 2))
  
  console.log('--- Gallery Items ---')
  console.log(JSON.stringify(galleryItems, null, 2))
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
