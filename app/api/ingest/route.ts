import { generateText, Output } from "ai"
import { google } from "@ai-sdk/google"
import { itinerarySchema } from "@/lib/itinerary-schema"
import { fallbackParse } from "@/lib/fallback-parser"
import type { ItineraryEvent, Trip } from "@/lib/types"

export const maxDuration = 60

const SYSTEM_PROMPT = `You are a travel logistics parser. You are given messy, unstructured travel
confirmation text (emails, booking receipts, forwarded messages). Extract every distinct
event (flights, hotels, ground transit, activities/reservations) and return them ordered
chronologically.

Rules:
- Only populate the detail object that matches the event "type"; set the others to null.
- Infer IATA airport codes and city names when an airport is named.
- If a field is unknown, use an empty string (never invent fake data).
- For baggage carousel on flights, use "Pending" when not stated.
- When the destination uses a non-latin script (e.g. Japan), provide the hotel
  addressLocalScript in that native script when you can reliably produce it.
- "startTime" should be a sortable representation so events sort correctly.`

export async function POST(request: Request) {
  try {
    const { userId, rawText } = await request.json()

    if (!userId || !rawText || typeof rawText !== "string") {
      return Response.json(
        { error: "Missing required fields: userId and rawText" },
        { status: 400 },
      )
    }

    let title = "Untitled Trip"
    let destination = ""
    let itinerary: ItineraryEvent[] = []
    let parsedBy: "gemini" | "fallback" = "fallback"

    let geminiSucceeded = false
    try {
      // Use Vercel AI Gateway with Google Gemini (no API key needed)
      const { experimental_output } = await generateText({
        model: google("gemini-2.0-flash"),
        system: SYSTEM_PROMPT,
        prompt: `Parse this travel confirmation text:\n\n${rawText}`,
        experimental_output: Output.object({ schema: itinerarySchema }),
      })

      const parsed = experimental_output
      title = parsed.title || "Untitled Trip"
      destination = parsed.destination || ""
      itinerary = parsed.events.map((e) => ({
        type: e.type,
        summary: e.summary,
        startTime: e.startTime,
        flight: e.type === "flight" ? e.flight : null,
        hotel: e.type === "hotel" ? e.hotel : null,
        transit: e.type === "transit" ? e.transit : null,
        activity: e.type === "activity" ? e.activity : null,
      }))
      parsedBy = "gemini"
      geminiSucceeded = true
    } catch (aiError) {
      // AI provider failed (invalid key, quota, network). Fall back gracefully
      // so the app stays usable for demos without a working AI key.
      console.error(
        "[v0] Gemini parse failed, using deterministic fallback:",
        aiError instanceof Error ? aiError.message : aiError,
      )
    }

    if (!geminiSucceeded) {
      const parsed = fallbackParse(rawText)
      title = parsed.title
      destination = parsed.destination
      itinerary = parsed.events
      parsedBy = "fallback"
    }

    // For hackathon demo: trip data is managed in-memory/frontend
    // In production: Aurora PostgreSQL would store all trips and events
    const trip = {
      userId,
      tripId: `trip_${Date.now()}`,
      title,
      destination,
      status: "Active",
      syncedAt: new Date().toISOString(),
      itinerary,
    }

    return Response.json({ success: true, trip, parsedBy })
  } catch (error) {
    console.error("[v0] Ingest pipeline failure:", error)
    const message = error instanceof Error ? error.message : "Unknown error"
    return Response.json(
      { error: "Pipeline processing error", details: message },
      { status: 500 },
    )
  }
}
