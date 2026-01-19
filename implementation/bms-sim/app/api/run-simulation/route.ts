
import { NextResponse } from 'next/server'

// Helper to make internal API calls
const BASE_URL = 'http://localhost:3000'

async function runConcurrentRequests(endpoint: string, count: number, payloadBase: any): Promise<any[]> {
    const requests = []
    for (let i = 0; i < count; i++) {
        const userId = `sim-user-${Date.now()}-${i}`
        requests.push(
            fetch(`${BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...payloadBase, userId })
            }).then(async (res) => ({
                userId,
                status: res.status,
                data: await res.json()
            })).catch(err => ({
                userId,
                status: 500,
                error: err.message
            }))
        )
    }
    return Promise.all(requests)
}

export async function POST(request: Request) {
    const body = await request.json()
    const { scenario } = body

    // Pick a random seat to avoid conflicts with manual testing
    const randomSeatId = Math.floor(Math.random() * 50) + 50 // Seats 50-100
    const showId = 1

    let results = []
    let summary = ""

    try {
        switch (scenario) {
            case 'naive':
                // Test: Double Booking (Concurrency Bug)
                // Expectation: Multiple successes
                results = await runConcurrentRequests('/api/book-naive', 20, {
                    showId,
                    seatIds: [randomSeatId]
                })

                const successCount = results.filter(r => r.data.success).length
                summary = successCount > 1
                    ? `❌ CRITICAL FAIL: ${successCount} users booked Seat ${randomSeatId}!`
                    : `✅ Lucky Pass (Try again)`
                break

            case 'secure':
                // Test: Distributed Locking
                // Expectation: Exactly 1 success
                results = await runConcurrentRequests('/api/book-secure', 20, {
                    showId,
                    seatIds: [randomSeatId]
                })

                const secureSuccess = results.filter(r => r.data.success).length
                summary = secureSuccess === 1
                    ? `✅ SECURE: Only 1 user booked Seat ${randomSeatId}. 19 blocked.`
                    : `⚠️ Unexpected: ${secureSuccess} bookings.`
                break

            default:
                return NextResponse.json({ error: 'Invalid scenario' }, { status: 400 })
        }

        return NextResponse.json({
            scenario,
            targetSeat: randomSeatId,
            summary,
            totalRequests: 20,
            results
        })

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
