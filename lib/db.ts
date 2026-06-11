import {
  DynamoDBClient,
  CreateTableCommand,
  DescribeTableCommand,
  ResourceNotFoundException,
} from "@aws-sdk/client-dynamodb"
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
  GetCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb"
import type { Trip } from "./types"
import {
  localSaveTrip,
  localGetTrips,
  localGetTrip,
  localDeleteTrip,
} from "./local-store"

export const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || "WaypointTrips"

// DynamoDB is used when AWS credentials are present in the environment.
// Otherwise we fall back to an on-disk JSON store so the app stays usable.
export const hasDynamoCreds = Boolean(
  process.env.AWS_REGION &&
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY,
)

export const storageBackend = hasDynamoCreds ? "dynamodb" : "local"

const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
})

const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true },
})

let tableReady: Promise<void> | null = null

/**
 * Ensures the WaypointTrips table exists, creating it on first use.
 * Partition key: userId (String), Sort key: tripId (String).
 */
export async function ensureTable(): Promise<void> {
  if (tableReady) return tableReady

  tableReady = (async () => {
    try {
      await client.send(new DescribeTableCommand({ TableName: TABLE_NAME }))
      return
    } catch (err) {
      if (!(err instanceof ResourceNotFoundException)) throw err
    }

    await client.send(
      new CreateTableCommand({
        TableName: TABLE_NAME,
        BillingMode: "PAY_PER_REQUEST",
        AttributeDefinitions: [
          { AttributeName: "userId", AttributeType: "S" },
          { AttributeName: "tripId", AttributeType: "S" },
        ],
        KeySchema: [
          { AttributeName: "userId", KeyType: "HASH" },
          { AttributeName: "tripId", KeyType: "RANGE" },
        ],
      }),
    )

    // Wait until the table becomes ACTIVE before allowing writes.
    for (let i = 0; i < 30; i++) {
      const desc = await client.send(
        new DescribeTableCommand({ TableName: TABLE_NAME }),
      )
      if (desc.Table?.TableStatus === "ACTIVE") return
      await new Promise((r) => setTimeout(r, 1000))
    }
  })()

  return tableReady
}

async function ddbSaveTrip(trip: Trip): Promise<void> {
  await ensureTable()
  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: trip,
    }),
  )
}

async function ddbGetTrips(userId: string): Promise<Trip[]> {
  await ensureTable()
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: "userId = :uid",
      ExpressionAttributeValues: { ":uid": userId },
    }),
  )
  const trips = (result.Items || []) as Trip[]
  return trips.sort((a, b) => (b.syncedAt > a.syncedAt ? 1 : -1))
}

async function ddbGetTrip(
  userId: string,
  tripId: string,
): Promise<Trip | null> {
  await ensureTable()
  const result = await docClient.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { userId, tripId },
    }),
  )
  return (result.Item as Trip) || null
}

async function ddbDeleteTrip(userId: string, tripId: string): Promise<void> {
  await ensureTable()
  await docClient.send(
    new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { userId, tripId },
    }),
  )
}

// ---- Public dispatchers: DynamoDB when credentialed & reachable, on-disk
// JSON otherwise. If DynamoDB is configured but errors at runtime (invalid
// token, throttling, etc.) we fall back to local storage so the app keeps
// working — useful for demos before valid AWS creds are wired up.

function logDdbFallback(op: string, err: unknown) {
  console.error(
    `[v0] DynamoDB ${op} failed, using local store:`,
    err instanceof Error ? err.message : err,
  )
}

export async function saveTrip(trip: Trip): Promise<void> {
  if (!hasDynamoCreds) return localSaveTrip(trip)
  try {
    return await ddbSaveTrip(trip)
  } catch (err) {
    logDdbFallback("saveTrip", err)
    return localSaveTrip(trip)
  }
}

export async function getTrips(userId: string): Promise<Trip[]> {
  if (!hasDynamoCreds) return localGetTrips(userId)
  try {
    return await ddbGetTrips(userId)
  } catch (err) {
    logDdbFallback("getTrips", err)
    return localGetTrips(userId)
  }
}

export async function getTrip(
  userId: string,
  tripId: string,
): Promise<Trip | null> {
  if (!hasDynamoCreds) return localGetTrip(userId, tripId)
  try {
    return await ddbGetTrip(userId, tripId)
  } catch (err) {
    logDdbFallback("getTrip", err)
    return localGetTrip(userId, tripId)
  }
}

export async function deleteTrip(
  userId: string,
  tripId: string,
): Promise<void> {
  if (!hasDynamoCreds) return localDeleteTrip(userId, tripId)
  try {
    return await ddbDeleteTrip(userId, tripId)
  } catch (err) {
    logDdbFallback("deleteTrip", err)
    return localDeleteTrip(userId, tripId)
  }
}
