import { getTrips, saveTrip, deleteTrip } from "@/lib/db"
import { google } from "@ai-sdk/google"
import { generateObject } from "ai" // Corrected import
import { z } from "zod"

export const maxDuration = 30

// Validation schemas matching your exact TypeScript types
const flightDetailsSchema = z.object({
  flightNumber: z.string(),
  airline: z.string(),
  departureAirport: z.string(),
  departureCity: z.string(),
  arrivalAirport: z.string(),
  arrivalCity: z.string(),
  departureTimeLocal: z.string(),
  arrivalTimeLocal: z.string(),
  terminal: z.string(),
  gate: z.string(),
  baggageCarousel: z.string(),
  status: z.string()
})

const hotelDetailsSchema = z.object({
  name: z.string(),
  addressLocal: z.string(),
  addressLocalScript: z.string().describe("Address written in destination native alphabet/script characters if available"),
  checkInTime: z.string(),
  confirmationNumber: z.string()
})

const transitDetailsSchema = z.object({
  mode: z.string().describe("E.g., Train, Uber, Bus, Bullet Train"),
  from: z.string(),
  to: z.string(),
  note: z.string()
})

const activityDetailsSchema = z.object({
  name: z.string(),
  time: z.string(),
  location: z.string(),
  note: z.string()
})

const itineraryEventSchema = z.object({
  type: z.enum(["flight", "hotel", "transit", "activity"]),
  summary: z.string().describe("Short descriptive sentence summary of what this event represents"),
  startTime: z.string().describe("Standard time layout string or departure timestamp"),
  flight: flightDetailsSchema.nullable(),
  hotel: hotelDetailsSchema.nullable(),
  transit: transitDetailsSchema.nullable(),
  activity: activityDetailsSchema.nullable()
})

// 1. GET Request: Fetches structured paths from AWS/Local layer
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    if (!userId) {
      return Response.json({ error: "Missing userId" }, { status: 400 })
    }
    const trips = await getTrips(userId)
    return Response.json({ trips })
  } catch (error) {
    console.error("[v0 API] GET Error:", error)
    return Response.json({ error: "Failed to load itineraries" }, { status: 500 })
  }
}

// 2. POST Request: Live Gemini Structure Extraction
export async function POST(request: Request) {
  try {
    const { userId, rawText } = await request.json()
    if (!userId || !rawText) {
      return Response.json({ error: "Missing required parameters" }, { status: 400 })
    }

    // Connects live to your GEMINI_API_KEY using generateObject
    const { object } = await generateObject({
      model: google("gemini-1.5-flash"),
      prompt: `Analyze this raw itinerary text or booking confirmation email and extract the structural travel milestones.
      You must populate the corresponding item sub-object (flight, hotel, transit, activity) that matches the event type.
      If a sub-object is not applicable for that event type, set its value to null.
      
      Raw Input Text:
      "${rawText}"`,
      schema: z.object({
        title: z.string().describe("E.g., Autumn Trip to Tokyo or Holiday in France"),
        destination: z.string(),
        status: z.string().describe("E.g., Pre-Flight, Active, Scheduled"),
        itinerary: z.array(itineraryEventSchema)
      })
    })

    const tripId = `trip_${Date.now()}`
    
    // Construct the row matching your accurate types configuration
    const finalTripData = {
      userId,
      tripId,
      syncedAt: new Date().toISOString(),
      title: object.title,
      destination: object.destination,
      status: object.status,
      itinerary: object.itinerary
    }

    // Persist cleanly via your db.ts interface layer (AWS DynamoDB automatic fallback)
    await saveTrip(finalTripData)

    return Response.json({ success: true, trip: finalTripData })
  } catch (error) {
    console.error("[v0 API] POST Parse Error:", error)
    return Response.json({ 
      error: "AI Parsing or DB pipeline failed", 
      details: error instanceof Error ? error.message : "Unknown" 
    }, { status: 500 })
  }
}

// 3. DELETE Request: Evicts data partitions
export async function DELETE(request: Request) {
  try {
    const { userId, tripId } = await request.json()
    if (!userId || !tripId) {
      return Response.json({ error: "Missing deletion criteria" }, { status: 400 })
    }
    await deleteTrip(userId, tripId)
    return Response.json({ success: true })
  } catch (error) {
    console.error("[v0 API] DELETE Error:", error)
    return Response.json({ error: "Failed to delete item" }, { status: 500 })
  }
}