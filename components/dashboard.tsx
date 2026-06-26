"use client"

import { useEffect, useMemo, useState } from "react"
import useSWR, { mutate } from "swr"
import { Navigation, Trash2, Clock, Luggage, ListChecks } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { IngestPanel } from "@/components/ingest-panel"
import { EventCard } from "@/components/event-card"
import { LivePreview } from "@/components/live-preview"
import { EventTimeline, getCurrentEventIndex } from "@/components/event-timeline"
import { ContextMoment } from "@/components/context-moment"
import { AnimatedDemo } from "@/components/animated-demo"
import { DEMO_USER_ID } from "@/lib/constants"
import { cn } from "@/lib/utils"
import type { Trip, ItineraryEvent } from "@/lib/types"
import { toast } from "sonner"

const TRIPS_KEY = `/api/trips?userId=${DEMO_USER_ID}`

const fetcher = (url: string) => 
  fetch(url)
    .then((r) => {
      if (!r.ok) {
        console.warn("[v0] API returned status", r.status)
        return { trips: [] }
      }
      return r.json()
    })
    .catch((error) => {
      console.warn("[v0] Failed to fetch trips:", error.message)
      return { trips: [] }
    })

export function Dashboard() {
  const { data, isLoading } = useSWR<{ trips: Trip[] }>(TRIPS_KEY, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  })
  
  // Initialize selectedId from localStorage
  const [selectedId, setSelectedId] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("selectedTripId")
    }
    return null
  })

  // Persist selected trip ID to localStorage whenever it changes
  useEffect(() => {
    if (selectedId && typeof window !== "undefined") {
      localStorage.setItem("selectedTripId", selectedId)
    }
  }, [selectedId])

  // Handle tab visibility changes - restore state when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (typeof window !== "undefined" && document.visibilityState === "visible") {
        const saved = localStorage.getItem("selectedTripId")
        if (saved && saved !== selectedId) {
          setSelectedId(saved)
        }
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [selectedId])

  const trips = useMemo(() => data?.trips ?? [], [data])
  const activeTrip = useMemo(
    () => trips.find((t) => t.tripId === selectedId) ?? trips[0] ?? null,
    [trips, selectedId],
  )

  async function handleIngested(trip: Trip) {
    setSelectedId(trip.tripId)
    await mutate(
      TRIPS_KEY,
      (current: { trips: Trip[] } | undefined) => ({
        trips: [trip, ...(current?.trips ?? [])],
      }),
      { revalidate: false },
    )
  }

  async function handleDelete(trip: Trip) {
    if (trip.tripId === selectedId) setSelectedId(null)
    await mutate(
      TRIPS_KEY,
      (current: { trips: Trip[] } | undefined) => ({
        trips: (current?.trips ?? []).filter((t) => t.tripId !== trip.tripId),
      }),
      { revalidate: false },
    )
    try {
      await fetch("/api/trips", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: DEMO_USER_ID, tripId: trip.tripId }),
      })
      toast.success("Trip removed")
    } catch {
      toast.error("Could not delete trip")
      mutate(TRIPS_KEY)
    }
  }

  return (
    <div className="mx-auto min-h-screen w-full max-w-6xl px-4 pb-16 pt-6 lg:px-8">
      <header className="mb-6">
        <div className="glass-panel relative overflow-hidden rounded-3xl border border-border p-5 shadow-lg lg:p-6">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-20 size-64 rounded-full bg-primary/20 blur-3xl"
          />
          {/* Brand bar — always visible */}
          <div className="relative flex items-start gap-x-4">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md shadow-primary/30">
              <Navigation className="size-5" />
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-foreground lg:text-2xl">
                  Travelway
                </h1>
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-[10px] font-medium text-accent lg:hidden">
                  <span className="relative flex size-1.5">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-70" />
                    <span className="relative inline-flex size-1.5 rounded-full bg-accent" />
                  </span>
                  Live
                </span>
              </div>
              <p className="text-[12px] text-muted-foreground lg:text-sm">
                Your whole trip, in one calm timeline
              </p>
              <span className="hidden items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-[11px] font-medium text-accent lg:inline-flex">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-70" />
                  <span className="relative inline-flex size-2 rounded-full bg-accent" />
                </span>
                Live sync
              </span>
            </div>
          </div>

          {/* Explanatory text and feature boxes — only when no trip is active */}
          {!activeTrip && (
            <div className="relative mt-6 hidden lg:block">
              {/* Desktop: full marketing description + feature cards */}
              <div className="grid gap-6 lg:grid-cols-[1fr_280px] lg:items-start">
                <div className="space-y-4">
                  <p className="max-w-2xl text-[13px] leading-relaxed text-muted-foreground text-pretty lg:text-sm">
                    Stop digging through emails on travel day. Paste your booking
                    confirmations and Travelway AI becomes your single source of truth —
                    telling you when to leave, which gate, what your baggage carousel is,
                    and what to do during the gaps.
                  </p>
                  
                  {/* Animated demo flow */}
                  <AnimatedDemo />
                </div>

                {/* Three key value props — right column */}
                <div className="grid gap-2.5">
                  {DASHBOARD_FEATURES.map((feature) => (
                    <div
                      key={feature.title}
                      className="rounded-xl border border-border/50 bg-background/40 p-2.5"
                    >
                      <div className="flex items-start gap-2">
                        <span className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-secondary text-foreground">
                          <feature.icon className="size-3" />
                        </span>
                        <div className="min-w-0">
                          <p className="text-[11px] font-semibold text-foreground">
                            {feature.title}
                          </p>
                          <p className="text-[10px] leading-relaxed text-muted-foreground">
                            {feature.body}
                          </p>
                        </div>
                      </div>
                  </div>
                ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] lg:items-start lg:gap-8">
        {/* Left panel: the input */}
        <div className="space-y-5 lg:sticky lg:top-6">
          <IngestPanel onIngested={handleIngested} />

          {isLoading ? (
            <Skeleton className="h-32 w-full rounded-2xl" />
          ) : trips.length > 0 ? (
            <TripList
              trips={trips}
              activeId={activeTrip?.tripId ?? null}
              onSelect={(t) => setSelectedId(t.tripId)}
              onDelete={handleDelete}
            />
          ) : null}
        </div>

        {/* Right panel: the live reward */}
        <div className="min-w-0">
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-24 w-full rounded-2xl" />
              <Skeleton className="h-40 w-full rounded-2xl" />
            </div>
          ) : activeTrip ? (
            <ActiveTrip
              key={activeTrip.tripId}
              trip={activeTrip}
              onDelete={() => handleDelete(activeTrip)}
            />
          ) : (
            <LivePreview />
          )}
        </div>
      </div>
    </div>
  )
}

function ActiveTrip({
  trip,
  onDelete,
}: {
  trip: Trip
  onDelete: () => void
}) {
  const [selectedEventIndex, setSelectedEventIndex] = useState(0)
  const [autoIndex, setAutoIndex] = useState<number | null>(null)

  // Auto-detect current event on mount and update every minute
  useEffect(() => {
    const updateAutoIndex = () => {
      setAutoIndex(getCurrentEventIndex(trip))
    }
    updateAutoIndex()
    const interval = setInterval(updateAutoIndex, 60000)
    return () => clearInterval(interval)
  }, [trip.tripId])

  // Use auto-detected index if available, otherwise manual selection
  const eventIndex = autoIndex !== null ? autoIndex : selectedEventIndex
  const currentEvent = trip.itinerary[eventIndex]

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Active trip
          </p>
          <h2 className="truncate text-base font-bold text-foreground lg:text-xl">
            {trip.title}
          </h2>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          aria-label="Delete trip"
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>

      {/* Event timeline — shows all events with current highlighted */}
      <EventTimeline
        trip={trip}
        activeEventIndex={eventIndex}
        onSelectEvent={setSelectedEventIndex}
      />

      {/* Event-specific guidance */}
      {currentEvent && <ContextMoment trip={trip} event={currentEvent} />}

      {/* Full itinerary */}
      <div className="space-y-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Itinerary
        </p>
        <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0">
          {trip.itinerary.map((event, i) => (
            <EventCard key={`${event.type}-${i}`} event={event} />
          ))}
        </div>
      </div>
    </section>
  )
}

