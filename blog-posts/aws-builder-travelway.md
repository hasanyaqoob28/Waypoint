# Serverless AI at Scale: Building Travelway with Amazon Aurora and Next.js

**AWS Builder Blog**

---

## Executive Summary

**Travelway** is a production AI application that ingests unstructured travel confirmation emails and persists them to Aurora PostgreSQL.

This post covers:
- **Why Aurora PostgreSQL** for AI workloads
- **Serverless architecture** with Next.js on Vercel
- **IAM authentication** for secure database access
- **Real-world scaling considerations**
- **Production lessons** from shipping to users

---

## Architecture Overview

```
Users
  ↓
Vercel Edge Network (Next.js Frontend)
  ↓
Next.js API Routes (Serverless Functions)
  ↓
AWS Secrets Manager (Database Credentials)
  ↓
Amazon Aurora PostgreSQL (Managed Database)
  ↓
Google Gemini 2.0 (AI Inference via API)
```

---

## Why Aurora PostgreSQL?

### 1. Managed Service = No Infrastructure Overhead

**Without Aurora:**
- Provision EC2 instances
- Manage backups manually
- Handle failover yourself
- Monitor disk space
- Update PostgreSQL versions
- Scale read replicas manually

**With Aurora:**
- AWS handles all of this
- Automatic failover to replica in <30 seconds
- Automated backups with point-in-time recovery
- Multi-AZ deployment by default

### 2. IAM Authentication (No Passwords)

**Traditional approach (insecure):**
```env
DATABASE_URL=postgresql://user:password@host/db
```

This bakes credentials into your codebase. Compromised = direct database access.

**Aurora IAM Authentication:**

```typescript
import { RDS } from '@aws-sdk/client-rds-signer'

const signer = new RDS.Signer({
  region: process.env.AWS_REGION,
  hostname: process.env.DB_HOST,
  port: 5432,
  username: process.env.DB_USER,
})

const token = signer.getAuthorizationToken({
  username: process.env.DB_USER,
})

const client = new Client({
  host: process.env.DB_HOST,
  port: 5432,
  user: process.env.DB_USER,
  password: token, // Temporary, signed token
  database: process.env.DB_NAME,
})
```

**Benefits:**
- Credentials never stored in code
- Tokens are temporary (valid ~15 minutes)
- Audit trail in CloudTrail
- Revoke access instantly without changing passwords

### 3. ACID Compliance for Data Integrity

When parsing multiple emails for the same trip, you need transactional consistency:

```typescript
await db.transaction(async (tx) => {
  // Atomically: create trip + add all events
  const trip = await tx.insert(trips).values({...})
  
  for (const event of parsedEvents) {
    await tx.insert(events).values({
      tripId: trip.id,
      ...event
    })
  }
  
  // Either all succeed or all rollback
})
```

If the function crashes mid-way, Aurora **rolls back all changes**. No partial data pollution.

### 4. Aurora Serverless v2 for Unpredictable Workloads

Aurora Serverless v2 automatically scales based on demand:

```
Aurora Serverless v2 ACU (Aurora Capacity Units):
├─ 0.5 ACU (minimum, ~4GB RAM)
├─ Scales to 2, 4, 8, 16+ ACUs based on demand
└─ Scales down when traffic drops (cost-effective)
```

**For Travelway:**
- Peak usage: ~10 ACU (when users parse bulk trips)
- Off-peak: ~0.5 ACU (minimal cost)
- No manual provisioning needed

---

## Production Architecture

### Database Schema

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR UNIQUE NOT NULL,
  password_hash VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  destination VARCHAR NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_trips_user_id (user_id, created_at DESC)
);

CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  type VARCHAR NOT NULL, -- 'flight', 'hotel', 'restaurant'
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP,
  data JSONB NOT NULL, -- Type-specific data
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_events_trip_id_time (trip_id, start_time)
);
```

**Why JSONB for `data` field?**

Different event types have different fields:
- **Flights:** airline, flight number, gate, seat, terminal
- **Hotels:** name, address, confirmation code, check-in time
- **Restaurants:** name, time, party size, location

Instead of separate tables, JSONB in one table is **simpler** and allows schema evolution.

**Query example:**
```sql
SELECT * FROM events 
WHERE trip_id = $1 
  AND data->>'type' = 'flight'
  AND (data->>'gate')::text = 'G4'
