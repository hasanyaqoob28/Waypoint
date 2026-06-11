import { z } from "zod"

export const flightSchema = z.object({
  flightNumber: z.string().describe("Flight number, e.g. JL6"),
  airline: z.string().describe("Airline name"),
  departureAirport: z.string().describe("Departure airport IATA code, e.g. JFK"),
  departureCity: z.string().describe("Departure city name"),
  arrivalAirport: z.string().describe("Arrival airport IATA code, e.g. HND"),
  arrivalCity: z.string().describe("Arrival city name"),
  departureTimeLocal: z
    .string()
    .describe("Local departure time as written, or empty string if unknown"),
  arrivalTimeLocal: z
    .string()
    .describe("Local arrival time as written, or empty string if unknown"),
  terminal: z.string().describe("Terminal, or empty string if unknown"),
  gate: z.string().describe("Gate, or empty string if unknown"),
  baggageCarousel: z
    .string()
    .describe('Baggage carousel, or "Pending" if unknown'),
  status: z.string().describe('Flight status such as "On Time" if known, else "Scheduled"'),
})

export const hotelSchema = z.object({
  name: z.string().describe("Hotel name"),
  addressLocal: z
    .string()
    .describe("Full street address in latin characters, empty string if unknown"),
  addressLocalScript: z
    .string()
    .describe(
      "Address in the destination's native script (e.g. Japanese) if derivable, else empty string",
    ),
  checkInTime: z.string().describe("Check-in time, empty string if unknown"),
  confirmationNumber: z
    .string()
    .describe("Booking confirmation code, empty string if unknown"),
})

export const transitSchema = z.object({
  mode: z.string().describe("Transit mode, e.g. train, taxi, shuttle"),
  from: z.string().describe("Origin"),
  to: z.string().describe("Destination"),
  note: z.string().describe("Any extra note, empty string if none"),
})

export const activitySchema = z.object({
  name: z.string().describe("Activity or reservation name"),
  time: z.string().describe("Time, empty string if unknown"),
  location: z.string().describe("Location, empty string if unknown"),
  note: z.string().describe("Any extra note, empty string if none"),
})

export const eventSchema = z.object({
  type: z
    .enum(["flight", "hotel", "transit", "activity"])
    .describe("The kind of itinerary event"),
  summary: z.string().describe("Short display title for the event"),
  startTime: z
    .string()
    .describe(
      "ISO-like sortable timestamp or local time used to order events chronologically; empty string if unknown",
    ),
  flight: flightSchema.nullable().describe("Populated only when type is flight"),
  hotel: hotelSchema.nullable().describe("Populated only when type is hotel"),
  transit: transitSchema
    .nullable()
    .describe("Populated only when type is transit"),
  activity: activitySchema
    .nullable()
    .describe("Populated only when type is activity"),
})

export const itinerarySchema = z.object({
  title: z.string().describe("A short trip title, e.g. 'Tokyo Trip'"),
  destination: z.string().describe("Primary destination city/region"),
  events: z.array(eventSchema).describe("Events ordered chronologically"),
})

export type ParsedItinerary = z.infer<typeof itinerarySchema>
