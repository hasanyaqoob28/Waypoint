import { query } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return Response.json({ error: 'userId required' }, { status: 400 })
    }

    const result = await query(
      'SELECT id, user_id, destination, title, raw_booking_text, created_at FROM trips WHERE user_id = $1 ORDER BY created_at DESC',
      [parseInt(userId)]
    )
    return Response.json(result.rows)
  } catch (error) {
    console.error('[v0] Database error:', error)
    return Response.json({ error: 'Failed to fetch trips' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { userId, destination, title, rawBookingText } = await request.json()

    if (!userId || !destination || !title) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const result = await query(
      'INSERT INTO trips (user_id, destination, title, raw_booking_text, created_at, updated_at) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING id, user_id, destination, title, raw_booking_text, created_at, updated_at',
      [parseInt(userId), destination, title, rawBookingText || null]
    )

    return Response.json(result.rows[0], { status: 201 })
  } catch (error) {
    console.error('[v0] Database error:', error)
    return Response.json({ error: 'Failed to create trip' }, { status: 500 })
  }
}
