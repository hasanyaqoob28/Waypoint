import { generateText, Output } from "ai"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { itinerarySchema } from "@/lib/itinerary-schema"
import { saveTrip } from "@/lib/db"
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

    if (!process.env.GEMINI_API_KEY) {
      return Response.json(
        { error: "Configuration missing: GEMINI_API_KEY is not set" },
        { status: 500 },
      )
    }

    const google = createGoogleGenerativeAI({
      apiKey: process.env.GEMINI_API_KEY,
    })

    const { experimental_output } = await generateText({
      model: google("gemini-2.5-flash"),
      system: SYSTEM_PROMPT,
      prompt: `Parse this travel confirmation text:\n\n${rawText}`,
      experimental_output: Output.object({ schema: itinerarySchema }),
    })

    const parsed = experimental_output

    const itinerary: ItineraryEvent[] = parsed.events.map((e) => ({
      type: e.type,
      summary: e.summary,
      startTime: e.startTime,
      flight: e.type === "flight" ? e.flight : null,
      hotel: e.type === "hotel" ? e.hotel : null,
      transit: e.type === "transit" ? e.transit : null,
      activity: e.type === "activity" ? e.activity : null,
    }))

    const trip: Trip = {
      userId,
      tripId: `trip_${Date.now()}`,
      title: parsed.title || "Untitled Trip",
      destination: parsed.destination || "",
      status: "Active",
      syncedAt: new Date().toISOString(),
      itinerary,
    }

    await saveTrip(trip)

    return Response.json({ success: true, trip })
  } catch (error) {
    console.error("[v0] Ingest pipeline failure:", error)
    const message = error instanceof Error ? error.message : "Unknown error"
    return Response.json(
      { error: "Pipeline processing error", details: message },
      { status: 500 },
    )
  }
}
