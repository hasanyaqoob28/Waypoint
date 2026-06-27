import { pool } from '@/lib/db'

export async function POST() {
  const client = await pool.connect()

  try {
    console.log('[v0] Running Better Auth schema migration...')

    // Create user table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "user" (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        emailVerified BOOLEAN NOT NULL DEFAULT false,
        name TEXT,
        image TEXT,
        createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_user_email ON "user"(email);
    `)
    console.log('[v0] ✓ Created user table')

    // Create session table
    await client.query(`
      CREATE TABLE IF NOT EXISTS session (
        id TEXT PRIMARY KEY,
        expiresAt TIMESTAMP NOT NULL,
        token TEXT UNIQUE NOT NULL,
        createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        userId TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE
      );
      CREATE INDEX IF NOT EXISTS idx_session_userId ON session(userId);
      CREATE INDEX IF NOT EXISTS idx_session_token ON session(token);
    `)
    console.log('[v0] ✓ Created session table')

    // Create account table
    await client.query(`
      CREATE TABLE IF NOT EXISTS account (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
        accountId TEXT NOT NULL,
        providerId TEXT NOT NULL,
        accessToken TEXT,
        refreshToken TEXT,
        idToken TEXT,
        expiresAt TIMESTAMP,
        password TEXT,
        createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(providerId, accountId)
      );
      CREATE INDEX IF NOT EXISTS idx_account_userId ON account(userId);
    `)
    console.log('[v0] ✓ Created account table')

    // Create verification table
    await client.query(`
      CREATE TABLE IF NOT EXISTS verification (
        id TEXT PRIMARY KEY,
        identifier TEXT NOT NULL,
        value TEXT NOT NULL,
        expiresAt TIMESTAMP NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_verification_identifier ON verification(identifier);
    `)
    console.log('[v0] ✓ Created verification table')

    return Response.json({
      success: true,
      message: 'Better Auth schema migration complete',
    })
  } catch (error) {
    console.error('[v0] Migration error:', error)
    return Response.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Migration failed',
      },
      { status: 500 }
    )
  } finally {
    client.release()
  }
}
