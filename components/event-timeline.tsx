"use client"

import { formatTime } from "@/lib/utils"
import type { Trip, ItineraryEvent } from "@/lib/types"
import { Plane, Hotel, Car, CalendarClock } from "lucide-react"

const ICONS: Record<ItineraryEvent["type"], typeof Plane> = {
  flight: Plane,
  hotel: Hotel,
  transit: Car,
  activity: CalendarClock,
}

export function EventTimeline({
  trip,
  activeEventIndex,
  onSelectEvent,
}: {
  trip: Trip
  activeEventIndex: number
  onSelectEvent: (index: number) => void
}) {
  return (
    <div className="mb-4 overflow-x-auto">
      <div className="flex gap-2 pb-2">
        {trip.itinerary.map((event, index) => {
          const Icon = ICONS[event.type]
          const isActive = index === activeEventIndex
          const isPast = index < activeEventIndex
          
          return (
            <button
              key={index}
              onClick={() => onSelectEvent(index)}
              className={`flex shrink-0 flex-col items-center gap-1.5 rounded-xl border p-2.5 transition-all ${
                isActive
                  ? "border-primary bg-primary/10"
                  : isPast
                    ? "border-border/50 bg-background/40 opacity-60"
                    : "border-border/50 bg-background/60 hover:border-border hover:bg-background"
              }`}
              aria-label={`Go to ${event.summary}`}
            >
              <Icon className={`size-4 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
              <div className="text-center">
                <p className="text-[10px] font-semibold text-foreground truncate max-w-[60px]">
                  {event.summary}
                </p>
                <p className="text-[9px] text-muted-foreground">
                  {formatTime(event.startTime)}
                </p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

/**
 * Determine the current event index based on real time vs itinerary times.
 * Returns the index of the event that's happening now or most recent.
 */
export function getCurrentEventIndex(trip: Trip): number {
  const now = new Date()
  let closestPastIndex = 0
  let closestPastTime = -Infinity

  for (let i = 0; i < trip.itinerary.length; i++) {
    const eventTime = parseTime(trip.itinerary[i].startTime)
    if (eventTime && eventTime <= now) {
      if (eventTime.getTime() > closestPastTime) {
        closestPastIndex = i
        closestPastTime = eventTime.getTime()
      }
    }
  }

  return closestPastIndex
}

function parseTime(timeStr: string): Date | null {
  // Assuming times are in HH:MM format (24-hour) or HH:MM AM/PM
  // For now, treating as time of day and assuming today's date
  try {
    const today = new Date()
    const [time, period] = timeStr.includes("AM") || timeStr.includes("PM")
      ? [timeStr.split(/\s+/)[0], timeStr.split(/\s+/)[1]]
      : [timeStr, ""]

    let [hours, minutes] = time.split(":").map(Number)

    if (period === "PM" && hours !== 12) hours += 12
    if (period === "AM" && hours === 12) hours = 0

    const date = new Date(today)
    date.setHours(hours, minutes, 0, 0)
    return date
  } catch {
    return null
  }
}
