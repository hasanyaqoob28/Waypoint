"use client"

import { useEffect, useState } from "react"
import { Plane, Clock, MapPin, Wifi, ScanText, Sparkles, Luggage } from "lucide-react"

/**
 * A self-contained, animated "Live Activity" style preview shown before the
 * user has any trips. It demonstrates what Waypoint produces — a calm, live
 * travel-day card — instead of explaining it with static text.
 */
export function LivePreview() {
  // Boarding countdown ticking down from 42:00 for a sense of "live".
  const [secondsLeft, setSecondsLeft] = useState(42 * 60)

  useEffect(() => {
    const id = setInterval(() => {
      setSecondsLeft((s) => (s <= 0 ? 42 * 60 : s - 1))
    }, 1000)
    return () => clearInterval(id)
  }, [])

  const mins = Math.floor(secondsLeft / 60)
  const secs = secondsLeft % 60
  const countdown = `${mins}:${secs.toString().padStart(2, "0")}`
  // Progress of the boarding window (filled as time elapses toward 0).
  const progress = Math.min(100, Math.max(0, ((42 * 60 - secondsLeft) / (42 * 60)) * 100))

  return (
    <div className="glass-panel relative overflow-hidden rounded-3xl border border-border px-4 py-6 shadow-lg sm:px-6">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-12 top-0 size-56 rounded-full bg-primary/15 blur-3xl"
      />

      <div className="relative mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex size-2.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-70" />
            <span className="relative inline-flex size-2.5 rounded-full bg-accent" />
          </span>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Live preview
          </p>
        </div>
        <p className="text-[11px] text-muted-foreground">This is what you get</p>
      </div>

      {/* Phone-style frame holding the live activity */}
      <div className="relative mx-auto w-full max-w-[300px]">
        <div className="rounded-[2.25rem] border border-border bg-background/80 p-2.5 shadow-2xl ring-1 ring-white/5">
          {/* status bar */}
          <div className="flex items-center justify-between px-3 py-1.5 text-[10px] font-medium text-muted-foreground">
            <span>9:41</span>
            <span className="flex items-center gap-1">
              <Wifi className="size-3" />
              Live
            </span>
          </div>

          {/* Live Activity card */}
          <div className="space-y-3 rounded-[1.75rem] bg-card p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Plane className="size-3.5" />
                </span>
                <div className="leading-tight">
                  <p className="text-[12px] font-bold text-foreground">JL6</p>
                  <p className="text-[10px] text-muted-foreground">
                    Japan Airlines
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-semibold text-accent">
                Pre-Flight
              </span>
            </div>

            {/* Flight path arc */}
            <FlightArc />

            <div className="flex items-end justify-between">
              <div className="leading-tight">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  JFK · T1
                </p>
                <p className="text-sm font-bold text-foreground">12:15 PM</p>
              </div>
              <div className="text-right leading-tight">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  HND
                </p>
                <p className="text-sm font-bold text-foreground">3:25 PM</p>
              </div>
            </div>

            {/* Boarding countdown */}
            <div className="rounded-xl border border-border bg-secondary/60 p-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <Clock className="size-3.5" />
                  Boarding in
                </span>
                <span className="font-mono text-sm font-bold tabular-nums text-foreground">
                  {countdown}
                </span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-1000 ease-linear"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-2 text-[11px] font-medium text-foreground">
                Gate 4 · leave for the airport now
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Next nudge teaser */}
      <div className="relative mx-auto mt-4 flex max-w-[300px] items-center gap-2 rounded-xl border border-border bg-card/60 px-3 py-2.5">
        <MapPin className="size-4 shrink-0 text-accent" />
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          After landing, Waypoint shows your hotel check-in and a dinner
          reservation at <span className="font-medium text-foreground">Narisawa</span>.
        </p>
      </div>

      <p className="relative mx-auto mt-4 max-w-[320px] text-center text-[12px] leading-relaxed text-muted-foreground">
        Paste a confirmation or tap{" "}
        <span className="font-semibold text-foreground">Use sample</span> to turn
        your own messy emails into a card like this.
      </p>

      {/* How it works — three quick steps */}
      <div className="relative mt-6 grid gap-2.5 border-t border-border pt-5 sm:grid-cols-3">
        {STEPS.map((step, i) => (
          <div
            key={step.title}
            className="rounded-2xl border border-border bg-card/60 p-3"
          >
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-secondary text-foreground">
                <step.icon className="size-3.5" />
              </span>
              <span className="font-mono text-[10px] font-semibold text-muted-foreground">
                0{i + 1}
              </span>
            </div>
            <p className="mt-2 text-[12px] font-semibold text-foreground">
              {step.title}
            </p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
              {step.body}
            </p>
          </div>
        ))}
      </div>
      <p className="relative mt-3 flex items-center justify-center gap-1.5 text-center text-[11px] text-muted-foreground">
        <Luggage className="size-3.5 text-accent" />
        Works offline with a built-in parser, upgrades to AI when connected.
      </p>
    </div>
  )
}

const STEPS = [
  {
    icon: ScanText,
    title: "Paste anything",
    body: "Drop in a flight or hotel email — even messy, copied text works.",
  },
  {
    icon: Sparkles,
    title: "AI structures it",
    body: "Flights, stays, transit and reservations are extracted in order.",
  },
  {
    icon: Clock,
    title: "Get the right nudge",
    body: "See Pre-Flight, Landed and Gap-time guidance for every moment.",
  },
]

function FlightArc() {
  return (
    <svg
      viewBox="0 0 260 60"
      className="h-12 w-full"
      role="img"
      aria-label="Flight path from JFK to Haneda"
    >
      <defs>
        <linearGradient id="arc-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="oklch(0.62 0.18 256)" stopOpacity="0.2" />
          <stop offset="50%" stopColor="oklch(0.62 0.18 256)" stopOpacity="0.9" />
          <stop offset="100%" stopColor="oklch(0.62 0.18 256)" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      {/* origin + destination dots */}
      <circle cx="14" cy="46" r="4" fill="oklch(0.62 0.18 256)" />
      <circle cx="246" cy="46" r="4" fill="oklch(0.78 0.14 75)" />
      {/* dashed arc */}
      <path
        d="M14 46 Q 130 -8 246 46"
        fill="none"
        stroke="url(#arc-grad)"
        strokeWidth="2"
        strokeDasharray="4 5"
        className="wp-arc-draw"
      />
      {/* plane traveling along the arc */}
      <g className="wp-arc-plane">
        <circle r="9" fill="oklch(0.62 0.18 256)" />
        <path
          d="M-3.5 0 L3 -2.5 L1.5 0 L3 2.5 Z"
          fill="oklch(0.98 0 0)"
          transform="rotate(0)"
        />
      </g>
    </svg>
  )
}
