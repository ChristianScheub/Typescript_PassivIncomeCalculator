import React, { useCallback } from 'react';
import { useAppSelector, useAppDispatch } from './redux';
import { 
  calculatePortfolioHistory,
  calculateAssetFocusData,
  calculateFinancialSummary,
  selectPortfolioHistory,
  selectAssetFocusData,
  selectFinancialSummary,
  selectIsStoreHydrated,
  clearAllCache,
  invalidateAllCache
} from '../store/slices/calculatedDataSlice';
import { AssetFocusTimeRange } from '../store/slices/dashboardSettingsSlice';
import Logger from '../service/shared/logging/Logger/logger';

/**
 * Custom hook for managing calculated data cache
 * Provides easy access to cached calculations and cache management functions
 */
export const useCalculatedDataCache = () => {
  const dispatch = useAppDispatch();

  // Cache management functions
  const clearCache = useCallback(() => {
    Logger.cache('Clearing all calculated data cache via hook');
    dispatch(clearAllCache());
  }, [dispatch]);

  const invalidateCache = useCallback(() => {
    Logger.cache('Invalidating all calculated data cache via hook');
    dispatch(invalidateAllCache());
  }, [dispatch]);

  const refreshPortfolioHistory = useCallback((timeRange: AssetFocusTimeRange) => {
    Logger.cache(`Refreshing portfolio history for timeRange: ${timeRange}`);
    dispatch(calculatePortfolioHistory({ timeRange }));
  }, [dispatch]);

  const refreshAssetFocusData = useCallback(() => {
    Logger.cache('Refreshing asset focus data');
    dispatch(calculateAssetFocusData());
  }, [dispatch]);

  const refreshFinancialSummary = useCallback(() => {
    Logger.cache('Refreshing financial summary');
    dispatch(calculateFinancialSummary());
  }, [dispatch]);

  const refreshAllData = useCallback((timeRange?: AssetFocusTimeRange) => {
    Logger.cache('Refreshing all calculated data');
    dispatch(calculateFinancialSummary());
    dispatch(calculateAssetFocusData());
    if (timeRange) {
      dispatch(calculatePortfolioHistory({ timeRange }));
    }
  }, [dispatch]);

  return {
    // Cache management
    clearCache,
    invalidateCache,
    
    // Data refresh functions
    refreshPortfolioHistory,
    refreshAssetFocusData,
    refreshFinancialSummary,
    refreshAllData,
    
    // Selector helpers
    usePortfolioHistory: (timeRange: AssetFocusTimeRange) => 
      useAppSelector(selectPortfolioHistory(timeRange)),
    useAssetFocusData: () => 
      useAppSelector(selectAssetFocusData),
    useFinancialSummary: () => 
      useAppSelector(selectFinancialSummary)
  };
};

/**
 * Hook specifically for portfolio history with automatic calculation
 */
export const usePortfolioHistory = (timeRange: AssetFocusTimeRange) => {
  const dispatch = useAppDispatch();
  const portfolioHistoryCache = useAppSelector(selectPortfolioHistory(timeRange));
  const isStoreHydrated = useAppSelector(selectIsStoreHydrated);
  const { items: assets } = useAppSelector(state => state.transactions);
  const { items: assetDefinitions } = useAppSelector(state => state.assetDefinitions);

  // Auto-calculate only if store is hydrated, cache is empty, and we have data
  React.useEffect(() => {
    if (!isStoreHydrated) {
      Logger.cache(`Portfolio history hook waiting for store hydration (timeRange: ${timeRange})`);
      return;
    }
    
    const shouldCalculate = !portfolioHistoryCache && 
                           assets.length > 0 && 
                           assetDefinitions.length > 0;
    
    if (shouldCalculate) {
      Logger.cache(`Auto-calculating portfolio history for timeRange: ${timeRange} (no valid cache found, store hydrated)`);
      dispatch(calculatePortfolioHistory({ timeRange }));
    } else if (portfolioHistoryCache) {
      Logger.cache(`Using cached portfolio history for timeRange: ${timeRange} (${portfolioHistoryCache.data.length} entries, calculated: ${portfolioHistoryCache.lastCalculated})`);
    } else {
      Logger.cache(`No calculation needed for portfolio history timeRange: ${timeRange} (store hydrated, no data or cache exists)`);
    }
  }, [isStoreHydrated, portfolioHistoryCache, assets.length, assetDefinitions.length, timeRange, dispatch]);

  return {
    data: portfolioHistoryCache?.data || [],
    lastCalculated: portfolioHistoryCache?.lastCalculated,
    isLoading: isStoreHydrated && !portfolioHistoryCache && assets.length > 0,
    refresh: () => dispatch(calculatePortfolioHistory({ timeRange }))
  };
};

