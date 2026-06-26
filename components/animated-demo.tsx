"use client"

import { useEffect, useState } from "react"
import { Mail, Zap, CheckCircle2 } from "lucide-react"

export function AnimatedDemo() {
  const [step, setStep] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  // Cycle through steps every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % 3)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="mt-8 space-y-6">
      {/* Steps indicator */}
      <div className="flex items-center justify-between gap-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex flex-1 items-center gap-2">
            <div
              className={`flex size-10 items-center justify-center rounded-full border-2 transition-all duration-500 ${
                step === i
                  ? "border-accent bg-accent/20 scale-110"
                  : step > i
                    ? "border-accent/50 bg-accent/10"
                    : "border-muted-foreground/30 bg-transparent"
              }`}
            >
              {i === 0 && <Mail className="size-5 text-accent" />}
              {i === 1 && <Zap className="size-5 text-accent" />}
              {i === 2 && <CheckCircle2 className="size-5 text-accent" />}
            </div>
            {i < 2 && (
              <div
                className={`flex-1 h-1 rounded-full transition-all duration-500 ${
                  step > i ? "bg-accent/50" : "bg-muted-foreground/20"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step content with animation */}
      <div className="relative h-40 overflow-hidden rounded-2xl border border-border/50 bg-background/40 p-6">
        {/* Step 1: Email Input */}
        <div
          className={`absolute inset-0 flex flex-col gap-3 p-6 transition-all duration-500 ${
            step === 0
              ? "translate-x-0 opacity-100"
              : step > 0
                ? "-translate-x-full opacity-0"
                : "translate-x-full opacity-0"
          }`}
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Step 1: Paste Email
          </p>
          <div className="space-y-2">
            <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
              <div className="font-mono text-[10px]">
                <div>Booking Confirmation</div>
                <div className="mt-1 text-accent/70">Flight UA88 SFO → JFK</div>
                <div className="text-accent/70">Departs: 10:40 AM</div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Copy any email confirmation and paste it here...
            </p>
          </div>
        </div>

        {/* Step 2: AI Processing */}
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 transition-all duration-500 ${
            step === 1
              ? "translate-x-0 opacity-100"
              : step > 1
                ? "-translate-x-full opacity-0"
                : "translate-x-full opacity-0"
          }`}
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Step 2: AI Parsing
          </p>
          <div className="flex items-center gap-3">
            <Zap className="size-6 animate-pulse text-accent" />
            <div className="space-y-1">
              <div className="h-2 w-32 animate-pulse rounded-full bg-accent/30" />
              <div className="h-2 w-24 animate-pulse rounded-full bg-accent/20" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Extracting flight, hotel, and event details...</p>
        </div>

        {/* Step 3: Timeline Result */}
        <div
          className={`absolute inset-0 flex flex-col gap-3 p-6 transition-all duration-500 ${
            step === 2
              ? "translate-x-0 opacity-100"
              : step > 2
                ? "-translate-x-full opacity-0"
                : "translate-x-full opacity-0"
          }`}
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Step 3: Your Timeline
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-2 rounded-lg border border-accent/30 bg-accent/10 p-2">
              <CheckCircle2 className="size-4 text-accent" />
              <div className="text-xs">
                <div className="font-semibold text-foreground">Flight UA88</div>
                <div className="text-muted-foreground">10:40 AM - SFO to JFK</div>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-border/50 bg-background/40 p-2">
              <CheckCircle2 className="size-4 text-muted-foreground" />
              <div className="text-xs">
                <div className="font-semibold text-foreground">Hotel Check-in</div>
                <div className="text-muted-foreground">3:00 PM</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Step labels */}
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Paste Email</span>
        <span>Parse with AI</span>
        <span>View Timeline</span>
      </div>
    </div>
  )
}
