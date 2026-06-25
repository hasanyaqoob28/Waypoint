# Building Travelway: A Full-Stack AI App From Ideation to Deployment

**Reading time: 12 minutes**

---

## Introduction

Travel shouldn't be stressful.

Yet every traveler experiences the same problem: standing at an airport, drowning in confirmation emails, unable to find crucial information.

What if there was an app that understood your travel chaos and turned it into a **calm, beautiful timeline**?

That's **Travelway**.

This is the story of how I built it—from initial concept through deployment, including technical decisions, challenges, and lessons learned.

---

## The Problem & Opportunity

### The User Problem

Travel confirmations arrive from:
- 🛫 **Airlines** (10+ different formats)
- 🏨 **Hotels** (buried in marketing emails)
- 🚗 **Rental car companies** (scattered across multiple emails)
- 🍽️ **Restaurants** (usually just a confirmation code)
- 🎭 **Tours and activities** (PDFs, screenshots, everything)

By travel day, your inbox is **chaos**. You've forgotten:
- What time your flight departs
- Which hotel you're staying at
- What time dinner reservations are
- What to do between flights

This is when you should be calm and prepared. Instead, you're anxious and unprepared.

### The Technical Opportunity

Modern AI makes this solvable.

With **Gemini's structured output** and a **persistent database**, we could:
1. Extract information from messy emails
2. Structure it into a cohesive timeline
3. Add context-aware guidance

---

## Architecture & Technology Choices

### Why These Technologies?

**Frontend: Next.js 16 + React 19**
- Server Components for better performance
- App Router for cleaner routing
- Built-in API routes eliminate separate backend
- TypeScript for type safety across the stack

**Database: Amazon Aurora PostgreSQL**
- Managed service (no infrastructure overhead)
- ACID compliance for data integrity
- Built-in replication and automated backups
- IAM authentication instead of passwords
- Scales horizontally with read replicas

**ORM: Drizzle**
- Type-safe queries (catch errors at compile time)
- Migrations without external tools
- Excellent TypeScript support
- Smaller bundle than alternatives

**AI: Google Gemini 2.0 Flash**
- Structured output support (JSON schemas)
- Fast inference (critical for parsing)
- Accessible via Vercel AI Gateway
- No separate API key management

**Auth: Better Auth on Neon**
- Built-in password hashing
- OAuth support (future-proofing)
- Database-backed sessions
- Type-safe auth helpers

### Architecture Diagram

```
User pastes email
      ↓
Next.js API Route
      ↓
Gemini AI (structured parsing)
      ↓
Aurora PostgreSQL (persist data)
      ↓
React components (display timeline)
```

---

## Key Technical Challenges & Solutions

### Challenge 1: Parsing Diverse Email Formats

**The Problem:**

Confirmation emails are wildly inconsistent:

```
Airline: "Flight UA88 from SFO to JFK departs 10:40 AM, Gate G10"
Hotel: "Reservation #12345. Check-in 3PM at Hilton Downtown..."
Restaurant: "A table for 2 at 7:30 PM. Please arrive 10 mins early"
```

Brittle regex-based parsing would fail constantly.

**The Solution: Structured AI Prompts**

Instead of asking Gemini to "parse this email," I gave it a strict schema:

```typescript
const extractionSchema = z.object({
  flights: z.array(z.object({
    airline: string,
    flightNumber: string,
    departure: z.object({
      airport: string,
      time: string,
      terminal: string.optional(),
    }),
    arrival: z.object({
      airport: string,
      time: string,
    }),
    gate: string.optional(),
    seat: string.optional(),
  })),
  hotels: z.array(z.object({
    name: string,
    address: string,
    checkIn: string,
    checkOut: string,
    confirmationNumber: string,
  })),
  restaurants: z.array(z.object({
    name: string,
    time: string,
    partySize: number,
    location: string,
  })),
})
```

Then called Gemini with this schema:

```typescript
const result = await generateObject({
  model: "google/gemini-2.0-flash",
  schema: extractionSchema,
  prompt: `Extract travel information from this email:\n\n${emailText}`,
})
```

**Key Insight:**

Structured output is more reliable than free-form text parsing. The model fills in fields based on context, making reasonable inferences when data is incomplete.

---

### Challenge 2: Mobile-First Design Under Pressure

**The Problem:**

Initial design had:
- Hero section with logo and tagline
- Long marketing description
- Three feature cards
- Input area

On mobile, users had to scroll through all this marketing before reaching the actual input. Not great UX when you're at an airport stressed.

**The Solution: Responsive Design**

```tsx
{/* Mobile: short description, hidden feature cards */}
<p className="text-[12px] leading-relaxed lg:hidden">
  Paste your bookings. Travelway AI extracts everything.
</p>

{/* Desktop: full description + feature cards */}
<div className="hidden lg:grid lg:grid-cols-3 gap-2">
  {DASHBOARD_FEATURES.map(feature => (...))}
</div>
```

