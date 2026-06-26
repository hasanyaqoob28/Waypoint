# From Chaos to Clarity: Building an AI-Powered Travel App

## (And What I Learned About Shipping at Scale)

I just shipped **Travelway**—an AI app that transforms travel confirmation emails into beautiful, actionable timelines. 

Here's what I learned in the process.

---

## The Problem I Solved

We've all been at the airport, frantically searching through 20+ emails.

*"What time is my flight?"*
*"Which terminal?"*
*"Where's the baggage carousel?"*

Travel confirmations come from airlines, hotels, rental companies, and restaurants—all in **different formats**, buried under marketing spam.

By travel day, you're drowning in information chaos when you should be calm and prepared.

**Travelway was my answer:** Paste your bookings, get one beautiful timeline.

---

## The Technical Foundation

**Core Stack:**
- Next.js 16 + React 19 (Frontend)
- Amazon Aurora PostgreSQL + Drizzle ORM (Backend)
- Google Gemini 2.0 (AI Parsing)
- Better Auth (User Management)
- Vercel (Deployment)

---

## The Hard Problems I Solved

### 1. **Diverse Email Formats**

**The Problem:**
Airlines format confirmations completely differently than hotels. Some include all details, others hide them behind links.

**The Solution:**
Instead of brittle parsing rules, I used **structured AI prompts** with JSON schemas. This let Gemini intelligently fill in fields based on context, even when formats varied wildly.

---

### 2. **Mobile-First Design Under Pressure**

**The Problem:**
Desktop-first design meant mobile users scrolled forever before reaching the input. Not ideal when you're at an airport stressed out.

**The Solution:**
Responsive redesign with:
- Hidden feature cards on mobile
- Inputs moved higher in viewport
- Shortened descriptions for small screens

**Key Learning:** Most travel app users access the app on their phones *at the airport*, not on a laptop at home. Design for that moment.

---

### 3. **Deployment Pipeline Efficiency**

**The Mistake I Made:**
I deployed after **every single fix**.
- Deployed color fixes ✗
- Deployed mobile optimizations ✗
- Deployed countdown timers ✗
- Deployed feature cards ✗

Result: Hit Vercel's 100 deployments/day limit and couldn't ship final improvements.

**What I Should Have Done:**
1. Make all related changes
2. Commit once
3. Deploy once

This would've used 2-3 deployments instead of 20+.

---

### 4. **Real-Time Countdown Timers**

**The Problem:**
Updating "Boarding in 41m 25s" every second without re-rendering the entire page.

**The Solution:**
React hooks with isolated state:
- Countdown lives in its own component
- Updates don't affect parent components
- One `setInterval` per component instance

---

## What This Taught Me About Shipping

**1. Structure Before Asking AI**
Gemini is powerful, but it needs constraints. Define your data schema first. The more structured your prompt, the better the output.

**2. Design for the Moment of Need**
Users interact with your app under stress—at airports, in taxis, before meetings. Design for that moment, not ideal conditions.

**3. Database Schema Decisions Compound**
Getting the data model right upfront saved hours of refactoring. TypeScript + Drizzle caught schema mismatches at compile time, not in production.

**4. Batch Your Deployments**
Small, frequent deployments feel productive but burn through limits. Group related changes. Deploy with confidence.

**5. Test With Real Data**
Travel confirmations are infinitely varied. I tested with real emails from different airlines, hotels, and booking sites. Each revealed edge cases I'd never anticipated.

---

## What Travelway Does Now

✓ Transforms 20+ emails into one intelligent timeline
✓ Context-aware guidance (Pre-flight, In-flight, Post-flight views)
✓ Real-time countdown timers
✓ Support for flights, hotels, restaurants, and events
✓ User authentication with session management
✓ Persistent trip storage with Aurora

---

## What's Next

- Multi-language support for international travelers
- Calendar app integrations
- Proactive delay notifications
- AI-powered travel recommendations

---

## The Takeaway

Building in public teaches you more than anything else.

Share your failures as much as your wins. The community learns from both.

If you're interested in full-stack AI, databases at scale, or shipping side projects—[try Travelway](https://travelway-ai.vercel.app) and let me know what features matter most.

**#BuildingPublic #AI #FullStack #NextJS #Startup #SideProject #PostgreSQL**
