
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import Redis from 'ioredis'

const prisma = new PrismaClient()
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379')

// Helper to simulate network delay (even with this, locking should save us!)
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { userId, seatIds, showId, simulateFailure } = body

        if (!userId || !seatIds || !showId) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
        }

        // ---------------------------------------------------------
        // THE SECURE LOGIC (Redis Distributed Locking)
        // ---------------------------------------------------------

        const locks: string[] = []

        // 1. Acquire Locks for ALL seats first
        // Strategy: "All or Nothing". If we fail to lock one, we must release others.
        try {
            for (const seatId of seatIds) {
                const lockKey = `lock:seat:${showId}:${seatId}`

                // SET key "locked" NX (Only if Not eXists) EX 600 (Expire in 10 mins)
                // This is Atomic. Only one request will succeed.
                const acquired = await redis.set(lockKey, userId, 'NX', 'EX', 600)

                if (!acquired) {
                    // Check who holds the lock (for better error messages)
                    const holder = await redis.get(lockKey)
                    throw new Error(`Seat ${seatId} is already held by ${holder === userId ? 'you' : 'someone else'}`)
                }

                locks.push(lockKey)
            }
        } catch (lockError: any) {
            // Rollback: Release any locks we acquired before the failure
            for (const lockKey of locks) {
                await redis.del(lockKey)
            }
            return NextResponse.json({ error: lockError.message }, { status: 409 })
        }

        // 2. Double Check DB (Optimistic Locking Layer 2)
        // Even if we have the Redis lock, the seat might be permanently booked in DB 
        // from a previous completed transaction (where Redis lock was deleted).
        const existingBookings = await prisma.bookingSeat.findMany({
            where: {
                seatId: { in: seatIds },
                booking: {
                    showId: showId,
                    status: 'CONFIRMED'
                }
            }
        })

        if (existingBookings.length > 0) {
            // Release locks and fail
            for (const lockKey of locks) await redis.del(lockKey)
            return NextResponse.json({ error: 'Seat already permanently booked' }, { status: 410 })
        }

        // 3. Simulate processing time (Payment Gateway, etc)
        // Even with 2 seconds delay, the lock protects us!
        await sleep(500)

        if (simulateFailure) {
            for (const lockKey of locks) await redis.del(lockKey) // Release lock explicitly on error
            return NextResponse.json({ error: 'Payment Failed (Simulated)' }, { status: 402 })
        }

        // 4. Create Booking in DB
        try {
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

            // 5. Release Locks? 
            // Option A: Keep locks until the show starts (if users can't cancel)
            // Option B: Delete locks now because DB has the record (Standard)
            // We will delete them because the DB is now the source of truth.
            for (const lockKey of locks) {
                await redis.del(lockKey)
            }

            return NextResponse.json({ success: true, bookingId: booking.id, message: 'Booked successfully (Secure)' })

        } catch (dbError) {
            // If DB write fails, MUST release locks so others can try
            for (const lockKey of locks) await redis.del(lockKey)
            throw dbError
        }

    } catch (error) {
        console.error('Booking failed:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
