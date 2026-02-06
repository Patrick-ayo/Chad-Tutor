/**
 * Jobs Layer
 * 
 * Central export for all background job stubs.
 * 
 * These are stubs ready for BullMQ integration:
 * 
 * @example Future integration:
 * ```ts
 * import { Queue, Worker } from 'bullmq';
 * import IORedis from 'ioredis';
 * 
 * const connection = new IORedis(process.env.REDIS_URL);
 * 
 * // Register all jobs
 * registerAllJobs(connection);
 * ```
 */

export * as contentRefreshJob from './content-refresh.job';
export * as cacheRebuildJob from './cache-rebuild.job';
export * as dailyResetJob from './daily-reset.job';

/**
 * Register all job stubs (logs registration info)
 */
export function registerAllJobs(): void {
  const { registerContentRefreshJob } = require('./content-refresh.job');
  const { registerCacheRebuildJob } = require('./cache-rebuild.job');
  const { registerDailyResetJob } = require('./daily-reset.job');

  registerContentRefreshJob();
  registerCacheRebuildJob();
  registerDailyResetJob();

  console.log('[Jobs] All jobs registered (stubs - no actual scheduler)');
}
