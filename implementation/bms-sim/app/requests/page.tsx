import Link from 'next/link'
import { getShowRequests } from '@/app/actions/show-request'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardTitle, CardHeader, CardDescription, CardFooter } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

export default async function RequestsPage() {
    const requests = await getShowRequests()

    return (
        <div className="container mx-auto p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Community Show Requests</h1>
                <Link href="/requests/create">
                    <Button>Start a New Campaign</Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {requests.map((req) => {
                    const progress = (req._count.participants / req.minParticipants) * 100

                    return (
                        <Card key={req.id} className="flex flex-col">
                            <CardHeader>
                                <CardTitle>{req.movie.title}</CardTitle>
                                <CardDescription>{req.theater.name}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <div className="mb-4">
                                    <p className="text-sm font-medium">Date: {new Date(req.date).toLocaleDateString()}</p>
                                    <p className="text-sm font-medium">Time: {new Date(req.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>{req._count.participants} joined</span>
                                        <span>Goal: {req.minParticipants}</span>
                                    </div>
                                    <Progress value={progress} className="h-2" />
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-between items-center">
                                <span className={`text-sm font-bold ${req.status === 'CONFIRMED' ? 'text-green-600' : 'text-yellow-600'}`}>
                                    {req.status}
                                </span>
                                <Link href={`/requests/${req.id}`}>
                                    <Button variant="outline">View Details</Button>
                                </Link>
                            </CardFooter>
                        </Card>
                    )
                })}

                {requests.length === 0 && (
                    <div className="col-span-full text-center py-12 text-gray-500">
                        No active requests. Start one now!
                    </div>
                )}
            </div>
        </div>
    )
}
