# 🎓 Chad-Tutor API Setup Guide

## Current Status
Your backend is **fully built** and ready to use the cache-first architecture. You just need to configure the external API.

## Required Configuration

### 1. Get Your API Key
You need an API key from an exam/university data provider. Options:

**Option A: Free APIs**
- [Universities API](https://github.com/Hipo/university-domains-list) (Free, no key needed)
- [Course API](https://www.coursera.org/api) (Coursera API)

**Option B: Premium APIs**
- ExamDB (hypothetical - replace with your actual provider)
- Academic Data APIs (your API provider)

### 2. Update Your .env File

```env
# Replace these with your actual values:
EXAM_API_KEY=your_real_api_key_here
EXAM_API_ENDPOINT=https://api.yourprovider.com/v1
```

### 3. Test the Flow

#### Step 1: Search Universities
```bash
GET http://localhost:3001/api/exam/universities?search=stanford

Response:
{
  "universities": [
    {
      "id": "uuid-123",
      "name": "Stanford University",
      "country": "United States"
    }
  ],
  "cacheHit": false,  # First time - from API
  "latencyMs": 450
}
```

#### Step 2: Search Again (Cache Hit!)
```bash
GET http://localhost:3001/api/exam/universities?search=stanford

Response:
{
  "universities": [...],
  "cacheHit": true,   # From database - FREE!
  "latencyMs": 12     # Much faster!
}
```

#### Step 3: Get Courses
```bash
GET http://localhost:3001/api/exam/universities/{universityId}/courses

# Saves courses to database on first fetch
# Subsequent requests use database
```

#### Step 4: Get Subjects
```bash
GET http://localhost:3001/api/exam/universities/{universityId}/courses/{courseId}/semesters/{semesterId}/subjects

# Same cache-first behavior
# Saves API tokens after first fetch
```

## How It Saves API Tokens

### First User Search:
```
User: "MIT"
    ↓
API Call (costs 1 token) 💰
    ↓
Saved to Database
    ↓
Returns: MIT universities
```

### All Future Searches (Anyone!):
```
User: "MIT"  
    ↓
Database Lookup (FREE!) ✅
    ↓
Returns: MIT universities
```

### Real Example:
- **Without caching**: 1000 searches for "MIT" = 1000 API calls = $$$
- **With caching**: 1000 searches for "MIT" = 1 API call + 999 free DB lookups = $

## Architecture Overview

### Database Tables
1. **University** - All universities (saved after first search)
2. **Course** - All courses (saved after first fetch)
3. **Semester** - All semesters (saved after first fetch)
4. **Subject** - All subjects (saved after first fetch)
5. **SearchCache** - Fast search results lookup
6. **SearchLog** - Analytics for popular searches
7. **ContentUsage** - Track what users view most

### Services
1. **exam.service.ts** - Cache-first orchestration
2. **cache.service.ts** - L1 (Redis) + L2 (PostgreSQL) caching
3. **normalization.service.ts** - Deduplication ("MIT" = "M.I.T.")

### API Endpoints
```
GET  /api/exam/universities?search=NAME
GET  /api/exam/universities/:id/courses
GET  /api/exam/universities/:uniId/courses/:courseId/semesters
GET  /api/exam/universities/:uniId/courses/:courseId/semesters/:semId/subjects
```

## Frontend Integration Example

### React/Vue Component:
```typescript
// Autocomplete for university search
async function searchUniversities(query: string) {
  const response = await fetch(
    `http://localhost:3001/api/exam/universities?search=${query}`
  );
  const data = await response.json();
  
  console.log(`Cache hit: ${data.cacheHit}`); // true if from DB
  console.log(`Speed: ${data.latencyMs}ms`);   // ~10ms from cache!
  
  return data.universities;
}

// User types "stanf"
const suggestions = await searchUniversities("stanf");
// Shows: ["Stanford", "Stanford Online", ...]

// User clicks "Stanford"
// Data is already saved in backend!
```

## Analytics Dashboard

Your backend tracks:
- **SearchLog**: What users search for (helps pre-cache popular items)
- **ContentUsage**: Which subjects are viewed most
- **SearchCache.hitCount**: How many times cache was used ($ saved!)

Example analytics query:
```sql
-- Most searched universities
SELECT normalizedQuery, COUNT(*) as searches
FROM "SearchLog"
WHERE entityType = 'university'
GROUP BY normalizedQuery
ORDER BY searches DESC
LIMIT 10;

-- Cache effectiveness
SELECT 
  SUM(CASE WHEN cacheHit THEN 1 ELSE 0 END) as cache_hits,
  COUNT(*) as total_searches,
  ROUND(100.0 * SUM(CASE WHEN cacheHit THEN 1 ELSE 0 END) / COUNT(*), 2) as hit_rate
FROM "SearchLog";
```

## Next Steps

1. **Get API Key**: Sign up for an exam/university data provider
2. **Update .env**: Add your `EXAM_API_KEY` and `EXAM_API_ENDPOINT`
3. **Test**: Make a few searches to populate the cache
4. **Monitor**: Check `SearchLog` table to see cache hits vs API calls
5. **Optimize**: Pre-cache popular universities/courses based on analytics

## FAQ

**Q: What if I don't have an API yet?**
A: You can manually add universities to the database using Prisma Studio:
```bash
npx prisma studio
# Add universities, courses, subjects manually
```

**Q: Can I use multiple APIs?**
A: Yes! The `ExternalSource` table tracks which API each record came from.

**Q: How do I clear the cache?**
A: Delete from `SearchCache` table or wait for expiry (24 hours default).

**Q: How much does this save?**
A: Example: If 100 users search for MIT:
- Without cache: 100 API calls
- With cache: 1 API call + 99 free DB lookups
- Savings: 99% of API costs!

---

**Your backend is production-ready!** Just add your API key and start searching. 🚀
