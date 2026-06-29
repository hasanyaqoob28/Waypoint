import { compare } from 'bcryptjs'
import { query } from '@/lib/db'
import { cookies } from 'next/headers'
import { SignJWT } from 'jose'

const secret = new TextEncoder().encode(process.env.BETTER_AUTH_SECRET || 'default-secret-change-me')

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return Response.json({ error: 'Email and password required' }, { status: 400 })
    }

    // Find user
    const userResult = await query('SELECT id, email, name FROM "user" WHERE email = $1', [email])
    if (userResult.rows.length === 0) {
      return Response.json({ error: 'Email or password is incorrect' }, { status: 401 })
    }

    const user = userResult.rows[0]

    // Get stored password hash
    const accountResult = await query(
      'SELECT password FROM account WHERE "userId" = $1 AND "providerId" = $2',
      [user.id, 'credential']
    )

    if (accountResult.rows.length === 0) {
      return Response.json({ error: 'Email or password is incorrect' }, { status: 401 })
    }

    const storedHash = accountResult.rows[0].password

    // Compare password
    const isValid = await compare(password, storedHash)
    if (!isValid) {
      return Response.json({ error: 'Email or password is incorrect' }, { status: 401 })
    }

    // Create JWT token
    const token = await new SignJWT({ userId: user.id, email: user.email })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(secret)

    // Set cookie
    const cookieStore = await cookies()
    cookieStore.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
    })

    return Response.json({ success: true, userId: user.id })
  } catch (error) {
    console.error('[v0] Login error:', error)
    return Response.json({ error: 'Failed to login' }, { status: 500 })
  }
}
