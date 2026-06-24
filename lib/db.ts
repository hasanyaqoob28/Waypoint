import { Pool, ClientBase } from 'pg'
import { Signer } from '@aws-sdk/rds-signer'
import { awsCredentialsProvider } from '@vercel/oidc-aws-credentials-provider'
import { attachDatabasePool } from '@vercel/functions'

let signer: Signer | null = null

function getSigner(): Signer {
  if (!signer) {
    signer = new Signer({
      credentials: awsCredentialsProvider({
        roleArn: process.env.AWS_ROLE_ARN!,
        audience: 'sts.amazonaws.com',
        region: process.env.AWS_REGION || 'us-east-1',
      }),
      region: process.env.AWS_REGION || 'us-east-1',
      hostname: process.env.PGHOST!,
      username: process.env.PGUSER || 'postgres',
      port: 5432,
    })
  }
  return signer
}

const pool = new Pool({
  host: process.env.PGHOST,
  database: 'travelway',
  port: 5432,
  user: process.env.PGUSER || 'postgres',
  password: async () => {
    try {
      return await getSigner().getAuthToken()
    } catch (error) {
      console.error('[v0] IAM token generation failed:', error instanceof Error ? error.message : error)
      throw error
    }
  },
  ssl: { rejectUnauthorized: false },
  max: 20,
})
attachDatabasePool(pool)

// Auto-create schema on startup if tables don't exist
async function initializeSchema() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

      CREATE TABLE IF NOT EXISTS trips (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        destination VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        raw_booking_text TEXT,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_trips_user_id ON trips(user_id);
      CREATE INDEX IF NOT EXISTS idx_trips_created_at ON trips(user_id, created_at DESC);

      CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        trip_id INT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
        event_type VARCHAR(50) NOT NULL,
        flight_number VARCHAR(20),
        airline VARCHAR(100),
        departure_airport VARCHAR(10),
        arrival_airport VARCHAR(10),
        departure_time TIMESTAMPTZ,
        arrival_time TIMESTAMPTZ,
        terminal VARCHAR(10),
        gate VARCHAR(10),
        seat_number VARCHAR(10),
        baggage_carousel VARCHAR(20),
        hotel_name VARCHAR(255),
        hotel_address TEXT,
        check_in_time TIMESTAMPTZ,
        check_out_time TIMESTAMPTZ,
        confirmation_number VARCHAR(50),
        activity_name VARCHAR(255),
        activity_location VARCHAR(255),
        activity_time TIMESTAMPTZ,
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_events_trip_id ON events(trip_id);
      CREATE INDEX IF NOT EXISTS idx_events_type ON events(trip_id, event_type);
      CREATE INDEX IF NOT EXISTS idx_events_departure_time ON events(trip_id, departure_time);
      CREATE INDEX IF NOT EXISTS idx_events_check_in_time ON events(trip_id, check_in_time);
    `)
    console.log('[v0] Database schema initialized')
  } catch (error) {
    console.log('[v0] Schema init note:', error instanceof Error ? error.message : 'Unknown error')
  }
}

// Initialize schema on first import
initializeSchema().catch(err => console.error('[v0] Schema init failed:', err))

// Single query transactions.
export async function query(text: string, params?: unknown[]) {
  return pool.query(text, params)
}

// Use for multi-query transactions.
export async function withConnection<T>(
  fn: (client: ClientBase) => Promise<T>,
): Promise<T> {
  const client = await pool.connect()
  try {
    return await fn(client)
  } finally {
    client.release()
  }
}
