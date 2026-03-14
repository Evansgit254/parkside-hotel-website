import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('--- Deleting Incorrect Hero Images ---')
  
  const deleted78 = await prisma.heroImage.delete({
    where: { id: 78 }
  }).catch(e => {
    console.log('ID 78 already gone or error:', e.message)
    return null
  })
  if (deleted78) console.log('Deleted ID 78:', deleted78.url)

  const deleted77 = await prisma.heroImage.delete({
    where: { id: 77 }
  }).catch(e => {
    console.log('ID 77 already gone or error:', e.message)
    return null
  })
  if (deleted77) console.log('Deleted ID 77:', deleted77.url)

  const remaining = await prisma.heroImage.findMany()
  console.log('--- Remaining Hero Images ---')
  console.log(JSON.stringify(remaining, null, 2))
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
