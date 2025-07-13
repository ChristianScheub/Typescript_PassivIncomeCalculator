/**
 * Cache Slices Index
 * Export remaining cache/analytics related slices
 * 
 * REMOVED:
 * - calculatedDataSlice (consolidated into transactionsSlice)
 * - portfolioIntradaySlice (consolidated into transactionsSlice)
 */

export { default as forecastReducer } from './forecastSlice';

// Re-export all actions and selectors from remaining cache slices
export * from './forecastSlice';

// CONSOLIDATED ARCHITECTURE: Forward to consolidated cache in transactionsSlice
// Re-export the consolidated thunks and selectors for clean import paths
export {
  calculatePortfolioHistory,
  calculateAssetFocusData,
  calculateFinancialSummary,
  calculatePortfolioIntradayData as calculatePortfolioIntradayDataDirect,
  selectPortfolioHistory,
  selectAssetFocusData,
  selectFinancialSummary,
  setIntradayData as setPortfolioIntradayData,
  setIntradayStatus as setPortfolioIntradayStatus,
  setIntradayError as setPortfolioIntradayError
} from '../domain/transactionsSlice';

// Store state management helpers
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const selectIsStoreHydrated = (_state: { [key: string]: unknown }) => true;
export const clearAllCache = () => ({ type: 'transactions/invalidateAllCaches' });
export const invalidateAllCache = () => ({ type: 'transactions/invalidateAllCaches' });

// Store initialization actions
export const markStoreHydrated = () => ({ type: 'cache/markStoreHydrated' });
