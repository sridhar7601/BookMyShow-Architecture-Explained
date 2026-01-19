
import { PrismaClient } from '@prisma/client'
import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Ticket, Shuffle } from "lucide-react"

const prisma = new PrismaClient()

async function getMovies() {
  const movies = await prisma.movie.findMany({
    include: {
      shows: {
        include: {
          screen: {
            include: {
              theater: true
            }
          }
        }
      }
    }
  })
  return movies
}

export default async function Home() {
  const movies = await getMovies()

  return (
    <main className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="bg-[#333545] text-white py-4 shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Ticket className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold tracking-tight">BookMyShow <span className="text-xs font-normal opacity-70">Simulation</span></h1>
          </div>
          <div className="flex gap-4">
            <Link href="/simulation">
              <Button variant="outline" size="sm" className="bg-transparent border-slate-500 text-slate-300 hover:text-white hover:border-white">
                <Shuffle className="w-3 h-3 mr-2" /> Live Lab
              </Button>
            </Link>
            <Button variant="secondary" size="sm">Sign In</Button>
          </div>
        </div>
      </header>

      {/* Hero Carousel */}
      <div className="relative w-full h-[400px] bg-slate-900 overflow-hidden mb-12">
        <div className="absolute inset-0 flex transition-transform duration-500">
          <img src="https://assets-in.bmscdn.com/promotions/cms/creatives/1706382336630_web.jpg" alt="Hero 1" className="w-full h-full object-cover opacity-80" />
        </div>
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-slate-900 to-transparent h-32"></div>
        <div className="absolute bottom-10 left-0 w-full text-center">
          <h2 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">Endless Entertainment</h2>
          <p className="text-slate-300 text-lg drop-shadow-md">Movies, Events, Plays, Sports, and more!</p>
        </div>
      </div>

      {/* Movie List */}
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-slate-800">Recommended Movies</h3>
          <Button variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50">See All ›</Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {movies.map((movie) => (
            <Card key={movie.id} className="overflow-hidden hover:shadow-xl transition-shadow border-0 shadow-sm group cursor-pointer h-full flex flex-col">
              <Link href={`/movie/${movie.id}`} className="contents">
                <div className="relative aspect-[2/3] overflow-hidden bg-slate-200">
                  <img
                    src={movie.posterUrl || 'https://placehold.co/400x600'}
                    alt={movie.title}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute bottom-2 right-2 flex gap-1">
                    <Badge variant="secondary" className="bg-black/70 hover:bg-black/80 text-white backdrop-blur-sm">
                      {movie.genre}
                    </Badge>
                  </div>
                </div>
              </Link>
              <CardContent className="p-4 flex-grow">
                <h4 className="font-bold text-xl mb-1 line-clamp-1">{movie.title}</h4>
                <div className="flex items-center text-slate-500 text-sm gap-4 mb-3">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {Math.floor(movie.duration / 60)}h {movie.duration % 60}m</span>
                  <span className="flex items-center gap-1">UA</span>
                </div>

                {movie.shows.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Next Shows</p>
                    {movie.shows.slice(0, 2).map(show => (
                      <Link key={show.id} href={`/movie/${movie.id}/show/${show.id}`}>
                        <div className="flex justify-between items-center bg-green-50 p-2 rounded border border-green-100 mb-2 hover:bg-green-100 transition-colors">
                          <div className="text-xs">
                            <div className="font-medium text-green-900">{show.screen.theater.name}</div>
                            <div className="text-green-700">{new Date(show.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                          </div>
                          <Badge className="bg-green-500 hover:bg-green-600">Book</Badge>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 italic">No shows scheduled</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      {/* BMS Footer */}
      <footer className="bg-[#333545] text-slate-400 py-12 mt-20 text-sm">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider">Profile</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white">Contact Us</a></li>
              <li><a href="#" className="hover:text-white">FAQ</a></li>
              <li><a href="#" className="hover:text-white">Terms of Use</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider">Discover</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white">Now Showing</a></li>
              <li><a href="#" className="hover:text-white">Coming Soon</a></li>
              <li><a href="#" className="hover:text-white">Exclusives</a></li>
            </ul>
          </div>
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Ticket className="h-10 w-10 text-white" />
              <span className="text-2xl font-bold text-white">BookMyShow</span>
            </div>
            <p>The best way to book tickets online. Simulating complex distributed system problems one ticket at a time.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
