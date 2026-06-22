export type EventType = "flight" | "hotel" | "transit" | "activity"

export interface FlightDetails {
  flightNumber: string
  airline: string
  departureAirport: string
  departureCity: string
  arrivalAirport: string
  arrivalCity: string
  departureTimeLocal: string
  arrivalTimeLocal: string
  terminal: string
  gate: string
  baggageCarousel: string
  status: string
}

export interface HotelDetails {
  name: string
  addressLocal: string
  addressLocalScript: string
  checkInTime: string
  confirmationNumber: string
}

export interface TransitDetails {
  mode: string
  from: string
  to: string
  note: string
}

export interface ActivityDetails {
  name: string
  time: string
  location: string
  note: string
}

export interface ItineraryEvent {
  type: EventType
  summary: string
  startTime: string
  flight: FlightDetails | null
  hotel: HotelDetails | null
  transit: TransitDetails | null
  activity: ActivityDetails | null
}

export interface Trip {
  userId: string
  tripId: string
  title: string
  destination: string
  status: string
  syncedAt: string
  itinerary: ItineraryEvent[]
}
