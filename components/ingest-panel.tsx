"use client"

import { useState } from "react"
import { Sparkles, Loader2, Wand2 } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { DEMO_USER_ID, SAMPLE_CONFIRMATION } from "@/lib/constants"
import type { Trip } from "@/lib/types"

export function IngestPanel({ onIngested }: { onIngested: (trip: Trip) => void }) {
  const [rawText, setRawText] = useState("")
  const [loading, setLoading] = useState(false)

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
          Intelligent Ingestion
        </h2>
      </div>
      <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
        Paste any messy flight or hotel confirmation. Gemini extracts a clean,
        chronological itinerary and saves it to your trips.
      </p>

      <Textarea
        value={rawText}
        onChange={(e) => setRawText(e.target.value)}
        placeholder="Paste your confirmation email or booking text here…"
        className="mt-4 min-h-32 resize-none bg-background/50 text-[13px] leading-relaxed"
        disabled={loading}
      />

      <div className="mt-3 flex items-center gap-2">
        <Button
          onClick={handleParse}
          disabled={loading}
          className="flex-1"
        >
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Parsing…
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
          onClick={() => setRawText(SAMPLE_CONFIRMATION)}
          disabled={loading}
        >
          Use sample
        </Button>
      </div>
    </section>
  )
}
