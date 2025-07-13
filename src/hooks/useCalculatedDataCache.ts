import { useCallback } from 'react';
import { useAppSelector, useAppDispatch } from './redux';
import type { ThunkDispatch, AnyAction } from '@reduxjs/toolkit';
import type { RootState } from '@/store';
import { 
  calculateAssetFocusData,
  calculateFinancialSummary,
  calculatePortfolioHistory,
  selectPortfolioHistory,
  selectAssetFocusData,
  selectFinancialSummary,
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
  
  // Get state values at the top level of the hook
  const liabilities = useAppSelector((state) => state.liabilities.items);
  const expenses = useAppSelector((state) => state.expenses.items);
  const income = useAppSelector((state) => state.income.items);
  
  const getState = useCallback(() => {
    return {
      liabilities,
      expenses,
      income,
    };
  }, [liabilities, expenses, income]);

  // Cache invalidation functions
  const clearCache = useCallback(() => {
    Logger.cache('useCalculatedDataCache: Clearing all cache');
    dispatch(invalidateAllCaches());
  }, [dispatch]);

  const invalidateCache = useCallback(() => {
    Logger.cache('useCalculatedDataCache: Invalidating all cache');
    dispatch(invalidateAllCaches());
  }, [dispatch]);

  // Refresh functions that get required data from Redux store
  const refreshAssetFocusData = useCallback(() => {
    Logger.cache('useCalculatedDataCache: Refreshing asset focus data');
    dispatch(calculateAssetFocusData());
  }, [dispatch]);

  const refreshFinancialSummary = useCallback(() => {
    Logger.cache('useCalculatedDataCache: Refreshing financial summary');
    const { liabilities, expenses, income } = getState();
    dispatch(calculateFinancialSummary({ liabilities, expenses, income }));
  }, [dispatch, getState]);

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
    
    // Hook functions for components
    usePortfolioHistory: (timeRange: AssetFocusTimeRange) => 
      useAppSelector(selectPortfolioHistory(timeRange)),
    
    useAssetFocusData: () => 
      useAppSelector(selectAssetFocusData),
    
    useFinancialSummary: () => 
      useAppSelector(selectFinancialSummary),
  };
};

// Individual hooks for backwards compatibility
export const usePortfolioHistory = (timeRange: AssetFocusTimeRange) => {
  const portfolioHistory = useAppSelector(selectPortfolioHistory(timeRange));
  const dispatch = useAppDispatch();

  const refresh = useCallback(() => {
    dispatch(calculatePortfolioHistory({ timeRange }));
  }, [dispatch, timeRange]);

  return {
    data: portfolioHistory?.data || [],
    loading: false, // TODO: Add proper loading state tracking
    error: null,
    lastCalculated: portfolioHistory?.lastCalculated,
    refresh
  };
};

export const useAssetFocusData = () => {
  const assetFocusData = useAppSelector(selectAssetFocusData);
  const dispatch = useAppDispatch();

  const refresh = useCallback(() => {
    dispatch(calculateAssetFocusData());
  }, [dispatch]);

  return {
    data: assetFocusData,
    loading: false, // TODO: Add proper loading state tracking
    error: null,
    refresh
  };
};

export const useFinancialSummary = () => {
  const financialSummary = useAppSelector(selectFinancialSummary);
  const dispatch = useAppDispatch() as ThunkDispatch<RootState, unknown, AnyAction>;
  const liabilities = useAppSelector((state) => state.liabilities.items);
  const expenses = useAppSelector((state) => state.expenses.items);
  const income = useAppSelector((state) => state.income.items);
  const refresh = useCallback(() => {
    dispatch(calculateFinancialSummary({ liabilities, expenses, income }));
  }, [dispatch, liabilities, expenses, income]);
  return {
    data: financialSummary,
    loading: false,
    error: null,
    refresh
  };
};

// Keep the original export for backward compatibility
export default useCalculatedDataCache;