function TripList({
  trips,
  activeId,
  onSelect,
  onDelete,
}: {
  trips: Trip[]
  activeId: string | null
  onSelect: (trip: Trip) => void
  onDelete: (trip: Trip) => void
}) {
  return (
    <section className="space-y-2">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        Your trips
      </p>
      {trips.map((trip) => {
        const isActive = trip.tripId === activeId
        return (
          <div
            key={trip.tripId}
            className={cn(
              "flex items-center justify-between gap-2 rounded-xl border bg-card p-3 transition-colors",
              isActive
                ? "border-primary/60 bg-primary/5"
                : "border-border hover:border-border/80 hover:bg-card/80",
            )}
          >
            <button
              type="button"
              onClick={() => onSelect(trip)}
              className="min-w-0 flex-1 text-left"
              aria-current={isActive ? "true" : undefined}
            >
              <p className="truncate text-sm font-medium text-foreground">
                {trip.title}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {trip.itinerary.length} events · {trip.destination || "—"}
              </p>
            </button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(trip)}
              aria-label={`Delete ${trip.title}`}
              className="shrink-0 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        )
      })}
    </section>
  )
}

const DASHBOARD_FEATURES = [
  {
    icon: ListChecks,
    title: "One inbox, one itinerary",
    body: "Scattered flight, hotel and reservation emails become a single ordered timeline.",
  },
  {
    icon: Clock,
    title: "Knows the moment",
    body: "Pre-Flight, Landed and Gap-time views surface only what matters right now.",
  },
  {
    icon: Luggage,
    title: "Travel-day ready",
    body: "Departure buffers, gates, baggage and downtime ideas at a glance.",
  },
]
