import { NextRequest, NextResponse } from 'next/server'

// GET /api/trips - Retrieve all trips for a user (demo returns empty for hackathon)
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

    // For hackathon demo: trips are managed in-memory on frontend
    // In production: Aurora PostgreSQL would retrieve all stored trips
    return NextResponse.json({
      trips: [],
      count: 0,
    })
  } catch (error) {
    console.error('[v0] GET /api/trips error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve trips' },
      { status: 500 }
    )
  }
}

// POST /api/trips - Create a new trip (demo endpoint for hackathon)
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

    // For hackathon demo: return success response
    // In production: Aurora PostgreSQL would store the trip
    return NextResponse.json({
      trip: {
        id: Date.now(),
        userId,
        destination,
        title,
        rawBookingText,
        createdAt: new Date().toISOString(),
      },
    }, { status: 201 })
  } catch (error) {
    console.error('[v0] POST /api/trips error:', error)
    return NextResponse.json(
      { error: 'Failed to create trip' },
      { status: 500 }
    )
  }
}
