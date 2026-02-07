/**
 * Hipolabs University Provider
 *
 * Implementation for http://universities.hipolabs.com API.
 *
 * - 5-second timeout
 * - Graceful error handling (never crashes server)
 * - Proper normalization into NormalizedUniversity
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import type { IUniversityProvider, NormalizedUniversity } from '../../types/university.types';

// ----- Raw Hipolabs response shape -----
interface HipolabsUniversity {
  name: string;
  domains: string[];
  web_pages: string[];
  alpha_two_code: string;
  'state-province': string | null;
  country: string;
}

export class HipolabsProvider implements IUniversityProvider {
  readonly name = 'hipolabs';
  readonly endpoint = 'http://universities.hipolabs.com';

  private readonly client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: this.endpoint,
      timeout: 5_000,
      headers: { 'Accept': 'application/json' },
    });
  }

  // ------------------------------------------------------------------
  // Public API
  // ------------------------------------------------------------------

  async search(query: string): Promise<NormalizedUniversity[]> {
    try {
      const { data } = await this.client.get<HipolabsUniversity[]>('/search', {
        params: { name: query },
      });

      if (!Array.isArray(data)) return [];

      return data.map((raw) => this.normalize(raw));
    } catch (error) {
      this.logError(error, query);
      return [];
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      await this.client.get('/search', { params: { name: 'test' }, timeout: 3_000 });
      return true;
    } catch {
      return false;
    }
  }

  // ------------------------------------------------------------------
  // Internal
  // ------------------------------------------------------------------

  private normalize(raw: HipolabsUniversity): NormalizedUniversity {
    const name = raw.name?.trim() || 'Unknown University';

    return {
      name,
      normalizedName: name.toLowerCase().trim().replace(/\s+/g, ' '),
      country: raw.country?.trim() || 'Unknown',
      state: raw['state-province']?.trim() || null,
      domain: raw.domains?.[0]?.trim() || null,
      webPage: raw.web_pages?.[0]?.trim() || null,
      alphaCode: raw.alpha_two_code?.trim() || null,
      provider: this.name,
    };
  }

  private logError(error: unknown, query: string): void {
    if (error instanceof AxiosError) {
      if (error.code === 'ECONNABORTED') {
        console.error(`[HipolabsProvider] Timeout for query="${query}"`);
      } else if (error.response) {
        console.error(`[HipolabsProvider] HTTP ${error.response.status} for query="${query}"`);
      } else {
        console.error(`[HipolabsProvider] No response for query="${query}"`);
      }
      return;
    }
    console.error('[HipolabsProvider] Unexpected error:', error);
  }
}
