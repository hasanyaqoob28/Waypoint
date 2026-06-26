"use client"

import { useRef, useState } from "react"
import { Sparkles, Loader2, Wand2 } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { DEMO_USER_ID, SAMPLE_CONFIRMATION } from "@/lib/constants"
import { SampleTripSelector } from "@/components/sample-trip-selector"
import { cn } from "@/lib/utils"
import type { Trip } from "@/lib/types"

export function IngestPanel({ onIngested }: { onIngested: (trip: Trip) => void }) {
  const [rawText, setRawText] = useState("")
  const [loading, setLoading] = useState(false)
  const [typing, setTyping] = useState(false)
  const typingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  function handleUseSample(sampleData: string = SAMPLE_CONFIRMATION) {
    if (loading || typing) return
    if (typingRef.current) clearInterval(typingRef.current)
    setTyping(true)
    setRawText("")
    let i = 0
    // Auto-type the sample so the user watches it stream in (show, don't tell).
    typingRef.current = setInterval(() => {
      i += 3
      setRawText(sampleData.slice(0, i))
      if (i >= sampleData.length) {
        if (typingRef.current) clearInterval(typingRef.current)
        setTyping(false)
      }
    }, 16)
  }

  async function handleParse() {
    if (!rawText.trim()) {
      toast.error("Paste a confirmation first")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: DEMO_USER_ID, rawText }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.details || data.error || "Parsing failed")
      }
      toast.success("Itinerary parsed and saved")
      onIngested(data.trip as Trip)
      setRawText("")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong"
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="glass-panel rounded-3xl border border-border p-5 shadow-lg">
      <div className="flex items-center gap-2">
        <span className="flex size-7 items-center justify-center rounded-lg bg-accent/15 text-accent">
          <Sparkles className="size-4" />
        </span>
        <h2 className="text-sm font-semibold text-foreground">
          Add a trip
        </h2>
        <span className="ml-auto rounded-full bg-secondary px-2 py-0.5 font-mono text-[10px] font-semibold text-muted-foreground">
          STEP 1
        </span>
      </div>
      <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
        Copy a flight or hotel confirmation email and paste it below — no
        formatting needed. New here? Tap{" "}
        <span className="font-medium text-foreground">Use sample</span> to see it
        work instantly.
      </p>

      <Textarea
        value={rawText}
        onChange={(e) => setRawText(e.target.value)}
        placeholder="e.g. 'Your flight UA88 from SFO departs at 10:40 AM, Gate G10…'"
        className={cn(
          "mt-4 min-h-32 resize-none bg-background/50 text-[13px] leading-relaxed",
          typing && "ring-2 ring-accent/40",
        )}
        disabled={loading || typing}
      />

      <div className="mt-3 flex items-center gap-2">
        <Button
          onClick={handleParse}
          disabled={loading || typing || !rawText.trim()}
          className="flex-1"
        >
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Building itinerary…
            </>
          ) : (
            <>
              <Wand2 className="size-4" />
              Parse with AI
            </>
          )}
        </Button>
        <Button
          variant="secondary"
          onClick={() => handleUseSample()}
          disabled={loading || typing}
        >
          {typing ? "Typing…" : "Use sample"}
        </Button>
      </div>

      <div className="mt-4 border-t border-border pt-4">
        <SampleTripSelector onSelectSample={handleUseSample} />
      </div>
    </section>
  )
}
