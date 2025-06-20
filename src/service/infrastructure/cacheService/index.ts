import { ICacheService } from './interfaces/ICacheService';
import { 
  calculateAssetMonthlyIncomeWithCache
} from './methods/calculateAssetIncomeWithCache';

/**
 * Cache Service that provides centralized caching functionality
 * Handles asset income caching, cache validation, and cache management
 */
const cacheService: ICacheService = {
  // Asset income cache methods
  calculateAssetMonthlyIncomeWithCache,
  
  // Cache management
  clearCache: () => {
    // Implementation for clearing all caches
    localStorage.removeItem('dividend_cache');
    localStorage.removeItem('portfolio_cache');
  },
  
  getCacheStats: () => ({
    assetCacheCount: 0, // Implement actual cache counting
    portfolioCacheCount: 0, // Implement actual cache counting
    lastCacheUpdate: new Date().toISOString()
  }),
};

// Export the service interface
export type { ICacheService };

// Export the service
export { cacheService };

// Export default instance for direct use
export default cacheService;
