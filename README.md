# Waypoint — Context-Aware Travel Day Copilot

Waypoint parses messy travel confirmations with AI and guides you through your entire travel day, from pre-flight preparation to landing to the gaps in between.

## Features

- **AI-Powered Parsing**: Paste any booking confirmation (flights, hotels, activities) and Waypoint automatically extracts and structures the data
- **Real-Time Guidance**: Get context-aware nudges at every stage of your trip — when to leave, which gate, baggage carousel, hotel check-in details
- **Live Timeline**: Visual event sequence showing all bookings with auto-detection of current event
- **Event-Based Navigation**: Dynamic tabs for each booking with booking-specific information
- **Weather Integration**: Real-time weather for your destination via Open-Meteo (no API key needed)
- **Offline First**: Works with a built-in fallback parser; upgrades to AI when connected

## Tech Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS v4
- **AI**: Vercel AI SDK 6 with Google Gemini
- **State Management**: SWR for client-side data fetching and caching
- **UI Components**: shadcn/ui, Lucide icons
- **Styling**: Design tokens with semantic color system

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm

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
```

For AI parsing, set up the Vercel AI Gateway in your deployment.

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

## License

MIT
