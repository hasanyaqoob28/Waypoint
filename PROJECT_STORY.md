# Travelway: Bringing Calm to Travel Planning

## Inspiration

The idea for Travelway came from a simple observation: travelers receive dozens of confirmation emails across Gmail, Outlook, and booking platforms, yet have no unified way to access critical information during travel day. We've all been there—frantically searching through emails at the airport to find a gate number, hotel address, or baggage carousel information that should be at our fingertips.

We envisioned a tool that could instantly transform scattered confirmations into a single, organized timeline—one that tells you exactly when to leave, which gate to go to, and what to expect during gaps in your itinerary.

## What We Built

**Travelway** is an AI-powered travel itinerary manager that:
- Parses travel confirmation emails automatically
- Extracts flight times, hotel details, and booking information
- Organizes everything into a chronological, easy-to-read timeline
- Provides a calm, single source of truth for your entire trip

The app features a beautiful, responsive interface with an animated 3-step demo showing users exactly how the system works—from email input to organized output.

## How We Built It

**Technology Stack:**
- **Frontend:** Next.js 16 with React 19, Tailwind CSS, and TypeScript
- **Backend:** Vercel Server Actions for secure, server-side processing
- **Database:** Amazon Aurora PostgreSQL for production-grade data storage
- **Deployment:** Vercel for instant global distribution and automatic scaling
- **UI Components:** shadcn/ui for accessible, modern components

We chose this stack to ensure fast development cycles, secure data handling, and seamless deployment without infrastructure complexity.

## Key Features Implemented

- **Real-time Email Parsing:** AI extracts structured data from unstructured email confirmations
- **Trip Management:** Users can create, view, and delete multiple trips
- **Responsive Design:** Works seamlessly on desktop, tablet, and mobile devices
- **Animated Demo:** 3-step walkthrough showing the parsing workflow
- **Feature-Rich UI:** Dark theme with orange accents, smooth animations, and intuitive navigation

## Challenges Faced

**Challenge 1: Email Parsing Complexity**
Different airlines, hotels, and booking platforms format confirmations differently. We solved this by using AI with structured prompts that understand context and extract relevant information regardless of format.

**Challenge 2: Date/Time Extraction from Unstructured Emails**
Parsing dates from unstructured email confirmations proved challenging. Different formats (12-hour, 24-hour, timezone variations, relative dates like "tomorrow") made consistent extraction difficult. The AI sometimes misses or misinterprets date fields, causing events to display in the wrong chronological order. While the core parsing works, improving date extraction accuracy and ensuring consistent formatting across all event types is an ongoing priority for the next iteration.

**Challenge 3: Database Configuration and Connection**
Setting up Aurora PostgreSQL and establishing reliable connections from a serverless environment proved challenging. Network timeouts, connection pooling issues, and environment variable configuration required careful debugging. We addressed this by implementing proper error handling, retry logic, and keeping database server actions production-ready for future deployment.

**Challenge 4: Real-time User Experience**
We needed instant feedback when users input emails. Server Actions combined with Vercel's infrastructure provided fast response times and smooth interactions.

**Challenge 5: First-Time User Clarity**
Users needed to immediately understand what the app does. We solved this with:
- Clear tagline: "Your whole trip, in one calm timeline"
- 3-step animated demo showing the exact workflow
- "Use sample" button for instant demo without typing

## What We Learned

1. **Simplicity wins:** Removing complexity and focusing on core functionality significantly improved user understanding
2. **Visual communication matters:** The animated demo reduced onboarding friction more than any text could
3. **AI + structured output is powerful:** AI can parse messy, unstructured data and produce clean, usable timelines
4. **Database planning is critical:** Proper schema design and connection strategy from the start prevents headaches later
5. **Natural language parsing is hard:** Extracting structured data from unstructured text requires careful prompt engineering and fallback strategies

## Future Roadmap

- Improve date/time extraction accuracy and sorting
- User authentication and account persistence
- Integration with calendar apps (Google Calendar, Outlook)
- Push notifications for upcoming flights and check-ins
- Multi-language support
- Mobile app native versions

---

**Built with passion for travelers everywhere. Travelway: Because your trip shouldn't stress you out.**
