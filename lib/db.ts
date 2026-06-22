import { Pool, ClientBase } from 'pg'
import { attachDatabasePool } from '@vercel/functions'

// Direct Aurora PostgreSQL connection using environment variables
const pool = new Pool({
  host: process.env.PGHOST,
  database: process.env.PGDATABASE || 'travelway',
  port: 5432,
  user: process.env.PGUSER || 'postgres',
  // For IAM auth: token will be generated via AWS credentials
  // For password auth: set PGPASSWORD environment variable
  password: process.env.PGPASSWORD,
  ssl: { rejectUnauthorized: false },
  max: 20,
})

attachDatabasePool(pool)

export async function query(text: string, params?: unknown[]) {
  return pool.query(text, params)
}

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
