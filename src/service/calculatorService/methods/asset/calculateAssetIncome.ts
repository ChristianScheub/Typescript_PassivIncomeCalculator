// filepath: /Users/christianscheub/Documents/Develope/PassiveIncomeCalculator/Typescript_PassivIncomeCalculator/src/service/calculatorService/methods/calculateAssetIncome.ts
// This file serves as a facade/entry-point for asset income calculations
// It re-exports functionality from more specialized modules

// Re-export from core calculation module
export {
  calculateAssetMonthlyIncome,
  getStockDividendIncome,
  getInterestIncome,
  getRentalIncome
} from './calculateAssetIncomeCore';

// Re-export from monthly income calculation module
export {
  calculateAssetIncomeForMonth,
  calculateTotalMonthlyAssetIncome,
  calculateTotalAssetIncomeForMonth
} from './calculateAssetIncomeMonthly';

// Re-export from cache-enabled calculation module
export { calculateAssetMonthlyIncomeWithCache } from './calculateAssetIncomeWithCache';

// Re-export from dedicated cache module
export {
  areAssetsCached,
  calculateTotalMonthlyAssetIncomeFromCache,
  calculateTotalAssetIncomeForMonthFromCache,
  // ❌ REMOVED: calculateTotalMonthlyAssetIncomeWithCache - use portfolio cache instead
  calculateTotalAssetIncomeForMonthWithCache,
  updateAssetCacheData
} from './calculateAssetIncomeCache';
