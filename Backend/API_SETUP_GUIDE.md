# Chad-Tutor — API & Data Architecture

## 1. Overview

Chad-Tutor is an education platform with a layered backend designed around **data ownership** and **controlled external dependencies**. The system integrates with external providers for:

1. **University identity resolution** (Hipolabs)
2. **Learning content discovery** (YouTube Data API v3)

All academic curriculum data (programs, subjects, topics) is platform-owned. External APIs are only used for identity resolution and content discovery, never as sources of curriculum truth.

This document defines the data strategy, external API integration boundaries, internal data ownership model, and staged rollout plan.

---

## 2. External API Scope

### 2.1 University Identity Resolution

**Purpose:** University metadata lookup only.

Data sourced externally:

| Field          | Source        | Example                    |
|----------------|---------------|----------------------------|
| University name | Hipolabs      | Stanford University        |
| Country         | Hipolabs      | United States              |
| Domain          | Hipolabs      | stanford.edu               |
| Alpha code      | Hipolabs      | US                         |
| State/province  | Hipolabs      | California                 |

**We do not rely on external APIs for curriculum data.**

No courses, programs, semesters, subjects, or topics are fetched from third-party providers. This is a deliberate architectural constraint — curriculum structure is platform-owned intellectual property and a long-term competitive advantage.

#### 2.1.1 Provider: Hipolabs

Primary university identity provider.

- Endpoint: `http://universities.hipolabs.com/search?name=`
- Auth: None required (public API)
- Rate limit: Self-imposed at 100 requests/hour
- Timeout: 5 seconds
- Failure mode: Graceful — returns empty results, never crashes

#### 2.1.2 Provider Strategy Pattern

Hipolabs is registered via `ProviderFactory` using a strategy pattern. Adding a second identity provider requires:

1. Implement `IUniversityProvider` interface
2. Register in `ProviderFactory`
3. No changes to service layer or routes

This prevents vendor lock-in. If Hipolabs becomes unreliable or a better source emerges, the switch is a single-file change.

### 2.2 Learning Content Discovery: YouTube Data API v3

**Purpose:** Fetch educational videos based on selected topics for personalized learning paths.

The platform uses YouTube Data API v3 to discover relevant educational content for each topic/subtopic in a user's study plan. This enhances the learning experience by providing curated video resources without requiring manual content curation.

#### 2.2.1 API Configuration

- Base URL: `https://www.googleapis.com/youtube/v3`
- Auth: API Key (stored in `YOUTUBE_API_KEY` environment variable)
- Rate limit: YouTube's default quota (10,000 units/day)
- Endpoints used:
  - `/search` — Find videos/playlists for topics
  - `/videos` — Get duration, views, likes
  - `/playlistItems` — Fetch videos from playlists

#### 2.2.2 Content Fetching Strategy

Videos are fetched based on:

1. **Educational Context:**
   - University program (B.Tech, B.Sc, MBA, etc.)
   - Semester/year level (First year, Second year, etc.)
   - Subject name
   - Topic and subtopics selected by user

2. **Search Query Construction:**
   ```
   [Level] [Year] [Subject] [Topic/Subtopic] [lecture/tutorial]
   Example: "engineering first year Mathematics 1 Linear Equations lecture"
   ```

3. **Content Filtering:**
   - Excludes irrelevant content (board exams for engineering students)
   - Video duration filters (medium/long based on one-shot preference)
   - Sort options: relevance, views, rating, date

4. **Content Modes:**
   - **Mixed Mode:** Individual videos from various sources (5 per topic/subtopic)
   - **Single Playlist Mode:** Complete playlists dedicated to topics (3 playlists per topic)

#### 2.2.3 Video Metadata Retrieved

For each video:
- Video ID, title, thumbnail
- Channel name and ID
- Duration (seconds and formatted)
- View count and like count
- Published date
- Associated topic/subtopic
- One-shot indicator (videos > 1 hour)
- Playlist information (if from playlist)

#### 2.2.4 Caching Strategy

Video search results are cached in-memory with:
- **Cache Key:** `topicIds-sourceType-sortBy-includeOneShot-level-semester-course`
- **TTL:** 24 hours
- **Purpose:** Share results between users with same filters, reduce API calls
- **Cache Hit Indicator:** Users see when results are pre-cached

#### 2.2.5 Failure Modes

