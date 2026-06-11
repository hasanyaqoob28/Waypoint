"use client"

import { Plane, Luggage, Hourglass, MapPin } from "lucide-react"
import type { Trip } from "@/lib/types"
import { WeatherWidget } from "@/components/weather-widget"

export type ContextState = "PRE_FLIGHT" | "LANDED" | "GAP_TIME"

const CONTEXT_META: Record<
  ContextState,
  { label: string; icon: typeof Plane }
> = {
  PRE_FLIGHT: { label: "Pre-Flight", icon: Plane },
  LANDED: { label: "Just Landed", icon: Luggage },
  GAP_TIME: { label: "The Gap", icon: Hourglass },
}

export function ContextMoment({
  trip,
  context,
}: {
  trip: Trip
  context: ContextState
}) {
  const flight = trip.itinerary.find((e) => e.type === "flight")?.flight ?? null
  const hotel = trip.itinerary.find((e) => e.type === "hotel")?.hotel ?? null
  const Icon = CONTEXT_META[context].icon
  // Destination to check weather for: arrival city, else the trip destination.
  const weatherPlace = flight?.arrivalCity || trip.destination || ""

  if (context === "PRE_FLIGHT") {
    return (
      <Banner icon={Icon} kicker="Heading to the airport">
        <p className="text-sm font-semibold text-foreground text-pretty">
          {flight
            ? `Leave with a buffer for ${flight.flightNumber} from ${flight.departureAirport}.`
            : "Leave with a comfortable buffer for your departure."}
        </p>
        <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
          {flight?.terminal
            ? `Head to Terminal ${flight.terminal}${flight.gate ? `, gate ${flight.gate}` : ""}. `
            : ""}
          Afternoon traffic tends to build up — departing now keeps your
          check-in stress-free.
        </p>
        {weatherPlace ? (
          <div className="mt-3">
            <WeatherWidget place={weatherPlace} />
          </div>
        ) : null}
      </Banner>
    )
  }

  if (context === "LANDED") {
    return (
      <Banner icon={Icon} kicker="Touchdown verified" tone="primary">
        <p className="text-sm font-semibold text-primary-foreground text-pretty">
          Welcome to {flight?.arrivalCity || trip.destination || "your destination"}.
        </p>
        <div className="mt-3 flex items-center justify-between gap-2 rounded-xl border border-primary-foreground/15 bg-background/20 px-3 py-2">
          <span className="inline-flex items-center gap-1.5 text-[12px] text-primary-foreground/90">
            <Luggage className="size-3.5" /> Baggage claim
          </span>
          <span className="rounded-md bg-background/30 px-2 py-0.5 font-mono text-sm font-bold text-primary-foreground">
            {flight?.baggageCarousel && flight.baggageCarousel !== "Pending"
              ? flight.baggageCarousel
              : "Awaiting"}
          </span>
        </div>
        {weatherPlace ? (
          <div className="mt-3">
            <WeatherWidget place={weatherPlace} />
          </div>
        ) : null}
      </Banner>
    )
  }

  return (
    <Banner icon={Icon} kicker="Time to spare" tone="accent">
      <p className="text-sm font-semibold text-foreground text-pretty">
        {hotel?.checkInTime
          ? `Check-in at ${hotel.name} opens at ${hotel.checkInTime}.`
          : "You have a gap before your next event."}
      </p>
      <p className="mt-1 flex items-center gap-1.5 text-[12px] leading-relaxed text-muted-foreground">
        <MapPin className="size-3.5" />
        Drop your bags at a nearby locker and explore while you wait — no need to
        haul luggage around.
      </p>
      {weatherPlace ? (
        <div className="mt-3">
          <WeatherWidget place={weatherPlace} />
        </div>
      ) : null}
    </Banner>
  )
}

function Banner({
  icon: Icon,
  kicker,
  children,
  tone = "default",
}: {
  icon: typeof Plane
  kicker: string
  children: React.ReactNode
  tone?: "default" | "primary" | "accent"
}) {
  const toneClasses =
    tone === "primary"
      ? "bg-primary border-primary/40"
      : tone === "accent"
        ? "bg-accent/10 border-accent/25"
        : "bg-card border-border"

  const kickerClasses =
    tone === "primary"
      ? "text-primary-foreground/80"
      : tone === "accent"
        ? "text-accent"
        : "text-primary"

  const iconWrap =
    tone === "primary"
      ? "bg-background/20 text-primary-foreground"
      : tone === "accent"
        ? "bg-accent/15 text-accent"
        : "bg-primary/12 text-primary"

  return (
    <div
      className={`animate-slide-up rounded-2xl border p-4 shadow-sm ${toneClasses}`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${iconWrap}`}
        >
          <Icon className="size-4.5" />
        </span>
        <div className="min-w-0">
          <p
            className={`text-[10px] font-semibold uppercase tracking-widest ${kickerClasses}`}
          >
            {kicker}
          </p>
          <div className="mt-0.5">{children}</div>
        </div>
      </div>
    </div>
  )
}
