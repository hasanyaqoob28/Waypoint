import { promises as fs } from "fs"
import path from "path"
import os from "os"
import type { Trip } from "./types"

// On-disk JSON fallback used when DynamoDB credentials are not present.
// Lives in the OS temp dir so it is always writable in the sandbox.
const STORE_PATH = path.join(os.tmpdir(), "waypoint-trips.json")

async function readAll(): Promise<Trip[]> {
  try {
    const raw = await fs.readFile(STORE_PATH, "utf8")
    return JSON.parse(raw) as Trip[]
  } catch {
    return []
  }
}

async function writeAll(trips: Trip[]): Promise<void> {
  await fs.writeFile(STORE_PATH, JSON.stringify(trips, null, 2), "utf8")
}

export async function localSaveTrip(trip: Trip): Promise<void> {
  const trips = await readAll()
  trips.push(trip)
  await writeAll(trips)
}

export async function localGetTrips(userId: string): Promise<Trip[]> {
  const trips = await readAll()
  return trips
    .filter((t) => t.userId === userId)
    .sort((a, b) => (b.syncedAt > a.syncedAt ? 1 : -1))
}

export async function localGetTrip(
  userId: string,
  tripId: string,
): Promise<Trip | null> {
  const trips = await readAll()
  return trips.find((t) => t.userId === userId && t.tripId === tripId) || null
}

export async function localDeleteTrip(
  userId: string,
  tripId: string,
): Promise<void> {
  const trips = await readAll()
  await writeAll(
    trips.filter((t) => !(t.userId === userId && t.tripId === tripId)),
  )
}
