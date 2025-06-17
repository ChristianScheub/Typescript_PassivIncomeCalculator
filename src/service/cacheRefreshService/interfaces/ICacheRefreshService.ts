/**
 * Service interface for cache refresh operations
 */
export interface CacheRefreshService {
    /**
     * Refreshes all caches in the application
     * This includes:
     * - Clearing dividend caches
     * - Clearing portfolio cache
     * - Clearing portfolio history cache
     * - Invalidating all Redux caches
     * - Recalculating all data from SQL database
     */
    refreshAllCaches(): Promise<void>;
}
