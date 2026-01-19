
import { PrismaClient } from '@prisma/client'
import { notFound } from 'next/navigation'
import SeatMap from './seat-map'
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin } from "lucide-react"

const prisma = new PrismaClient()

async function getShowData(showId: string) {
    const show = await prisma.show.findUnique({
        where: { id: parseInt(showId) },
        include: {
            movie: true,
            screen: {
                include: {
                    theater: true,
                    seats: {
                        orderBy: [{ row: 'asc' }, { number: 'asc' }]
                    }
                }
            },
            bookings: {
                where: { status: { in: ['CONFIRMED', 'PENDING'] } },
                include: {
                    seats: {
                        include: {
                            seat: true
                        }
                    }
                }
            }
        }
    })

    if (!show) return null

    // Process seats to add "isBooked" status
    // In a real app with 50k seats, we'd do this map efficiently or in DB
    const bookedSeatIds = new Set<number>()
    show.bookings.forEach(booking => {
        booking.seats.forEach(bs => bookedSeatIds.add(bs.seatId))
    })

    // Group seats by Row for the UI
    const seatsByRow: Record<string, any[]> = {}
    show.screen.seats.forEach(seat => {
        if (!seatsByRow[seat.row]) seatsByRow[seat.row] = []
        seatsByRow[seat.row].push({
            ...seat,
            isBooked: bookedSeatIds.has(seat.id)
        })
    })

    return { show, seatsByRow }
}

export default async function ShowPage({ params }: { params: Promise<{ showId: string }> }) {
    const { showId } = await params
    const data = await getShowData(showId)

    if (!data) notFound()

    const { show, seatsByRow } = data

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 pb-20">
            {/* Header */}
            <div className="bg-slate-800 p-4 shadow-lg sticky top-0 z-10 border-b border-slate-700">
                <div className="container mx-auto flex justify-between items-start">
                    <div>
                        <h1 className="text-xl font-bold text-white flex items-center gap-2">
                            {show.movie.title}
                            <Badge variant="outline" className="text-xs text-slate-300 border-slate-500">UA</Badge>
                        </h1>
                        <div className="text-sm text-slate-400 mt-1 flex gap-4">
                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {show.screen.theater.name} | {show.screen.theater.location}</span>
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {show.startTime.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Seat Map Client Component */}
            <div className="container mx-auto mt-8 px-4">
                <SeatMap showId={show.id} seatsByRow={seatsByRow} />
            </div>
        </div>
    )
}