- **API Quota Exceeded:** Return cached results or graceful error message
- **No Results Found:** Continue with other topics, log for review
- **Network Timeout:** Retry once, then skip topic with error message
- **Invalid Response:** Log error details, continue processing

### 2.3 Removed References

The following were removed from the architecture as incorrect dependencies:

- ~~Coursera API~~ — Coursera does not expose structured curriculum data suitable for ingestion
- ~~Generic "exam provider" API~~ — No such standardised API exists
- ~~External course/subject APIs~~ — Curriculum is internally owned

---

## 3. Academic Data Strategy

### 3.1 Ownership Model

The platform owns the full academic knowledge graph:

```
University (external identity)
  └── Program (internally created)
        └── Semester / Year
              └── Subject
                    └── Topic Graph (AI-assisted extraction)
```

Each layer below University is **platform-owned data**, sourced from official university materials — not external APIs. This structure is the foundation of the product and should be treated as a long-term asset.

### 3.2 Data Sources by Layer

| Layer       | Source                                      | Owner     |
|-------------|---------------------------------------------|-----------|
| University  | Hipolabs API (identity only)                | External  |
| Program     | Official university curriculum pages        | Internal  |
| Subject     | Syllabus PDFs, curriculum documents         | Internal  |
| Topic Graph | AI extraction from syllabi + manual review  | Internal  |

### 3.3 Data Confidence Levels

Every academic record carries a confidence level:

| Level            | Meaning                                                    |
|------------------|------------------------------------------------------------|
| `verified`       | Confirmed from an official university source by a reviewer |
| `parsed`         | Extracted by AI from a syllabus or curriculum document      |
| `pending_review` | Awaiting human verification before serving to users         |

**Why this matters:** Academic trust is non-negotiable. An incorrect subject mapping or fabricated topic degrades the entire platform's credibility. Confidence levels let the system distinguish between authoritative data and AI-generated drafts, and allow the UI to surface appropriate disclaimers.

---

## 4. Role of AI

AI is a **processing tool**, not a source of academic truth.

### AI is used for:

- **Syllabus parsing** — Extracting subjects, topics, and credit structures from PDF/HTML documents
- **Topic extraction** — Identifying granular topics within a subject
- **Normalization** — Resolving naming variations ("Data Structures and Algorithms" vs "DSA" vs "DSGT Data Structures")
- **Dependency mapping** — Inferring prerequisite relationships between subjects

### AI is never:

- Treated as an authoritative academic source
- Used to fabricate curriculum structure
- Allowed to serve unverified data without a `parsed` or `pending_review` confidence tag

All AI-generated academic data passes through the confidence pipeline before reaching users.

---

## 5. Caching Architecture

### 5.1 Current: PostgreSQL-Only

The system begins with PostgreSQL as the sole caching layer. The `SearchCache` table stores normalised query results with TTL-based expiration.

```
User searches "stanford"
  → Check SearchCache table (normalised query lookup)
  → Cache hit: return stored result IDs, resolve from University table
  → Cache miss: call Hipolabs → normalise → store → cache → return
```

**Cache behaviour:**

- TTL: Configurable via `CACHE_EXPIRY_HOURS` (default: 168 hours / 7 days)
- Hit tracking: `hitCount` column for analytics
- Expiry cleanup: Background job purges stale entries

### 5.2 Future: Redis Introduction

Redis (L1 cache) is designed into the architecture but **not activated by default**. It will be introduced when:

- Request volume exceeds what PostgreSQL comfortably serves (~1000 req/s on search)
- P95 latency on cached queries exceeds 50ms
- Multiple application instances require shared in-memory state

The `cache.service.ts` already supports L1+L2 hierarchy. Activation requires setting `REDIS_URL` in the environment — no code changes.

---

## 6. Endpoint Architecture

### 6.1 Current Endpoints (Stage 1)

University identity search via Hipolabs:

```
GET /api/universities/search?q=stanford&limit=20&provider=hipolabs
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Stanford University",
      "country": "United States",
      "state": null,
      "domain": "stanford.edu",
      "webPage": "http://www.stanford.edu/",
      "alphaCode": "US",
      "provider": "hipolabs"
    }
  ],
  "meta": {
    "cacheHit": false,
    "provider": "hipolabs",
    "latencyMs": 487,
    "totalResults": 1,
    "query": "stanford"
  }
}
```

