/**
 * University Normalization Utilities
 *
 * Standalone helpers used by providers and services.
 * Never store raw API data — always normalize first.
 */

import type { NormalizedUniversity, UniversityDTO } from '../types/university.types';

/**
 * Normalize a university name for consistent DB comparison.
 */
export function normalizeUniversityName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')   // strip special chars except hyphens
    .replace(/\s+/g, ' ');      // collapse whitespace
}

/**
 * Validate that a NormalizedUniversity object has all required fields.
 */
export function isValidNormalized(
  uni: Partial<NormalizedUniversity>,
): uni is NormalizedUniversity {
  return Boolean(uni.name && uni.normalizedName && uni.country && uni.provider);
}

/**
 * Map a Prisma University row to a serialisable DTO.
 * Accepts `any` so every Prisma payload shape works without casting.
 */
export function toUniversityDTO(row: Record<string, any>): UniversityDTO {
  return {
    id: row.id,
    name: row.name,
    country: row.country ?? null,
    state: row.state ?? null,
    domain: row.domain ?? null,
    webPage: row.webPage ?? null,
    alphaCode: row.alphaCode ?? null,
    provider: row.provider ?? 'unknown',
  };
}
