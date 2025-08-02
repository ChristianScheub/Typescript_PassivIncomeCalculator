import { IAssetCalculatorService } from './interfaces/IAssetCalculatorService';
import { 
  calculateAssetMonthlyIncome, 
  calculateAssetIncomeForMonth, 
  calculateTotalAssetIncomeForMonth
} from './methods/calculateAssetIncome';
import { calculateAssetAllocation } from './methods/calculateAllocations';
import { 
  areAssetsCached, 
  calculateTotalMonthlyAssetIncomeFromCache,
  calculateTotalAssetIncomeForMonthFromCache
} from '../../../../shared/cache/assetIncomeCacheUtils';
import { calculateAssetMonthlyIncomeWithCache } from '../../../../shared/calculations/assetIncomeCalculations';
import type { Asset } from '@/types/domains/assets/entities';
import Logger from '@/service/shared/logging/Logger/logger';

// Type for cache data that needs to be updated
interface CacheUpdateData {
  monthlyAmount: number;
  annualAmount: number;
  monthlyBreakdown: Record<number, number>;
}

/**
 * Asset Calculator Service that provides all asset-related calculations
 * Handles asset income, values, and allocation calculations
 */
const assetCalculatorService: IAssetCalculatorService = {
  // Basic asset calculations
  calculateAssetMonthlyIncome,
  calculateAssetIncomeForMonth,
  calculateTotalAssetValue: (assets) => assets.reduce((sum, asset) => sum + (asset.value || 0), 0),
  calculateLiquidAssetValue: (assets) => assets
    .filter(asset => ['stock', 'bond', 'cash'].includes(asset.type))
    .reduce((sum, asset) => sum + asset.value, 0),
  calculateTotalMonthlyAssetIncome: (assets) => {
    Logger.cache(`calculateTotalMonthlyAssetIncome called - checking cache strategies for ${assets.length} assets`);
    
    // Priority 1: Try pure cache approach (fastest - O(1))
    const cachedTotal = calculateTotalMonthlyAssetIncomeFromCache(assets);
    if (cachedTotal !== null) {
      Logger.cache(`Cache hit: returning cached total ${cachedTotal} for ${assets.length} assets`);
      return cachedTotal;
    }
    
    Logger.cache(`Cache miss: falling back to individual calculations for ${assets.length} assets`);
    // Priority 2: Individual calculations with cache-aware approach
    // Use the cache-aware function that checks and can potentially extend cache
    const assetsNeedingCacheUpdate: Array<{asset: Asset, cacheData: CacheUpdateData}> = [];
    
    const total = assets.reduce((sum, asset) => {
      const result = calculateAssetMonthlyIncomeWithCache(asset);
      // Log cache status for each asset to help with debugging
      if (result.cacheHit) {
        Logger.cache(`Asset ${asset.name}: Cache hit, income=${result.monthlyAmount} [CACHE HIT]`);
      } else {
        Logger.cache(`Asset ${asset.name}: Cache miss, calculated income=${result.monthlyAmount} [CACHE MISS]`);
        // Track assets that need cache updates
        if (result.cacheDataToUpdate) {
          assetsNeedingCacheUpdate.push({
            asset,
            cacheData: result.cacheDataToUpdate
          });
        }
      }
      return sum + result.monthlyAmount;
    }, 0);
    
    // Log cache update opportunities
    if (assetsNeedingCacheUpdate.length > 0) {
      Logger.cache(`${assetsNeedingCacheUpdate.length} assets calculated and could be cached for future performance improvements`);
      assetsNeedingCacheUpdate.forEach(({asset, cacheData}) => {
        Logger.cache(`  - Asset ${asset.name}: income=${cacheData.monthlyAmount} (not yet cached)`);
      });
    }
    
    return total;
  },
  calculateTotalAssetIncomeForMonth: (assets, monthNumber) => {
    Logger.cache(`calculateTotalAssetIncomeForMonth called for month ${monthNumber} with ${assets.length} assets`);
    
    // Try cache-only approach first for maximum performance
    const cachedTotal = calculateTotalAssetIncomeForMonthFromCache(assets, monthNumber);
    if (cachedTotal !== null) {
      Logger.cache(`Cache hit: returning cached month ${monthNumber} total ${cachedTotal}`);
      return cachedTotal;
    }
    
    Logger.cache(`Cache miss: falling back to individual month calculations for month ${monthNumber}`);
    // Fallback to original function (which also uses cache where available)
    return calculateTotalAssetIncomeForMonth(assets, monthNumber);
  },
  calculateAnnualAssetIncome: (monthlyIncome) => monthlyIncome * 12,
  
  // Asset allocation analysis
  calculateAssetAllocation,
  
  // Cached asset calculations
  calculateAssetMonthlyIncomeWithCache,
  
  // Cache status helpers
  areAssetsCached: (assets) => areAssetsCached(assets),
};

// Export the service interface


// Export the service
export { assetCalculatorService };

// Export default instance for direct use
export default assetCalculatorService;
