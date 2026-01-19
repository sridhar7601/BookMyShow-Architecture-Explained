
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // 1. Create a Movie
  const movie = await prisma.movie.create({
    data: {
      title: 'Avengers: Secret Wars',
      description: 'The ultimate marvel showdown.',
      duration: 180,
      genre: 'Action',
      posterUrl: 'https://placehold.co/400x600',
    },
  })
  console.log(`Created movie: ${movie.title} (ID: ${movie.id})`)

  // 2. Create a Theater
  const theater = await prisma.theater.create({
    data: {
      name: 'PVR: Grand Cinema',
      location: 'Mumbai',
    },
  })

  // 3. Create a Screen
  const screen = await prisma.screen.create({
    data: {
      number: 1,
      theaterId: theater.id,
    },
  })

  // 4. Create 100 Seats (10 Rows x 10 Columns)
  // Rows A-J, Numbers 1-10
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']
  const seatsData = []

  for (const row of rows) {
    for (let number = 1; number <= 10; number++) {
      seatsData.push({
        screenId: screen.id,
        row,
        number,
        type: row === 'A' ? 'VIP' : 'STANDARD', // First row VIP
        priceModifier: row === 'A' ? 2.0 : 1.0,
      })
    }
  }

  await prisma.seat.createMany({ data: seatsData })
  console.log(`Created ${seatsData.length} seats for Screen ${screen.number}`)

  // 5. Create a Show
  const show = await prisma.show.create({
    data: {
      movieId: movie.id,
      screenId: screen.id,
      startTime: new Date(new Date().setHours(20, 0, 0, 0)), // Tonight 8 PM
    },
  })
  console.log(`Created show for ${movie.title} at ${show.startTime}`)
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
