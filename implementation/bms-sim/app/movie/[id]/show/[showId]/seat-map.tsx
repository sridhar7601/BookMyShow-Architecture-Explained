
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

export default function SeatMap({ showId, seatsByRow }: { showId: number, seatsByRow: Record<string, any[]> }) {
    const router = useRouter()
    const [selectedSeats, setSelectedSeats] = useState<any[]>([])
    const [isBooking, setIsBooking] = useState(false)

    const toggleSeat = (seat: any) => {
        if (seat.isBooked) return

        if (selectedSeats.find(s => s.id === seat.id)) {
            setSelectedSeats(selectedSeats.filter(s => s.id !== seat.id))
        } else {
            if (selectedSeats.length >= 6) {
                toast.error("You can only select up to 6 seats")
                return
            }
            setSelectedSeats([...selectedSeats, seat])
        }
    }

    const handleBook = async () => {
        if (selectedSeats.length === 0) return

        setIsBooking(true)
        const toastId = toast.loading("Booking your seats...")

        try {
            // NOTE: Calling the NAIVE API first for simulation
            const response = await fetch('/api/book-naive', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: 'user-' + Math.floor(Math.random() * 1000), // Random user ID for sim
                    showId: showId,
                    seatIds: selectedSeats.map(s => s.id)
                })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Booking failed')
            }

            toast.success("Booking confirmed! (Secure)", { id: toastId })
            setTimeout(() => {
                router.push(`/booking/confirmed/${data.bookingId}`)
            }, 1000)

        } catch (error: any) {
            toast.error(error.message, { id: toastId })
        } finally {
            setIsBooking(false)
        }
    }

    const totalPrice = selectedSeats.reduce((sum, seat) => sum + (150 * seat.priceModifier), 0)

    return (
        <div className="flex flex-col items-center">
            {/* Screen Visual */}
            <div className="w-full max-w-3xl mb-12">
                <div className="h-2 bg-slate-500 rounded-full mb-1 shadow-[0_10px_30px_rgba(255,255,255,0.1)]"></div>
                <p className="text-center text-xs text-slate-500 mt-2">SCREEN THIS WAY</p>
            </div>

            {/* Seats Grid */}
            <div className="space-y-4 mb-10 overflow-x-auto w-full flex flex-col items-center">
                {Object.entries(seatsByRow).map(([row, seats]) => (
                    <div key={row} className="flex gap-4 items-center">
                        <div className="w-6 text-slate-500 text-sm font-bold text-right">{row}</div>
                        <div className="flex gap-2">
                            {seats.map((seat) => {
                                const isSelected = selectedSeats.find(s => s.id === seat.id)

                                let seatColor = "bg-white text-green-500 hover:bg-green-50 border-green-500" // Available
                                if (seat.isBooked) seatColor = "bg-slate-700 text-slate-500 border-slate-700 cursor-not-allowed" // Booked
                                if (isSelected) seatColor = "bg-green-500 text-white border-green-500 shadow-lg scale-110" // Selected
                                if (seat.type === 'VIP' && !seat.isBooked && !isSelected) seatColor = "bg-white text-purple-500 hover:bg-purple-50 border-purple-500" // VIP

                                return (
                                    <button
                                        key={seat.id}
                                        onClick={() => toggleSeat(seat)}
                                        disabled={seat.isBooked}
                                        className={`w-8 h-8 rounded text-xs font-medium border transition-all duration-200 flex items-center justify-center ${seatColor}`}
                                        title={`${row}${seat.number} - ₹${150 * seat.priceModifier}`}
                                    >
                                        {seat.number}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Legend */}
            <div className="flex gap-6 text-sm text-slate-400 mb-12">
                <div className="flex items-center gap-2"><div className="w-4 h-4 border border-green-500 rounded bg-white"></div> Available</div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 border border-green-500 rounded bg-green-500"></div> Selected</div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 border border-slate-700 rounded bg-slate-700"></div> Booked</div>
            </div>

            {/* Footer / Cart */}
            {selectedSeats.length > 0 && (
                <div className="fixed bottom-0 left-0 w-full bg-white text-slate-900 border-t p-4 shadow-2xl animate-in slide-in-from-bottom duration-300 z-50">
                    <div className="container mx-auto flex justify-between items-center max-w-4xl">
                        <div>
                            <p className="font-bold text-lg">Pay ₹{totalPrice}</p>
                            <p className="text-sm text-slate-500">For {selectedSeats.map(s => `${s.row}${s.number}`).join(', ')}</p>
                        </div>
                        <Button
                            size="lg"
                            className="bg-red-500 hover:bg-red-600 px-8"
                            onClick={handleBook}
                            disabled={isBooking}
                        >
                            {isBooking ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Booking...</> : 'Confirm Booking'}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