```

---

### API Route for Email Parsing

```typescript
// app/api/ingest/route.ts
export async function POST(request: Request) {
  const { rawEmail, tripId } = await request.json()
  
  // 1. Authenticate user
  const session = await getSession()
  
  // 2. Verify trip ownership
  const trip = await db.query.trips.findFirst({
    where: (trips, { eq, and }) => and(
      eq(trips.id, tripId),
      eq(trips.userId, session.user.id)
    )
  })
  
  if (!trip) return NextResponse.json(
    { error: 'Unauthorized' }, 
    { status: 403 }
  )
  
  // 3. Parse email with Gemini
  const parsedData = await generateObject({
    model: 'google/gemini-2.0-flash',
    schema: extractionSchema,
    prompt: `Extract travel events:\n${rawEmail}`
  })
  
  // 4. Persist atomically
  await db.transaction(async (tx) => {
    for (const flight of parsedData.flights) {
      await tx.insert(events).values({
        tripId,
        type: 'flight',
        startTime: new Date(flight.departure.time),
        endTime: new Date(flight.arrival.time),
        data: flight
      })
    }
    
    for (const hotel of parsedData.hotels) {
      await tx.insert(events).values({
        tripId,
        type: 'hotel',
        startTime: new Date(hotel.checkIn),
        endTime: new Date(hotel.checkOut),
        data: hotel
      })
    }
  })
  
  return NextResponse.json({ success: true })
}
```

---

## Scaling Considerations

### Connection Pooling

Each serverless function creates a new database connection. With 1000 concurrent functions, you'd have 1000 connections.

Aurora has limits (~16,000 for db.r6i.4xlarge).

**Solution: AWS RDS Proxy**

```
Lambda → RDS Proxy (connection pooling) → Aurora
```

**RDS Proxy Benefits:**
- Maintains persistent connections to Aurora
- Maps incoming connections to pooled connections
- Reduces connection overhead by ~80%

### Query Performance

Monitor slow queries in Aurora with **Performance Insights**:

```
Top queries by load:
1. SELECT * FROM events WHERE trip_id = ? ORDER BY start_time
2. SELECT * FROM trips WHERE user_id = ? ORDER BY created_at DESC
3. INSERT INTO events (trip_id, type, ...) VALUES (...)
```

**Optimization:**

```sql
CREATE INDEX idx_events_covering 
  ON events (trip_id, start_time) 
  INCLUDE (type, data);
```

---

## Cost Analysis

**Baseline costs (monthly, US-East-1):**

| Component | Capacity | Cost |
|-----------|----------|------|
| Aurora Serverless v2 | 0.5-4 ACU | $40-160 |
| Data transfer | 100GB | $10 |
| RDS Proxy | 0.5 connections | $14 |
| **Total** | | **~$65-185/mo** |

**Compared to self-managed EC2:**
- EC2 instance: $30/month
- Data backup: $10/month
- Operational overhead: **priceless**

Aurora's cost is justified by:
- Automatic backups
- No operational overhead
- Built-in redundancy
- Automatic failover

---

## Monitoring & Observability

### CloudWatch Metrics

```typescript
const cloudwatch = new CloudWatch()

await cloudwatch.putMetricData({
  Namespace: 'Travelway',
  MetricData: [
    {
      MetricName: 'EmailsParsed',
      Value: 1,
      Timestamp: new Date(),
    },
    {
      MetricName: 'ParseLatencyMs',
      Value: 2300,
    }
  ]
})
```

### Aurora Performance Insights

Monitor:
- **Database Load** — # of active sessions
- **Top wait events** — locks, I/O, network
- **Slow query log** — queries taking >1s

*This caught a missing index that was slowing timeline queries by 10x.*

---

## Security Best Practices

### 1. Row-Level Security (RLS)

```sql
CREATE POLICY user_trips_policy ON trips
  USING (user_id = current_user_id());
```

Only users can see their own trips.

### 2. Encryption at Rest

Aurora is encrypted by default with AWS KMS. All backups are encrypted automatically.

### 3. Encryption in Transit

```typescript
const sslMode = 'require'
const connectionString = `postgresql://...?sslmode=${sslMode}`
```

Force SSL connections.

### 4. Secrets Rotation

AWS Secrets Manager rotates IAM auth tokens automatically. Never hardcode credentials.

---

## Lessons Learned

### 1. Plan for Connections Early

We had connection pool exhaustion at 100 concurrent users. Should have implemented RDS Proxy from day one.

### 2. Monitor Query Performance

A missing index caused **10x latency increase**. Aurora Performance Insights caught it in 5 minutes.

### 3. JSONB Schema Evolution

Flexibility saved time, but lack of structure caught bugs late. Use validation schemas:

```typescript
const flightSchema = z.object({
  airline: z.string(),
  flightNumber: z.string(),
  departure: z.object({
    airport: z.string(),
    time: z.string().datetime(),
  }),
})

const validatedFlights = flights.map(f => flightSchema.parse(f))
```

### 4. Backup Recovery Testing

Test your backups. We discovered our RTO was 2 hours until we tested it (it was actually 30 minutes—good news).

### 5. Cost Monitoring

Set up CloudWatch alarms for unexpected costs:

```typescript
cloudwatch.putMetricAlarm({
  AlarmName: 'TravelwayBudgetAlert',
  MetricName: 'EstimatedCharges',
  Threshold: 300,
  ComparisonOperator: 'GreaterThanThreshold',
})
```

Alert if monthly bill projected to exceed $300.

---

## Conclusion

**Aurora PostgreSQL provides:**

✓ **Reliability** — Automatic failover, backups, ACID compliance
✓ **Security** — IAM authentication, encryption, RLS
✓ **Scalability** — Serverless v2, read replicas, RDS Proxy
✓ **Cost-effectiveness** — Pay for what you use, no infrastructure overhead

For AI applications ingesting unstructured data and persisting to structured databases, **Aurora is the right choice**.

---

## The Full Stack

```
API Gateway:      Vercel (Edge Network)
Compute:          Next.js on Vercel (Serverless)
Database:         Aurora Serverless v2
AI:               Gemini 2.0 via API
Auth:             Better Auth + IAM
Monitoring:       CloudWatch + Aurora Performance Insights
```

This combination gives you a **production-ready, scalable AI application** without managing a single server.

---

## Try Travelway

**[Visit Travelway →](https://travelway-ai.vercel.app)**

---

## Resources

- [Aurora Serverless v2 Documentation](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/aurora-serverless-v2.html)
- [IAM Database Authentication](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/UsingWithRDS.IAMDBAuth.html)
- [RDS Proxy Best Practices](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/rds-proxy.html)
