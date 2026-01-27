
import prisma from '../lib/db'
import { joinShowRequest } from '../app/actions/show-request'

async function main() {
    console.log('Starting verification simulation...')

    // 1. Setup Data
    const movie = await prisma.movie.create({
        data: {
            title: 'Simulation Movie',
            description: 'Test Description',
            duration: 120,
        }
    })

    const theater = await prisma.theater.create({
        data: {
            name: 'Simulation Theater',
            location: 'Test Location',
        }
    })

    // Create a screen for the theater
    const screen = await prisma.screen.create({
        data: {
            number: 1,
            theaterId: theater.id,
        }
    })

    const request = await prisma.showRequest.create({
        data: {
            movieId: movie.id,
            theaterId: theater.id,
            date: new Date(),
            startTime: new Date(),
            minParticipants: 20,
            status: 'PENDING',
        }
    })

    console.log(`Created Request ID: ${request.id}`)

    // 2. Simulate 20 joins
    for (let i = 1; i <= 20; i++) {
        const userId = `sim-user-${i}`
        try {
            await joinShowRequest(request.id, userId)
        } catch (e: any) {
            if (e.message.includes('NEXT_REDIRECT') || e.message.includes('headers') || e.message.includes('invariant')) {
                // Expected error due to revalidatePath outside of request context
            } else {
                // Ignoring revalidatePath error
            }
        }
        process.stdout.write('.')
    }
    console.log('\nFinished joining.')

    // 3. Verify Result
    const updatedRequest = await prisma.showRequest.findUnique({
        where: { id: request.id },
        include: { participants: true }
    })

    console.log(`Request Status: ${updatedRequest?.status}`)
    console.log(`Participants: ${updatedRequest?.participants.length}`)

    if (updatedRequest?.status === 'CONFIRMED' && updatedRequest.participants.length === 20) {
        console.log('SUCCESS: Request is confirmed.')
    } else {
        console.error('FAILURE: Request status or count is wrong.')
    }

    // Check if Show was created
    const show = await prisma.show.findFirst({
        where: {
            movieId: movie.id,
            screenId: screen.id,
        }
    })

    if (show) {
        console.log(`SUCCESS: Show created with ID ${show.id}`)
    } else {
        console.error('FAILURE: Show was not created.')
    }

    // Cleanup
    await prisma.showRequestParticipant.deleteMany({ where: { requestId: request.id } })
    await prisma.showRequest.delete({ where: { id: request.id } })
    await prisma.show.deleteMany({ where: { movieId: movie.id } })
    await prisma.screen.delete({ where: { id: screen.id } })
    await prisma.movie.delete({ where: { id: movie.id } })
    await prisma.theater.delete({ where: { id: theater.id } })
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