/**
 * Hook specifically for asset focus data with automatic calculation
 */
export const useAssetFocusData = () => {
  const dispatch = useAppDispatch();
  const assetFocusDataCache = useAppSelector(selectAssetFocusData);
  const isStoreHydrated = useAppSelector(selectIsStoreHydrated);
  const { items: assets } = useAppSelector(state => state.transactions);
  const { items: assetDefinitions } = useAppSelector(state => state.assetDefinitions);

  // Auto-calculate only if store is hydrated, cache is empty, and we have data
  React.useEffect(() => {
    if (!isStoreHydrated) {
      Logger.cache('Asset focus hook waiting for store hydration');
      return;
    }
    
    const shouldCalculate = !assetFocusDataCache && 
                           assets.length > 0 && 
                           assetDefinitions.length > 0;
    
    if (shouldCalculate) {
      Logger.cache('Auto-calculating asset focus data (no valid cache found, store hydrated)');
      dispatch(calculateAssetFocusData());
    } else if (assetFocusDataCache) {
      Logger.cache(`Using cached asset focus data (calculated: ${assetFocusDataCache.lastCalculated})`);
    } else {
      Logger.cache('No calculation needed for asset focus data (store hydrated, no data or cache exists)');
    }
  }, [isStoreHydrated, assetFocusDataCache, assets.length, assetDefinitions.length, dispatch]);

  return {
    assetsWithValues: assetFocusDataCache?.assetsWithValues || [],
    portfolioSummary: assetFocusDataCache?.portfolioSummary || {},
    lastCalculated: assetFocusDataCache?.lastCalculated,
    isLoading: isStoreHydrated && !assetFocusDataCache && assets.length > 0,
    refresh: () => dispatch(calculateAssetFocusData())
  };
};

/**
 * Hook specifically for financial summary with automatic calculation
 */
export const useFinancialSummary = () => {
  const dispatch = useAppDispatch();
  const financialSummaryCache = useAppSelector(selectFinancialSummary);
  const isStoreHydrated = useAppSelector(selectIsStoreHydrated);
  const { items: assets } = useAppSelector(state => state.transactions);
  const { items: liabilities } = useAppSelector(state => state.liabilities);
  const { items: expenses } = useAppSelector(state => state.expenses);
  const { items: income } = useAppSelector(state => state.income);

  // Auto-calculate only if store is hydrated, cache is empty, and we have financial data
  React.useEffect(() => {
    if (!isStoreHydrated) {
      Logger.cache('Financial summary hook waiting for store hydration');
      return;
    }
    
    const hasData = assets.length > 0 || liabilities.length > 0 || 
                    expenses.length > 0 || income.length > 0;
    
    const shouldCalculate = !financialSummaryCache && hasData;
    
    if (shouldCalculate) {
      Logger.cache('Auto-calculating financial summary (no valid cache found, store hydrated)');
      dispatch(calculateFinancialSummary());
    } else if (financialSummaryCache) {
      Logger.cache(`Using cached financial summary (calculated: ${financialSummaryCache.lastCalculated})`);
    } else {
      Logger.cache('No calculation needed for financial summary (store hydrated, no data or cache exists)');
    }
  }, [
    isStoreHydrated,
    financialSummaryCache, 
    assets.length, 
    liabilities.length, 
    expenses.length, 
    income.length, 
    dispatch
  ]);

  return {
    ...(financialSummaryCache || {
      netWorth: 0,
      totalAssets: 0,
      totalLiabilities: 0,
      monthlyIncome: 0,
      monthlyExpenses: 0,
      monthlyCashFlow: 0
    }),
    lastCalculated: financialSummaryCache?.lastCalculated,
    isLoading: isStoreHydrated && !financialSummaryCache && (
      assets.length > 0 || liabilities.length > 0 || 
      expenses.length > 0 || income.length > 0
    ),
    refresh: () => dispatch(calculateFinancialSummary())
  };
};
