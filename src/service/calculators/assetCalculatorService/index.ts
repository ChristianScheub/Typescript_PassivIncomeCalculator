import { IAssetCalculatorService } from './interfaces/IAssetCalculatorService';
import { 
  calculateAssetMonthlyIncome, 
  calculateAssetIncomeForMonth, 
  calculateTotalAssetIncomeForMonth,
  calculateTotalMonthlyAssetIncomeFromCache,
  calculateTotalAssetIncomeForMonthFromCache,
  calculateTotalAssetIncomeForMonthWithCache,
  areAssetsCached,
  calculateAssetMonthlyIncomeWithCache
} from './methods/calculateAssetIncome';
import { calculateAssetAllocation } from './methods/calculateAllocations';

/**
 * Asset Calculator Service that provides all asset-related calculations
 * Handles asset income, values, and allocation calculations
 */
const assetCalculatorService: IAssetCalculatorService = {
  // Basic asset calculations
  calculateAssetMonthlyIncome,
  calculateAssetIncomeForMonth,
  calculateTotalAssetValue: (assets) => assets.reduce((sum, asset) => sum + asset.value, 0),
  calculateLiquidAssetValue: (assets) => assets
    .filter(asset => ['stock', 'bond', 'cash'].includes(asset.type))
    .reduce((sum, asset) => sum + asset.value, 0),
  calculateTotalMonthlyAssetIncome: (assets) => {
    // Priority 1: Try pure cache approach (fastest - O(1))
    const cachedTotal = calculateTotalMonthlyAssetIncomeFromCache(assets);
    if (cachedTotal !== null) {
      return cachedTotal;
    }
    // Priority 2: Individual calculations with cache (slower but reliable - O(n))
    return assets.reduce((sum, asset) => sum + calculateAssetMonthlyIncome(asset), 0);
  },
  calculateTotalAssetIncomeForMonth: (assets, monthNumber) => {
    // Try cache-only approach first for maximum performance
    const cachedTotal = calculateTotalAssetIncomeForMonthFromCache(assets, monthNumber);
    if (cachedTotal !== null) {
      return cachedTotal;
    }
    // Fallback to original function (which also uses cache where available)
    return calculateTotalAssetIncomeForMonth(assets, monthNumber);
  },
  calculateAnnualAssetIncome: (monthlyIncome) => monthlyIncome * 12,
  
  // Asset allocation analysis
  calculateAssetAllocation,
  
  // Cached asset calculations
  calculateAssetMonthlyIncomeWithCache,
  calculateTotalAssetIncomeForMonthWithCache,
  
  // Cache status helpers
  areAssetsCached: (assets) => areAssetsCached(assets),
};

// Export the service interface
export type { IAssetCalculatorService };

// Export the service
export { assetCalculatorService };

// Export default instance for direct use
export default assetCalculatorService;
