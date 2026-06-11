import type { ItineraryEvent } from "./types"

/**
 * Deterministic, dependency-free travel-text parser used as a fallback when no
 * GEMINI_API_KEY is configured (or the AI call fails). It recognizes the most
 * common patterns (flights, hotels, transit, activities) and — critically —
 * composes clean, human-readable summaries from the *extracted fields* rather
 * than slicing raw text, so the app always looks polished.
 */

interface FallbackResult {
  title: string
  destination: string
  events: ItineraryEvent[]
}

// Common airport codes → city names, used to enrich flight cards and the
// derived trip destination when the source text only contains IATA codes.
const IATA_CITY: Record<string, string> = {
  JFK: "New York",
  EWR: "New York",
  LGA: "New York",
  SFO: "San Francisco",
  LAX: "Los Angeles",
  ORD: "Chicago",
  SEA: "Seattle",
  BOS: "Boston",
  MIA: "Miami",
  LHR: "London",
  LGW: "London",
  CDG: "Paris",
  AMS: "Amsterdam",
  FRA: "Frankfurt",
  MAD: "Madrid",
  BCN: "Barcelona",
  FCO: "Rome",
  HND: "Tokyo",
  NRT: "Tokyo",
  ICN: "Seoul",
  SIN: "Singapore",
  HKG: "Hong Kong",
  DXB: "Dubai",
  SYD: "Sydney",
  YYZ: "Toronto",
}

const TIME_RE = /\b(\d{1,2}:\d{2}\s?(?:AM|PM|am|pm)?)\b/

function findTime(text: string): string {
  const m = text.match(TIME_RE)
  return m ? m[1].toUpperCase().replace(/\s+/, " ") : ""
}

function titleCase(s: string): string {
  return s
    .toLowerCase()
    .split(/\s+/)
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ")
    .trim()
}

function cityFor(code: string, fallback: string): string {
  return IATA_CITY[code] || fallback || ""
}

/** Extract a "City (CODE)" pair, common in confirmation emails. */
function cityCodePairs(text: string): Array<{ city: string; code: string }> {
  const out: Array<{ city: string; code: string }> = []
  const re = /([A-Z][a-zA-Z]+(?:\s[A-Z][a-zA-Z]+)?)\s*\(([A-Z]{3})\)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(text)) !== null) {
    out.push({ city: m[1].trim(), code: m[2] })
  }
  return out
}

function parseFlight(seg: string, startTime: string): ItineraryEvent {
  const lower = seg.toLowerCase()
  const flightCode = seg.match(/\b([A-Z]{2}\s?\d{1,4})\b/)
  const flightNumber = flightCode ? flightCode[1].replace(/\s+/, "") : ""

  const airlineMatch = seg.match(
    /([A-Z][a-zA-Z]+(?:\s[A-Z][a-zA-Z]+)?\s+(?:Airlines|Airways))|([A-Z][a-zA-Z]+\s+Air\b)/,
  )
  let airline = airlineMatch ? (airlineMatch[1] || airlineMatch[2]).trim() : ""
  // Catch "United flight UA88" style phrasing.
  if (!airline) {
    const beforeFlight = seg.match(/([A-Z][a-zA-Z]+)\s+flight/i)
    if (beforeFlight) airline = titleCase(beforeFlight[1])
  }

  const pairs = cityCodePairs(seg)
  const looseCodes = (seg.match(/\b([A-Z]{3})\b/g) || []).filter(
    (c) => c !== "AM" && c !== "PM",
  )
  const depAirport = pairs[0]?.code || looseCodes[0] || ""
  const arrAirport = pairs[1]?.code || looseCodes[1] || ""
  const depCity = cityFor(depAirport, pairs[0]?.city || "")
  const arrCity = cityFor(arrAirport, pairs[1]?.city || "")

  const times = seg.match(new RegExp(TIME_RE, "g")) || []
  const gate = seg.match(/gate\s+([A-Z]?\d{1,3})/i)
  const terminal = seg.match(/terminal\s+(\w+)/i)

  const dest = arrCity || arrAirport
  const carrier = airline || flightNumber || "Flight"
  const summary = dest ? `${carrier} to ${dest}` : carrier

  return {
    type: "flight",
    summary,
    startTime,
    flight: {
      flightNumber,
      airline,
      departureAirport: depAirport,
      departureCity: depCity,
      arrivalAirport: arrAirport,
      arrivalCity: arrCity,
      departureTimeLocal: times[0]?.toUpperCase() || startTime,
      arrivalTimeLocal: times[1]?.toUpperCase() || "",
      gate: gate ? gate[1] : "",
      terminal: terminal ? terminal[1] : "",
      baggageCarousel: "Pending",
      status: lower.includes("delay")
        ? "Delayed"
        : lower.includes("on time")
          ? "On Time"
          : "Scheduled",
    },
    hotel: null,
    transit: null,
    activity: null,
  }
}