Second request for the same query:
```json
{
  "meta": {
    "cacheHit": true,
    "latencyMs": 8,
    "totalResults": 1
  }
}
```

Additional endpoints:

```
GET /api/universities/:id          — Retrieve by ID
GET /api/universities/health/:provider — Provider health check
```

### 6.2 Staged Rollout Plan

The endpoint surface expands as each data layer matures:

**Stage 1 — University Identity (current)**
- Hipolabs integration live
- Cache-first search operational
- Analytics logging active

**Stage 2 — Program Layer**
- `POST /api/programs` — Admin creates programs linked to universities
- `GET /api/universities/:id/programs` — List programs
- Data sourced from official university curriculum pages
- Manual entry or bulk import via admin tools

**Stage 3 — Subject Mapping**
- `POST /api/subjects` — Subjects linked to programs and semesters
- `GET /api/programs/:id/subjects` — List subjects in a program
- AI-assisted extraction from syllabus documents
- All entries tagged with confidence level

**Stage 4 — Topic Graph**
- `POST /api/subjects/:id/topics` — AI-extracted topic trees
- `GET /api/subjects/:id/topics` — Retrieve topic graph
- Prerequisite and dependency mapping
- Human review workflow for `parsed` → `verified` promotion

**Stage 5 — Personalized Learning Paths (Active Development)**
- `POST /api/videos/search` — Fetch YouTube videos for selected topics
- `GET /api/videos/cached` — Retrieve cached video results
- User selects topics → System generates study roadmap with:
  - Video resources (duration, channel, playlist info)
  - Test scheduling based on topic completion
  - Question banks per topic
  - One-shot video recommendations for comprehensive coverage
  - Timeline estimation based on video duration

Each stage builds on the previous. No stage is deployed until the underlying data layer has sufficient quality controls.

### 6.3 Personalized Learning Roadmap Generation

The platform generates customized study roadmaps based on user's selected topics and study preferences.

#### Roadmap Components:

**1. Topic Selection & Video Discovery**
- User selects topics/subtopics from subjects
- System fetches relevant videos from YouTube API
- Videos filtered by:
  - Educational level (engineering, degree, etc.)
  - Semester/year
  - Subject context
  - Topic/subtopic specificity

**Example Selection:**
```
Subject: Mathematics 1 (Engineering First Year)
Selected Topics:
  ✓ Linear Equations
    ✓ Slope-Intercept Form
    ✓ Standard Form  
    ✓ Point-Slope Form
  ✓ Quadratic Equations
    (no subtopics)
  ✓ Matrices
    ✓ Matrix Operations
    ✓ Determinants
    ✓ Inverse Matrices
```

For this selection, system will search YouTube for:
- 3 subtopics under Linear Equations = 3 × 5 = 15 videos
- 1 topic (Quadratic Equations) = 1 × 5 = 5 videos
- 3 subtopics under Matrices = 3 × 5 = 15 videos
- **Total: 35 videos fetched** across 7 searchable items

**2. Video Curation Per Topic**

The system searches YouTube for each selected topic and subtopic:

- **If topic has subtopics:** Each subtopic is searched individually
  - Example: "Linear Equations" topic with subtopics "Slope-Intercept Form", "Standard Form", "Point-Slope Form"
  - System searches: 3 separate queries with full context
  
- **Number of videos:** 5 videos per topic/subtopic (3 for one-shot mode)

- **Search includes educational context:**
  - Course level (e.g., "engineering", "B.Sc degree")
  - Year (e.g., "first year", "second year")
  - Subject (e.g., "Mathematics 1")
  - Topic/Subtopic name
  - Lecture keywords

- **Example search query:**
  - Input: Engineering, First year, Mathematics 1, Linear Equations → Slope-Intercept Form
  - Query: `"engineering first year Mathematics 1 Linear Equations Slope-Intercept Form lecture tutorial"`

- **Video metadata returned:**
  - Duration (e.g., "15:23" and 923 seconds)
  - Views, likes, channel name
  - Thumbnail, video ID
  - Associated topic/subtopic for grouping

**3. Study Time Calculation**
- Total video duration = Sum of all selected video durations
- Estimated study hours = Total duration / 3600 seconds
- Timeline adjusted based on:
  - User's available hours per day
  - Days per week dedicated to study
  - Target completion date

