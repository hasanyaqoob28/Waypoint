"use client"

import { useState } from "react"
import {
  Sun,
  Cloud,
  CloudSun,
  CloudRain,
  Snowflake,
  Droplets,
  Wind,
  Loader2,
  CloudOff,
} from "lucide-react"

interface WeatherData {
  place: string
  temperature: number
  feelsLike: number
  humidity: number
  windSpeed: number
  label: string
  icon: string
}

const ICONS: Record<string, typeof Sun> = {
  sun: Sun,
  "cloud-sun": CloudSun,
  cloud: Cloud,
  "cloud-rain": CloudRain,
  snow: Snowflake,
}

export function WeatherWidget({ place }: { place: string }) {
  const [data, setData] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function check() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/weather?place=${encodeURIComponent(place)}`)
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || "Weather unavailable")
        setData(null)
      } else {
        setData(json)
      }
    } catch {
      setError("Weather unavailable")
    } finally {
      setLoading(false)
    }
  }

  if (data) {
    const Icon = ICONS[data.icon] ?? Cloud
    return (
      <div className="animate-slide-up rounded-xl border border-accent/25 bg-accent/10 p-3">
        <div className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-accent">
            <Icon className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-foreground">
                {data.temperature}°C
              </span>
              <span className="truncate text-[12px] text-muted-foreground">
                {data.label} in {data.place}
              </span>
            </div>
            <div className="mt-1 flex items-center gap-3 text-[11px] text-muted-foreground">
              <span>Feels {data.feelsLike}°</span>
              <span className="inline-flex items-center gap-1">
                <Droplets className="size-3" />
                {data.humidity}%
              </span>
              <span className="inline-flex items-center gap-1">
                <Wind className="size-3" />
                {data.windSpeed} km/h
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={check}
      disabled={loading}
      className="flex w-full items-center justify-center gap-2 rounded-xl border border-accent/25 bg-accent/10 px-3 py-2.5 text-[13px] font-medium text-accent transition-colors hover:bg-accent/15 disabled:opacity-60"
    >
      {loading ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          Checking weather…
        </>
      ) : error ? (
        <>
          <CloudOff className="size-4" />
          {error} · Retry
        </>
      ) : (
        <>
          <Sun className="size-4" />
          Check local weather in {place}
        </>
      )}
    </button>
  )
}
