import { getShowRequest, joinShowRequest } from '@/app/actions/show-request'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardTitle, CardHeader, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { notFound } from 'next/navigation'

export default async function RequestDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const request = await getShowRequest(parseInt(id))

    if (!request) notFound()

    const progress = (request.participants.length / request.minParticipants) * 100
    const isConfirmed = request.status === 'CONFIRMED'

    return (
        <div className="container mx-auto p-8 max-w-3xl">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-2xl">{request.movie.title}</CardTitle>
                            <CardDescription className="text-lg">{request.theater.name}, {request.theater.location}</CardDescription>
                        </div>
                        <div className={`px-4 py-1 rounded-full text-sm font-bold ${isConfirmed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {request.status}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="font-semibold block">Date</span>
                            {new Date(request.date).toLocaleDateString()}
                        </div>
                        <div>
                            <span className="font-semibold block">Time</span>
                            {new Date(request.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between font-medium">
                            <span>{request.participants.length} participants</span>
                            <span>Target: {request.minParticipants}</span>
                        </div>
                        <Progress value={progress} className="h-4" />
                        <p className="text-sm text-gray-500">
                            {Math.max(0, request.minParticipants - request.participants.length)} more people needed to confirm this show!
                        </p>
                    </div>

                    {!isConfirmed && (
                        <form action={async () => {
                            'use server'
                            // Simulate a random user ID for now, since we don't have auth
                            const randomUserId = `user-${Math.floor(Math.random() * 10000)}`
                            await joinShowRequest(request.id, randomUserId)
                        }}>
                            <Button size="lg" className="w-full">
                                Join Campaign (Pledge Ticket)
                            </Button>
                        </form>
                    )}

                    {isConfirmed && (
                        <div className="p-4 bg-green-50 text-green-700 rounded-lg text-center">
                            This show is confirmed! You can now book your seats on the movie page.
                        </div>
                    )}

                    <div className="border-t pt-4 mt-6">
                        <h3 className="font-bold mb-2">Participants</h3>
                        <ul className="list-disc pl-5 text-sm text-gray-600 max-h-40 overflow-y-auto">
                            {request.participants.map(p => (
                                <li key={p.id}>User {p.userId} joined at {new Date(p.joinedAt).toLocaleString()}</li>
                            ))}
                        </ul>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
