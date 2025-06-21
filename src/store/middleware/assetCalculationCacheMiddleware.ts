import { Middleware } from '@reduxjs/toolkit';
import { updateAssetCache } from '../slices/transactionsSlice';
import { calculateAssetMonthlyIncomeWithCache } from '@/service/shared/calculations/assetIncomeCalculations';
import { createCachedDividends } from '@/utils/dividendCacheUtils';
import Logger from '@/service/shared/logging/Logger/logger';

/**
 * Middleware to automatically cache asset calculation results
 * This middleware listens for actions that trigger asset calculations
 * and ensures that calculated values (including 0 values) are cached
 */
export const assetCalculationCacheMiddleware: Middleware = (store) => (next) => (action: any) => {
  const result = next(action);
  
  // Listen for specific actions that might trigger asset calculations
  if (action.type === 'dashboard/updateValues/fulfilled' || 
      action.type === 'forecast/calculateForecastData/fulfilled' ||
      action.type.includes('analytics')) {
    
    const state = store.getState() as any;
    const assets = state.transactions?.items || [];
    
    // Check if there are assets that need cache updates
    let cacheUpdatesNeeded = 0;
    
    assets.forEach((asset: any) => {
      const result = calculateAssetMonthlyIncomeWithCache(asset);
      
      // If this asset doesn't have cached data, cache it now
      if (!result.cacheHit && result.cacheDataToUpdate) {
        const cachedDividends = createCachedDividends(
          result.cacheDataToUpdate.monthlyAmount,
          result.cacheDataToUpdate.annualAmount,
          result.cacheDataToUpdate.monthlyBreakdown,
          asset
        );
        
        store.dispatch(updateAssetCache({
          assetId: asset.id,
          cachedDividends
        }));
        
        cacheUpdatesNeeded++;
      }
    });
    
    if (cacheUpdatesNeeded > 0) {
      Logger.cache(`Auto-cached ${cacheUpdatesNeeded} asset calculations for future performance improvements [CACHE EXTENDED]`);
    }
  }
  
  return result;
};

export default assetCalculationCacheMiddleware;
