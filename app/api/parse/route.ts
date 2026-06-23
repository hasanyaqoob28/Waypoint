import { NextRequest, NextResponse } from 'next/server'
import { generateObject } from 'ai'
import { google } from '@ai-sdk/google'
import { z } from 'zod'

const EventSchema = z.object({
  eventType: z.enum(['flight', 'hotel', 'activity', 'transit']),
  flightNumber: z.string().optional(),
  airline: z.string().optional(),
  departureAirport: z.string().optional(),
  arrivalAirport: z.string().optional(),
  departureTime: z.string().optional(),
  arrivalTime: z.string().optional(),
  terminal: z.string().optional(),
  gate: z.string().optional(),
  seatNumber: z.string().optional(),
  baggageCarousel: z.string().optional(),
  hotelName: z.string().optional(),
  hotelAddress: z.string().optional(),
  checkInTime: z.string().optional(),
  checkOutTime: z.string().optional(),
  confirmationNumber: z.string().optional(),
  activityName: z.string().optional(),
  activityLocation: z.string().optional(),
  activityTime: z.string().optional(),
  notes: z.string().optional(),
})

// POST /api/parse - Parse booking confirmation and save events to Aurora
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, tripId, bookingText } = body

    if (!userId || !tripId || !bookingText) {
      return NextResponse.json(
        { error: 'userId, tripId, and bookingText are required' },
        { status: 400 }
      )
    }

    // Parse booking text with Gemini
    const { object } = await generateObject({
      model: google('gemini-2.0-flash'),
      schema: z.object({ events: z.array(EventSchema) }),
      prompt: `Parse this booking confirmation and extract all travel events:\n\n${bookingText}`,
    })

    // For hackathon demo: events are returned to frontend for display
    // In production: Aurora PostgreSQL would store all parsed events
    const events = object.events.map((event, idx) => ({
      id: idx,
      tripId,
      ...event,
      createdAt: new Date().toISOString(),
    }))

    return NextResponse.json({ eventsCreated: events.length, events }, { status: 201 })
  } catch (error) {
    console.error('[v0] POST /api/parse error:', error)
    return NextResponse.json({ error: 'Failed to parse and save events' }, { status: 500 })
  }
}
