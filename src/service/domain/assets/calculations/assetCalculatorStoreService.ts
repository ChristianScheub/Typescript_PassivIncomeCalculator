import { Asset } from "@/types/domains/assets/entities";
import { calculateAssetMonthlyIncomeWithCache } from "@/service/shared/calculations/assetIncomeCalculations";
import { updateAssetCache } from "@/store/slices/domain";
import { createCachedDividends } from "@/utils/dividendCacheUtils";
import Logger from "@/service/shared/logging/Logger/logger";
import type { AppDispatch } from "@/store";

/**
 * Asset calculation service that integrates with the store to handle cache updates
 * This service should be used when you want automatic cache extension after calculations
 */
export class AssetCalculationStoreService {
  constructor(private readonly dispatch: AppDispatch) {}

  /**
   * Calculate asset monthly income with automatic cache updates
   * This function will cache the result (including 0 values) for future use
   */
  calculateAssetMonthlyIncomeWithCacheUpdate(asset: Asset): number {
    const result = calculateAssetMonthlyIncomeWithCache(asset);
    
    // If cache miss occurred and we have data to cache, update the store
    // This includes caching 0 values to avoid repeated calculations
    if (!result.cacheHit && result.cacheDataToUpdate) {
      const cachedDividends = createCachedDividends(
        result.cacheDataToUpdate.monthlyAmount,
        result.cacheDataToUpdate.annualAmount,
        result.cacheDataToUpdate.monthlyBreakdown,
        asset
      );
      
      this.dispatch(updateAssetCache({
        assetId: asset.id,
        cachedDividends
      }));
      
      if (result.monthlyAmount === 0) {
        Logger.cache(`Cached 0 income for asset ${asset.name} (no dividends/income) - future calls will use cache [CACHE EXTENDED]`);
      } else {
        Logger.cache(`Cached income ${result.monthlyAmount} for asset ${asset.name} - future calls will use cache [CACHE EXTENDED]`);
      }
    }
    
    return result.monthlyAmount;
  }

  /**
   * Calculate total monthly asset income for multiple assets with cache updates
   */
  calculateTotalMonthlyAssetIncomeWithCacheUpdate(assets: Asset[]): number {
    Logger.cache(`calculateTotalMonthlyAssetIncomeWithCacheUpdate called for ${assets.length} assets`);
    
    return assets.reduce((sum, asset) => {
      return sum + this.calculateAssetMonthlyIncomeWithCacheUpdate(asset);
    }, 0);
  }
}

export default AssetCalculationStoreService;
