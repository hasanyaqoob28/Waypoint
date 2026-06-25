"use client"

import { Plane, Luggage, MapPin, Clock } from "lucide-react"
import type { Trip, ItineraryEvent } from "@/lib/types"
import { WeatherWidget } from "@/components/weather-widget"

export function ContextMoment({
  trip,
  event,
}: {
  trip: Trip
  event: ItineraryEvent
}) {
  // Destination for weather: arrival city for flights, or trip destination
  const weatherPlace =
    (event.type === "flight" && event.flight?.arrivalCity) || trip.destination || ""

  if (event.type === "flight" && event.flight) {
    return (
      <FlightGuidance flight={event.flight} weatherPlace={weatherPlace} />
    )
  }

  if (event.type === "hotel" && event.hotel) {
    return (
      <HotelGuidance hotel={event.hotel} weatherPlace={weatherPlace} />
    )
  }

  if (event.type === "activity" && event.activity) {
    return <ActivityGuidance activity={event.activity} />
  }

  if (event.type === "transit" && event.transit) {
    return <TransitGuidance transit={event.transit} />
  }

  return null
}

function FlightGuidance({
  flight,
  weatherPlace,
}: {
  flight: NonNullable<ItineraryEvent["flight"]>
  weatherPlace: string
}) {
  const departureTime = flight.departureTimeLocal.split(" ")[0] // Just HH:MM
  
  return (
    <Banner icon={Plane} kicker="Your flight" tone="default">
      <div className="space-y-3">
        <p className="text-sm font-semibold text-primary-foreground text-pretty">
          {flight.flightNumber} departs at {departureTime} from{" "}
          {flight.departureCity}.
        </p>
        <div className="space-y-2 rounded-xl border border-primary-foreground/15 bg-background/20 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-primary-foreground/80">
            Before boarding
          </p>
          <ul className="space-y-1.5 text-[12px] text-primary-foreground/90">
            {flight.terminal && (
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-primary-foreground/50" />
                Head to Terminal {flight.terminal}
                {flight.gate ? `, gate ${flight.gate}` : ""}
              </li>
            )}
            {flight.status && (
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-primary-foreground/50" />
                Status: {flight.status}
              </li>
            )}
            <li className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-primary-foreground/50" />
              Allow 30 mins for check-in and security
            </li>
          </ul>
        </div>
        {weatherPlace && (
          <div className="mt-3">
            <WeatherWidget place={weatherPlace} />
          </div>
        )}
      </div>
    </Banner>
  )
}

function HotelGuidance({
  hotel,
  weatherPlace,
}: {
  hotel: NonNullable<ItineraryEvent["hotel"]>
  weatherPlace: string
}) {
  return (
    <Banner icon={Luggage} kicker="Your stay" tone="accent">
      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground text-pretty">
          {hotel.name}
        </p>
        <div className="space-y-2 rounded-xl border border-accent/25 bg-accent/5 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-accent">
            Check-in details
          </p>
          <div className="space-y-1.5 text-[12px]">
            {hotel.checkInTime && (
              <p className="flex items-center gap-2 text-foreground">
                <Clock className="size-3.5 text-accent" />
                Opens at {hotel.checkInTime}
              </p>
            )}
            {hotel.addressLocal && (
              <p className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="mt-0.5 size-3.5 shrink-0 text-accent" />
                <span className="line-clamp-2">{hotel.addressLocal}</span>
              </p>
            )}
            {hotel.confirmationNumber && (
              <p className="flex items-center gap-2 text-muted-foreground">
                <span className="font-mono text-[11px]">
                  Conf: {hotel.confirmationNumber}
                </span>
              </p>
            )}
          </div>
        </div>
        {weatherPlace && (
          <div className="mt-3">
            <WeatherWidget place={weatherPlace} />
          </div>
        )}
      </div>
    </Banner>
  )
}

function ActivityGuidance({
  activity,
}: {
  activity: NonNullable<ItineraryEvent["activity"]>
}) {
  return (
    <Banner icon={Plane} kicker="Upcoming reservation">
      <div className="space-y-2">
        <p className="text-sm font-semibold text-foreground">{activity.name}</p>
        <div className="flex flex-col gap-1.5 text-[12px] text-muted-foreground">
          {activity.time && (
            <p className="flex items-center gap-2">
              <Clock className="size-3.5" /> {activity.time}
            </p>
          )}
          {activity.location && (
            <p className="flex items-start gap-2">
              <MapPin className="mt-0.5 size-3.5 shrink-0" />
              {activity.location}
            </p>
          )}
        </div>
        {activity.note && (
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            {activity.note}
          </p>
        )}
      </div>
    </Banner>
  )
}

function TransitGuidance({
  transit,
}: {
  transit: NonNullable<ItineraryEvent["transit"]>
}) {
  return (
    <Banner icon={Plane} kicker="Transit" tone="default">
      <div className="space-y-2">
        <p className="text-sm font-semibold text-foreground">
          {transit.mode || "Transit"}: {transit.from} → {transit.to}
        </p>
        {transit.note && (
          <p className="text-[12px] leading-relaxed text-muted-foreground">
            {transit.note}
          </p>
        )}
      </div>
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
      ? "bg-card border-primary/40 border-l-4 border-l-primary"
      : tone === "accent"
        ? "bg-accent/10 border-accent/25"
        : "bg-card border-border/50 border-l-4 border-l-primary"

  const kickerClasses =
    tone === "primary"
      ? "text-primary-foreground/80"
      : tone === "accent"
        ? "text-accent"
        : "text-primary"

  const iconWrap =
    tone === "primary"
      ? "bg-primary/15 text-primary"
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

