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

export const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || "WaypointTrips"

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

export async function saveTrip(trip: Trip): Promise<void> {
  await ensureTable()
  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: trip,
    }),
  )
}

export async function getTrips(userId: string): Promise<Trip[]> {
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

export async function getTrip(
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

export async function deleteTrip(
  userId: string,
  tripId: string,
): Promise<void> {
  await ensureTable()
  await docClient.send(
    new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { userId, tripId },
    }),
  )
}
