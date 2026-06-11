"use client"

import { useMemo } from "react"
import { Braces, CircleCheck, Cpu } from "lucide-react"
import type { Trip } from "@/lib/types"

const SAMPLE_PAYLOAD = {
  title: "Trip to Tokyo",
  destination: "Tokyo",
  itinerary: [
    {
      type: "flight",
      summary: "Japan Airlines to Tokyo",
      flight: {
        flightNumber: "JL6",
        departureCity: "New York",
        arrivalCity: "Tokyo",
        gate: "4",
        terminal: "1",
        status: "On Time",
      },
    },
    {
      type: "hotel",
      summary: "Shibuya Stream Excel Hotel Tokyu",
    },
  ],
}

/**
 * Renders a JSON value with lightweight syntax highlighting using design tokens.
 * Keys, strings, numbers and punctuation each get their own color.
 */
function HighlightedJson({ value }: { value: unknown }) {
  const lines = useMemo(() => JSON.stringify(value, null, 2).split("\n"), [value])

  return (
    <pre className="overflow-x-auto whitespace-pre font-mono text-[11px] leading-relaxed">
      <code>
        {lines.map((line, i) => (
          <div key={i} className="flex gap-3">
            <span className="select-none text-right text-muted-foreground/40 tabular-nums w-5 shrink-0">
              {i + 1}
            </span>
            <span className="min-w-0">{colorizeLine(line)}</span>
          </div>
        ))}
      </code>
    </pre>
  )
}

function colorizeLine(line: string) {
  // Match "key": value  OR  bare values / punctuation
  const keyMatch = line.match(/^(\s*)"([^"]+)":\s*(.*)$/)
  if (keyMatch) {
    const [, indent, key, rest] = keyMatch
    return (
      <>
        {indent}
        <span className="text-chart-2">&quot;{key}&quot;</span>
        <span className="text-muted-foreground">: </span>
        {colorizeValue(rest)}
      </>
    )
  }
  return <span className="text-muted-foreground">{line}</span>
}

function colorizeValue(rest: string) {
  const trailing = rest.endsWith(",") ? "," : ""
  const val = trailing ? rest.slice(0, -1) : rest

  if (val.startsWith('"')) {
    return (
      <>
        <span className="text-primary">{val}</span>
        <span className="text-muted-foreground">{trailing}</span>
      </>
    )
  }
  if (val === "{" || val === "[" || val === "}" || val === "]") {
    return <span className="text-muted-foreground">{rest}</span>
  }
  return (
    <>
      <span className="text-accent">{val}</span>
      <span className="text-muted-foreground">{trailing}</span>
    </>
  )
}

export function AiOutputStream({ trip }: { trip: Trip | null }) {
  const payload = trip
    ? {
        title: trip.title,
        destination: trip.destination,
        itinerary: trip.itinerary,
      }
    : SAMPLE_PAYLOAD

  const eventCount = trip?.itinerary.length ?? SAMPLE_PAYLOAD.itinerary.length

  return (
    <aside className="glass-panel flex h-full flex-col overflow-hidden rounded-3xl border border-border shadow-lg">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <span className="flex size-7 items-center justify-center rounded-lg bg-secondary text-foreground">
          <Cpu className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="text-[12px] font-semibold text-foreground">
            AI Output Stream
          </p>
          <p className="text-[10px] text-muted-foreground">
            Structured JSON from the ingestion engine
          </p>
        </div>
        <span className="ml-auto inline-flex items-center gap-1 rounded-full border border-chart-3/30 bg-chart-3/10 px-2 py-0.5 text-[10px] font-medium text-chart-3">
          <CircleCheck className="size-3" />
          {trip ? "Parsed" : "Sample"}
        </span>
      </div>

      <div className="flex items-center gap-2 border-b border-border bg-background/40 px-4 py-2 text-[10px] text-muted-foreground">
        <Braces className="size-3" />
        <span className="font-mono">itinerary.json</span>
        <span className="ml-auto tabular-nums">{eventCount} events</span>
      </div>

      <div className="flex-1 overflow-auto bg-background/30 px-4 py-3">
        <HighlightedJson value={payload} />
      </div>
    </aside>
  )
}
