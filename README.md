# Travelway — Your whole trip, in one calm timeline

Travelway parses messy travel confirmations with AI and guides you through your entire travel day, from pre-flight preparation to landing to the gaps in between. Built for hackathon with real database persistence and intelligent event parsing.

## Features

- **AI-Powered Parsing**: Paste any booking confirmation (flights, hotels, activities) and Travelway automatically extracts and structures the data using Gemini 2.0 Flash
- **Real-Time Guidance**: Get context-aware nudges at every stage of your trip — when to leave, which gate, baggage carousel, hotel check-in details
- **Live Timeline**: Visual event sequence showing all bookings with auto-detection of current event
- **Event Countdown Timer**: Real-time countdown showing hours and minutes until upcoming flights
- **Event-Based Navigation**: Dynamic tabs for each booking with booking-specific information
- **Weather Integration**: Real-time weather for your destination via Open-Meteo (no API key needed)
- **Data Persistence**: All trips and events stored in AWS Aurora PostgreSQL for reliability
- **Offline First**: Works with a built-in fallback parser; upgrades to AI when connected

## Tech Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS v4
- **Backend**: Next.js API Routes with Server Actions
- **Database**: AWS Aurora PostgreSQL with real-time data persistence
- **AI**: Vercel AI SDK 6 with Google Gemini 2.0 Flash
- **State Management**: SWR for client-side data fetching and caching
- **UI Components**: shadcn/ui, Lucide icons
- **Styling**: Design tokens with semantic color system
- **Deployment**: Vercel (frontend) + AWS (database)

## Live Demo

Visit **[travelway-ai.vercel.app](https://travelway-ai.vercel.app)** to try Travelway now.

### Demo Usage

1. **Paste a booking confirmation** - Copy/paste any travel booking email or confirmation (try the "Use sample" button for a pre-filled example)
2. **AI parses automatically** - Gemini 2.0 Flash extracts flights, hotels, activities, times, seat numbers, gate info
3. **View your itinerary** - See a beautiful timeline of all events
4. **Get guidance** - Countdown timers show when to leave for your flight
5. **Real-time data** - All trips persist to AWS Aurora PostgreSQL

**Sample Data to Try:**
- Paste any flight confirmation with: airline, flight number, departure/arrival airports, times
- Include hotel name, address, check-in/check-out times
- Add activity/restaurant reservations with locations and times

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- AWS Aurora PostgreSQL database (optional for local development)
- Vercel account for deployment

### Installation

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Environment Variables

Create a `.env.local` file:

```
NEXT_PUBLIC_API_URL=http://localhost:3000
PGHOST=your-aurora-cluster.cluster-xxxxx.us-east-1.rds.amazonaws.com
PGUSER=postgres
PGPASSWORD=your-db-password
PGDATABASE=travelway
```

### Database Setup (AWS Aurora PostgreSQL)

**Create Aurora Cluster:**
1. Go to AWS RDS Console → Create database
2. Select Amazon Aurora PostgreSQL-Compatible
3. Configure:
   - DB instance class: `db.t3.micro` (free tier eligible)
   - Master username: `postgres`
   - Create strong master password
   - Public accessibility: `Yes`
   - Security group: Allow inbound on port 5432

**Initialize Database:**
The app auto-creates tables on first connection. Tables created:
- `users` - User accounts
- `trips` - Travel itineraries
- `events` - Individual flights, hotels, activities

**Connection String:**
```
postgresql://postgres:PASSWORD@CLUSTER.us-east-1.rds.amazonaws.com:5432/travelway
```

## Architecture

### Components

- **Dashboard**: Main layout with header, trip list, and active trip view
- **EventTimeline**: Horizontal timeline showing all trip events with current event highlighted
- **ContextMoment**: Event-specific guidance panel with real booking details
- **IngestPanel**: Input form for pasting travel confirmations
- **EventCard**: Display card for individual itinerary events

### Data Flow

1. User pastes booking confirmation → IngestPanel
2. Fallback parser or AI structures data → Trip object
3. Trip stored in local state via SWR
4. Dashboard renders event timeline and current guidance
5. Clicking timeline event updates ContextMoment display

## Deployment

### Vercel

The project is configured for Vercel deployment. To deploy:

1. Connect your GitHub repository to Vercel
2. Push code to main branch
3. Vercel automatically builds and deploys

Visit the [Vercel Dashboard](https://vercel.com/dashboard) to manage deployments.

## Development

### Build

```bash
pnpm build
```

### Type Checking

```bash
pnpm exec tsc --noEmit
```

### Linting

```bash
pnpm lint
```

## Deployment

### Quick Deploy to Vercel

1. **Connect GitHub Repository**
   - Push code to GitHub
   - Connect repo to Vercel

2. **Set Environment Variables**
   - Add AWS Aurora connection details in Vercel Settings → Environment Variables
   - Set `PGHOST`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`

3. **Deploy**
   ```bash
   git push origin main
   ```
   Vercel auto-deploys on push

4. **Verify Database Connection**
   - Check deployment logs for successful database initialization
   - Visit your live URL and test with sample booking data

## Creator

**Hassan Yaqoob** - Built Travelway for the hackathon
- Connect on LinkedIn: [Hassan Yaqoob](https://www.linkedin.com/in/hassan-yaqoob)
- Email: For collaboration and inquiries

## License

MIT
