import { Pool, ClientBase } from 'pg'
import { Signer } from '@aws-sdk/rds-signer'
import { awsCredentialsProvider } from '@vercel/functions/oidc'
import { attachDatabasePool } from '@vercel/functions'

const signer = new Signer({
  credentials: awsCredentialsProvider({
    roleArn: process.env.AWS_ROLE_ARN,
    clientConfig: { region: process.env.AWS_REGION },
  }),
  region: process.env.AWS_REGION,
  hostname: process.env.PGHOST,
  username: process.env.PGUSER || 'postgres',
  port: 5432,
})

const pool = new Pool({
  host: process.env.PGHOST,
  database: process.env.PGDATABASE || 'postgres',
  port: 5432,
  user: process.env.PGUSER || 'postgres',
  // The auth token value can be cached for up to 15 minutes (900 seconds) if desired.
  password: () => signer.getAuthToken(),
  // Recommended to switch to `true` in production.
  // See https://docs.aws.amazon.com/lambda/latest/dg/services-rds.html#rds-lambda-certificates
  ssl: { rejectUnauthorized: false },
  max: 20,
})
attachDatabasePool(pool)

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
