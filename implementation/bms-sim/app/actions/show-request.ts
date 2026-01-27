'use server'

import prisma from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createShowRequest(formData: FormData) {
    const movieId = parseInt(formData.get('movieId') as string)
    const theaterId = parseInt(formData.get('theaterId') as string)
    const dateStr = formData.get('date') as string
    const timeStr = formData.get('time') as string

    // Combine date and time
    const startDateTime = new Date(`${dateStr}T${timeStr}`)

    const request = await prisma.showRequest.create({
        data: {
            movieId,
            theaterId,
            date: new Date(dateStr),
            startTime: startDateTime,
            minParticipants: 20,
            status: 'PENDING',
        },
    })

    redirect('/requests')
}

export async function joinShowRequest(requestId: number, userId: string) {
    // 1. Check if already joined
    const existing = await prisma.showRequestParticipant.findUnique({
        where: {
            requestId_userId: {
                requestId,
                userId,
            },
        },
    })

    if (existing) {
        return { success: false, message: 'Already joined' }
    }

    // 2. Add participant
    await prisma.showRequestParticipant.create({
        data: {
            requestId,
            userId,
        },
    })

    // 3. Check threshold
    const request = await prisma.showRequest.findUnique({
        where: { id: requestId },
        include: { participants: true },
    })

    if (!request) return { success: false, message: 'Request not found' }

    if (request.status === 'PENDING' && request.participants.length >= request.minParticipants) {
        // Threshold met!
        // a. Update status
        await prisma.showRequest.update({
            where: { id: requestId },
            data: { status: 'CONFIRMED' },
        })

        // b. Find a screen in the theater (simplification: pick first screen)
        const screen = await prisma.screen.findFirst({
            where: { theaterId: request.theaterId },
        })

        if (screen) {
            // c. Create the actual Show
            await prisma.show.create({
                data: {
                    movieId: request.movieId,
                    screenId: screen.id,
                    startTime: request.startTime,
                },
            })
        }
    }

    revalidatePath(`/requests/${requestId}`)
    return { success: true }
}

export async function getShowRequests() {
    return await prisma.showRequest.findMany({
        include: {
            movie: true,
            theater: true,
            _count: {
                select: { participants: true },
            },
        },
        orderBy: { createdAt: 'desc' },
    })
}

export async function getShowRequest(id: number) {
    return await prisma.showRequest.findUnique({
        where: { id },
        include: {
            movie: true,
            theater: true,
            participants: true,
        },
    })
}
