import pg from 'pg'

const { Pool } = pg

const pool = new Pool({
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  port: 5432,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  ssl: { rejectUnauthorized: false },
})

async function seedDemoData() {
  try {
    // Create demo user
    const userResult = await pool.query(
      `INSERT INTO users (id, email, password_hash, created_at, updated_at) 
       VALUES (99999, 'demo@travelway.local', 'placeholder_hash', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       ON CONFLICT (id) DO NOTHING`
    )
    console.log('Demo user created/exists')

    // Create demo trip 1: NYC to Paris
    const trip1 = await pool.query(
      `INSERT INTO trips (user_id, destination, title, raw_booking_text, created_at, updated_at)
       VALUES (99999, 'Paris', 'Summer Getaway to Paris', 'United flight UA900 from JFK to CDG departing June 15 at 7pm arriving June 16 at 8am. Seat 12A. Confirmation UN900. Hotel: Le Marais Boutique checking in June 16 checking out June 22.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       ON CONFLICT DO NOTHING
       RETURNING id`
    )
    
    if (trip1.rows.length > 0) {
      const tripId1 = trip1.rows[0].id
      
      // Add events for Paris trip
      await pool.query(
        `INSERT INTO events (trip_id, event_type, flight_number, airline, departure_airport, arrival_airport, departure_time, arrival_time, terminal, gate, seat_number, confirmation_number, created_at, updated_at)
         VALUES 
         ($1, 'flight', 'UA900', 'United Airlines', 'JFK', 'CDG', '2024-06-15 19:00:00', '2024-06-16 08:00:00', '1', '42', '12A', 'UN900', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
         ($1, 'hotel', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         ON CONFLICT DO NOTHING`,
        [tripId1]
      )
      console.log('Demo trip 1 (Paris) created')
    }

    // Create demo trip 2: LA Beach Vacation
    const trip2 = await pool.query(
      `INSERT INTO trips (user_id, destination, title, raw_booking_text, created_at, updated_at)
       VALUES (99999, 'Los Angeles', 'Beach Vacation in LA', 'American flight AA200 from Boston BOS to Los Angeles LAX departing July 1 at 10am arriving July 1 at 1pm. Seat 14B. Confirmation AA200. Hotel: Santa Monica Beachfront checking in July 1 checking out July 8. Rental car: Hertz at LAX.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       ON CONFLICT DO NOTHING
       RETURNING id`
    )
    
    if (trip2.rows.length > 0) {
      const tripId2 = trip2.rows[0].id
      
      await pool.query(
        `INSERT INTO events (trip_id, event_type, flight_number, airline, departure_airport, arrival_airport, departure_time, arrival_time, terminal, gate, seat_number, confirmation_number, created_at, updated_at)
         VALUES 
         ($1, 'flight', 'AA200', 'American Airlines', 'BOS', 'LAX', '2024-07-01 10:00:00', '2024-07-01 13:00:00', '2', '15', '14B', 'AA200', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
         ($1, 'hotel', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         ON CONFLICT DO NOTHING`,
        [tripId2]
      )
      console.log('Demo trip 2 (LA) created')
    }

    console.log('Demo data seeding complete')
    process.exit(0)
  } catch (error) {
    console.error('Error seeding demo data:', error)
    process.exit(1)
  }
}

seedDemoData()
