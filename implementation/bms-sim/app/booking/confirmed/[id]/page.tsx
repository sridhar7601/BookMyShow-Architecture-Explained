
import { PrismaClient } from '@prisma/client'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { CheckCircle2, QrCode, Share2, Download } from "lucide-react"

const prisma = new PrismaClient()

async function getBooking(id: string) {
    const booking = await prisma.booking.findUnique({
        where: { id: parseInt(id) },
        include: {
            show: {
                include: {
                    movie: true,
                    screen: {
                        include: { theater: true }
                    }
                }
            },
            seats: {
                include: { seat: true }
            }
        }
    })
    return booking
}

export default async function BookingConfirmed({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const booking = await getBooking(id)

    if (!booking) notFound()

    const { show, seats } = booking
    const seatNumbers = seats.map(s => `${s.seat.row}${s.seat.number}`).join(', ')
    const totalAmount = seats.reduce((sum, s) => sum + (150 * s.seat.priceModifier), 0)

    return (
        <div className="min-h-screen bg-slate-100 py-10">
            <div className="container mx-auto px-4 max-w-md">

                {/* Success Header */}
                <div className="text-center mb-6">
                    <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-2" />
                    <h1 className="text-2xl font-bold text-slate-800">Booking Confirmed!</h1>
                    <p className="text-slate-500">Your tickets have been sent to your email.</p>
                </div>

                {/* Ticket Card */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden relative">

                    {/* Movie Poster & Info */}
                    <div className="flex gap-4 p-4 border-b border-dashed border-slate-300">
                        <div className="w-24 h-36 bg-slate-200 rounded shrink-0">
                            <img src={show.movie.posterUrl || ''} className="w-full h-full object-cover rounded" />
                        </div>
                        <div className="flex-grow">
                            <h2 className="font-bold text-lg mb-1">{show.movie.title}</h2>
                            <p className="text-slate-500 text-sm mb-2">{show.movie.genre} • UA</p>
                            <p className="text-slate-700 text-sm font-medium">{show.screen.theater.name}</p>
                            <p className="text-slate-500 text-xs">{show.screen.theater.location}</p>
                            <div className="mt-3 text-sm font-bold text-slate-800">
                                {new Date(show.startTime).toLocaleDateString()} | {new Date(show.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    </div>

                    {/* Seat Details */}
                    <div className="p-4 bg-slate-50 flex justify-between items-center">
                        <div>
                            <p className="text-xs text-slate-400 uppercase font-bold">Seats</p>
                            <p className="font-bold text-lg">{seats.length} Tickets</p>
                            <p className="text-sm text-slate-600 font-medium">{seatNumbers}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-slate-400 uppercase font-bold">Screen</p>
                            <p className="font-bold text-lg">Screen {show.screenId}</p>
                            <p className="text-sm text-slate-600 font-medium">Gold Class</p>
                        </div>
                    </div>

                    {/* QR Code Section */}
                    <div className="p-6 text-center border-t border-dashed border-slate-300 relative">
                        <div className="absolute -left-3 -top-3 w-6 h-6 bg-slate-100 rounded-full"></div>
                        <div className="absolute -right-3 -top-3 w-6 h-6 bg-slate-100 rounded-full"></div>

                        <div className="bg-white p-2 inline-block border rounded mb-2">
                            <QrCode className="w-32 h-32 text-slate-900" />
                        </div>
                        <p className="text-xs text-slate-400 mb-4">Scan at entrance - Booking ID: {booking.id}</p>

                        <div className="flex gap-2 justify-center">
                            <Button variant="outline" size="sm" className="text-xs"><Share2 className="w-3 h-3 mr-1" /> Share</Button>
                            <Button variant="outline" size="sm" className="text-xs"><Download className="w-3 h-3 mr-1" /> Download</Button>
                        </div>
                    </div>

                    {/* Total */}
                    <div className="bg-green-50 p-4 flex justify-between items-center border-t border-green-100">
                        <span className="text-green-800 font-medium">Total Amount Paid</span>
                        <span className="text-green-800 font-bold text-lg">₹{totalAmount}</span>
                    </div>

                </div>

                <div className="mt-8 text-center">
                    <Link href="/">
                        <Button variant="link" className="text-slate-500">Book Another Movie</Button>
                    </Link>
                </div>

            </div>
        </div>
    )
}
