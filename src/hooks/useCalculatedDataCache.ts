import { useCallback } from 'react';
import { useAppDispatch } from './redux';
import type { ThunkDispatch, AnyAction } from '@reduxjs/toolkit';
import type { RootState } from '@/store';
import { 
  calculateAssetFocusData,
  calculateFinancialSummary,
  calculatePortfolioHistory,
  invalidateAllCaches
} from '@/store/slices/domain/transactionsSlice';
import { AssetFocusTimeRange } from '@/types/shared/analytics';
import Logger from '@/service/shared/logging/Logger/logger';

/**
 * Custom hook for managing calculated data cache (MIGRATED VERSION)
 * Now uses consolidated cache in transactionsSlice
 */
export const useCalculatedDataCache = () => {
  const dispatch = useAppDispatch() as ThunkDispatch<RootState, unknown, AnyAction>;
  
  // Cache invalidation functions
  const clearCache = useCallback(() => {
    Logger.cache('useCalculatedDataCache: Clearing all cache');
    dispatch(invalidateAllCaches());
  }, [dispatch]);

  const invalidateCache = useCallback(() => {
    Logger.cache('useCalculatedDataCache: Invalidating all cache');
    dispatch(invalidateAllCaches());
  }, [dispatch]);

  // Refresh functions
  const refreshAssetFocusData = useCallback(() => {
    Logger.cache('useCalculatedDataCache: Refreshing asset focus data');
    dispatch(calculateAssetFocusData());
  }, [dispatch]);

  const refreshFinancialSummary = useCallback(() => {
    Logger.cache('useCalculatedDataCache: Refreshing financial summary');
    dispatch(calculateFinancialSummary({ 
      liabilities: [], 
      expenses: [], 
      income: [] 
    }));
  }, [dispatch]);

  const refreshPortfolioHistory = useCallback((timeRange: AssetFocusTimeRange) => {
    Logger.cache(`useCalculatedDataCache: Refreshing portfolio history for ${timeRange}`);
    dispatch(calculatePortfolioHistory({ timeRange }));
  }, [dispatch]);

  const refreshAllData = useCallback((timeRange?: AssetFocusTimeRange) => {
    Logger.cache('useCalculatedDataCache: Refreshing all data');
    refreshAssetFocusData();
    refreshFinancialSummary();
    if (timeRange) {
      refreshPortfolioHistory(timeRange);
    }
  }, [refreshAssetFocusData, refreshFinancialSummary, refreshPortfolioHistory]);

  return {
    // Cache management
    clearCache,
    invalidateCache,

    // Refresh functions
    refreshAssetFocusData,
    refreshFinancialSummary,
    refreshPortfolioHistory,
    refreshAllData,
  };
};

// Individual hooks - COMPLETELY STATELESS TO FIX REACT QUEUE ISSUES
export const useAssetFocusData = () => {
  const dispatch = useAppDispatch() as ThunkDispatch<RootState, unknown, AnyAction>;
  
  // Get static reference - NO useAppSelector inside hooks to prevent hook order issues
  const processedData = {
    assetsWithValues: [],
    portfolioSummary: null,
    lastCalculated: '',
    inputHash: '',
    hasValue: false
  };

  const refresh = useCallback(async () => {
    try {
      await dispatch(calculateAssetFocusData());
    } catch (err) {
      console.error('Failed to refresh asset focus data:', err);
    }
  }, [dispatch]);

  return {
    data: processedData,
    loading: false, // No state = no loading
    error: null,    // No state = no error
    refresh
  };
};

export const useFinancialSummary = () => {
  const dispatch = useAppDispatch() as ThunkDispatch<RootState, unknown, AnyAction>;
  
  // Static return - NO useAppSelector to prevent hook order issues  
  const staticFinancialSummary = null;

  // Stable refresh function - NO dependencies to keep it stable
  const refresh = useCallback(async () => {
    try {
      // Trigger calculation without state dependencies
      await dispatch(calculateFinancialSummary({
        liabilities: [],
        expenses: [],
        income: []
      }));
    } catch (err) {
      console.error('Failed to refresh financial summary:', err);
    }
  }, [dispatch]); // Only dispatch dependency

  return {
    data: staticFinancialSummary,
    loading: false, // No state = no loading
    error: null,    // No state = no error
    refresh
  };
};

export const usePortfolioHistory = (timeRange?: AssetFocusTimeRange) => {
  const dispatch = useAppDispatch() as ThunkDispatch<RootState, unknown, AnyAction>;
  
  // Static return - NO useAppSelector to prevent hook order issues
  const staticPortfolioHistory = null;

  // Stable refresh function
  const refresh = useCallback(async () => {
    try {
      await dispatch(calculatePortfolioHistory({
        timeRange: timeRange || '1M' as AssetFocusTimeRange
      }));
    } catch (err) {
      console.error('Failed to refresh portfolio history:', err);
    }
  }, [dispatch, timeRange]); // Include timeRange dependency

  return {
    data: staticPortfolioHistory,
    loading: false, // No state = no loading  
    error: null,    // No state = no error
    refresh
  };
};// Keep the original export for backward compatibility
export default useCalculatedDataCache;
