import { query } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/trips - Retrieve all trips for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    const result = await query(
      'SELECT * FROM trips WHERE user_id = $1 ORDER BY created_at DESC',
      [parseInt(userId)]
    )

    return NextResponse.json({
      trips: result.rows,
      count: result.rows.length,
    })
  } catch (error) {
    console.error('[v0] GET /api/trips error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve trips' },
      { status: 500 }
    )
  }
}

// POST /api/trips - Create a new trip
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, destination, title, rawBookingText } = body

    if (!userId || !destination || !title) {
      return NextResponse.json(
        { error: 'userId, destination, and title are required' },
        { status: 400 }
      )
    }

    const result = await query(
      `INSERT INTO trips (user_id, destination, title, raw_booking_text, created_at, updated_at)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING *`,
      [parseInt(userId), destination, title, rawBookingText || null]
    )

    return NextResponse.json({
      trip: result.rows[0],
    }, { status: 201 })
  } catch (error) {
    console.error('[v0] POST /api/trips error:', error)
    return NextResponse.json(
      { error: 'Failed to create trip' },
      { status: 500 }
    )
  }
}
