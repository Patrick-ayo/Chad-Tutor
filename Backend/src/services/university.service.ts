/**
 * University Service
 *
 * Cache-first search for universities.
 *
 * Flow:
 *  1. Search database (normalizedName case-insensitive CONTAINS).
 *  2. If found → return immediately (fast, free).
 *  3. If not found → call external provider via ProviderFactory.
 *  4. Validate & normalize results.
 *  5. Bulk insert with skipDuplicates (safe for concurrent writes).
 *  6. Re-query DB so the caller always gets consistent DTOs.
 *
 * External API is NEVER called when results exist in the database.
 */

import { ProviderFactory } from '../external/providers/ProviderFactory';
import {
  isValidNormalized,
  normalizeUniversityName,
  toUniversityDTO,
} from '../utils/normalizeUniversity';
import type { UniversityDTO } from '../types/university.types';
import {
  universityRepo,
  externalSourceRepo,
  searchLogRepo,
} from '../repositories';

// ------------------------------------------------------------------
// Types
// ------------------------------------------------------------------

export interface UniversitySearchResult {
  universities: UniversityDTO[];
  cacheHit: boolean;
  provider?: string;
  latencyMs: number;
  totalResults: number;
}

// Max results to persist per external call to avoid DB bloat
const MAX_PERSIST = 50;

// ------------------------------------------------------------------
// Public API
// ------------------------------------------------------------------

/**
 * Search universities.
 *
 * @param query        Raw user query
 * @param providerName Provider key (default "hipolabs")
 * @param limit        Max results to return (1-100)
 * @param userId       Optional — for analytics
 */
export async function searchUniversities(
  query: string,
  providerName = 'hipolabs',
  limit = 20,
  userId?: string,
): Promise<UniversitySearchResult> {
  const t0 = Date.now();
  const normalizedQuery = normalizeUniversityName(query);

  // ---- STEP 1 — Database (cache) ----
  const dbRows = await universityRepo.searchByNameInsensitive(normalizedQuery, limit);

  if (dbRows.length > 0) {
    const latencyMs = Date.now() - t0;
    logSearch(userId, query, normalizedQuery, true, dbRows.length, latencyMs);
    return {
      universities: dbRows.map(toUniversityDTO),
      cacheHit: true,
      latencyMs,
      totalResults: dbRows.length,
    };
  }

  // ---- STEP 2 — External provider ----
  const provider = ProviderFactory.get(providerName);
  const externalResults = await provider.search(query);

  if (externalResults.length === 0) {
    const latencyMs = Date.now() - t0;
    logSearch(userId, query, normalizedQuery, false, 0, latencyMs);
    return { universities: [], cacheHit: false, provider: provider.name, latencyMs, totalResults: 0 };
  }

  // ---- STEP 3 — Validate ----
  const valid = externalResults.filter(isValidNormalized).slice(0, MAX_PERSIST);

  // ---- STEP 4 — Persist ----
  if (valid.length > 0) {
    await persistUniversities(valid, providerName);
  }

  // ---- STEP 5 — Re-query so DTOs are consistent ----
  const stored = await universityRepo.searchByNameInsensitive(normalizedQuery, limit);
  const latencyMs = Date.now() - t0;

  logSearch(userId, query, normalizedQuery, false, stored.length, latencyMs);

  return {
    universities: stored.map(toUniversityDTO),
    cacheHit: false,
    provider: provider.name,
    latencyMs,
    totalResults: stored.length,
  };
}

/**
 * Get a single university by ID.
 */
export async function getUniversityById(id: string): Promise<UniversityDTO | null> {
  const row = await universityRepo.findById(id);
  return row ? toUniversityDTO(row) : null;
}

/**
 * Check if a provider is reachable.
 */
export async function checkProviderHealth(providerName = 'hipolabs'): Promise<boolean> {
  try {
    return await ProviderFactory.get(providerName).isAvailable();
  } catch {
    return false;
  }
}

// ------------------------------------------------------------------
// Internals
// ------------------------------------------------------------------

async function persistUniversities(
  universities: { name: string; normalizedName: string; country: string; state?: string | null; domain?: string | null; webPage?: string | null; alphaCode?: string | null; provider: string }[],
  providerName: string,
): Promise<void> {
  try {
    const source = await externalSourceRepo.findOrCreate(
      providerName,
      providerName === 'hipolabs' ? 'http://universities.hipolabs.com' : undefined,
    );

    await universityRepo.createMany(
      universities.map((u) => ({
        externalId: `${u.provider}:${u.normalizedName}`,
        sourceId: source.id,
        name: u.name,
        normalizedName: u.normalizedName,
        country: u.country,
        state: u.state,
        domain: u.domain,
        webPage: u.webPage,
        alphaCode: u.alphaCode,
        provider: u.provider,
        type: undefined,
        isCanonical: true,
        canonicalId: undefined,
      })),
    );

    await externalSourceRepo.updateLastSync(providerName);
  } catch (err) {
    // Storage failure must never break the search response
    console.error('[UniversityService] Persist error:', err);
  }
}

function logSearch(
  userId: string | undefined,
  rawQuery: string,
  normalizedQuery: string,
  cacheHit: boolean,
  resultCount: number,
  latencyMs: number,
): void {
  // Fire-and-forget — logging must never block the response
  searchLogRepo
    .create({
      userId: userId ?? undefined,
      rawQuery,
      normalizedQuery,
      entityType: 'UNIVERSITY',
      cacheHit,
      resultCount,
      latencyMs,
    })
    .catch((err) => console.error('[UniversityService] Log error:', err));
}
