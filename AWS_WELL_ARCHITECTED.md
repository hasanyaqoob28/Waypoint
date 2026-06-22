# Travelway - AWS Well-Architected Framework

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        TRAVELWAY APPLICATION FLOW                           │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│   CLIENT     │       │  EDGE/CDN    │       │   SECURITY   │
│   BROWSER    │──────→│   (Vercel)   │──────→│  (HTTPS/TLS) │
└──────────────┘       └──────────────┘       └──────────────┘
                              ↓
                    ┌─────────────────────┐
                    │  FRONTEND LAYER     │
                    │  (Vercel Serverless)│
                    │  - Next.js React    │
                    │  - Input Form       │
                    │  - Event Timeline   │
                    │  - Context Guidance │
                    └─────────────────────┘
                              ↓
        ┌─────────────────────┴─────────────────────┐
        ↓                                           ↓
┌───────────────────────┐              ┌──────────────────────┐
│  API LAYER            │              │  AI PROCESSING       │
│  (Next.js Serverless) │──────────────→  (Google Gemini)     │
│  - POST /api/parse    │              │  - Text Parsing      │
│  - GET /api/trips     │              │  - Data Extraction   │
│  - POST /api/trips    │              │  - Vercel AI SDK     │
└───────────────────────┘              └──────────────────────┘
        ↓                                           │
        └───────────────────┬──────────────────────┘
                           ↓
        ┌──────────────────────────────────┐
        │  DATA PERSISTENCE LAYER          │
        │  (AWS Aurora PostgreSQL)         │
        │                                  │
        │  USERS TABLE                     │
        │  ├─ user_id (Primary Key)       │
        │  ├─ email (Unique)              │
        │  ├─ password_hash (Encrypted)   │
        │  └─ created_at                  │
        │                                  │
        │  TRIPS TABLE                     │
        │  ├─ trip_id (Primary Key)       │
        │  ├─ user_id (Foreign Key)       │
        │  ├─ destination                 │
        │  ├─ title                       │
        │  ├─ raw_booking_text            │
        │  └─ created_at                  │
        │                                  │
        │  EVENTS TABLE                    │
        │  ├─ event_id (Primary Key)      │
        │  ├─ trip_id (Foreign Key)       │
        │  ├─ event_type (flight/hotel/...) │
        │  ├─ flight_number               │
        │  ├─ departure_time              │
        │  ├─ arrival_city                │
        │  ├─ hotel_name                  │
        │  ├─ hotel_address               │
        │  ├─ check_in_time               │
        │  ├─ activity_name               │
        │  ├─ activity_time               │
        │  └─ metadata (JSON)             │
        └──────────────────────────────────┘
                           ↓
        ┌──────────────────────────────────┐
        │  EXTERNAL SERVICES               │
        │  - Open-Meteo Weather API        │
        │  - Real-time destination weather │
        └──────────────────────────────────┘
                           ↓
        ┌──────────────────────────────────┐
        │  LIVE DISPLAY (React UI)         │
        │  - Timeline Strip                │
        │  - Event Detection               │
        │  - Guidance Panel                │
        │  - Weather Widget                │
        └──────────────────────────────────┘
