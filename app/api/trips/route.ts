import { getTrips, deleteTrip } from "@/lib/db"

export const maxDuration = 30

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    if (!userId) {
      return Response.json({ error: "Missing userId" }, { status: 400 })
    }
    const trips = await getTrips(userId)
    return Response.json({ trips })
  } catch (error) {
    console.error("[v0] Failed to load trips:", error)
    const message = error instanceof Error ? error.message : "Unknown error"
    return Response.json(
      { error: "Failed to load trips", details: message },
      { status: 500 },
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { userId, tripId } = await request.json()
    if (!userId || !tripId) {
      return Response.json(
        { error: "Missing userId or tripId" },
        { status: 400 },
      )
    }
    await deleteTrip(userId, tripId)
    return Response.json({ success: true })
  } catch (error) {
    console.error("[v0] Failed to delete trip:", error)
    const message = error instanceof Error ? error.message : "Unknown error"
    return Response.json(
      { error: "Failed to delete trip", details: message },
      { status: 500 },
    )
  }
}
