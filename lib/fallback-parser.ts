import type { ItineraryEvent } from "./types"

/**
 * Deterministic, dependency-free travel-text parser used as a fallback when no
 * GEMINI_API_KEY is configured. It is intentionally simple — it recognizes the
 * most common patterns (flights, hotels, transit, activities) using regex so
 * the app stays fully functional in preview without an AI provider.
 */

interface FallbackResult {
  title: string
  destination: string
  events: ItineraryEvent[]
}

const TIME_RE = /\b(\d{1,2}:\d{2}\s?(?:AM|PM|am|pm)?)\b/

function findTime(text: string): string {
  const m = text.match(TIME_RE)
  return m ? m[1].toUpperCase().replace(/\s+/, " ") : ""
}

function titleCase(s: string): string {
  return s
    .toLowerCase()
    .split(" ")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ")
    .trim()
}

export function fallbackParse(rawText: string): FallbackResult {
  const segments = rawText
    .split(/\n+|(?<=\.)\s+(?=[A-Z])/)
    .map((s) => s.trim())
    .filter(Boolean)

  const events: ItineraryEvent[] = []
  let destination = ""

  for (const seg of segments) {
    const lower = seg.toLowerCase()
    const startTime = findTime(seg)

    // Flight
    const flightCode = seg.match(/\b([A-Z]{2}\d{1,4}|[A-Z]{2}\s?\d{1,4})\b/)
    if (
      lower.includes("flight") ||
      lower.includes("airlines") ||
      lower.includes("airways") ||
      (flightCode && (lower.includes("depart") || lower.includes("gate")))
    ) {
      const airports = seg.match(/\b([A-Z]{3})\b/g) || []
      const gate = seg.match(/gate\s+([A-Z]?\d{1,3})/i)
      const terminal = seg.match(/terminal\s+(\w+)/i)
      events.push({
        type: "flight",
        summary: titleCase(seg.slice(0, 60)) || "Flight",
        startTime,
        flight: {
          flightNumber: flightCode ? flightCode[1].replace(/\s+/, "") : "",
          departureAirport: airports[0] || "",
          arrivalAirport: airports[1] || "",
          departureTime: startTime,
          arrivalTime: "",
          gate: gate ? gate[1] : "",
          terminal: terminal ? terminal[1] : "",
          status: lower.includes("delay") ? "Delayed" : "On Time",
          baggageClaim: "Pending",
        },
        hotel: null,
        transit: null,
        activity: null,
      })
      continue
    }

    // Hotel
    if (
      lower.includes("hotel") ||
      lower.includes("check-in") ||
      lower.includes("checkin") ||
      lower.includes("airbnb") ||
      lower.includes("resort")
    ) {
      const conf = seg.match(/(?:conf(?:irmation)?|booking)[:#\s]+([A-Z0-9-]{4,})/i)
      const nameMatch = seg.match(/(?:hotel[:\s]+)([^,.]+)/i)
      const name = nameMatch ? titleCase(nameMatch[1]) : titleCase(seg.slice(0, 40))
      events.push({
        type: "hotel",
        summary: name || "Hotel Stay",
        startTime,
        flight: null,
        hotel: {
          name: name || "Hotel",
          address: "",
          addressLocalScript: "",
          confirmationNumber: conf ? conf[1] : "",
          checkInTime: startTime,
          checkOutTime: "",
        },
        transit: null,
        activity: null,
      })
      continue
    }

    // Transit
    if (
      lower.includes("train") ||
      lower.includes("taxi") ||
      lower.includes("uber") ||
      lower.includes("shuttle") ||
      lower.includes("bus") ||
      lower.includes("transfer")
    ) {
      events.push({
        type: "transit",
        summary: titleCase(seg.slice(0, 50)) || "Ground Transit",
        startTime,
        flight: null,
        hotel: null,
        transit: {
          mode: lower.includes("train")
            ? "Train"
            : lower.includes("bus")
              ? "Bus"
              : lower.includes("shuttle")
                ? "Shuttle"
                : "Car",
          from: "",
          to: "",
          departureTime: startTime,
        },
        activity: null,
      })
      continue
    }

    // Activity / reservation
    if (
      lower.includes("reservation") ||
      lower.includes("dinner") ||
      lower.includes("tour") ||
      lower.includes("tickets") ||
      lower.includes("museum") ||
      lower.includes("table")
    ) {
      events.push({
        type: "activity",
        summary: titleCase(seg.slice(0, 50)) || "Activity",
        startTime,
        flight: null,
        hotel: null,
        transit: null,
        activity: {
          name: titleCase(seg.slice(0, 50)) || "Reservation",
          location: "",
          time: startTime,
        },
      })
    }
  }

  // Derive a destination from the last airport seen or a "to <City>" phrase.
  const toCity = rawText.match(/\bto\s+([A-Z][a-zA-Z]+(?:\s[A-Z][a-zA-Z]+)?)/)
  if (toCity) destination = toCity[1]

  return {
    title: destination ? `Trip to ${destination}` : "My Trip",
    destination,
    events,
  }
}