```

---

## AWS Well-Architected Six Pillars

### 1. Operational Excellence
**Objective:** Run and monitor systems, continually improve processes

**Implementation in Travelway:**
- **Serverless Computing:** Next.js on Vercel handles auto-scaling and maintenance
- **API Monitoring:** Next.js provides built-in logging and error tracking
- **Database Monitoring:** Aurora PostgreSQL provides CloudWatch integration
- **Automated Deployments:** GitHub → Vercel auto-deployment pipeline
- **Infrastructure as Code:** All configs in repository

### 2. Security
**Objective:** Protect information, systems, and detect security events

**Implementation in Travelway:**
- **Data Encryption:** 
  - TLS/HTTPS for all client-server communication (Vercel edge)
  - Password hashing with bcrypt before storage
  - Database encryption at rest (Aurora default)
- **Access Control:**
  - User authentication via session tokens
  - Row-level data isolation (users only see own trips)
  - IAM authentication for AWS database access
- **Input Validation:**
  - Server-side validation on all API endpoints
  - Sanitized booking text before AI processing
  - SQL parameterized queries (no injection risk)
- **Secrets Management:**
  - API keys stored in Vercel environment variables
  - Google Gemini API key never exposed to client

### 3. Reliability
**Objective:** Workloads perform intended functions and recover from failure

**Implementation in Travelway:**
- **High Availability:**
  - Aurora PostgreSQL with Multi-AZ deployment
  - Vercel global CDN for frontend distribution
  - Serverless auto-scaling for API functions
- **Data Redundancy:**
  - Aurora automated backups (35-day retention)
  - Database replicas across availability zones
  - Read replicas for query scaling
- **Failover Handling:**
  - Automatic Aurora failover to replica (< 30 seconds)
  - Vercel automatic deployment rollback on errors
- **Error Handling:**
  - Graceful error boundaries in React UI
  - API endpoint error responses with proper HTTP status codes
  - Fallback UI states when services unavailable

### 4. Performance Efficiency
**Objective:** Allocate IT resources optimally for workload requirements

**Implementation in Travelway:**
- **Compute Optimization:**
  - Serverless (pay-per-use) Next.js on Vercel
  - Aurora Serverless v2 (auto-scaling database)
  - Optimized function memory allocation
- **Storage Optimization:**
  - Efficient database indexing on frequently queried columns (trip_id, user_id)
  - Event timeline data stored efficiently in Events table
  - Compressed JSON metadata storage
- **Caching Strategy:**
  - Vercel edge caching for static assets
  - Browser caching for UI components
  - Consider Redis for session caching (future optimization)
- **Query Optimization:**
  - Efficient SQL queries with proper indexes
  - Pagination for large trip lists
  - Select only needed fields from database

### 5. Cost Optimization
**Objective:** Avoid unnecessary costs, right-size resources

**Implementation in Travelway:**
- **Serverless Architecture:**
  - No idle compute costs (Vercel functions, Aurora Serverless)
  - Pay only for actual requests and database queries
  - Free tier eligibility for Vercel and Aurora
- **Data Transfer:**
  - Vercel CDN reduces egress costs
  - Compressed API responses
  - Efficient data structure (no over-fetching)
- **Storage Efficiency:**
  - Aurora Serverless v2 scales with demand (vs. fixed provisioned capacity)
  - Only store essential booking data
  - Archive old trips after user-defined retention period (future feature)
- **Regional Selection:**
  - Vercel global CDN (lowest latency)
  - Aurora in region closest to users

### 6. Sustainability
**Objective:** Minimize environmental impact

**Implementation in Travelway:**
- **Efficient Infrastructure:**
  - Serverless means shared infrastructure (better resource utilization)
  - Vercel uses 100% renewable energy data centers
  - AWS commits to carbon neutrality by 2040
- **Code Efficiency:**
  - Minimal JavaScript bundle size
  - Efficient API calls (no over-fetching)
  - Optimized database queries
- **Lifecycle Management:**
  - Serverless architecture has lower idle power consumption
  - Automated scaling prevents over-provisioning

---

## Data Flow Summary

1. **User Input:** Paste booking confirmation email
2. **Parse Request:** POST /api/parse sends raw text
3. **AI Processing:** Gemini AI extracts structured data
4. **Storage:** Parsed events stored in Aurora PostgreSQL
5. **Retrieval:** GET /api/trips fetches user's trips
6. **Display:** React UI renders timeline, guidance, weather
7. **Output:** User sees event sequence with booking details

---

## Deployment Architecture

```
┌─────────────────────────────────────────┐
│         GitHub Repository               │
│  (Source of truth, v0 branch)          │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│       Vercel (Deployment)               │
│  - Automatic CI/CD on push              │
│  - Next.js frontend + API routes        │
│  - Global CDN distribution              │
│  - Environment variables managed        │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│    AWS Aurora PostgreSQL                │
│  - Multi-AZ deployment                  │
│  - Automated backups                    │
│  - RDS monitoring & alerts              │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│    External APIs                        │
│  - Google Gemini (AI parsing)           │
│  - Open-Meteo (Weather)                 │
└─────────────────────────────────────────┘
```

---

## Technology Stack Summary

| Layer | Service | Why |
|-------|---------|-----|
| Frontend | Vercel/Next.js | Serverless, fast, global CDN |
| Backend API | Next.js Serverless Functions | Auto-scaling, no server management |
| AI Processing | Google Gemini + Vercel AI SDK | State-of-art text parsing |
| Database | AWS Aurora PostgreSQL | Managed, scalable, secure, reliable |
| Weather | Open-Meteo API | Free, no auth required |
| Deployment | GitHub + Vercel CI/CD | Automatic deployments |

This architecture is built on the AWS Well-Architected Framework and follows all six pillars for a production-ready, scalable travel assistant application.
