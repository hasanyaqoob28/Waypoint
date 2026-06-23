import { Pool, ClientBase } from 'pg'
import { Signer } from '@aws-sdk/rds-signer'
import { fromEnv } from '@aws-sdk/credential-providers'
import { attachDatabasePool } from '@vercel/functions'

const signer = new Signer({
  credentials: fromEnv(),
  region: process.env.AWS_REGION || 'us-east-1',
  hostname: process.env.PGHOST,
  username: process.env.PGUSER || 'postgres',
  port: 5432,
})

const pool = new Pool({
  host: process.env.PGHOST,
  database: process.env.PGDATABASE || 'travelway',
  port: 5432,
  user: process.env.PGUSER || 'postgres',
  password: () => signer.getAuthToken(),
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
