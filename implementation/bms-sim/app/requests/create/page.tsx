import prisma from '@/lib/db'
import { createShowRequest } from '@/app/actions/show-request'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardTitle, CardHeader, CardDescription } from '@/components/ui/card'
// We need a client component for the form to handle pending states better, but for MVP standard form action is fine.

export default async function CreateRequestPage() {
    const movies = await prisma.movie.findMany()
    const theaters = await prisma.theater.findMany()

    return (
        <div className="container mx-auto p-8 max-w-2xl">
            <Card>
                <CardHeader>
                    <CardTitle>Start a New Campaign</CardTitle>
                    <CardDescription>
                        Request a show for your favorite movie. If 20 people join, it happens!
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={createShowRequest} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Select Movie</label>
                            <select name="movieId" required className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm">
                                <option value="">-- Select Movie --</option>
                                {movies.map((m) => (
                                    <option key={m.id} value={m.id}>
                                        {m.title}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Select Cinema</label>
                            <select name="theaterId" required className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm">
                                <option value="">-- Select Cinema --</option>
                                {theaters.map((t) => (
                                    <option key={t.id} value={t.id}>
                                        {t.name} ({t.location})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Date</label>
                                <input type="date" name="date" required className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Time</label>
                                <input type="time" name="time" required className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm" />
                            </div>
                        </div>

                        <div className="pt-4">
                            <Button type="submit" className="w-full">Create Campaign</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
