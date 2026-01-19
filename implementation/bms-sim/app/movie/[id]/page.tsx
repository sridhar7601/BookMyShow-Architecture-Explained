
import { PrismaClient } from '@prisma/client'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Star, Share2, PlayCircle } from "lucide-react"

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
        <div className="min-h-screen bg-slate-50">
            {/* Navbar Placeholder (Should act same as Home) */}
            <nav className="bg-[#333545] text-white p-4">
                <div className="container mx-auto flex justify-between items-center">
                    <Link href="/" className="font-bold text-xl">BookMyShow <span className="text-xs font-normal opacity-50">Sim</span></Link>
                </div>
            </nav>

            {/* Hero / Backdrop */}
            <div
                className="w-full h-[480px] bg-cover bg-center relative"
                style={{
                    backgroundImage: `linear-gradient(90deg, #1A1A1A 24.97%, #1A1A1A 38.3%, rgba(26, 26, 26, 0.0409746) 97.47%, #1A1A1A 100%), url(${movie.posterUrl})`
                }}
            >
                <div className="container mx-auto px-4 h-full flex items-center gap-8 relative z-10">
                    {/* Poster Card */}
                    <div className="w-[260px] h-[390px] rounded-xl overflow-hidden shadow-2xl shrink-0 hidden md:block">
                        <img src={movie.posterUrl || ''} alt={movie.title} className="w-full h-full object-cover" />
                        <div className="bg-black text-white text-center py-1 text-xs">In Cinemas</div>
                    </div>

                    {/* Info */}
                    <div className="text-white max-w-2xl">
                        <h1 className="text-4xl font-bold mb-4">{movie.title}</h1>

                        <div className="flex items-center gap-4 mb-6">
                            <div className="flex items-center gap-1 text-xl font-bold"><Star className="fill-red-500 text-red-500 w-6 h-6" /> 9.8/10</div>
                            <div className="bg-slate-700 px-2 py-1 rounded text-xs">Simulated Rating</div>
                        </div>

                        <div className="flex gap-2 flex-wrap mb-4">
                            <Badge variant="secondary" className="px-3 py-1 text-sm bg-slate-100 text-slate-900">2D, IMAX 2D, 3D</Badge>
                            <Badge variant="secondary" className="px-3 py-1 text-sm bg-slate-100 text-slate-900">Tamil, Hindi, English, Telugu</Badge>
                        </div>

                        <div className="text-slate-300 text-sm font-medium mb-8">
                            {Math.floor(movie.duration / 60)}h {movie.duration % 60}m • {movie.genre} • UA • 15 Jan, 2026
                        </div>

                        <Button size="lg" className="bg-red-500 hover:bg-red-600 px-10 py-6 text-lg font-semibold rounded block w-full md:w-auto">
                            Book Tickets
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Col */}
                <div className="lg:col-span-2 space-y-8">

                    {/* About */}
                    <section>
                        <h3 className="text-xl font-bold text-slate-900 mb-4">About the movie</h3>
                        <p className="text-slate-600 leading-relaxed">{movie.description}</p>
                    </section>

                    <hr />

                    {/* Cast */}
                    <section>
                        <h3 className="text-xl font-bold text-slate-900 mb-4">Cast</h3>
                        <div className="flex gap-6 overflow-x-auto pb-4">
                            {CAST.map((c, i) => (
                                <div key={i} className="text-center min-w-[100px]">
                                    <div className="w-24 h-24 rounded-full bg-slate-200 mx-auto mb-2 overflow-hidden">
                                        <img src={c.img} className="w-full h-full object-cover" />
                                    </div>
                                    <p className="font-bold text-sm text-slate-900">{c.name}</p>
                                    <p className="text-xs text-slate-500">as {c.role}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <hr />

                    {/* Crew etc... skipped for brevity */}

                </div>

                {/* Right Col: Booking Widget */}
                <div className="lg:col-span-1">
                    <div className="bg-white border rounded-lg p-6 sticky top-24">
                        <h3 className="text-lg font-bold mb-4">Select Show</h3>

                        {movie.shows.length > 0 ? (
                            <div className="space-y-3">
                                {movie.shows.map(show => (
                                    <div key={show.id} className="border rounded p-3 hover:border-red-500 transition-colors cursor-pointer group">
                                        <div className="flex justify-between items-center mb-2">
                                            <div className="font-semibold text-sm">{show.screen.theater.name}</div>
                                            <div className="text-xs text-green-600 font-bold">Available</div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Link href={`/movie/${movie.id}/show/${show.id}`} className="w-full">
                                                <Button variant="outline" className="w-full text-green-600 border-green-600 hover:bg-green-50">
                                                    {new Date(show.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 text-slate-400">No shows available for this movie yet.</div>
                        )}
                    </div>
                </div>

            </div>

        </div>
    )
}
