import { PrismaClient } from '@prisma/client'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star } from "lucide-react"

const prisma = new PrismaClient()

// Mock Cast Data
const CAST = [
    { name: "Robert Downey Jr.", role: "Iron Man", img: "https://placehold.co/100x100" },
    { name: "Chris Evans", role: "Captain America", img: "https://placehold.co/100x100" },
    { name: "Chris Hemsworth", role: "Thor", img: "https://placehold.co/100x100" },
]

async function getMovie(id: string) {
    const movie = await prisma.movie.findUnique({
        where: { id: parseInt(id) },
        include: {
            shows: {
                include: { screen: { include: { theater: true } } },
                orderBy: { startTime: 'asc' }
            }
        }
    })
    return movie
}

export default async function MovieDetails({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const movie = await getMovie(id)
    if (!movie) notFound()

    return (
        <div className="min-h-screen bg-[#F5F5F7] font-sans">
            {/* Navbar Placeholder */}
            <nav className="bg-[#333545] text-white h-[64px] flex items-center shadow-md z-50 relative">
                <div className="container mx-auto px-4 flex justify-between items-center">
                    <Link href="/" className="font-bold text-xl flex items-center gap-2">
                        <span className="text-white">BookMyShow</span>
                        <span className="text-[10px] text-gray-400 border border-gray-600 px-1 rounded">SIM</span>
                    </Link>
                    <div className="flex gap-4 text-sm font-medium text-gray-300">
                        <Link href="/requests" className="hover:text-white transition-colors">Fan Campaigns</Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div
                className="w-full relative bg-cover bg-no-repeat bg-center"
                style={{
                    backgroundImage: `linear-gradient(90deg, #1A1A1A 24.97%, #1A1A1A 38.3%, rgba(26, 26, 26, 0.0409746) 97.47%, #1A1A1A 100%), url(${movie.posterUrl})`,
                    height: '480px'
                }}
            >
                <div className="container mx-auto px-4 h-full flex items-center relative z-10">
                    <div className="flex gap-8 w-full">
                        {/* Poster */}
                        <div className="w-[260px] h-[390px] rounded-lg overflow-hidden shadow-2xl shrink-0 hidden md:block relative top-8">
                            <img src={movie.posterUrl || ''} alt={movie.title} className="w-full h-full object-cover" />
                            <div className="bg-black text-white text-center py-1 text-xs absolute bottom-0 w-full">In Cinemas</div>
                        </div>

                        {/* Info */}
                        <div className="text-white flex flex-col justify-center max-w-2xl py-8">
                            <h1 className="text-4xl font-bold mb-4 text-white leading-tight">{movie.title}</h1>

                            <div className="flex items-center gap-4 mb-4">
                                <div className="flex items-center gap-2 text-2xl font-bold">
                                    <Star className="fill-red-500 text-red-500 w-8 h-8" />
                                    <span>9.2/10</span>
                                </div>
                                <div className="bg-[#333] px-3 py-1 rounded-md text-sm font-semibold text-white/90 cursor-pointer hover:bg-[#444] transition-colors">
                                    (50.2K Votes) &gt;
                                </div>
                            </div>

                            <div className="flex gap-3 mb-4 flex-wrap">
                                <Badge variant="secondary" className="bg-white text-black hover:bg-white/90 text-xs px-2 py-0.5 rounded-[2px] cursor-pointer">2D</Badge>
                                <Badge variant="secondary" className="bg-white text-black hover:bg-white/90 text-xs px-2 py-0.5 rounded-[2px] cursor-pointer">IMAX 2D</Badge>
                                <Badge variant="secondary" className="bg-white text-black hover:bg-white/90 text-xs px-2 py-0.5 rounded-[2px] cursor-pointer">Tamil</Badge>
                                <Badge variant="secondary" className="bg-white text-black hover:bg-white/90 text-xs px-2 py-0.5 rounded-[2px] cursor-pointer">English</Badge>
                            </div>

                            <div className="text-white/90 text-[16px] font-medium mb-8 flex items-center gap-2">
                                <span>{Math.floor(movie.duration / 60)}h {movie.duration % 60}m</span>
                                <span className="w-1 h-1 bg-white rounded-full"></span>
                                <span>{movie.genre}</span>
                                <span className="w-1 h-1 bg-white rounded-full"></span>
                                <span>UA</span>
                                <span className="w-1 h-1 bg-white rounded-full"></span>
                                <span>15 Jan, 2026</span>
                            </div>

                            <Button size="lg" className="bg-[#F84464] hover:bg-[#d63450] text-white px-12 py-6 text-lg font-semibold rounded-lg w-fit shadow-lg transition-transform active:scale-95">
                                Book Tickets
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Left Column */}
                <div className="lg:col-span-3 space-y-8">
                    <section>
                        <h2 className="text-2xl font-bold text-[#333333] mb-4">About the movie</h2>
                        <p className="text-[#666666] leading-7 text-[16px]">{movie.description}</p>
                    </section>

                    <div className="border-t border-gray-200"></div>

                    <section>
                        <h2 className="text-2xl font-bold text-[#333333] mb-4">Cast</h2>
                        <div className="flex gap-8 overflow-x-auto pb-4 scrollbar-hide">
                            {CAST.map((c, i) => (
                                <div key={i} className="text-center min-w-[120px] flex flex-col items-center">
                                    <div className="w-[120px] h-[120px] rounded-full overflow-hidden mb-2 shadow-sm">
                                        <img src={c.img} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                                    </div>
                                    <p className="font-semibold text-gray-900 text-sm">{c.name}</p>
                                    <p className="text-xs text-gray-500">as {c.role}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Right Column (ads/offers usually, here booking widget) */}
                <div className="lg:col-span-1">
                    <div className="sticky top-24 space-y-4">
                        <div className="bg-white border text-center p-4 rounded-lg shadow-sm">
                            <h3 className="font-bold text-gray-800 mb-2">Applicable offers</h3>
                            <div className="bg-yellow-50 text-yellow-800 text-xs p-2 rounded border border-yellow-200 flex items-center gap-2">
                                <Star className="w-4 h-4" />
                                <span>Limited Period Offer</span>
                            </div>
                        </div>

                        <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
                            <div className="bg-gray-50 p-3 border-b font-bold text-gray-700">Available Shows</div>
                            {movie.shows.length > 0 ? (
                                <div className="divide-y max-h-[400px] overflow-y-auto">
                                    {movie.shows.map(show => (
                                        <div key={show.id} className="p-4 hover:bg-gray-50 transition-colors">
                                            <div className="text-sm font-bold text-gray-800 mb-1">{show.screen.theater.name}</div>
                                            <div className="flex justify-between items-center">
                                                <div className="text-xs text-green-600 font-medium">Available</div>
                                                <Link href={`/movie/${movie.id}/show/${show.id}`}>
                                                    <Button variant="outline" size="sm" className="text-green-600 border-green-600 hover:bg-green-50 h-8">
                                                        {new Date(show.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 text-center text-gray-400 text-sm">No shows available.</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
