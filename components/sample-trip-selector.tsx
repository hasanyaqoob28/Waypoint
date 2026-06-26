"use client"

import { SAMPLE_TRIPS } from "@/lib/constants"
import { Button } from "@/components/ui/button"

interface SampleTripSelectorProps {
  onSelectSample: (data: string) => void
}

export function SampleTripSelector({ onSelectSample }: SampleTripSelectorProps) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        Try Sample Trips
      </p>
      <div className="flex flex-wrap gap-2">
        {SAMPLE_TRIPS.map((trip) => (
          <Button
            key={trip.id}
            onClick={() => onSelectSample(trip.data)}
            variant="outline"
            className="text-sm h-8"
          >
            <span className="mr-1.5">{trip.emoji}</span>
            {trip.name}
          </Button>
        ))}
      </div>
    </div>
  )
}