/** Pick the most "name-like" line from a multi-line block. */
function pickNameLine(seg: string, skip: RegExp): string {
  const lines = seg
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean)
  for (const line of lines) {
    if (skip.test(line)) continue
    if (/^\d/.test(line)) continue // address lines starting with a number
    if (/^(confirmation|conf|booking|status|standard|depart|arrive|gate|terminal)\b/i.test(line))
      continue
    // A good name line has letters and isn't mostly punctuation/time.
    if (/[A-Za-z]/.test(line) && !TIME_RE.test(line.replace(/[A-Za-z].*/, ""))) {
      return cleanName(line)
    }
  }
  return cleanName(lines[0] || "")
}

function cleanName(raw: string): string {
  // Strip leading labels and trailing time/punctuation noise.
  let s = raw
    .replace(
      /^(hotel|reservation|voucher|booking|dinner reservation|table booked at|table at|dinner at|lunch at|reservation at)[:\s-]*/i,
      "",
    )
    .replace(/\b\d{1,2}:\d{2}\s?(?:AM|PM|am|pm)?\b.*$/, "")
    .replace(/[,.\s]+$/, "")
    .trim()
  // Drop trailing address fragments after the first comma for cleaner titles.
  if (s.includes(",")) s = s.split(",")[0].trim()
  return s
}

function splitIntoBlocks(rawText: string): string[] {
  // Prefer blank-line separated blocks (multi-line confirmations). Internal
  // newlines are preserved so we can pick out specific lines (e.g. hotel name).
  const byBlankLine = rawText
    .split(/\n\s*\n/)
    .map((s) => s.trim())
    .filter(Boolean)

  if (byBlankLine.length > 1) return byBlankLine

  return rawText
    .split(/\n+|(?<=\.)\s+(?=[A-Z])/)
    .map((s) => s.trim())
    .filter(Boolean)
}

export function fallbackParse(rawText: string): FallbackResult {
  const segments = splitIntoBlocks(rawText)

  const events: ItineraryEvent[] = []
  let destination = ""

  for (const seg of segments) {
    const lower = seg.toLowerCase()
    const startTime = findTime(seg)
    const flightCode = seg.match(/\b([A-Z]{2}\s?\d{1,4})\b/)

    // Flight
    if (
      lower.includes("flight") ||
      lower.includes("airlines") ||
      lower.includes("airways") ||
      (flightCode && (lower.includes("depart") || lower.includes("gate")))
    ) {
      const ev = parseFlight(seg, startTime)
      events.push(ev)
      if (ev.flight?.arrivalCity) destination = ev.flight.arrivalCity
      continue
    }

    // Hotel
    if (
      lower.includes("hotel") ||
      lower.includes("check-in") ||
      lower.includes("checkin") ||
      lower.includes("airbnb") ||
      lower.includes("resort") ||
      lower.includes("voucher")
    ) {
      const conf = seg.match(
        /(?:conf(?:irmation)?(?:\s+code)?|booking)[:#\s]+([A-Z0-9-]{4,})/i,
      )
      const name =
        pickNameLine(seg, /(hotel\s+voucher|voucher|hotel$|^hotel\b)/i) ||
        "Hotel Stay"
      events.push({
        type: "hotel",
        summary: name,
        startTime,
        flight: null,
        hotel: {
          name,
          addressLocal: "",
          addressLocalScript: "",
          confirmationNumber: conf ? conf[1] : "",
          checkInTime: startTime,
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
      const mode = lower.includes("train")
        ? "Train"
        : lower.includes("bus")
          ? "Bus"
          : lower.includes("shuttle")
            ? "Shuttle"
            : "Car"
      const to = seg.match(/\bto\s+([A-Z][a-zA-Z]+(?:\s[A-Z][a-zA-Z]+)?)/)
      events.push({
        type: "transit",
        summary: to ? `${mode} to ${to[1]}` : `${mode} transfer`,
        startTime,
        flight: null,
        hotel: null,
        transit: {
          mode,
          from: "",
          to: to ? to[1] : "",
          note: startTime ? `Departs ${startTime}` : "",
        },
        activity: null,
      })
      continue
    }

    // Activity / reservation
    if (
      lower.includes("reservation") ||
      lower.includes("dinner") ||
      lower.includes("lunch") ||
      lower.includes("tour") ||
      lower.includes("tickets") ||
      lower.includes("museum") ||
      lower.includes("visit") ||
      lower.includes("table")
    ) {
      const name =
        pickNameLine(seg, /^(reservation|booking)$/i) || "Reservation"
      events.push({
        type: "activity",
        summary: name,
        startTime,
        flight: null,
        hotel: null,
        transit: null,
        activity: {
          name,
          location: "",
          time: startTime,
          note: "",
        },
      })
    }
  }

  // Prefer a flight-derived destination; otherwise look for a "to <City>" phrase.
  if (!destination) {
    const toCity = rawText.match(
      /\bto\s+([A-Z][a-zA-Z]+(?:\s[A-Z][a-zA-Z]+)?)/,
    )
    if (toCity) destination = toCity[1]
  }

  return {
    title: destination ? `Trip to ${destination}` : "My Trip",
    destination,
    events,
  }
}