**Result:**
- Mobile users see input area immediately (no scrolling)
- Desktop users get full marketing story
- Same app, different experiences

**Mobile-First Principle:**

Your users will access this app at the moment of need (airport, taxi, pre-flight) not in a comfortable office. Design for that.

---

### Challenge 3: Real-Time Countdown Timers

**The Problem:**

Display "Boarding in 41m 25s" and update every second. But we don't want to re-render the entire page 60 times per minute.

**The Solution: Isolated React State**

```typescript
export function FlightSummary({ event }: { event: ItineraryEvent }) {
  const [countdown, setCountdown] = useState<string>("—")

  useEffect(() => {
    const updateCountdown = () => {
      setCountdown(getCountdown(event.flight.departureTimeLocal))
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)
    return () => clearInterval(interval)
  }, [event.flight.departureTimeLocal])

  return (
    <div>
      <p className="text-base font-bold">{countdown}</p>
    </div>
  )
}
```

**Key Insight:**

The countdown is in its own component with its own state. Updates to `countdown` don't affect parent components. React's reconciliation algorithm keeps the rest of the page static.

---

### Challenge 4: Deployment Pipeline Efficiency

**The Mistake I Made:**

I deployed after almost every change:
- ✗ Deployed color fixes
- ✗ Deployed mobile optimizations
- ✗ Deployed flight summary component
- ✗ Deployed countdown timer
- ✗ Deployed feature cards layout
- ✗ ...and ~15 more times

**Result:** Hit Vercel's 100 deployments/day limit and couldn't ship final improvements.

**What I Should Have Done:**

1. Make all related changes to code
2. Test locally
3. Commit once with comprehensive message
4. Deploy once

This would've used 2-3 deployments instead of 20+.

**The Lesson:**

Deploying frequently feels productive but creates risk and deployment fatigue. Batch changes logically. Deploy with confidence.

---

## Database Schema Design

The data model reflects how users think about trips:

```typescript
// Users
- id: string
- email: string
- createdAt: Date

// Trips (a journey to a destination)
- id: string
- userId: string
- destination: string
- startDate: Date
- endDate: Date

// Events (flights, hotels, restaurants)
- id: string
- tripId: string
- type: 'flight' | 'hotel' | 'restaurant' | 'event'
- startTime: Date
- endTime: Date
- data: JSON (flexible per type)

// AI Parsing Logs (for debugging)
- id: string
- tripId: string
- rawEmail: string
- parsedData: JSON
- success: boolean
```

**Why This Structure:**

- `tripId` groups all events for a single trip
- Flexible `data` JSON field stores type-specific details (gates, seat numbers, confirmation codes, etc.)
- Logging raw/parsed data helps debug edge cases

---

## Performance Considerations

### Database Indexes

Use indexes on frequently accessed columns:

```sql
CREATE INDEX idx_trips_user_id ON trips(user_id);
CREATE INDEX idx_events_trip_id ON events(trip_id, start_time);
```

### API Response Caching

Use SWR on frontend for smart caching:

```typescript
const { data: trip, mutate } = useSWR(
  tripId ? `/api/trips/${tripId}` : null,
  fetcher,
  { revalidateOnFocus: false }
)
```

### AI Parsing Time

Structured output parsing takes **2-3 seconds per email**.

Solution: Show loading state and update UI after completion.

---

## Deployment & Monitoring

| Component | Details |
|-----------|---------|
| **Deployed to** | Vercel (automatic deployments on git push) |
| **Database** | Amazon Aurora (managed backups, read replicas) |
| **Monitoring** | Vercel Analytics, custom error logging |

---

## What I'd Do Differently

**1. Define schema first**
Before writing UI or API logic, get your data model right.

**2. Test with real data**
Use actual travel confirmations from different airlines and hotels.

**3. Batch deployments**
Group changes logically. Deploy less frequently.

**4. Mobile-first from day one**
Not as an afterthought.

**5. Set deployment limits early**
Know your service limits before hitting them hard.

---

## Conclusion

Building Travelway taught me that solving real problems requires:

- **Good architecture** — Clear separation of concerns
- **Right tools** — Gemini for AI, Aurora for data, Next.js for full-stack
- **User empathy** — Design for the moment of need, not ideal conditions
- **Disciplined shipping** — Batch changes, deploy with confidence

The hardest part wasn't the code—it was understanding how people actually use the app (at an airport, stressed, under time pressure) and building accordingly.

---

## Try It Yourself

**[Visit Travelway →](https://travelway-ai.vercel.app)**

**Tech Stack:**
Next.js 16 • React 19 • TypeScript • Tailwind CSS • Aurora PostgreSQL • Drizzle ORM • Better Auth • Gemini 2.0 • Vercel AI SDK
