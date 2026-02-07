/**
 * Provider Factory — Strategy Pattern
 *
 * Central registry for all university data providers.
 * Adding a new provider = create class + register here.
 * Service layer never needs to change.
 *
 * Usage:
 *   ProviderFactory.get('hipolabs').search('stanford')
 */

import type { IUniversityProvider } from '../../types/university.types';
import { HipolabsProvider } from './HipolabsProvider';

export class ProviderFactory {
  private static readonly providers = new Map<string, IUniversityProvider>();

  // ---- Auto-register on module load ----
  static {
    ProviderFactory.register(new HipolabsProvider());
    // Future providers:
    // ProviderFactory.register(new CourseraProvider());
    // ProviderFactory.register(new EdXProvider());
  }

  /** Register a provider (idempotent). */
  static register(provider: IUniversityProvider): void {
    this.providers.set(provider.name, provider);
  }

  /** Get provider by name. Throws if unknown. */
  static get(name: string): IUniversityProvider {
    const provider = this.providers.get(name);
    if (!provider) {
      const available = Array.from(this.providers.keys()).join(', ');
      throw new Error(`Unknown university provider "${name}". Available: ${available}`);
    }
    return provider;
  }

  /** Get default provider (hipolabs). */
  static getDefault(): IUniversityProvider {
    return this.get('hipolabs');
  }

  /** List all registered provider names. */
  static listNames(): string[] {
    return Array.from(this.providers.keys());
  }

  /** Check if a provider is registered. */
  static has(name: string): boolean {
    return this.providers.has(name);
  }
}