**4. Test Scheduling**
- Tests scheduled after topic completion
- Frequency based on:
  - Topic difficulty
  - User's coverage percentage
  - Spaced repetition principles
  
**5. Question Bank Allocation**
- Questions per topic based on:
  - Topic complexity
  - Video duration (more hours → more questions)
  - User's performance history

**6. One-Shot Video Feature**
- **Trigger:** When user's coverage is low or wants comprehensive review
- **Search:** Topic-specific one-shot lectures (>1 hour duration)
- **Filter:** `includeOneShot: true` in video preferences
- **Query Example:** "engineering Mathematics 1 Linear Equations one shot lecture complete"
- **Purpose:** Quick comprehensive coverage before exams

#### API Endpoints:

```
POST /api/videos/search
Body: {
  topics: Topic[],              // Selected topics with subtopics
  preferences: {
    sourceType: "single-playlist" | "mixed",
    sortBy: "relevance" | "views" | "rating" | "date",
    includeOneShot: boolean
  },
  examContext: {
    university: string,
    course: string,
    semester: string,
    subjects: string[],
    level: string                // auto-detected from course
  }
}

Response: {
  videos: VideoResult[],         // All videos found
  playlists?: Playlist[],        // Grouped playlists (single-playlist mode)
  meta: {
    totalVideos: number,
    totalPlaylists: number,
    totalDurationSeconds: number,
    totalHours: number,
    cacheHit: boolean
  }
}
```

#### Roadmap Output:

The generated roadmap includes all selected topics with their associated learning resources:

**Example: User selects "Linear Equations" (with 3 subtopics) and "Quadratic Equations" (no subtopics)**

**Video Library Structure:**
- **Linear Equations - Slope-Intercept Form**
  - 5 videos fetched (15-25 min each)
  - Total: ~1.5 hours
  - Channel diversity: Khan Academy, Professor Leonard, etc.
  
- **Linear Equations - Standard Form**
  - 5 videos fetched (10-20 min each)
  - Total: ~1.2 hours
  
- **Linear Equations - Point-Slope Form**
  - 5 videos fetched (12-18 min each)
  - Total: ~1.3 hours
  
- **Quadratic Equations**
  - 5 videos fetched (20-30 min each)
  - Total: ~2.0 hours

**Study Timeline:**
- Total video duration: ~6 hours
- User's availability: 2 hours/day, 5 days/week
- Estimated completion: 3 days
- Day 1: Linear Equations (all subtopics)
- Day 2: Quadratic Equations
- Day 3: Review + Buffer time

**Test Schedule:**
- Day 3: Linear Equations assessment (after completion)
- Day 4: Quadratic Equations quiz
- Day 7: Combined review test (spaced repetition)

**Question Targets:**
- Linear Equations: 15 questions (5 per subtopic)
- Quadratic Equations: 12 questions
- Total practice: 27 questions

**One-Shot Options:**
- Available: "Mathematics 1 Complete One Shot" (2.5 hours)
- Trigger: If user coverage falls below 60% or exam within 48 hours

**Progress Tracking:**
- Topics completed: 0/4 subtopics, 0/1 topics
- Videos watched: 0/20
- Time spent: 0 hours / 6 hours
- Questions solved: 0/27

---

## 7. Database Schema (Relevant Tables)

### University (external identity)
```
id             UUID (PK)
externalId     String (provider-specific)
sourceId       FK → ExternalSource
name           VARCHAR(255)
normalizedName VARCHAR(255)
country        VARCHAR(100)
state          VARCHAR(100)
domain         VARCHAR(255)
webPage        VARCHAR(500)
alphaCode      VARCHAR(10)
provider       VARCHAR(50)
isCanonical    Boolean
```

Key indexes:
- `[normalizedName, isCanonical]` — Search performance
- `[country, isCanonical]` — Country filtering
- `[provider]` — Provider-specific queries
- `[sourceId, externalId]` — Unique constraint per source

### SearchCache
```
id              UUID (PK)
normalizedQuery VARCHAR(500) UNIQUE
entityType      EntityType enum
resultIds       String[]
resultCount     SmallInt
expiresAt       DateTime
hitCount        Int
```

