import { cookies } from 'next/headers'
import { query } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value

    if (!userId) {
      return NextResponse.json({ user: null }, { status: 200 })
    }

    // Fetch user from database
    const result = await query(
      'SELECT id, email FROM users WHERE id = $1',
      [userId],
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ user: null }, { status: 200 })
    }

    const user = result.rows[0]
    return NextResponse.json({ user }, { status: 200 })
  } catch (error) {
    console.error('[v0] Error fetching user:', error)
    return NextResponse.json({ user: null }, { status: 500 })
  }
}
