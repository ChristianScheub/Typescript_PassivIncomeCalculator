import { Asset, CachedDividends } from '../types';
import { AppDispatch } from '../store';
import { updateAssetDividendCache } from '../store/slices/assetsSlice';
import { calculateAssetMonthlyIncomeWithCache, updateAssetCacheData } from './calculatorService/methods/calculateAssetIncome';
import Logger from './Logger/logger';

/**
 * Cache service for managing dividend calculations
 */
export class DividendCacheService {
  private dispatch: AppDispatch;

  constructor(dispatch: AppDispatch) {
    this.dispatch = dispatch;
  }

  /**
   * Calculates asset income with caching support
   */
  public calculateAssetIncomeWithCache(asset: Asset): {
    monthlyAmount: number;
    annualAmount: number;
    monthlyBreakdown: Record<number, number>;
    cacheHit: boolean;
  } {
    const result = calculateAssetMonthlyIncomeWithCache(asset);
    // Kein automatisches Dispatchen/Cache-Update mehr hier!
    return result;
  }

  /**
   * Calculate total monthly income for all assets with caching
   */
  public calculateTotalMonthlyAssetIncomeWithCache(assets: Asset[]): number {
    let totalIncome = 0;
    let cacheHits = 0;
    let cacheMisses = 0;
    
    Logger.cache(`Calculating total asset income for ${assets.length} assets with caching`);
    
    for (const asset of assets) {
      const result = this.calculateAssetIncomeWithCache(asset);
      if (result) {
        totalIncome += result.monthlyAmount;
        
        if (result.cacheHit) {
          cacheHits++;
        } else {
          cacheMisses++;
        }
        
        Logger.cache(`Asset ${asset.name}: ${result.monthlyAmount} (cache ${result.cacheHit ? 'hit' : 'miss'})`);
      } else {
        cacheMisses++;
        Logger.cache(`Asset ${asset.name}: no cache data (cache miss)`);
      }
    }
    
    Logger.cache(`Total asset income: ${totalIncome} (${cacheHits} cache hits, ${cacheMisses} cache misses)`);
    return totalIncome;
  }

  /**
   * Calculate asset income for specific month with caching
   */
  public calculateAssetIncomeForMonthWithCache(asset: Asset, monthNumber: number): number {
    const result = this.calculateAssetIncomeWithCache(asset);
    
    // Return the breakdown for the specific month
    return result ? (result.monthlyBreakdown[monthNumber] || 0) : 0;
  }

  /**
   * Calculate total asset income for specific month with caching
   */
  public calculateTotalAssetIncomeForMonthWithCache(assets: Asset[], monthNumber: number): number {
    let totalIncome = 0;
    
    Logger.cache(`Calculating total asset income for ${assets.length} assets in month ${monthNumber} with caching`);
    
    for (const asset of assets) {
      const monthlyIncome = this.calculateAssetIncomeForMonthWithCache(asset, monthNumber);
      totalIncome += monthlyIncome;
      Logger.cache(`Asset ${asset.name} month ${monthNumber}: ${monthlyIncome}`);
    }
    
    Logger.cache(`Total asset income for month ${monthNumber}: ${totalIncome}`);
    return totalIncome;
  }
}

// Create a singleton factory function
let cacheServiceInstance: DividendCacheService | null = null;

export const createDividendCacheService = (dispatch: AppDispatch): DividendCacheService => {
  if (!cacheServiceInstance) {
    cacheServiceInstance = new DividendCacheService(dispatch);
  }
  return cacheServiceInstance;
};

export const getDividendCacheService = (): DividendCacheService | null => {
  return cacheServiceInstance;
};
