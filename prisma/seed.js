const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  // Create Cats
  const cats = ['Mikina', 'Bublina', 'Ferda']
  for (const name of cats) {
    await prisma.cat.upsert({
      where: { name },
      update: {},
      create: {
        name,
        currentLocation: 'Home',
        photoUrl: `/images/${name.toLowerCase()}.jpg` // Placeholder
      },
    })
  }

  // Create Users with nicknames
  const users = [
    { username: 'tomas', nickname: 'Tomáš' },
    { username: 'lukas', nickname: 'Lukáš' },
    { username: 'matyas', nickname: 'Matyáš' },
    { username: 'honza', nickname: 'Honza' },
    { username: 'martina', nickname: 'Martina' }
  ]
  // Pre-calculated hash for 'Abc12345' to avoid bcryptjs dependency in seed script
  const passwordHash = '$2b$10$AI57DW7pNQ32HMMxy2tCzuDXrZBKnIm3YE4Ic7DMshwnE3KPkrQWa'

  for (const user of users) {
    await prisma.user.upsert({
      where: { username: user.username },
      update: { nickname: user.nickname },
      create: {
        username: user.username,
        nickname: user.nickname,
        passwordHash,
      },
    })
  }

  console.log('Seeding finished.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
