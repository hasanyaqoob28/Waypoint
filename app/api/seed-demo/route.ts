import { query } from '@/lib/db'

export async function POST() {
  try {
    // Create demo user if not exists
    await query(
      `INSERT INTO users (id, email, password_hash, created_at, updated_at) 
       VALUES (99999, 'demo@travelway.local', 'placeholder_hash', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       ON CONFLICT (id) DO NOTHING`
    )

    // Demo trip 1: Paris
    const trip1Result = await query(
      `INSERT INTO trips (user_id, destination, title, raw_booking_text, created_at, updated_at)
       VALUES (99999, 'Paris', 'Summer Getaway to Paris', 
       'United flight UA900 from JFK to CDG departing June 15 at 7pm arriving June 16 at 8am. Seat 12A. Confirmation UN900. Le Marais Hotel checking in June 16 checking out June 22.',
       CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING id`
    )

    if (trip1Result.rows.length > 0) {
      const tripId1 = trip1Result.rows[0].id
      await query(
        `INSERT INTO events (trip_id, event_type, flight_number, airline, departure_airport, arrival_airport, departure_time, arrival_time, terminal, gate, seat_number, confirmation_number, created_at, updated_at)
         VALUES 
         ($1, 'flight', 'UA900', 'United Airlines', 'JFK', 'CDG', '2024-06-15 19:00:00', '2024-06-16 08:00:00', '1', '42', '12A', 'UN900', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
         ($1, 'hotel', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         ON CONFLICT DO NOTHING`,
        [tripId1]
      )
    }

    // Demo trip 2: LA
    const trip2Result = await query(
      `INSERT INTO trips (user_id, destination, title, raw_booking_text, created_at, updated_at)
       VALUES (99999, 'Los Angeles', 'Beach Vacation in LA',
       'American flight AA200 from Boston BOS to Los Angeles LAX departing July 1 at 10am arriving July 1 at 1pm. Seat 14B. Confirmation AA200. Santa Monica Hotel checking in July 1 checking out July 8.',
       CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING id`
    )

    if (trip2Result.rows.length > 0) {
      const tripId2 = trip2Result.rows[0].id
      await query(
        `INSERT INTO events (trip_id, event_type, flight_number, airline, departure_airport, arrival_airport, departure_time, arrival_time, terminal, gate, seat_number, confirmation_number, created_at, updated_at)
         VALUES 
         ($1, 'flight', 'AA200', 'American Airlines', 'BOS', 'LAX', '2024-07-01 10:00:00', '2024-07-01 13:00:00', '2', '15', '14B', 'AA200', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
         ($1, 'hotel', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         ON CONFLICT DO NOTHING`,
        [tripId2]
      )
    }

    return Response.json({ success: true, message: 'Demo data seeded' })
  } catch (error) {
    console.error('Seed error:', error)
    return Response.json({ error: 'Failed to seed demo data' }, { status: 500 })
  }
}
