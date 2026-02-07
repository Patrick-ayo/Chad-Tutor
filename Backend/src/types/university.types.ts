/**
 * University Types
 *
 * Shared type definitions for university providers and services.
 * Enables provider-agnostic service layer implementation.
 */

/**
 * Normalized university structure used throughout the application.
 * Every provider must map raw API responses into this shape.
 */
export interface NormalizedUniversity {
  name: string;
  normalizedName: string;
  country: string;
  state?: string | null;
  domain?: string | null;
  webPage?: string | null;
  alphaCode?: string | null;
  provider: string;
}

/**
 * University data returned from the service layer to routes.
 */
export interface UniversityDTO {
  id: string;
  name: string;
  country: string | null;
  state?: string | null;
  domain?: string | null;
  webPage?: string | null;
  alphaCode?: string | null;
  provider: string;
}

/**
 * Contract every university data provider must implement.
 * Adding a new provider = implement this interface + register in factory.
 */
export interface IUniversityProvider {
  /** Unique identifier for this provider (e.g. "hipolabs") */
  readonly name: string;
  /** Base URL for health / debug purposes */
  readonly endpoint: string;

  /**
   * Search universities from external API.
   * Must handle errors gracefully — never throws, returns empty array on failure.
   */
  search(query: string): Promise<NormalizedUniversity[]>;

  /** Health check for provider availability. */
  isAvailable(): Promise<boolean>;
}
