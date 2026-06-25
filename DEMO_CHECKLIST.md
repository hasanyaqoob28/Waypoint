# Travelway Demo Checklist

## Before Demo
- [ ] Internet connection is stable
- [ ] Open [https://travelway-ai.vercel.app](https://travelway-ai.vercel.app) in browser
- [ ] Have sample booking text ready (use "Use sample" button as fallback)
- [ ] Browser console open for transparency
- [ ] Vercel deployment dashboard open for reference

## Demo Flow (5-7 minutes)

### 1. Introduction (1 min)
- "Travelway solves travel chaos by parsing messy confirmations with AI"
- "All data persists to AWS Aurora - production-ready"
- Show the three-step workflow (Paste → Parse → Nudge)

### 2. Paste a Booking (1 min)
- Click "Use sample" button to auto-fill sample booking text
- Shows pre-formatted flight, hotel, activity booking

### 3. AI Parsing (1 min)
- Click "Parse with AI"
- Watch Gemini 2.0 Flash extract:
  - Flight details (airline, flight number, times, gates, seats)
  - Hotel information (check-in/out times, address)
  - Activity reservations (time, location)
- Point out: "AI runs serverless on Vercel, data goes straight to Aurora"

### 4. Live Timeline View (1 min)
- Show event timeline with all bookings
- Highlight countdown timer showing "Xh Ym until departure"
- Click through different events to show details

### 5. Data Persistence (1 min)
- "All trips stored in AWS Aurora PostgreSQL"
- Mention: "Automatic table creation, user management, event tracking"
- Optional: Show GitHub deployment (mention auto-push to `v0/...` branch)

### 6. Technical Stack (1 min)
- Frontend: Next.js 16 + React 19 + Tailwind
- AI: Vercel AI SDK + Gemini 2.0 Flash
- Database: AWS Aurora PostgreSQL with auto-schema
- Deployment: Vercel (frontend) + AWS (database)

### 7. Q&A
- "Any questions about the stack or use cases?"

## What to Highlight

✨ **Key Points:**
- AI parsing is intelligent - extracts context, relationships between events
- Real database backend - not just frontend tricks
- Countdown timers provide real value
- Clean, calm UI focused on traveler needs
- Production-ready: error handling, data validation, security

🎯 **If Asked:**
- "Why Aurora?" → Reliability, auto-scaling, integrated with AWS ecosystem
- "How do you extract data?" → Gemini 2.0 Flash with structured prompts
- "What about privacy?" → Data stored securely in Aurora, HTTPS encrypted
- "How's state managed?" → SWR for client-side caching, Server Actions for mutations

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Slow load | Clear cache, refresh, check internet |
| AI not parsing | Click "Use sample" first, then manually try |
| Database down | Check AWS Aurora status, verify PGHOST env var |
| Styling issues | Browser zoom to 100%, clear cache |

## Demo Notes
- Keep pace conversational, not too fast
- Let AI parsing finish naturally (7-10 seconds)
- Show the beautiful UI, not just functionality
- Emphasize: "Built from zero in hackathon" + "Production-ready"
