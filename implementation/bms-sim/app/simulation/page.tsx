
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle2, Lock, Shuffle, Users } from "lucide-react"

export default function SimulationPage() {
    const [isRunning, setIsRunning] = useState(false)
    const [results, setResults] = useState<any>(null)
    const [mode, setMode] = useState<'naive' | 'secure' | null>(null)

    const runTest = async (scenario: 'naive' | 'secure') => {
        setIsRunning(true)
        setMode(scenario)
        setResults(null)

        try {
            const res = await fetch('/api/run-simulation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ scenario })
            })
            const data = await res.json()
            setResults(data)
        } catch (e) {
            console.error(e)
        } finally {
            setIsRunning(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 p-8">
            <div className="container mx-auto max-w-5xl">

                <header className="mb-10 text-center">
                    <h1 className="text-3xl font-bold mb-2 flex justify-center items-center gap-2">
                        <Shuffle className="text-blue-500" />
                        Race Condition Simulator
                    </h1>
                    <p className="text-slate-400">Visually demonstrate the "Double Booking" problem and the Redis solution.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">

                    {/* NAIVE CARD */}
                    <Card className="bg-slate-800 border-slate-700">
                        <CardHeader>
                            <CardTitle className="text-red-400 flex items-center gap-2"><AlertCircle /> The Problem (Naive)</CardTitle>
                            <CardDescription className="text-slate-400">
                                Runs 20 concurrent requests WITHOUT locking.
                                <br />Expectation: Multiple users book the same seat.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button
                                onClick={() => runTest('naive')}
                                disabled={isRunning}
                                className="w-full bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/50"
                            >
                                {isRunning && mode === 'naive' ? 'Simulating...' : 'Simulate Race Condition 💥'}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* SECURE CARD */}
                    <Card className="bg-slate-800 border-slate-700">
                        <CardHeader>
                            <CardTitle className="text-green-400 flex items-center gap-2"><Lock /> The Solution (Redis)</CardTitle>
                            <CardDescription className="text-slate-400">
                                Runs 20 concurrent requests WITH Redis Distributed Locks.
                                <br />Expectation: Only 1 succeeds. 19 blocked.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button
                                onClick={() => runTest('secure')}
                                disabled={isRunning}
                                className="w-full bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white border border-green-500/50"
                            >
                                {isRunning && mode === 'secure' ? 'Simulating...' : 'Verify Fix 🛡️'}
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* RESULTS AREA */}
                {results && (
                    <div className="animate-in fade-in slide-in-from-bottom-5 duration-500">
                        <div className={`p-4 rounded-lg mb-6 text-center border ${results.scenario === 'naive' && results.summary.includes('CRITICAL')
                                ? 'bg-red-950/30 border-red-900 text-red-200'
                                : 'bg-green-950/30 border-green-900 text-green-200'
                            }`}>
                            <h3 className="text-xl font-bold">{results.summary}</h3>
                            <p className="text-sm opacity-70 mt-1">Target Seat: #{results.targetSeat} | Total Requests: {results.totalRequests}</p>
                        </div>

                        <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 text-center">Request Visualizer</h4>

                        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-10 gap-3">
                            {results.results.map((r: any, i: number) => {
                                let color = 'bg-slate-700 border-slate-600'
                                let icon = <Users className="w-4 h-4 text-slate-400" />

                                // Success Logic
                                if (r.data.success) {
                                    color = 'bg-green-500 border-green-400 shadow-[0_0_15px_rgba(34,197,94,0.5)] scale-110 z-10'
                                    icon = <CheckCircle2 className="w-5 h-5 text-white" />
                                }
                                // Error Logic
                                else if (r.data.error) {
                                    if (r.data.error.includes('held') || r.data.error.includes('booked')) {
                                        color = 'bg-yellow-500/20 border-yellow-600/50' // Locked/Blocked properly
                                        icon = <Lock className="w-4 h-4 text-yellow-500" />
                                    } else {
                                        color = 'bg-red-500/20 border-red-600' // Actual crash or Logic error
                                        icon = <AlertCircle className="w-4 h-4 text-red-500" />
                                    }
                                }

                                return (
                                    <div key={i} className={`h-16 rounded-md border flex flex-col items-center justify-center transition-all ${color}`}>
                                        {icon}
                                        <span className="text-[10px] mt-1 font-mono opacity-60">User {i + 1}</span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

            </div>
        </div>
    )
}
