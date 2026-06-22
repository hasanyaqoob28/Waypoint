# Travelway Architecture

## Overview

Travelway is a full-stack travel assistant built with:
- **Frontend:** Next.js 16 on Vercel (React, Tailwind CSS)
- **Backend:** Serverless API routes (Next.js)
- **AI:** Google Gemini via Vercel AI SDK
- **Database:** AWS Aurora PostgreSQL (primary backend)
- **Weather:** Open-Meteo API (real-time conditions)

## AWS Well-Architected Framework Analysis

**For detailed AWS Well-Architected Six Pillars analysis, see:** [`AWS_WELL_ARCHITECTED.md`](./AWS_WELL_ARCHITECTED.md)

This document covers:
- Operational Excellence (monitoring, automation, deployments)
- Security (encryption, access control, input validation)
- Reliability (high availability, failover, backups)
- Performance Efficiency (compute, storage, caching optimization)
- Cost Optimization (serverless, right-sizing, efficient queries)
- Sustainability (renewable energy, resource efficiency)

### Full Data Journey (Left to Right)

1. **User Input (Vercel UI)**
   - User pastes booking confirmation email text
   - Input form captures raw booking data

2. **API Layer (Next.js Serverless)**
   - `POST /api/parse` receives raw booking text
   - `GET /api/trips` retrieves stored trips from database

3. **AI Processing (Google Gemini)**
   - Raw booking text sent to Gemini API via Vercel AI SDK
   - Parses messy email into structured data:
     - Flight numbers, departure/arrival times
     - Gate numbers and terminals
     - Hotel names and check-in times
     - Activity details and locations
     - Transit information

4. **Data Storage (Aurora PostgreSQL - Primary Backend)**
   - Parsed events stored in database
   - Relationships maintained (user → trip → events)
   - Indexed for fast retrieval

5. **Live Display (React UI)**
   - Event timeline strip shows visual sequence
   - Current event auto-detected based on system time
   - Context-aware guidance displays booking-specific details
   - Real-time information: gates, addresses, check-in times

6. **External Services**
   - Open-Meteo Weather API provides destination weather
   - Weather data displayed in guidance panel

## Database Schema (Aurora PostgreSQL)

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Trips Table
```sql
CREATE TABLE trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255),
  destination VARCHAR(255),
  booking_raw_text TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Events (Itinerary) Table
```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  event_type VARCHAR(50),  -- 'flight', 'hotel', 'activity', 'transit'
  
  -- Flight-specific fields
  flight_number VARCHAR(20),
  departure_airport VARCHAR(10),
  arrival_airport VARCHAR(10),
  departure_city VARCHAR(100),
  arrival_city VARCHAR(100),
  departure_time_local VARCHAR(50),
  arrival_time_local VARCHAR(50),
  terminal VARCHAR(10),
  gate VARCHAR(10),
  baggage_carousel VARCHAR(20),
  seat VARCHAR(10),
  status VARCHAR(50),
  
  -- Hotel-specific fields
  hotel_name VARCHAR(255),
  check_in_time VARCHAR(50),
  check_out_time VARCHAR(50),
  address_local VARCHAR(255),
  confirmation_number VARCHAR(100),
  
  -- Activity/Reservation fields
  activity_name VARCHAR(255),
  activity_time VARCHAR(50),
  activity_location VARCHAR(255),
  activity_note TEXT,
  
  -- Transit fields
  transit_mode VARCHAR(50),
  transit_from VARCHAR(100),
  transit_to VARCHAR(100),
  transit_note TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_trip_id (trip_id),
  INDEX idx_event_type (event_type)
);
```

## Data Flow

1. **User Input:** User pastes booking confirmation text in Travelway UI
2. **API Processing:** POST `/api/trips` receives raw text
3. **AI Parsing:** Text sent to Google Gemini via Vercel AI SDK
4. **Structured Data:** Gemini returns parsed JSON (flights, hotels, etc.)
5. **Database Storage:** Parsed events inserted into Aurora PostgreSQL
6. **Retrieval:** Events fetched from DB and displayed in timeline UI
7. **Real-time Guidance:** Context-aware nudges based on event details + current time
8. **Weather:** Destination sent to Open-Meteo for live conditions

## API Endpoints

### POST /api/trips
Parse and store a new trip
- Input: Raw booking text
- Output: Trip with parsed events stored in DB
- Uses: Gemini AI, Aurora PostgreSQL

### GET /api/trips?userId=...
Retrieve all trips for a user
- Output: Array of trips with full itineraries
- Uses: Aurora PostgreSQL

### DELETE /api/trips?tripId=...
Delete a trip and all related events
- Uses: Aurora PostgreSQL CASCADE delete

## Scalability Considerations

- **Aurora Serverless v2:** Auto-scales with demand (no cold starts beyond first connection)
- **Connection pooling:** RDS Proxy for efficient serverless connections
- **Indexing:** Optimized for trip_id and event_type queries
- **JSON fields:** Flexible schema for booking variations without migrations

## Security

- IAM authentication to Aurora (no password storage)
- Row-level security via user_id filtering
- Parameterized queries (Drizzle ORM prevents SQL injection)
- HTTPS-only (Vercel + Aurora encrypted in transit)

## Deployment

- Frontend: Vercel (automatic from GitHub)
- Database: AWS Aurora PostgreSQL in same region
- Environment: `.env.local` for connection string (managed by v0 integration)
