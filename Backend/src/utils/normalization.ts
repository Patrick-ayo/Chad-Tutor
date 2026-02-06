/**
 * Normalization Utilities
 * 
 * String normalization for deduplication and search matching.
 * Used to create canonical forms of names, queries, etc.
 */

/**
 * Normalize a string for search/deduplication
 * - Lowercase
 * - Trim whitespace
 * - Remove extra spaces
 * - Remove special characters (optional)
 */
export function normalizeString(
  str: string,
  options: {
    removeSpecialChars?: boolean;
    removeNumbers?: boolean;
  } = {}
): string {
  let result = str
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' '); // Collapse multiple spaces

  if (options.removeSpecialChars) {
    result = result.replace(/[^\w\s]/g, '');
  }

  if (options.removeNumbers) {
    result = result.replace(/\d/g, '');
  }

  return result;
}

/**
 * Normalize university name
 * Handles common variations like "University of X" vs "X University"
 */
export function normalizeUniversityName(name: string): string {
  let normalized = normalizeString(name);

  // Remove common suffixes/prefixes for matching
  const removals = [
    'university',
    'college',
    'institute',
    'institution',
    'of technology',
    'of science',
    'of arts',
  ];

  // Create a version without common words for fuzzy matching
  // But keep original normalized version for storage
  return normalized;
}

/**
 * Normalize course name
 */
export function normalizeCourseName(name: string): string {
  let normalized = normalizeString(name);

  // Standardize common abbreviations
  const abbreviations: Record<string, string> = {
    'b.tech': 'btech',
    'b. tech': 'btech',
    'bachelor of technology': 'btech',
    'm.tech': 'mtech',
    'm. tech': 'mtech',
    'master of technology': 'mtech',
    'b.sc': 'bsc',
    'b. sc': 'bsc',
    'bachelor of science': 'bsc',
    'm.sc': 'msc',
    'm. sc': 'msc',
    'master of science': 'msc',
    'b.com': 'bcom',
    'b. com': 'bcom',
    'bachelor of commerce': 'bcom',
    'm.com': 'mcom',
    'master of business administration': 'mba',
    'computer science': 'cs',
    'information technology': 'it',
    'electrical engineering': 'ee',
    'mechanical engineering': 'me',
    'civil engineering': 'ce',
    'electronics and communication': 'ece',
  };

  for (const [full, abbr] of Object.entries(abbreviations)) {
    normalized = normalized.replace(new RegExp(full, 'gi'), abbr);
  }

  return normalized;
}

/**
 * Normalize subject name
 */
export function normalizeSubjectName(name: string): string {
  return normalizeString(name);
}

/**
 * Normalize search query
 */
export function normalizeSearchQuery(query: string): string {
  return normalizeString(query, { removeSpecialChars: true });
}

/**
 * Generate a simple hash for content comparison
 * Used for freshness detection
 */
export function generateContentHash(content: object): string {
  const str = JSON.stringify(content, Object.keys(content).sort());
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(16);
}

/**
 * Check if two normalized strings are similar enough to be duplicates
 * Uses simple Levenshtein distance threshold
 */
export function areSimilar(
  str1: string,
  str2: string,
  threshold: number = 0.8
): boolean {
  if (str1 === str2) return true;

  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) return true;

  // Simple check: if one contains the other
  if (longer.includes(shorter)) {
    return shorter.length / longer.length >= threshold;
  }

  // Calculate similarity ratio
  const distance = levenshteinDistance(str1, str2);
  const maxLength = Math.max(str1.length, str2.length);
  const similarity = 1 - distance / maxLength;

  return similarity >= threshold;
}

/**
 * Levenshtein distance calculation
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}
