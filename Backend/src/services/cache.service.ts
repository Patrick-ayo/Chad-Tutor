/**
 * Cache Service
 * 
 * Implements cache-first logic with L1 (Redis) and L2 (PostgreSQL) hierarchy.
 * 
 * Flow:
 * 1. Check L1 (Redis) - if hit, return
 * 2. Check L2 (PostgreSQL) - if hit, populate L1, return
 * 3. Call API/DB - store in L2, populate L1, return
 */

import Redis from 'ioredis';
import config from '../config';
import { cacheRepo } from '../repositories';

// L1 Cache (Redis) - optional, can be null if not configured
let redisClient: Redis | null = null;

/**
 * Initialize Redis connection (L1 cache)
 */
export function initializeRedis(): void {
  if (!config.redisUrl) {
    console.log('⚠️ Redis not configured, using L2 cache only');
    return;
  }

  try {
    redisClient = new Redis(config.redisUrl, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });

    redisClient.on('error', (err) => {
      console.error('Redis error:', err.message);
    });

    redisClient.on('connect', () => {
      console.log('✅ Redis connected (L1 cache)');
    });

    redisClient.connect().catch((err) => {
      console.error('Redis connection failed:', err.message);
      redisClient = null;
    });
  } catch (error) {
    console.error('Failed to initialize Redis:', error);
    redisClient = null;
  }
}

/**
 * Close Redis connection
 */
export async function closeRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}

// ============================================================================
// L1 CACHE (Redis) - Fast, ephemeral
// ============================================================================

const L1_TTL_SECONDS = 300; // 5 minutes

/**
 * Get from L1 cache
 */
async function getL1<T>(key: string): Promise<T | null> {
  if (!redisClient) return null;

  try {
    const data = await redisClient.get(key);
    if (data) {
      return JSON.parse(data) as T;
    }
  } catch (error) {
    console.error('L1 cache get error:', error);
  }

  return null;
}

/**
 * Set in L1 cache
 */
async function setL1<T>(key: string, data: T, ttlSeconds: number = L1_TTL_SECONDS): Promise<void> {
  if (!redisClient) return;

  try {
    await redisClient.setex(key, ttlSeconds, JSON.stringify(data));
  } catch (error) {
    console.error('L1 cache set error:', error);
  }
}

/**
 * Delete from L1 cache
 */
async function deleteL1(key: string): Promise<void> {
  if (!redisClient) return;

  try {
    await redisClient.del(key);
  } catch (error) {
    console.error('L1 cache delete error:', error);
  }
}

// ============================================================================
// L2 CACHE (PostgreSQL) - Persistent, source of truth
// ============================================================================

/**
 * Get from L2 cache
 */
async function getL2(
  normalizedQuery: string,
  entityType: string
): Promise<{ resultIds: string[]; cacheHit: boolean } | null> {
  const entry = await cacheRepo.findByQuery(normalizedQuery, entityType);
  
  if (entry) {
    // Increment hit count for analytics
    await cacheRepo.incrementHit(entry.id);
    return {
      resultIds: entry.resultIds,
      cacheHit: true,
    };
  }

  return null;
}

/**
 * Set in L2 cache
 */
async function setL2(
  normalizedQuery: string,
  entityType: string,
  resultIds: string[],
  cacheHours: number = config.cacheExpiryHours
): Promise<void> {
  await cacheRepo.upsert(normalizedQuery, entityType, resultIds, cacheHours);
}

// ============================================================================
// PUBLIC API - Cache-first logic
// ============================================================================

export interface CacheResult<T> {
  data: T;
  cacheHit: boolean;
  source: 'l1' | 'l2' | 'fresh';
}

/**
 * Get cached search results
 * Implements L1 → L2 → Fresh hierarchy
 */
export async function getCachedSearch(
  normalizedQuery: string,
  entityType: string
): Promise<{ resultIds: string[]; cacheHit: boolean; source: 'l1' | 'l2' } | null> {
  const cacheKey = `search:${entityType}:${normalizedQuery}`;

  // Try L1 (Redis)
  const l1Result = await getL1<string[]>(cacheKey);
  if (l1Result) {
    return { resultIds: l1Result, cacheHit: true, source: 'l1' };
  }

  // Try L2 (PostgreSQL)
  const l2Result = await getL2(normalizedQuery, entityType);
  if (l2Result) {
    // Populate L1 for next time
    await setL1(cacheKey, l2Result.resultIds);
    return { resultIds: l2Result.resultIds, cacheHit: true, source: 'l2' };
  }

  return null;
}

/**
 * Store search results in cache
 */
export async function setCachedSearch(
  normalizedQuery: string,
  entityType: string,
  resultIds: string[]
): Promise<void> {
  const cacheKey = `search:${entityType}:${normalizedQuery}`;

  // Store in both L1 and L2
  await Promise.all([
    setL1(cacheKey, resultIds),
    setL2(normalizedQuery, entityType, resultIds),
  ]);
}

/**
 * Invalidate cache for a query
 */
export async function invalidateCache(
  normalizedQuery: string,
  entityType: string
): Promise<void> {
  const cacheKey = `search:${entityType}:${normalizedQuery}`;

  await Promise.all([
    deleteL1(cacheKey),
    // L2 will expire naturally, or can be deleted if needed
  ]);
}

/**
 * Clear expired L2 cache entries
 */
export async function cleanupExpiredCache(): Promise<number> {
  return cacheRepo.deleteExpired();
}

/**
 * Get cache statistics
 */
export async function getCacheStats(): Promise<{
  l1Available: boolean;
  l2Stats: {
    total: number;
    expired: number;
    byEntityType: { entityType: string; count: number }[];
  };
}> {
  return {
    l1Available: redisClient !== null,
    l2Stats: await cacheRepo.getStats(),
  };
}
