'use server'

import { query } from '@/lib/db'
import { hashPassword, verifyPassword } from '@/lib/password'
import { cookies } from 'next/headers'

export interface AuthResult {
  success: boolean
  error?: string
  userId?: number
}

export async function serverSignUp(
  email: string,
  password: string,
  _name: string, // name parameter for form compatibility (not stored in DB)
): Promise<AuthResult> {
  try {
    // Check if user exists
    const existingUser = await query('SELECT id FROM users WHERE email = $1', [email])
    if (existingUser.rows.length > 0) {
      return { success: false, error: 'Email already registered' }
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    // Create user
    const result = await query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id',
      [email, passwordHash],
    )

    const userId = result.rows[0].id

    // Store user ID in cookie
    const cookieStore = await cookies()
    cookieStore.set('userId', String(userId), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return { success: true, userId }
  } catch (error) {
    console.error('[v0] SignUp error:', error)
    return { success: false, error: 'Failed to create account' }
  }
}

export async function serverSignIn(email: string, password: string): Promise<AuthResult> {
  try {
    // Find user
    const result = await query('SELECT id, password_hash FROM users WHERE email = $1', [email])

    if (result.rows.length === 0) {
      return { success: false, error: 'Email or password is incorrect' }
    }

    const user = result.rows[0]

    // Verify password
    const isValid = await verifyPassword(password, user.password_hash)
    if (!isValid) {
      return { success: false, error: 'Email or password is incorrect' }
    }

    // Store user ID in cookie
    const cookieStore = await cookies()
    cookieStore.set('userId', String(user.id), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return { success: true, userId: user.id }
  } catch (error) {
    console.error('[v0] SignIn error:', error)
    return { success: false, error: 'Failed to sign in' }
  }
}

export async function serverGetCurrentUser() {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value

    if (!userId) {
      return null
    }

    const result = await query('SELECT id, email FROM users WHERE id = $1', [parseInt(userId)])
    return result.rows[0] || null
  } catch (error) {
    console.error('[v0] GetCurrentUser error:', error)
    return null
  }
}
