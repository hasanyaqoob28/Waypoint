"use client"

import { useState } from "react"
import {
  Plane,
  Hotel,
  Car,
  CalendarClock,
  Copy,
  Check,
  Luggage,
  MapPin,
  Clock,
  Hash,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import type { ItineraryEvent } from "@/lib/types"

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(value)
        setCopied(true)
        toast.success(`${label} copied`)
        setTimeout(() => setCopied(false), 1800)
      }}
      className="inline-flex shrink-0 items-center gap-1 rounded-md border border-border bg-secondary px-2 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground active:scale-95"
      aria-label={`Copy ${label}`}
    >
      {copied ? (
        <Check className="size-3 text-chart-3" />
      ) : (
        <Copy className="size-3" />
      )}
      {copied ? "Copied" : "Copy"}
    </button>
  )
}

const ICONS: Record<ItineraryEvent["type"], typeof Plane> = {
  flight: Plane,
  hotel: Hotel,
  transit: Car,
  activity: CalendarClock,
}

const TYPE_LABEL: Record<ItineraryEvent["type"], string> = {
  flight: "Flight",
  hotel: "Stay",
  transit: "Transit",
  activity: "Reservation",
}

export function EventCard({ event }: { event: ItineraryEvent }) {
  const Icon = ICONS[event.type]

  return (
    <article className="animate-slide-up rounded-2xl border border-border bg-card p-4 shadow-sm">
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary/12 text-primary">
            <Icon className="size-4.5" />
          </span>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              {TYPE_LABEL[event.type]}
            </p>
            <h3 className="text-sm font-semibold leading-tight text-foreground text-pretty">
              {event.summary}
            </h3>
          </div>
        </div>
        {event.flight?.status ? (
          <Badge
            variant="outline"
            className="border-chart-3/30 bg-chart-3/10 text-chart-3"
          >
            {event.flight.status}
          </Badge>
        ) : null}
      </header>

      {event.type === "flight" && event.flight ? (
        <FlightBody flight={event.flight} />
      ) : null}
      {event.type === "hotel" && event.hotel ? (
        <HotelBody hotel={event.hotel} />
      ) : null}
      {event.type === "transit" && event.transit ? (
        <TransitBody transit={event.transit} />
      ) : null}
      {event.type === "activity" && event.activity ? (
        <ActivityBody activity={event.activity} />
      ) : null}
    </article>
  )
}

function FlightBody({ flight }: { flight: NonNullable<ItineraryEvent["flight"]> }) {
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="font-mono text-xl font-bold tracking-tight text-foreground">
            {flight.departureAirport || "—"}
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {flight.departureCity}
          </p>
          {flight.departureTimeLocal ? (
            <p className="mt-1 text-[11px] font-medium text-foreground/80">
              {flight.departureTimeLocal}
            </p>
          ) : null}
        </div>

        <div className="flex flex-1 items-center px-3">
          <span className="h-px flex-1 border-t border-dashed border-border" />
          <Plane className="mx-1.5 size-3.5 rotate-90 text-primary" />
          <span className="h-px flex-1 border-t border-dashed border-border" />
        </div>

        <div className="text-right">
          <p className="font-mono text-xl font-bold tracking-tight text-foreground">
            {flight.arrivalAirport || "—"}
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {flight.arrivalCity}
          </p>
          {flight.arrivalTimeLocal ? (
            <p className="mt-1 text-[11px] font-medium text-foreground/80">
              {flight.arrivalTimeLocal}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 border-t border-border pt-3 text-[11px]">
        <Detail label="Flight" value={flight.flightNumber} />
        <Detail
          label="Terminal / Gate"
          value={[flight.terminal, flight.gate].filter(Boolean).join(" · ") || "—"}
        />
        <Detail label="Baggage" value={flight.baggageCarousel || "Pending"} />
      </div>
    </div>
  )
}

function HotelBody({ hotel }: { hotel: NonNullable<ItineraryEvent["hotel"]> }) {
  const addressForDriver = hotel.addressLocalScript || hotel.addressLocal
  return (
    <div className="mt-4 space-y-3">
      <p className="text-sm font-semibold text-foreground">{hotel.name}</p>

      {addressForDriver ? (
        <div className="rounded-xl border border-border bg-background/60 p-3">
          <div className="flex items-start justify-between gap-2">
            <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              <MapPin className="size-3" /> Show driver
            </p>
            <CopyButton value={addressForDriver} label="Address" />
          </div>
          <p className="mt-1.5 select-all text-base font-semibold leading-snug text-chart-3">
            {addressForDriver}
          </p>
          {hotel.addressLocalScript && hotel.addressLocal ? (
            <p className="mt-1 text-[11px] text-muted-foreground">
              {hotel.addressLocal}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-3 text-[11px]">
        {hotel.checkInTime ? (
          <Detail
            label="Check-in"
            value={hotel.checkInTime}
            icon={<Clock className="size-3" />}
          />
        ) : null}
        {hotel.confirmationNumber ? (
          <Detail
            label="Confirmation"
            value={hotel.confirmationNumber}
            mono
            icon={<Hash className="size-3" />}
          />
        ) : null}
      </div>
    </div>
  )
}

function TransitBody({
  transit,
}: {
  transit: NonNullable<ItineraryEvent["transit"]>
}) {
  return (
    <div className="mt-4 space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <span className="capitalize">{transit.mode || "Transit"}</span>
        <span className="text-muted-foreground">·</span>
        <span className="text-muted-foreground">
          {transit.from} → {transit.to}
        </span>
      </div>
      {transit.note ? (
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          {transit.note}
        </p>
      ) : null}
    </div>
  )
}

function ActivityBody({
  activity,
}: {
  activity: NonNullable<ItineraryEvent["activity"]>
}) {
  return (
    <div className="mt-4 space-y-2">
      <p className="text-sm font-semibold text-foreground">{activity.name}</p>
      <div className="flex flex-wrap gap-3 text-[11px] text-muted-foreground">
        {activity.time ? (
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3" /> {activity.time}
          </span>
        ) : null}
        {activity.location ? (
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-3" /> {activity.location}
          </span>
        ) : null}
      </div>
      {activity.note ? (
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          {activity.note}
        </p>
      ) : null}
    </div>
  )
}

function Detail({
  label,
  value,
  mono,
  icon,
}: {
  label: string
  value: string
  mono?: boolean
  icon?: React.ReactNode
}) {
  return (
    <div>
      <p className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </p>
      <p
        className={cn(
          "mt-0.5 font-semibold text-foreground",
          mono && "font-mono",
        )}
      >
        {value || "—"}
      </p>
    </div>
  )
}
