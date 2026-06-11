"use client"

import { useMemo, useState } from "react"
import useSWR, { mutate } from "swr"
import { Navigation, Trash2, Plane, Sparkles, ScanText, Clock, Luggage, ChevronRight } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { IngestPanel } from "@/components/ingest-panel"
import { EventCard } from "@/components/event-card"
import { ContextMoment, type ContextState } from "@/components/context-moment"
import { DEMO_USER_ID } from "@/lib/constants"
import { cn } from "@/lib/utils"
import type { Trip } from "@/lib/types"
import { toast } from "sonner"

const TRIPS_KEY = `/api/trips?userId=${DEMO_USER_ID}`

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const CONTEXTS: { value: ContextState; label: string }[] = [
  { value: "PRE_FLIGHT", label: "Pre-Flight" },
  { value: "LANDED", label: "Landed" },
  { value: "GAP_TIME", label: "The Gap" },
]

export function Dashboard() {
  const { data, isLoading } = useSWR<{ trips: Trip[] }>(TRIPS_KEY, fetcher)
  const [context, setContext] = useState<ContextState>("PRE_FLIGHT")
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const trips = useMemo(() => data?.trips ?? [], [data])
  const activeTrip = useMemo(
    () => trips.find((t) => t.tripId === selectedId) ?? trips[0] ?? null,
    [trips, selectedId],
  )

  async function handleIngested(trip: Trip) {
    setSelectedId(trip.tripId)
    setContext("PRE_FLIGHT")
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
      <header className="mb-8">
        <div className="glass-panel relative overflow-hidden rounded-3xl border border-border p-5 shadow-lg lg:p-7">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-10 -top-16 size-48 rounded-full bg-primary/20 blur-3xl"
          />
          <div className="relative flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md shadow-primary/30">
                <Navigation className="size-5" />
              </span>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-foreground lg:text-2xl">
                  Waypoint
                </h1>
                <p className="text-[12px] text-muted-foreground lg:text-sm">
                  Travel day copilot
                </p>
              </div>
            </div>
            <span className="hidden items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-[11px] font-medium text-accent sm:inline-flex">
              <Sparkles className="size-3.5" />
              AI-powered
            </span>
          </div>
          <p className="relative mt-4 max-w-xl text-[15px] font-medium leading-relaxed text-foreground text-pretty lg:text-base">
            Stop digging through emails on travel day. Paste your booking
            confirmations and Waypoint becomes your single, on-time itinerary —
            telling you when to leave, which gate, and what to do during the
            gaps.
          </p>
          <ol className="relative mt-4 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-[11px] text-muted-foreground">
            <li className="flex items-center gap-1.5">
              <span className="flex size-4 items-center justify-center rounded-full bg-secondary font-mono text-[9px] font-semibold text-foreground">
                1
              </span>
              Paste a confirmation
            </li>
            <ChevronRight className="size-3 text-muted-foreground/50" />
            <li className="flex items-center gap-1.5">
              <span className="flex size-4 items-center justify-center rounded-full bg-secondary font-mono text-[9px] font-semibold text-foreground">
                2
              </span>
              Parse with AI
            </li>
            <ChevronRight className="size-3 text-muted-foreground/50" />
            <li className="flex items-center gap-1.5">
              <span className="flex size-4 items-center justify-center rounded-full bg-secondary font-mono text-[9px] font-semibold text-foreground">
                3
              </span>
              Get guidance for every moment
            </li>
          </ol>
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)] lg:items-start lg:gap-8">
        {/* Left column: ingestion + trip list */}
        <div className="space-y-5 lg:sticky lg:top-6">
          <IngestPanel onIngested={handleIngested} />

          {isLoading ? (
            <Skeleton className="h-32 w-full rounded-2xl" />
          ) : trips.length > 0 ? (
            <TripList
              trips={trips}
              activeId={activeTrip?.tripId ?? null}
              onSelect={(t) => {
                setSelectedId(t.tripId)
                setContext("PRE_FLIGHT")
              }}
              onDelete={handleDelete}
            />
          ) : null}
        </div>

        {/* Right column: active trip detail */}
        <div className="min-w-0">
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-24 w-full rounded-2xl" />
              <Skeleton className="h-40 w-full rounded-2xl" />
            </div>
          ) : activeTrip ? (
            <ActiveTrip
              trip={activeTrip}
              context={context}
              onContextChange={setContext}
              onDelete={() => handleDelete(activeTrip)}
            />
          ) : (
            <EmptyState />
          )}
        </div>
      </div>
    </div>
  )
}

function ActiveTrip({
  trip,
  context,
  onContextChange,
  onDelete,
}: {
  trip: Trip
  context: ContextState
  onContextChange: (c: ContextState) => void
  onDelete: () => void
}) {
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
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>

      <Tabs
        value={context}
        onValueChange={(v) => onContextChange(v as ContextState)}
      >
        <TabsList className="grid w-full grid-cols-3 lg:max-w-md">
          {CONTEXTS.map((c) => (
            <TabsTrigger key={c.value} value={c.value} className="text-[12px]">
              {c.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <ContextMoment trip={trip} context={context} />

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

function EmptyState() {
  const steps = [
    {
      icon: ScanText,
      title: "Paste anything",
      body: "Drop in a flight or hotel email — even messy, copied text works.",
    },
    {
      icon: Sparkles,
      title: "AI structures it",
      body: "Gemini extracts flights, stays, transit and reservations in order.",
    },
    {
      icon: Clock,
      title: "Get the right nudge",
      body: "See Pre-Flight, Landed and Gap-time guidance for every moment.",
    },
  ]

  return (
    <div className="glass-panel relative overflow-hidden rounded-3xl border border-border px-6 py-10 shadow-lg lg:px-10 lg:py-14">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-12 top-0 size-56 rounded-full bg-primary/15 blur-3xl"
      />
      <div className="relative flex flex-col items-center text-center">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/15 text-primary ring-1 ring-primary/20">
          <Plane className="size-6" />
        </span>
        <h3 className="mt-4 text-lg font-bold text-foreground text-balance">
          Build your travel day in seconds
        </h3>
        <p className="mt-1.5 max-w-sm text-[13px] leading-relaxed text-muted-foreground text-pretty">
          Waypoint reads your confirmations and assembles a clean, time-aware
          itinerary. Start by pasting a booking or loading the sample.
        </p>
      </div>

      <div className="relative mt-8 grid gap-3 sm:grid-cols-3">
        {steps.map((step, i) => (
          <div
            key={step.title}
            className="rounded-2xl border border-border bg-card/70 p-4 text-left"
          >
            <div className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-lg bg-secondary text-foreground">
                <step.icon className="size-4" />
              </span>
              <span className="font-mono text-[11px] font-semibold text-muted-foreground">
                0{i + 1}
              </span>
            </div>
            <p className="mt-3 text-sm font-semibold text-foreground">
              {step.title}
            </p>
            <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
              {step.body}
            </p>
          </div>
        ))}
      </div>

      <div className="relative mt-6 flex items-center justify-center gap-2 text-[11px] text-muted-foreground">
        <Luggage className="size-3.5 text-accent" />
        Works offline with a built-in parser, upgrades to AI when connected.
      </div>
    </div>
  )
}