### SearchLog (analytics)
```
id              UUID (PK)
userId          FK → User (nullable)
rawQuery        VARCHAR(500)
normalizedQuery VARCHAR(500)
entityType      EntityType enum
cacheHit        Boolean
resultCount     SmallInt
latencyMs       SmallInt
createdAt       DateTime
```

---

## 8. Environment Configuration

Required variables in `.env`:

```env
# Server
PORT=3001
NODE_ENV=development

# PostgreSQL (required)
DATABASE_URL="postgresql://user:password@localhost:5432/chad_tutor?schema=public"

# Clerk Authentication (required)
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# YouTube Data API v3 (required for video discovery)
YOUTUBE_API_KEY=your_youtube_api_key_here

# Cache TTL (optional, default: 168 hours)
CACHE_EXPIRY_HOURS=168

# Frontend URL for CORS (required)
FRONTEND_URL=http://localhost:5174

# Redis (optional — activate only when scale demands)
# REDIS_URL="redis://localhost:6379"
```

**External API Keys:**
- **Hipolabs:** No API key needed (public API)
- **YouTube Data API v3:** Required for video content discovery
  - Obtain from: https://console.cloud.google.com/apis/credentials
  - Default quota: 10,000 units/day
  - Each video search uses ~3-5 units

---

## 9. Operational Commands

```bash
# Apply database schema
npx prisma migrate dev

# Generate Prisma client after schema changes
npx prisma generate

# Start development server
npm run dev

# Inspect database visually
npx prisma studio

# Verify TypeScript compilation
npx tsc --noEmit
```

---

## 10. Analytics

The `SearchLog` table tracks every search with cache hit/miss, latency, and entity type. This data informs:

- **Pre-caching decisions** — Popular queries can be warmed on startup
- **Provider reliability** — Latency trends reveal degradation before users notice
- **Cost analysis** — Cache hit rate directly correlates with avoided API calls

Example queries:

```sql
-- Cache effectiveness
SELECT
  COUNT(*) AS total_searches,
  SUM(CASE WHEN "cacheHit" THEN 1 ELSE 0 END) AS cache_hits,
  ROUND(100.0 * SUM(CASE WHEN "cacheHit" THEN 1 ELSE 0 END) / COUNT(*), 1) AS hit_rate_pct,
  ROUND(AVG("latencyMs")) AS avg_latency_ms
FROM "SearchLog"
WHERE "createdAt" > NOW() - INTERVAL '7 days';

-- Most searched terms
SELECT "normalizedQuery", COUNT(*) AS searches
FROM "SearchLog"
WHERE "entityType" = 'UNIVERSITY'
GROUP BY "normalizedQuery"
ORDER BY searches DESC
LIMIT 20;
```

---

## 11. Data Governance Summary

| Principle                        | Implementation                                          |
|----------------------------------|---------------------------------------------------------|
| External APIs for specific purposes | Hipolabs for university identity, YouTube for video discovery |
| Curriculum is platform-owned     | Programs, subjects, topics created internally            |
| Content discovery, not ownership | YouTube API finds videos; we don't host or own content  |
| AI is a tool, not a source       | All AI output tagged with confidence, requires review    |
| Cache before external calls      | 24-hour video cache, PostgreSQL for search results       |
| No vendor lock-in                | Provider strategy pattern for all external dependencies  |
| Data quality is explicit         | Confidence levels: verified, parsed, pending_review      |
| Context-aware search             | Videos filtered by level, semester, subject, topic       |

---

## 12. Architecture Status

**Active Development: Personalized Learning Roadmap System**

Current implementation status:

**✅ Operational:**
- Stage 1: University identity + caching (Hipolabs integration)
- Stage 5: YouTube video discovery with context-aware search
- Video caching layer (in-memory, 24-hour TTL)
- Playlist grouping for single-playlist mode
- Topic-based video recommendations
- Subtopic-level video granularity

**🚧 In Progress:**
- Test scheduling algorithm based on video completion
- Question bank allocation system
- One-shot video trigger based on user coverage
- Study timeline generation from video durations

**📋 Planned:**
- Stage 2: Program layer with admin tools
- Stage 3: Subject mapping with AI extraction
- Stage 4: Topic graph with dependency mapping
- Progress tracking and analytics
- Spaced repetition for test scheduling
- Redis cache layer for video results

The database schema, service layer, and repository pattern are designed to accommodate all stages without structural refactoring. The YouTube integration is actively serving users with personalized video learning paths.
