import { query } from '@/lib/db'
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

    // Save events to Aurora PostgreSQL
    const events = []
    for (const event of object.events) {
      const result = await query(
        `INSERT INTO events (trip_id, event_type, flight_number, airline, departure_airport, arrival_airport, departure_time, arrival_time, terminal, gate, seat_number, baggage_carousel, hotel_name, hotel_address, check_in_time, check_out_time, confirmation_number, activity_name, activity_location, activity_time, notes, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) 
         RETURNING *`,
        [tripId, event.eventType, event.flightNumber || null, event.airline || null, event.departureAirport || null, event.arrivalAirport || null, event.departureTime || null, event.arrivalTime || null, event.terminal || null, event.gate || null, event.seatNumber || null, event.baggageCarousel || null, event.hotelName || null, event.hotelAddress || null, event.checkInTime || null, event.checkOutTime || null, event.confirmationNumber || null, event.activityName || null, event.activityLocation || null, event.activityTime || null, event.notes || null]
      )
      events.push(result.rows[0])
    }

    return NextResponse.json({ eventsCreated: events.length, events }, { status: 201 })
  } catch (error) {
    console.error('[v0] POST /api/parse error:', error)
    return NextResponse.json({ error: 'Failed to parse and save events' }, { status: 500 })
  }
}
