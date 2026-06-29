import { hash } from 'bcryptjs'
import { query } from '@/lib/db'
import { cookies } from 'next/headers'
import { SignJWT } from 'jose'

const secret = new TextEncoder().encode(process.env.BETTER_AUTH_SECRET || 'default-secret-change-me')

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json()

    // Validate inputs
    if (!email || !password || !name) {
      return Response.json({ error: 'Missing fields' }, { status: 400 })
    }

    if (password.length < 8) {
      return Response.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    // Check if user exists
    const existing = await query('SELECT id FROM "user" WHERE email = $1', [email])
    if (existing.rows.length > 0) {
      return Response.json({ error: 'Email already registered' }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await hash(password, 10)

    // Create user
    const result = await query(
      'INSERT INTO "user" (id, email, name, "emailVerified", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [
        `user_${Date.now()}`,
        email,
        name,
        false,
        new Date(),
        new Date(),
      ]
    )

    const userId = result.rows[0].id

    // Store password in account table
    await query(
      'INSERT INTO account (id, "userId", "accountId", "providerId", password, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [
        `account_${Date.now()}`,
        userId,
        email,
        'credential',
        hashedPassword,
        new Date(),
        new Date(),
      ]
    )

    // Create JWT token
    const token = await new SignJWT({ userId, email })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(secret)

    // Set cookie
    const cookieStore = await cookies()
    cookieStore.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    return Response.json({ success: true, userId })
  } catch (error) {
    console.error('[v0] Signup error:', error)
    return Response.json({ error: 'Failed to create account' }, { status: 500 })
  }
}
