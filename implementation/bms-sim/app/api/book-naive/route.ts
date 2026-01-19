
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Helper to simulate slow DB/Network (widens the race condition window)
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { userId, seatIds, showId } = body

        if (!userId || !seatIds || !showId) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
        }

        // ---------------------------------------------------------
        // THE NAIVE LOGIC (Contains Race Condition)
        // ---------------------------------------------------------

        // 1. Fetch current status of seats
        // PROBLEM: Multiples request do this at the same time and see "AVAILABLE"
        const seats = await prisma.seat.findMany({
            where: {
                id: { in: seatIds },
                bookings: {
                    some: {
                        booking: {
                            showId: showId,
                            status: 'CONFIRMED'
                        }
                    }
                }
            }
        })

        // If any seat is found in a CONFIRMED booking, it's taken.
        // However, we only checked committed data. In a race, this check passes for everyone.
        if (seats.length > 0) {
            return NextResponse.json({ error: 'One or more seats are already booked' }, { status: 409 })
        }

        // 2. Artificial Delay (Simulate complex validation/pricing calculation)
        // This makes the race condition easy to reproduce locally.
        await sleep(200)

        // 3. Create Booking
        // PROBLEM: Multiple confirmed bookings will be created for the same seat
        const booking = await prisma.booking.create({
            data: {
                userId,
                showId,
                status: 'CONFIRMED',
                seats: {
                    create: seatIds.map((seatId: number) => ({
                        seat: { connect: { id: seatId } }
                    }))
                }
            }
        })

        return NextResponse.json({ success: true, bookingId: booking.id, message: 'Booked successfully (Naive)' })

    } catch (error) {
        console.error('Booking failed:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
