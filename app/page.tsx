"use client"

import { useState, useEffect } from "react"
import {
  LucideCompass,
  LucideLoader2,
  LucideSparkles,
  LucideTrash2,
  LucidePlane,
  LucideHotel,
  LucideArrowRight,
  LucideCalendar,
  LucideActivity,
  LucideTrain,
  LucideBriefcase,
  LucideMapPin,
  LucideRefreshCw
} from "lucide-react"
import { toast, Toaster } from "sonner"
import type { Trip, ItineraryEvent } from "@/lib/types"

export default function WaypointDashboard() {
  const [userId] = useState("hackathon_user_premium")
  const [textInput, setTextInput] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [tripsList, setTripsList] = useState<Trip[]>([])
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null)

  useEffect(() => {
    fetchSavedTrips()
  }, [])

  const fetchSavedTrips = async () => {
    try {
      const res = await fetch(`/api/trips?userId=${userId}`)
      const data = await res.json()
      if (data.trips) setTripsList(data.trips)
    } catch (err) {
      console.error("Connection failed:", err)
    }
  }

  const handleCreateTrip = async () => {
    if (!textInput.trim()) return
    setIsProcessing(true)

    const promise = fetch("/api/trips", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, rawText: textInput }),
    })

    toast.promise(promise, {
      loading: 'AI is reading itinerary & saving to AWS Database...',
      success: async (res) => {
        const result = await res.json()
        if (result.success) {
          setTextInput("")
          await fetchSavedTrips()
          setSelectedTrip(result.trip)
          return 'Itinerary successfully synced to AWS Cloud!'
        }
        throw new Error(result.error || "Failed")
      },
      error: 'Connection error during deployment.',
    })

    try {
      await promise
    } catch (err) {
      console.error(err)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDeleteTrip = async (e: React.MouseEvent, tripId: string) => {
    e.stopPropagation()
    try {
      const res = await fetch("/api/trips", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, tripId }),
      })
      const result = await res.json()
      if (result.success) {
        toast.success("Journey record cleared.")
        if (selectedTrip?.tripId === tripId) setSelectedTrip(null)
        await fetchSavedTrips()
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="min-h-screen bg-[#06080c] text-slate-100 font-sans selection:bg-indigo-500/20 antialiased">
      <Toaster position="bottom-right" theme="dark" />

      {/* Premium Tech Dashboard Header */}
      <header className="border-b border-slate-900/80 bg-[#06080c]/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <LucideCompass className="h-5 w-5 text-white animate-spin-slow" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight block text-white bg-clip-text">Waypoint AI</span>
              <span className="text-[9px] text-slate-500 font-mono tracking-wider block uppercase">Live AWS Integration Stack</span>
            </div>
          </div>
          <button
            onClick={fetchSavedTrips}
            className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-400 transition-colors"
            title="Refresh Index"
          >
            <LucideRefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* LEFT COMPONENT: INGESTION CONTROL PANELS */}
        <div className="lg:col-span-4 space-y-6">

          {/* Active Text Parser Box */}
          <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 backdrop-blur-md space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-white">
              <LucideSparkles className="h-4 w-4 text-indigo-400" />
              <h3 className="font-bold text-xs tracking-wider uppercase">AI Telemetry Parser</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Paste confirmation documents, raw message schedules, or emails. Gemini transforms the unorganized copy directly into your database.
            </p>
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Example: Flight UA242 from LAX to NRT leaving 8:15 AM... Hotel reservation at Grand Hyatt Tokyo confirmation #83942..."
              className="w-full h-36 bg-[#0a0d14] border border-slate-900 rounded-xl p-4 text-xs text-slate-300 focus:outline-none focus:border-indigo-500/50 transition-colors resize-none placeholder:text-slate-700 font-mono leading-relaxed"
            />
            <button
              onClick={handleCreateTrip}
              disabled={isProcessing || !textInput.trim()}
              className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 disabled:from-slate-900 disabled:to-slate-900 disabled:text-slate-600 font-semibold text-xs py-3 rounded-xl tracking-wider transition-all flex items-center justify-center gap-2 text-white shadow-lg shadow-indigo-950/30"
            >
              {isProcessing ? (
                <>
                  <LucideLoader2 className="h-3.5 w-3.5 animate-spin text-indigo-400" />
                  Streaming to DynamoDB...
                </>
              ) : (
                <>
                  Ingest & Struct Payload
                  <LucideArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </div>

          {/* Connected Table Stream Sidebar */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold tracking-widest text-slate-500 uppercase px-1">AWS Managed Streams ({tripsList.length})</h4>
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
              {tripsList.length === 0 ? (
                <div className="text-center py-10 bg-slate-900/10 border border-dashed border-slate-900 rounded-2xl text-xs text-slate-600">
                  No active partitions located in table index.
                </div>
              ) : (
                tripsList.map((t) => (
                  <div
                    key={t.tripId}
                    onClick={() => setSelectedTrip(t)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex justify-between items-center group relative overflow-hidden ${selectedTrip?.tripId === t.tripId
                        ? "bg-slate-900/80 border-indigo-500/40 shadow-inner"
                        : "bg-slate-900/20 border-slate-900 hover:border-slate-800 hover:bg-slate-900/40"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${selectedTrip?.tripId === t.tripId ? "bg-indigo-600/10 text-indigo-400" : "bg-slate-950 text-slate-500"}`}>
                        <LucideBriefcase className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold block text-slate-200">{t.title || "Journey"}</span>
                        <span className="text-[9px] font-mono text-slate-500 block mt-0.5">{t.destination}</span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleDeleteTrip(e, t.tripId)}
                      className="text-slate-600 hover:text-rose-400 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <LucideTrash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COMPONENT: LIVE TIMELINE DISPLAY */}
        <div className="lg:col-span-8">
          {!selectedTrip ? (
            <div className="h-full min-h-[500px] border border-dashed border-slate-900 rounded-2xl flex flex-col items-center justify-center text-center p-8 bg-slate-900/5 backdrop-blur-xs">
              <LucideCompass className="h-8 w-8 text-slate-700 mb-3 stroke-[1.25]" />
              <h3 className="text-sm font-semibold text-slate-500">System Standby Mode</h3>
              <p className="text-xs text-slate-600 max-w-xs mt-1">
                Select a cluster record sequence from the sidebar index list or submit an itinerary above.
              </p>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">

              {/* Trip Metadata Header Card */}
              <div className="bg-gradient-to-b from-slate-900/40 to-slate-900/10 border border-slate-900 p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <div className="text-[9px] font-mono font-bold tracking-widest text-indigo-400 bg-indigo-500/5 border border-indigo-500/10 px-2 py-0.5 rounded w-max uppercase mb-2">
                    Partition Status: {selectedTrip.status || "Synced"}
                  </div>
                  <h2 className="text-xl font-black text-white tracking-tight">{selectedTrip.title}</h2>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mt-1">
                    <LucideMapPin className="h-3.5 w-3.5 text-slate-600" />
                    <span>{selectedTrip.destination}</span>
                  </div>
                </div>
                <div className="text-left sm:text-right font-mono bg-[#0a0d14] border border-slate-900 p-3 rounded-xl min-w-[150px]">
                  <span className="text-[9px] text-slate-500 uppercase tracking-wider block">Last Server Sync</span>
                  <span className="text-[11px] font-bold text-indigo-400 block mt-1">
                    {new Date(selectedTrip.syncedAt).toLocaleTimeString()}
                  </span>
                </div>
              </div>

              {/* Dynamic Chronological Stream Render */}
              <div className="space-y-6 relative before:absolute before:left-[23px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-900">
                {selectedTrip.itinerary?.map((event: ItineraryEvent, idx: number) => {
                  const isFlight = event.type === "flight" && event.flight
                  const isHotel = event.type === "hotel" && event.hotel
                  const isTransit = event.type === "transit" && event.transit
                  const isActivity = event.type === "activity" && event.activity

                  return (
                    <div key={idx} className="flex gap-4 items-start relative group">

                      {/* Event Specific Icon Nodes */}
                      <div className={`h-12 w-12 rounded-xl flex items-center justify-center border shrink-0 z-10 shadow-md ${event.type === "flight" ? "bg-[#0a1224] border-blue-500/20 text-blue-400" :
                          event.type === "hotel" ? "bg-[#0a1c14] border-emerald-500/20 text-emerald-400" :
                            event.type === "transit" ? "bg-[#1c140a] border-amber-500/20 text-amber-400" :
                              "bg-[#180a24] border-purple-500/20 text-purple-400"
                        }`}>
                        {event.type === "flight" && <LucidePlane className="h-5 w-5" />}
                        {event.type === "hotel" && <LucideHotel className="h-5 w-5" />}
                        {event.type === "transit" && <LucideTrain className="h-5 w-5" />}
                        {event.type === "activity" && <LucideActivity className="h-5 w-5" />}
                      </div>

                      {/* Main Dynamic Details Grid Structure */}
                      <div className="bg-slate-900/20 border border-slate-900/90 p-5 rounded-2xl flex-1 space-y-3 hover:border-slate-800/80 transition-colors shadow-xs">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <span className="text-[9px] font-mono tracking-wider font-bold text-slate-500 uppercase block">{event.type} Log</span>
                            <h4 className="text-sm font-bold text-slate-200 mt-0.5">{event.summary}</h4>
                          </div>
                          <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/5 border border-indigo-500/10 px-2 py-1 rounded-lg">
                            {event.startTime}
                          </span>
                        </div>

                        {/* FLIGHT TYPE SPECIFIC GRID SUB-ROW */}
                        {isFlight && event.flight && (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-900/60 text-xs">
                            <div>
                              <span className="text-[10px] text-slate-500 block uppercase font-mono">Airline / Number</span>
                              <span className="text-slate-300 font-semibold block mt-0.5">{event.flight.airline} {event.flight.flightNumber}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-500 block uppercase font-mono">Route</span>
                              <span className="text-slate-300 font-medium block mt-0.5">{event.flight.departureAirport} ➔ {event.flight.arrivalAirport}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-500 block uppercase font-mono">Terminal / Gate</span>
                              <span className="text-slate-300 font-medium block mt-0.5">T{event.flight.terminal} / Gate {event.flight.gate}</span>
                            </div>
                            {event.flight.baggageCarousel && (
                              <div className="col-span-full text-[10px] font-mono bg-blue-950/20 border border-blue-900/30 text-blue-300 px-2 py-1 rounded w-max">
                                🧳 Baggage Claim Carousel: <span className="font-bold">{event.flight.baggageCarousel}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* HOTEL TYPE SPECIFIC GRID SUB-ROW */}
                        {isHotel && event.hotel && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-900/60 text-xs">
                            <div>
                              <span className="text-[10px] text-slate-500 block uppercase font-mono">Property Name</span>
                              <span className="text-slate-300 font-semibold block mt-0.5">{event.hotel.name}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-500 block uppercase font-mono">Check-In Time Window</span>
                              <span className="text-slate-300 font-medium block mt-0.5">{event.hotel.checkInTime}</span>
                            </div>
                            <div className="col-span-full space-y-1">
                              <span className="text-[10px] text-slate-500 block uppercase font-mono">Local Navigation Directions</span>
                              <p className="text-slate-300 font-medium">{event.hotel.addressLocal}</p>
                              {event.hotel.addressLocalScript && (
                                <p className="text-xs text-indigo-300 bg-indigo-950/10 px-2 py-1 border border-indigo-900/20 rounded font-serif italic mt-1">
                                  Native Script Directions: {event.hotel.addressLocalScript}
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* TRANSIT TYPE SPECIFIC GRID SUB-ROW */}
                        {isTransit && event.transit && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-900/60 text-xs">
                            <div>
                              <span className="text-[10px] text-slate-500 block uppercase font-mono">Mode of Transport</span>
                              <span className="text-amber-400 font-semibold block mt-0.5 uppercase tracking-wide">{event.transit.mode}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-500 block uppercase font-mono">Routing Vector</span>
                              <span className="text-slate-300 font-medium block mt-0.5">{event.transit.from} ➔ {event.transit.to}</span>
                            </div>
                            {event.transit.note && (
                              <div className="col-span-full text-slate-400 italic text-xs border-l-2 border-slate-800 pl-2">
                                Note: {event.transit.note}
                              </div>
                            )}
                          </div>
                        )}

                        {/* ACTIVITY TYPE SPECIFIC GRID SUB-ROW */}
                        {isActivity && event.activity && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-900/60 text-xs">
                            <div>
                              <span className="text-[10px] text-slate-500 block uppercase font-mono">Event Name</span>
                              <span className="text-slate-300 font-semibold block mt-0.5">{event.activity.name}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-500 block uppercase font-mono">Venue Address</span>
                              <span className="text-slate-300 font-medium block mt-0.5">{event.activity.location}</span>
                            </div>
                            {event.activity.note && (
                              <div className="col-span-full text-purple-300/80 bg-purple-950/10 border border-purple-900/20 p-2 rounded">
                                Event Operations Guide: {event.activity.note}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Unified Confirmation Footer Line */}
                        {(isFlight && event.flight?.status) || (isHotel && event.hotel?.confirmationNumber) ? (
                          <div className="text-[10px] font-mono text-slate-600 bg-[#0a0d14] px-2 py-1 rounded w-max border border-slate-900/60">
                            CONFIRMATION ID: <span className="text-slate-400 font-bold">
                              {event.flight?.flightNumber ? `FLIGHT-ST-OK` : event.hotel?.confirmationNumber}
                            </span>
                          </div>
                        ) : null}

                      </div>
                    </div>
                  )
                })}
              </div>

            </div>
          )}
        </div>

      </main>
    </div>
  )
}
